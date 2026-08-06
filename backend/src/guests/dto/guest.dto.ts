import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { RsvpStatus } from '../../common/domain.enums';

export class CreateGuestDto {
  @IsString() @Length(2, 160) name: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @Length(4, 40) phone?: string;
  @IsOptional() @IsString() @Length(1, 100) groupName?: string;
  @IsOptional() @IsString() @Length(1, 80) relationLabel?: string;
  @IsOptional() @IsEnum(RsvpStatus) rsvp?: RsvpStatus;
  @IsOptional() @IsInt() @Min(0) @Max(20) companions?: number;
  @IsOptional() @IsString() dietary?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsUUID() parentId?: string | null;
}

export class UpdateGuestDto {
  @IsOptional() @IsString() @Length(2, 160) name?: string;
  @IsOptional() @IsEmail() email?: string | null;
  @IsOptional() @IsString() @Length(4, 40) phone?: string | null;
  @IsOptional() @IsString() @Length(1, 100) groupName?: string;
  @IsOptional() @IsString() @Length(1, 80) relationLabel?: string;
  @IsOptional() @IsEnum(RsvpStatus) rsvp?: RsvpStatus;
  @IsOptional() @IsInt() @Min(0) @Max(20) companions?: number;
  @IsOptional() @IsString() dietary?: string | null;
  @IsOptional() @IsString() notes?: string | null;
  @IsOptional() @IsUUID() parentId?: string | null;
  @IsOptional() @IsInt() @Min(1) version?: number;
}

export class GuestListQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) limit = 50;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(RsvpStatus) rsvp?: RsvpStatus;
  @IsOptional() @IsString() group?: string;
  @IsOptional() @IsString() sort = 'name';
  @IsOptional() @IsString() direction = 'ASC';
}
