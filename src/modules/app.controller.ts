import { Controller } from '@nestjs/common'
import { Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Public } from 'decorators/public.decorator'
import { diskStorage } from 'multer'
import { extname } from 'path'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Post('test')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
        filename(req, file, callback) {
          // Create unique suffix
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
          // Get file extension
          const ext = extname(file.originalname)
          // Write filename
          const filename = `${uniqueSuffix}${ext}`

          callback(null, filename)
        },
      }),
    }),
  )
  async uploadFiles(@UploadedFile() file: Express.Multer.File): Promise<void> {
    console.log('UPLOADED file:')
    console.log(file)
  }
}
