import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Column({ unique: true })
  @Field((type) => String)
  @IsString()
  @Length(5)
  name: string;

  @Column({ unique: true })
  @Field((type) => String)
  @IsString()
  slug: string;

  @Column({ nullable: true })
  @Field((type) => String, { nullable: true })
  @IsString()
  coverImage: string;

  @OneToMany((type) => Restaurant, (restaurant) => restaurant.category)
  @Field((type) => [Restaurant])
  restaurants: Restaurant[];
}
