import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { LmsService } from './lms.service';
import { EvaluationService } from './evaluation.service';
import {
    CreateThemeDto, UpdateThemeDto,
    CreateCourseDto, UpdateCourseDto,
    CreateLessonDto, UpdateLessonDto,
    UpdateProgressDto,
    CreateEvaluationDto, UpdateEvaluationDto,
    CreateQuestionDto,
    CreateLessonAttachmentDto,
} from './dto';
import { Public, CurrentUser, Roles, CurrentTenant } from '../../common/decorators';

// ==================== PUBLIC LMS CONTROLLER ====================
@Controller('lms')
export class LmsController {
    constructor(
        private readonly lmsService: LmsService,
        private readonly evaluationService: EvaluationService,
    ) { }

    // Themes
    @Get('themes')
    @Public()
    async getThemes(@Query('include') include?: string) {
        const includeCourses = include === 'courses';
        return this.lmsService.findAllThemes(false, includeCourses);
    }

    @Get('themes/:slug')
    @Public()
    async getTheme(@Param('slug') slug: string, @CurrentUser() user?: any) {
        const hasSubscription = user?.hasActiveSubscription || user?.role === 'ADMIN' || false;
        return this.lmsService.findThemeBySlug(slug, hasSubscription);
    }

    // Courses
    @Get('courses/:slug')
    @Public()
    async getCourse(@Param('slug') slug: string, @CurrentUser() user?: any) {
        const userId = user?.id;
        return this.lmsService.findCourseBySlug(slug, userId);
    }

    // Lessons (requiere autenticación)
    @Get('courses/:courseSlug/lessons/:lessonSlug')
    async getLesson(
        @Param('courseSlug') courseSlug: string,
        @Param('lessonSlug') lessonSlug: string,
        @CurrentUser() user: any,
    ) {
        const hasSubscription = user?.hasActiveSubscription || user?.role === 'ADMIN' || false;
        return this.lmsService.findLessonBySlug(courseSlug, lessonSlug, user.id, hasSubscription);
    }

    // Progress
    @Patch('progress/:lessonId')
    async updateProgress(
        @Param('lessonId') lessonId: string,
        @Body() dto: UpdateProgressDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.lmsService.updateProgress(userId, lessonId, dto);
    }

    @Get('my-progress')
    async getMyProgress(@CurrentUser('id') userId: string) {
        return this.lmsService.getUserProgress(userId);
    }

    // Evaluations
    @Get('evaluations/:id')
    async getEvaluation(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.evaluationService.getEvaluationForUser(id, userId);
    }

    @Post('evaluations/:id/submit')
    async submitEvaluation(
        @Param('id') id: string,
        @Body() dto: any,
        @CurrentUser('id') userId: string,
    ) {
        return this.evaluationService.submitEvaluation(id, userId, dto);
    }

    @Get('my-results')
    async getMyResults(@CurrentUser('id') userId: string) {
        return this.evaluationService.getUserResults(userId);
    }
}

// ==================== ADMIN LMS CONTROLLER ====================
@Controller('admin/lms')
@Roles('ADMIN')
export class AdminLmsController {
    constructor(
        private readonly lmsService: LmsService,
        private readonly evaluationService: EvaluationService,
    ) { }

    // Themes
    @Get('themes')
    async getAllThemes() {
        return this.lmsService.findAllThemes(true);
    }

    @Get('themes/:id')
    async getTheme(@Param('id') id: string) {
        return this.lmsService.findThemeById(id);
    }

    @Post('themes')
    async createTheme(@Body() dto: CreateThemeDto, @CurrentTenant() tenantId: string) {
        return this.lmsService.createTheme(dto, tenantId);
    }

    @Patch('themes/:id')
    async updateTheme(@Param('id') id: string, @Body() dto: UpdateThemeDto) {
        return this.lmsService.updateTheme(id, dto);
    }

    @Delete('themes/:id')
    async deleteTheme(@Param('id') id: string) {
        return this.lmsService.deleteTheme(id);
    }

    // Courses
    @Get('courses/:id')
    async getCourse(@Param('id') id: string) {
        return this.lmsService.findCourseById(id);
    }

    @Post('courses')
    async createCourse(@Body() dto: CreateCourseDto, @CurrentTenant() tenantId: string) {
        return this.lmsService.createCourse(dto, tenantId);
    }

    @Patch('courses/:id')
    async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
        return this.lmsService.updateCourse(id, dto);
    }

    @Delete('courses/:id')
    async deleteCourse(@Param('id') id: string) {
        return this.lmsService.deleteCourse(id);
    }

    // Lessons
    @Get('lessons/:id')
    async getLesson(@Param('id') id: string) {
        return this.lmsService.findLessonById(id);
    }

    @Post('lessons')
    async createLesson(@Body() dto: CreateLessonDto, @CurrentTenant() tenantId: string) {
        return this.lmsService.createLesson(dto, tenantId);
    }

    @Patch('lessons/:id')
    async updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
        return this.lmsService.updateLesson(id, dto);
    }

    @Delete('lessons/:id')
    async deleteLesson(@Param('id') id: string) {
        return this.lmsService.deleteLesson(id);
    }

    @Post('lessons/:id/attachments')
    async addLessonAttachment(
        @Param('id') lessonId: string,
        @Body() dto: CreateLessonAttachmentDto,
    ) {
        return this.lmsService.addLessonAttachment(lessonId, dto);
    }

    @Delete('attachments/:id')
    async removeLessonAttachment(@Param('id') id: string) {
        return this.lmsService.removeLessonAttachment(id);
    }

    // Evaluations
    @Get('evaluations/:id')
    async getEvaluation(@Param('id') id: string) {
        return this.evaluationService.findEvaluationById(id);
    }

    @Post('evaluations')
    async createEvaluation(@Body() dto: CreateEvaluationDto) {
        return this.evaluationService.createEvaluation(dto);
    }

    @Patch('evaluations/:id')
    async updateEvaluation(@Param('id') id: string, @Body() dto: UpdateEvaluationDto) {
        return this.evaluationService.updateEvaluation(id, dto);
    }

    @Delete('evaluations/:id')
    async deleteEvaluation(@Param('id') id: string) {
        return this.evaluationService.deleteEvaluation(id);
    }

    // Questions
    @Post('evaluations/:evaluationId/questions')
    async addQuestion(
        @Param('evaluationId') evaluationId: string,
        @Body() dto: CreateQuestionDto,
    ) {
        return this.evaluationService.addQuestion(evaluationId, dto);
    }

    @Patch('questions/:id')
    async updateQuestion(@Param('id') id: string, @Body() dto: Partial<CreateQuestionDto>) {
        return this.evaluationService.updateQuestion(id, dto);
    }

    @Delete('questions/:id')
    async deleteQuestion(@Param('id') id: string) {
        return this.evaluationService.deleteQuestion(id);
    }
}

