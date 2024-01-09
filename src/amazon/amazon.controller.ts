import { AmazonService } from './amazon.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('amazon')
export class AmazonController {
  constructor(private readonly amazonService: AmazonService) {}

  @Get('products')
  getProducts(@Query('product') product: string) {
    return this.amazonService.getProducts(product);
  }
}
