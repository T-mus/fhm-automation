import { DynamicModule, Module } from '@nestjs/common'
import { DiscordService } from './discord.service'
import { DiscordModuleAsyncOptions } from './discord.types'
import { DISCORD_MODULE_OPTIONS } from './discord.constants'

@Module({})
export class DiscordModule {
    static forFeatureAsync(options: DiscordModuleAsyncOptions): DynamicModule {
        return {
            module: DiscordModule,
            imports: options.imports,
            providers: [
                DiscordService,
                {
                    provide: DISCORD_MODULE_OPTIONS,
                    inject: options.inject,
                    useFactory: async (...args: any[]) => options.useFactory(...args),
                },
            ],
            exports: [DiscordService],
        }
    }
}
