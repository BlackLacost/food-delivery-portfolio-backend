import { Body, Controller, Post } from '@nestjs/common';

@Controller('payments')
export class PaymentsController {
  constructor() {}

  @Post()
  async processYookassaPayment(@Body() body) {
    console.log({ body });
  }
}
