import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
  @Field((type) => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Length(5)
  @Field((type) => String)
  @Column()
  name: string;

  @IsBoolean()
  @IsOptional()
  @Field((type) => Boolean, { nullable: true })
  @Column({ default: true })
  isVegan: boolean;

  @IsString()
  @Field((type) => String)
  @Column()
  address: string;
}
