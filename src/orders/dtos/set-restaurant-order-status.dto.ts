import { Field, InputType } from "@nestjs/graphql";
import { OrderStatus } from "src/orders/entities/order.entity";

type RestaurantOrderStatus = Pick<typeof OrderStatus, 'Cooking'|'Cooked'>

@InputType()
export class SetRestaurantOrderStatusInput {
	@Field()
	status:
}