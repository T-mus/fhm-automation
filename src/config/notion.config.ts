import { ConfigService } from '@nestjs/config'
import { NotionModuleOptions } from '../modules/notion/notion.types'

export const getNotionConfig = (configService: ConfigService): NotionModuleOptions => {
    const apiKey = configService.get('NOTION_API_KEY')
    if (!apiKey) {
        throw new Error('NOTION_API_KEY is not specified')
    }
    const playersDb = configService.get('NOTION_PLAYERS_DB_ID')
    if (!playersDb) {
        throw new Error('NOTION_PLAYERS_DB_ID is not specified')
    }
    const foundryDb = configService.get('NOTION_FOUNDRY_DB_ID')
    if (!foundryDb) {
        throw new Error('NOTION_FOUNDRY_DB_ID is not specified')
    }
    return { apiKey, playersDb, foundryDb }
}
