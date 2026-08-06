import { IsEmail, IsIn, IsString } from 'class-validator';
import { EventRole } from '../../common/domain.enums';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsIn([EventRole.VIEWER, EventRole.EDITOR])
  role: EventRole;
}

export class AcceptInvitationDto {
  @IsString()
  token: string;
}
