import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { EventStatus } from '../../common/domain.enums';

export class CreateEventDto {
  @IsString()
  @Length(2, 160)
  name: string;

  @IsString()
  @Length(2, 60)
  type: string;

  @IsDateString()
  startsAt: string;

  @IsString()
  @Length(2, 255)
  location: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}

export class UpdateEventDto {
  @IsOptional() @IsString() @Length(2, 160) name?: string;
  @IsOptional() @IsString() @Length(2, 60) type?: string;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsString() @Length(2, 255) location?: string;
  @IsOptional() @IsEnum(EventStatus) status?: EventStatus;
  @IsOptional() @IsHexColor() color?: string;
  @IsOptional() @IsInt() @Min(1) version?: number;
}

export class EventListQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}
