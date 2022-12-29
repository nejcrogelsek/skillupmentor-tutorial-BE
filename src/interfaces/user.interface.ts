export enum UserAccess {
  USER = 'user',
  PRIVILEGED = 'privileged',
  ADMIN = 'admin',
  SUPERUSER = 'superuser',
}

export interface UserData {
  id: string
  first_name?: string
  last_name?: string
  email: string
  avatar?: string
}

export type PropertyTypes = string | number | boolean | Date | null | undefined
