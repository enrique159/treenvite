import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthIdentity } from '../../auth/entities/auth-identity.entity';
import { RefreshSession } from '../../auth/entities/refresh-session.entity';
import { Event } from '../../events/entities/event.entity';
import { EventMember } from '../../members/entities/event-member.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 190 })
  email: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  emailVerifiedAt: Date | null;

  @OneToMany(() => AuthIdentity, (identity) => identity.user)
  identities: AuthIdentity[];

  @OneToMany(() => RefreshSession, (session) => session.user)
  sessions: RefreshSession[];

  @OneToMany(() => Event, (event) => event.owner)
  ownedEvents: Event[];

  @OneToMany(() => EventMember, (member) => member.user)
  memberships: EventMember[];

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6 })
  updatedAt: Date;
}
