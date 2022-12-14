import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { Coords } from 'src/common/entities/coords.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Category } from 'src/restaurants/entities/category.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Column()
  @Field((type) => String)
  @IsString()
  @Length(3)
  name: string;

  @Column()
  @Field((type) => String)
  @IsString()
  coverImage: string;

  @Column()
  @Field((type) => String)
  @IsString()
  address: string;

  @OneToOne((type) => Coords, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  @Field((type) => Coords)
  coords: Coords;

  @ManyToOne((type) => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Field((type) => Category, { nullable: true })
  category: Category;

  @ManyToOne((type) => User, (owner) => owner.restaurants, {
    onDelete: 'CASCADE',
  })
  @Field((type) => User, { nullable: true })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @OneToMany((type) => Order, (order) => order.restaurant)
  @Field((type) => [Order])
  orders: Order[];

  @OneToMany((type) => Dish, (dish) => dish.restaurant)
  @Field((type) => [Dish])
  menu: Dish[];

  @Column({ default: false })
  @Field((type) => Boolean)
  isPromoted: boolean;

  @Column({ nullable: true })
  @Field((type) => Date, { nullable: true })
  promotedUntil?: Date;
}
