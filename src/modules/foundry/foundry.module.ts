import { Module } from '@nestjs/common'
import { FoundryService } from './foundry.service'
import { FoundryController } from './foundry.controller'
import { NotionModule } from '../notion/notion.module'
import { DiscordModule } from '../discord/discord.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getNotionConfig } from '../../config/notion.config'
import { getDiscordConfig } from '../../config/discord.config'
import { MistralModule } from '../mistral/mistral.module'
import { getMistralConfig } from '../../config/mistral.config'

@Module({
    imports: [
        NotionModule.forFeatureAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getNotionConfig,
        }),
        MistralModule.forFeatureAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getMistralConfig,
        }),
        DiscordModule.forFeatureAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getDiscordConfig,
        }),
    ],
    controllers: [FoundryController],
    providers: [FoundryService],
})
export class FoundryModule {}
