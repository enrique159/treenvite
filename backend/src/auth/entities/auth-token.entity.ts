import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthTokenType } from '../../common/domain.enums';
import { User } from '../../users/entities/user.entity';

@Entity('auth_tokens')
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 64, select: false })
  tokenHash: string;

  @Column({ type: 'varchar', length: 30 })
  type: AuthTokenType;

  @Column({ type: 'datetime', precision: 6 })
  expiresAt: Date;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  usedAt: Date | null;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;
}
