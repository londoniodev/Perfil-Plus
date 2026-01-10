import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreatePostDto, UpdatePostDto, CreateCategoryDto, CreateTagDto, CreateAttachmentDto } from './dto';
import { Public, CurrentUser, Roles } from '../../common/decorators';

// ==================== PUBLIC BLOG CONTROLLER ====================
@Controller('blog')
export class BlogController {
    constructor(private readonly blogService: BlogService) { }

    @Get('posts')
    @Public()
    async getPublicPosts(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('category') category?: string,
    ) {
        return this.blogService.findPublicPosts(page, limit, category);
    }

    @Get('posts/:slug')
    @Public()
    async getPostBySlug(
        @Param('slug') slug: string,
        @CurrentUser() user?: any,
    ) {
        const hasSubscription = user?.hasActiveSubscription || user?.role === 'ADMIN' || false;
        return this.blogService.findPostBySlug(slug, hasSubscription);
    }

    @Get('categories')
    @Public()
    async getCategories() {
        return this.blogService.findAllCategories();
    }

    @Get('tags')
    @Public()
    async getTags() {
        return this.blogService.findAllTags();
    }
}

// ==================== ADMIN BLOG CONTROLLER ====================
@Controller('admin/blog')
@Roles('ADMIN')
export class AdminBlogController {
    constructor(private readonly blogService: BlogService) { }

    // Posts
    @Get('posts')
    async getAllPosts(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('published') published?: string,
    ) {
        const publishedFilter = published === 'true' ? true : published === 'false' ? false : undefined;
        return this.blogService.findAllPosts(page, limit, publishedFilter);
    }

    @Get('posts/:id')
    async getPost(@Param('id') id: string) {
        return this.blogService.findPostById(id);
    }

    @Post('posts')
    async createPost(@Body() dto: CreatePostDto) {
        return this.blogService.createPost(dto);
    }

    @Patch('posts/:id')
    async updatePost(@Param('id') id: string, @Body() dto: UpdatePostDto) {
        return this.blogService.updatePost(id, dto);
    }

    @Delete('posts/:id')
    async deletePost(@Param('id') id: string) {
        return this.blogService.deletePost(id);
    }

    // Attachments
    @Get('posts/:postId/attachments')
    async getAttachments(@Param('postId') postId: string) {
        return this.blogService.findAttachmentsByPostId(postId);
    }

    @Post('posts/:postId/attachments')
    async addAttachment(
        @Param('postId') postId: string,
        @Body() dto: CreateAttachmentDto,
    ) {
        return this.blogService.addAttachment(postId, dto);
    }

    @Delete('attachments/:id')
    async removeAttachment(@Param('id') id: string) {
        return this.blogService.removeAttachment(id);
    }

    // Categories
    @Post('categories')
    async createCategory(@Body() dto: CreateCategoryDto) {
        return this.blogService.createCategory(dto);
    }

    @Delete('categories/:id')
    async deleteCategory(@Param('id') id: string) {
        return this.blogService.deleteCategory(id);
    }

    // Tags
    @Post('tags')
    async createTag(@Body() dto: CreateTagDto) {
        return this.blogService.createTag(dto);
    }

    @Delete('tags/:id')
    async deleteTag(@Param('id') id: string) {
        return this.blogService.deleteTag(id);
    }
}
