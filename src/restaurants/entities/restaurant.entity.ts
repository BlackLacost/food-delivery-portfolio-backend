import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Category } from 'src/restaurants/entities/category.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Column()
  @Field((type) => String)
  @IsString()
  @Length(5)
  name: string;

  @Column()
  @Field((type) => String)
  @IsString()
  coverImage: string;

  @Column()
  @Field((type) => String)
  @IsString()
  address: string;

  @ManyToOne((type) => Category, (category) => category.restaurants)
  @Field((type) => Category)
  category: Category;
}
