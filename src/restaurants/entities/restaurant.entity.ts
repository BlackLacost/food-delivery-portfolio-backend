import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
  @Field((type) => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Length(5, 10)
  @Field((type) => String)
  @Column()
  name: string;

  @IsBoolean()
  @Field((type) => Boolean)
  @Column()
  isVegan: boolean;

  @IsString()
  @Field((type) => String)
  @Column()
  address: string;

  @IsString()
  @Field((type) => String)
  @Column()
  ownerName: string;

  @IsString()
  @Field((type) => String)
  @Column()
  categoryName: string;
}
