import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsUUID } from 'class-validator'
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export class Base {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @Expose()
  id: string

  @ApiProperty()
  @CreateDateColumn()
  @Expose()
  created_at: Date

  @ApiProperty()
  @UpdateDateColumn()
  @Expose()
  updated_at: Date
}
