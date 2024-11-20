import { ModuleMetadata } from '@nestjs/common'

export type NotionModuleOptions = {
    apiKey: string
    playersDb: string
    foundryDb: string
}

export type NotionModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
    inject?: any[]
    useFactory: (...args: any[]) => Promise<NotionModuleOptions> | NotionModuleOptions
}
