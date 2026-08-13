import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GuestSide, RsvpStatus } from '../../common/domain.enums';
import type { Guest } from '../../guests/entities/guest.entity';

function emptyContactToNull({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeWords({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value;
}

export class IntegrationGuestListQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit = 50;

  @ApiPropertyOptional({
    description: 'Busca parcialmente en nombre, correo o teléfono.',
    example: 'Ana',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: RsvpStatus })
  @IsOptional()
  @IsEnum(RsvpStatus)
  rsvp?: RsvpStatus;

  @ApiPropertyOptional({
    description: 'Nombre exacto del grupo.',
    example: 'Familia',
  })
  @IsOptional()
  @IsString()
  group?: string;

  @ApiPropertyOptional({
    enum: ['name', 'groupName', 'rsvp', 'createdAt'],
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'groupName', 'rsvp', 'createdAt'])
  sort = 'name';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.toLowerCase() : (value as unknown),
  )
  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction = 'asc';
}

export class IntegrationUpdateGuestDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 160, example: 'Ana Pérez' })
  @IsOptional()
  @IsString()
  @Length(2, 160)
  name?: string;

  @ApiPropertyOptional({ nullable: true, example: 'ana@example.com' })
  @Transform(emptyContactToNull)
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '6691234567' })
  @Transform(emptyContactToNull)
  @IsOptional()
  @IsString()
  @Matches(/^\d{7,15}$/, {
    message: 'El teléfono debe contener entre 7 y 15 dígitos',
  })
  phone?: string | null;

  @ApiPropertyOptional({ minLength: 1, maxLength: 100, example: 'Familia' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  groupName?: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 80, example: 'Amistad' })
  @Transform(normalizeWords)
  @IsOptional()
  @IsString()
  @Length(1, 80)
  @Matches(/^\p{L}+(?: \p{L}+)*$/u, {
    message: 'La relación sólo puede contener letras y espacios',
  })
  relationLabel?: string;

  @ApiPropertyOptional({ enum: GuestSide, nullable: true })
  @IsOptional()
  @IsEnum(GuestSide)
  invitedBySide?: GuestSide | null;

  @ApiPropertyOptional({ enum: RsvpStatus })
  @IsOptional()
  @IsEnum(RsvpStatus)
  rsvp?: RsvpStatus;

  @ApiPropertyOptional({ minimum: 0, maximum: 20, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  companions?: number;

  @ApiPropertyOptional({ nullable: true, example: 'Vegetariana' })
  @IsOptional()
  @IsString()
  dietary?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Llegará después de las 20:00',
  })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description: 'Invitado padre en el árbol; null elimina la relación.',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiProperty({
    minimum: 1,
    description: 'Versión recibida al consultar el invitado.',
    example: 3,
  })
  @IsInt()
  @Min(1)
  version: number;
}

export class IntegrationGuestResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) eventId: string;
  @ApiProperty({ format: 'uuid', nullable: true }) parentId: string | null;
  @ApiProperty({ example: 'Ana Pérez' }) name: string;
  @ApiProperty({ nullable: true, example: 'ana@example.com' }) email:
    string | null;
  @ApiProperty({ nullable: true, example: '6691234567' }) phone: string | null;
  @ApiProperty({ example: 'Familia' }) groupName: string;
  @ApiProperty({ example: 'Amistad' }) relationLabel: string;
  @ApiProperty({ enum: GuestSide, nullable: true })
  invitedBySide: GuestSide | null;
  @ApiProperty({ enum: RsvpStatus }) rsvp: RsvpStatus;
  @ApiProperty({ example: 1 }) companions: number;
  @ApiProperty({ nullable: true, example: 'Vegetariana' }) dietary:
    string | null;
  @ApiProperty({ nullable: true }) notes: string | null;
  @ApiProperty({ example: 3 }) version: number;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt: Date;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt: Date;
}

export class IntegrationGuestPageDto {
  @ApiProperty({ type: () => [IntegrationGuestResponseDto] })
  items: IntegrationGuestResponseDto[];
  @ApiProperty({ example: 1 }) page: number;
  @ApiProperty({ example: 50 }) limit: number;
  @ApiProperty({ example: 125 }) total: number;
  @ApiProperty({ example: 3 }) totalPages: number;
}

export class IntegrationErrorDto {
  @ApiProperty({ example: 409 }) statusCode: number;
  @ApiProperty({ example: 'GUEST_VERSION_CONFLICT' }) code: string;
  @ApiProperty({ example: 'El invitado cambió desde que lo consultaste' })
  message: string | string[];
  @ApiProperty({ nullable: true }) details: unknown;
}

export function toIntegrationGuest(guest: Guest): IntegrationGuestResponseDto {
  return {
    id: guest.id,
    eventId: guest.eventId,
    parentId: guest.parentId,
    name: guest.name,
    email: guest.email,
    phone: guest.phone,
    groupName: guest.groupName,
    relationLabel: guest.relationLabel,
    invitedBySide: guest.invitedBySide,
    rsvp: guest.rsvp,
    companions: guest.companions,
    dietary: guest.dietary,
    notes: guest.notes,
    version: guest.version,
    createdAt: guest.createdAt,
    updatedAt: guest.updatedAt,
  };
}
