import { IsNotEmpty } from 'class-validator'

export class CreateUpdateRoleDto {
  @IsNotEmpty()
  name: string
}
