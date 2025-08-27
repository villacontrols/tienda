import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Order } from '../../ordenes/OrdenEntity/ordenes.entity';

export enum UserRole {
  CUSTOMER = 'cliente',
  ADMIN = 'admin',
}

export enum TipoNaturaleza {
  NATURAL = 'natural',
  JURIDICA = 'juridica',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column({ length: 100, unique: true , default: ""})
  username: string;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() 
  password: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  tipo_usuario: UserRole;

  @Column({
    type: 'enum',
    enum: TipoNaturaleza,
    default: TipoNaturaleza.NATURAL,
  })
  tipo_naturaleza: TipoNaturaleza;

  @Column({ type: 'text', nullable: true })
  biografia: string;

  @Column({ length: 50, nullable: true })
  documento: string;

  @Column({ length: 255, nullable: true })
  linkedin: string;

  @Column({ length: 255, nullable: true })
  twitter: string;

  @Column({ length: 255, nullable: true })
  github: string;

  @Column({ length: 255, nullable: true })
  sitio_web: string;

  @Column({ type: 'boolean', default: false })
  esta_verificado: boolean;

  @Column({ nullable: true })
  foto: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fecha_creacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fecha_actualizacion: Date;
    
  @OneToMany(() => Order, (ordenes) => ordenes.user)
  ordenes: Order[]
}