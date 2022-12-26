import { InternalServerErrorException } from '@nestjs/common'
import sgMail from '@sendgrid/mail'
import Logging from 'library/Logging'

export const sendMail = async (msg: sgMail.MailDataRequired): Promise<void> => {
  try {
    await sgMail.send(msg)
  } catch (error) {
    Logging.error(error)
    throw new InternalServerErrorException('Something went wrong while sending email.')
  }
}
