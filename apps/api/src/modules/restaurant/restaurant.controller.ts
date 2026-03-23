import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RestaurantService } from './restaurant.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('public/restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Public()
  @Throttle({ public: { limit: 300, ttl: 60000 } })
  @Get('menu')
  async getGenericMenu() {
    return this.restaurantService.getPublicMenu();
  }

  @Public()
  @Get(':slug/menu')
  async getMenu(@Param('slug') slug: string) {
    return this.restaurantService.getPublicMenu(slug);
  }

  @Public()
  @Post('products/:productId/like')
  async toggleLikeGeneric(
    @Param('productId') productId: string,
    @Body('userPhone') userPhone: string,
  ) {
    return this.restaurantService.toggleLike(undefined, productId, userPhone);
  }

  @Public()
  @Post(':slug/products/:productId/like')
  async toggleLike(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Body('userPhone') userPhone: string,
  ) {
    return this.restaurantService.toggleLike(slug, productId, userPhone);
  }

  @Public()
  @Post('products/:productId/comment')
  async addCommentGeneric(
    @Param('productId') productId: string,
    @Body() body: { userPhone: string; content: string; userName?: string },
  ) {
    return this.restaurantService.addComment(
      undefined,
      productId,
      body.userPhone,
      body.content,
      body.userName,
    );
  }

  @Public()
  @Post(':slug/products/:productId/comment')
  async addComment(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Body() body: { userPhone: string; content: string; userName?: string },
  ) {
    return this.restaurantService.addComment(
      slug,
      productId,
      body.userPhone,
      body.content,
      body.userName,
    );
  }

  @Public()
  @Get('products/:productId/like-status/:userPhone')
  async checkLikeStatusGeneric(
    @Param('productId') productId: string,
    @Param('userPhone') userPhone: string,
  ) {
    return this.restaurantService.checkLikeStatus(
      undefined,
      productId,
      userPhone,
    );
  }

  @Public()
  @Get(':slug/products/:productId/like-status/:userPhone')
  async checkLikeStatus(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Param('userPhone') userPhone: string,
  ) {
    return this.restaurantService.checkLikeStatus(slug, productId, userPhone);
  }
}
