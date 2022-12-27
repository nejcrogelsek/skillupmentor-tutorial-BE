export const FileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error, filename: boolean) => void,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false)
  }
  callback(null, true)
}
