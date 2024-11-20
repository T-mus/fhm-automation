import { ConfigService } from '@nestjs/config'
import { DiscordModuleOptions } from '../modules/discord/discord.types'

export const getDiscordConfig = (configService: ConfigService): DiscordModuleOptions => {
    const botToken = configService.get('DISCORD_BOT_TOKEN')
    if (!botToken) {
        throw new Error('DISCORD_BOT_TOKEN is not specified')
    }
    const rootChannel = configService.get('DISCORD_ROOT_CHANNEL_ID')
    if (!rootChannel) {
        throw new Error('DISCORD_ROOT_CHANNEL_ID is not specified')
    }
    return { botToken, rootChannel }
}
