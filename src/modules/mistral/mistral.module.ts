import { DynamicModule, Module } from '@nestjs/common'
import { MistralService } from './mistral.service'
import { MistralModuleAsyncOptions } from './mistral.types'
import { MISTRAL_MODULE_OPTIONS } from './mistral.constants'

@Module({})
export class MistralModule {
    static forFeatureAsync(options: MistralModuleAsyncOptions): DynamicModule {
        return {
            module: MistralModule,
            imports: options.imports,
            providers: [
                MistralService,
                {
                    provide: MISTRAL_MODULE_OPTIONS,
                    inject: options.inject,
                    useFactory: async (...args: any[]) => options.useFactory(...args),
                },
            ],
            exports: [MistralService],
        }
    }
}
