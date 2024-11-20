import { ModuleMetadata } from '@nestjs/common'

export type DiscordModuleOptions = {
    botToken: string
    rootChannel: string
}

export type DiscordModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
    inject?: any[]
    useFactory: (...args: any[]) => Promise<DiscordModuleOptions> | DiscordModuleOptions
}
