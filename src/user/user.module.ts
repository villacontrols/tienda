import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './UserEntity/user.entity';
import { SupabaseService } from 'src/util/storage';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, SupabaseService],
  exports: [UserService]
})
export class UserModule {}
