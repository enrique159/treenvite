import { Column, CreateDateColumn, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventRole } from '../../common/domain.enums';
import { Event } from '../../events/entities/event.entity';
import { EventAccessGrant } from './event-access-grant.entity';

@Entity('event_access_codes')
export class EventAccessCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, (event) => event.accessCodes, { onDelete: 'CASCADE' })
  event: Event;

  @Index({ unique: true })
  @Column({ length: 64, select: false })
  codeHash: string;

  @Column({ length: 4 })
  codeSuffix: string;

  @Column({ type: 'varchar', length: 20 })
  role: EventRole;

  @Column({ type: 'datetime', precision: 6 })
  expiresAt: Date;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  revokedAt: Date | null;

  @Column()
  createdById: string;

  @OneToMany(() => EventAccessGrant, (grant) => grant.accessCode)
  grants: EventAccessGrant[];

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;
}
