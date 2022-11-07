import { Field, Float, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
@ObjectType()
export class Coords extends CoreEntity {
  @Column({ type: 'float' })
  @Field((type) => Float)
  latitude: number;

  @Column({ type: 'float' })
  @Field((type) => Float)
  longitude: number;
}
