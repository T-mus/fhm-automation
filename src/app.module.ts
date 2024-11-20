import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { FoundryModule } from './modules/foundry/foundry.module'

@Module({
    imports: [
        ConfigModule.forRoot({ envFilePath: `.${process.env.NODE_ENV}.env`, isGlobal: true }),
        FoundryModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
