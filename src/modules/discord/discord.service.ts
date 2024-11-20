import { Inject, Injectable } from '@nestjs/common'
import { DiscordModuleOptions } from './discord.types'
import { DISCORD_MODULE_OPTIONS } from './discord.constants'
import { Client, GatewayIntentBits, TextChannel } from 'discord.js'

@Injectable()
export class DiscordService {
    private client: Client

    constructor(
        @Inject(DISCORD_MODULE_OPTIONS) private readonly discordOptions: DiscordModuleOptions,
    ) {
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        })
    }

    async onModuleInit() {
        try {
            await this.client.login(process.env.DISCORD_BOT_TOKEN)
            console.log('Discord client successfully authorized')
        } catch (error) {
            console.error('Failed to log in to Discord', error)
        }
    }

    async sendMessage(message: string, channelId?: string) {
        const channel = await this.client.channels.fetch(
            channelId || this.discordOptions.rootChannel,
        )
        if (channel instanceof TextChannel) {
            await channel.send(message)
        } else {
            console.error('Channel not found or is not a text channel')
        }
    }
}
