import { Inject, Injectable } from '@nestjs/common'
import { NotionModuleOptions } from './notion.types'
import { NOTION_MODULE_OPTIONS } from './notion.constants'
import {
    BlockObjectRequest,
    ListBlockChildrenParameters,
    ListBlockChildrenResponse,
    QueryDatabaseParameters,
    QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints'
import { Client } from '@notionhq/client'

@Injectable()
export class NotionService {
    private notion: Client

    constructor(
        @Inject(NOTION_MODULE_OPTIONS) private readonly notionOptions: NotionModuleOptions,
    ) {
        this.notion = new Client({ auth: this.notionOptions.apiKey })
    }

    async readDbContent(
        databaseId: string,
        config?: Omit<QueryDatabaseParameters, 'database_id'>,
    ): Promise<QueryDatabaseResponse> {
        const response = await this.notion.databases.query({
            database_id: databaseId,
            ...config,
        })
        return response
    }

    async readPageContent(
        pageId: string,
        config?: Omit<ListBlockChildrenParameters, 'block_id'>,
    ): Promise<ListBlockChildrenResponse> {
        const response = await this.notion.blocks.children.list({
            block_id: pageId,
            ...config,
        })
        return response
    }

    async writeContent(pageId: string, content: BlockObjectRequest[]): Promise<void> {
        await this.notion.blocks.children.append({
            block_id: pageId,
            children: content,
        })
    }
}
