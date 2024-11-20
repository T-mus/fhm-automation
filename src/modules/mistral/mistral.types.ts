import { ModuleMetadata } from '@nestjs/common'

export type MistralModuleOptions = {
    apiKey: string
}

export type MistralModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
    inject?: any[]
    useFactory: (...args: any[]) => Promise<MistralModuleOptions> | MistralModuleOptions
}
