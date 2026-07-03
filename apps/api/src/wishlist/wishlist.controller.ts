import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser, AuthUser } from '@/auth/decorators/current-user.decorator';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto/wishlist.dto';

@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user wishlist' })
  get(@CurrentUser() user: AuthUser) {
    return this.wishlist.getOrCreate(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a product to the wishlist' })
  addItem(@CurrentUser() user: AuthUser, @Body() dto: AddWishlistItemDto) {
    return this.wishlist.addItem(user.id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from the wishlist' })
  removeItem(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.wishlist.removeItem(user.id, id);
  }
}
