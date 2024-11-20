import { DynamicModule, Module } from '@nestjs/common'
import { NotionService } from './notion.service'
import { NotionModuleAsyncOptions } from './notion.types'
import { NOTION_MODULE_OPTIONS } from './notion.constants'
import { NotionBlocksService } from './notion-blocks.service'

@Module({})
export class NotionModule {
    static forFeatureAsync(options: NotionModuleAsyncOptions): DynamicModule {
        return {
            module: NotionModule,
            imports: options.imports,
            providers: [
                NotionService,
                NotionBlocksService,
                {
                    provide: NOTION_MODULE_OPTIONS,
                    inject: options.inject,
                    useFactory: async (...args: any[]) => options.useFactory(...args),
                },
            ],
            exports: [NotionService, NotionBlocksService],
        }
    }
}
