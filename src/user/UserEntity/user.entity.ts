import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Order } from 'src/ordenes/OrdenEntity/ordenes.entity';

export enum UserRole {
  CUSTOMER = 'cliente',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() 
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  rol: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
    
  @Column({nullable: true})
  imagenUrl: string;

  @Column({type: "boolean", default: true})
  status: boolean;

  @OneToMany(() => Order, (ordenes) => ordenes.user)
  ordenes: Order[]
}
