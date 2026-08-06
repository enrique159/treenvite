export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export enum AuthTokenType {
  VERIFY_EMAIL = 'verify_email',
  RESET_PASSWORD = 'reset_password',
}

export enum EventRole {
  VIEWER = 'viewer',
  EDITOR = 'editor',
  OWNER = 'owner',
}

export enum EventStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  FINISHED = 'finished',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REVOKED = 'revoked',
}

export enum RsvpStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
}
