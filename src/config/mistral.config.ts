import { ConfigService } from '@nestjs/config'
import { MistralModuleOptions } from '../modules/mistral/mistral.types'

export const getMistralConfig = (configService: ConfigService): MistralModuleOptions => {
    const apiKey = configService.get('MISTRAL_API_KEY')
    if (!apiKey) {
        throw new Error('MISTRAL_API_KEY is not specified')
    }
    return { apiKey }
}
