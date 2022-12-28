import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Response,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { Patch } from '@nestjs/common/decorators/index'
import { FileInterceptor } from '@nestjs/platform-express'
import { GetCurrentUserId } from 'decorators/get-current-user-id.decorator'
import { User } from 'entities/user.entity'
import { isFileExtensionSafe, removeFile, saveImageToStorage } from 'helpers/imageStorage'
import { join } from 'path'

import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UsersService } from './users.service'

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id)
  }

  @Get('get/image')
  @HttpCode(HttpStatus.OK)
  async findImage(@GetCurrentUserId() userId: string, @Response() res): Promise<void> {
    const imageName = await this.usersService.findImageNameByUserId(userId)
    return res.sendFile(imageName, {
      root: './files',
    })
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto)
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('avatar', saveImageToStorage))
  @HttpCode(HttpStatus.CREATED)
  async upload(@UploadedFile() file: Express.Multer.File, @GetCurrentUserId() userId: string): Promise<User> {
    const filename = file?.filename

    if (!filename) throw new BadRequestException('File must be a png, jpg/jpeg')

    const imagesFolderPath = join(process.cwd(), 'files')
    const fullImagePath = join(imagesFolderPath + '/' + file.filename)
    if (await isFileExtensionSafe(fullImagePath)) {
      return this.usersService.updateUserImageId(userId, filename)
    }
    removeFile(fullImagePath)
    throw new BadRequestException('File content does not match extension!')
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id)
  }
}
