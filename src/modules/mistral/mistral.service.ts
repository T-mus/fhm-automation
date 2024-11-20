import { Inject, Injectable } from '@nestjs/common'
import { MistralModuleOptions } from './mistral.types'
import { MISTRAL_MODULE_OPTIONS } from './mistral.constants'
import { Mistral } from '@mistralai/mistralai'

@Injectable()
export class MistralService {
    private readonly mistralClient: Mistral

    constructor(
        @Inject(MISTRAL_MODULE_OPTIONS) private readonly mistralOptions: MistralModuleOptions,
    ) {
        this.mistralClient = new Mistral({ apiKey: this.mistralOptions.apiKey })
    }

    async sendRequest(role: string, prompt: string): Promise<any> {
        try {
            const systemRole =
                'You are an AI assistant who provides concise and accurate information.'

            const response = await this.mistralClient.chat.complete({
                model: 'pixtral-12b-2409',
                messages: [
                    {
                        role: 'system',
                        content: role || systemRole,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            })

            return response.choices[0].message.content
        } catch (error) {
            console.error('Error making request to Mistral model:', error)
            throw error
        }
    }
}
