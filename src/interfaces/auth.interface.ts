import { User } from 'entities/user.entity'
import { Request } from 'express'

export interface TokenPayload {
  name: string
  sub: string
  type: JwtType
}

export interface Tokens {
  access_token: string
  refresh_token: string
}

export type JwtPayloadWithRt = TokenPayload & { refresh_token: string }

export interface RequestWithUser extends Request {
  user: User
}

export enum JwtType {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}

export enum CookieType {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
}
