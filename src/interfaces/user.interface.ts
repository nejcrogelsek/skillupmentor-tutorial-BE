export enum UserAccess {
  USER = 'user',
  PRIVILEGED = 'privileged',
  ADMIN = 'admin',
  SUPERUSER = 'superuser',
}

//TODO: remove "User" interface at the end if not in use
export interface User {
  id: string
  email: string
  password: string
  email_token: string | null
  email_verified: boolean
  refresh_token: string | null
  created_at: Date
  updated_at: Date
}

export interface UserData {
  id: string
  email: string
}

export interface UserReturnData {
  id: string
  email: string
  email_verified: boolean
}

export type UserType = {
  email: string
  email_verified?: boolean
}

export type PropertyTypes = string | boolean | Date | null | undefined
