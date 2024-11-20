import { Controller, Get, Redirect } from '@nestjs/common'
import { FoundryService } from './foundry.service'

@Controller('foundry')
export class FoundryController {
    constructor(private readonly foundryService: FoundryService) {}

    @Redirect()
    @Get('teams')
    async createTeams() {
        try {
            const { url } = await this.foundryService.createTeams()
            return { url }
        } catch (error) {
            console.error('Error creating teams: ', error.message)
            throw error
        }
    }
}
