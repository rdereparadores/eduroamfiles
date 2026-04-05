import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { Step1Module } from './step1/step1.module';
import { Step2Module } from './step2/step2.module';
import { Step3Module } from './step3/step3.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, ChatModule, Step1Module, Step2Module, Step3Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
