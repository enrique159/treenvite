import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuthProvider } from '../../common/domain.enums';
import { User } from '../../users/entities/user.entity';

@Entity('auth_identities')
@Index(['provider', 'providerSubject'], { unique: true })
export class AuthIdentity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  provider: AuthProvider;

  @Column({ length: 191 })
  providerSubject: string;

  @Column({ length: 255, nullable: true, select: false })
  passwordHash: string | null;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.identities, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;
}
