import { IsDateString, IsIn, IsString, Length } from 'class-validator';
import { EventRole } from '../../common/domain.enums';

export class CreateAccessCodeDto {
  @IsIn([EventRole.VIEWER, EventRole.EDITOR])
  role: EventRole;

  @IsDateString()
  expiresAt: string;
}

export class RedeemAccessCodeDto {
  @IsString()
  @Length(6, 30)
  code: string;
}
