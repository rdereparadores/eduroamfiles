import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { Step1Module } from './step1/step1.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, ChatModule, Step1Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
