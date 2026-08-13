import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiTokenPermission } from '../../common/domain.enums';

export class CreateApiTokenDto {
  @ApiProperty({
    description: 'Nombre que identifica a la integración.',
    example: 'CRM del evento',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    enum: ApiTokenPermission,
    description: 'Permisos concedidos al token.',
    example: ApiTokenPermission.READ_WRITE,
  })
  @IsEnum(ApiTokenPermission)
  permission: ApiTokenPermission;

  @ApiPropertyOptional({
    description: 'Fecha futura de vencimiento. Si se omite, el token no vence.',
    example: '2026-11-11T23:59:59.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}
