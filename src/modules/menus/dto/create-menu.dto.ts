import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateMenuDto {
  @IsNotEmpty()
  logo: string

  @IsNotEmpty()
  primary_color: string

  @IsNotEmpty()
  secondary_color: string

  @IsOptional()
  facebook_link: string

  @IsOptional()
  instagram_link: string
}
