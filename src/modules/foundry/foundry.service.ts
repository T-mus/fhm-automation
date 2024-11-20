import { BadRequestException, Injectable } from '@nestjs/common'
import { NotionService } from '../notion/notion.service'
import { NotionBlocksService } from '../notion/notion-blocks.service'
import { MistralService } from '../mistral/mistral.service'
import { DiscordService } from '../discord/discord.service'
import { Legion, Players } from './foundry.types'
import { ConfigService } from '@nestjs/config'
import {
    BlockObjectRequest,
    BlockObjectResponse,
    PageObjectResponse,
    QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { AI_DEFAULT_ROLE, TOGGLE_LIST_LABEL, WRONG_NOTION_STRUCUTRE_MESSAGE } from './foudry.constants'
import * as markdownit from 'markdown-it'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class FoundryService {
    constructor(
        private readonly configService: ConfigService,
        private readonly notionService: NotionService,
        private readonly notionBlocksService: NotionBlocksService,
        private readonly mistralService: MistralService,
        private readonly discordService: DiscordService,
    ) {}

    // prettier-ignor
    async createTeams(): Promise<{ url: string }> {
        const lastBattle = await this.notionService.readDbContent(
            this.configService.get('NOTION_FOUNDRY_DB_ID'),
            {
                sorts: [{ property: 'Date', direction: 'descending' }],
                page_size: 1,
            },
        )
        const battlePageBlocks = await this.notionService.readPageContent(lastBattle.results[0].id)
        const toggleList = battlePageBlocks.results.find(
            (block: BlockObjectResponse) =>
                block.type === 'toggle' &&
                block.toggle.rich_text.some((text) => text.plain_text === TOGGLE_LIST_LABEL),
        )
        if (!toggleList) {
            throw new BadRequestException(WRONG_NOTION_STRUCUTRE_MESSAGE)
        }

        const toggleListBlocks = await this.notionService.readPageContent(toggleList.id)
        // Ideally, you should also check whether there is a database
        const { legion1, legion2 } = await this.getPlayers(toggleListBlocks.results[0].id)

        const basePrompt = await fs.promises.readFile(
            path.join(__dirname, '../../common/prompt_v3.txt'),
            'utf-8',
        )

        function joinLegionTemplate(legion: Legion): string {
            return (
                `${basePrompt}\n` +
                '### **Leaders (Top 10 strongest players):**  \n' +
                legion.leaders.join('\n') +
                '\n\n' +
                '### **Participants:**  \n' +
                legion.members.join('\n')
            )
        }
        const legion1Prompt = joinLegionTemplate(legion1)
        const legion2Prompt = joinLegionTemplate(legion2)

        const legion1Response = await this.mistralService.sendRequest(AI_DEFAULT_ROLE, legion1Prompt)
        const legion2Response = await this.mistralService.sendRequest(AI_DEFAULT_ROLE, legion2Prompt)

        function cleanCodeBlock(response: string) {
            if (response.startsWith('```') && response.endsWith('```')) {
                const withoutCodeBlock = response.slice(3, -3).trim()
                return withoutCodeBlock.replace(/^.*\n/, '').trim()
            }
            return response.trim()
        }

        const cleanedLegion1Response = cleanCodeBlock(legion1Response)
        const cleanedLegion2Response = cleanCodeBlock(legion2Response)

        const legion1Template = `# Legion1\n${cleanedLegion1Response}\n`
        const legion2Template = `# Legion2\n${cleanedLegion2Response}\n`
        const fullTemplate = `${legion1Template}${legion2Template}
    `
        const notionBlocks = await this.buildNotionBlocks(fullTemplate)
        await this.notionService.writeContent(lastBattle.results[0].id, notionBlocks)

        /* ------------------------------------
            Sending created teams to Discord 
           ------------------------------------ */
        /* const rootChannelId = this.configService.get('DISCORD_ROOT_CHANNEL_ID')
        await this.discordService.sendMessage(legion1Template, rootChannelId)
        await this.discordService.sendMessage(legion2Template, rootChannelId) */

        const castBattlePage = lastBattle.results[0] as PageObjectResponse
        return { url: castBattlePage.url }
    }

    private async getPlayers(selectedPlayersDbId: string): Promise<Players> {
        const selectedPlayers: QueryDatabaseResponse =
            await this.notionService.readDbContent(selectedPlayersDbId)

        const legion1Ids = selectedPlayers.results
            .flatMap((item: any) => item.properties['Legion 1'].relation)
            .map((relation) => relation.id)
        const legion2Ids = selectedPlayers.results
            .flatMap((item: any) => item.properties['Legion 2'].relation)
            .map((relation) => relation.id)

        const allPlayers = await this.notionService.readDbContent(
            this.configService.get('NOTION_PLAYERS_DB_ID'),
        )

        const formatPlayer = (player: any) => {
            const furnaceLevel = player.properties['Furnace'].number
            const powerPoints = player.properties['Power'].number

            return `- ${player.properties['Name'].title[0].plain_text} | ${furnaceLevel} | ${powerPoints}`
        }

        const separateLeadersAndMembers = (players: any[]) => {
            const sortedPlayers = players.sort(
                (a, b) => b.properties['Power'].number - a.properties['Power'].number,
            )
            const leaders = sortedPlayers.slice(0, 10).map(formatPlayer)
            const members = sortedPlayers.slice(10).map(formatPlayer)
            return { leaders, members }
        }

        const legion1Players = allPlayers.results.filter((player) => legion1Ids.includes(player.id))
        const legion2Players = allPlayers.results.filter((player) => legion2Ids.includes(player.id))

        const legion1 = separateLeadersAndMembers(legion1Players)
        const legion2 = separateLeadersAndMembers(legion2Players)

        return { legion1, legion2 }
    }

    private async buildNotionBlocks(markdown: string): Promise<BlockObjectRequest[]> {
        const md = markdownit()

        const parsedContent = md.parse(markdown, {})
        const notionBlocks: BlockObjectRequest[] = []

        for (let i = 0; i < parsedContent.length; i++) {
            const token = parsedContent[i]

            switch (token.type) {
                case 'paragraph_open': {
                    const content = this.notionBlocksService.buildRichText(
                        parsedContent[i + 1].children || [],
                    )
                    notionBlocks.push(this.notionBlocksService.createParagraphBlock(content))
                    i += 2
                    break
                }
                case 'heading_open': {
                    const level = token.tag.replace('h', '')
                    const content = this.notionBlocksService.buildRichText(
                        parsedContent[i + 1].children || [],
                    )
                    notionBlocks.push(this.notionBlocksService.createHeadingBlock(level, content))
                    i += 2
                    break
                }
                case 'list_item_open': {
                    const content = this.notionBlocksService.buildRichText(
                        parsedContent[i + 2].children || [],
                    )
                    if (token.markup === '-') {
                        notionBlocks.push(this.notionBlocksService.createBulletedListItem(content))
                    } else if (!isNaN(Number(token.markup))) {
                        notionBlocks.push(this.notionBlocksService.createNumberedListItem(content))
                    }
                    i += 4
                    break
                }
                default:
                    break
            }
        }

        return notionBlocks
    }
}
