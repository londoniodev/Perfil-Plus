import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEvaluationDto,
  UpdateEvaluationDto,
  SubmitEvaluationDto,
  CreateQuestionDto,
} from './dto';

@Injectable()
export class EvaluationService {
  constructor(private prisma: PrismaService) {}

  // ==================== EVALUATIONS ====================

  async createEvaluation(dto: CreateEvaluationDto) {
    // Verificar que el tema existe y no tiene evaluación
    const theme = await this.prisma.secure.theme.findUnique({
      where: { id: dto.themeId },
      include: { evaluation: true },
    });

    if (!theme) throw new NotFoundException('Tema no encontrado');
    if (theme.evaluation)
      throw new BadRequestException('Este tema ya tiene una evaluación');

    const { questions, ...evaluationData } = dto;

    return this.prisma.secure.evaluation.create({
      data: {
        ...evaluationData,
        questions: questions?.length
          ? {
              create: questions.map((q, index) => ({
                question: q.question,
                image: q.image,
                options: q.options as any,
                correctId: q.correctId,
                order: q.order ?? index,
              })),
            }
          : undefined,
      },
      include: {
        questions: { orderBy: { order: 'asc' } },
        theme: { select: { id: true, title: true } },
      },
    });
  }

  async updateEvaluation(id: string, dto: UpdateEvaluationDto) {
    const evaluation = await this.prisma.secure.evaluation.findUnique({
      where: { id },
    });
    if (!evaluation) throw new NotFoundException('Evaluación no encontrada');

    return this.prisma.secure.evaluation.update({
      where: { id },
      data: dto,
      include: {
        questions: { orderBy: { order: 'asc' } },
        theme: { select: { id: true, title: true } },
      },
    });
  }

  async deleteEvaluation(id: string) {
    const evaluation = await this.prisma.secure.evaluation.findUnique({
      where: { id },
    });
    if (!evaluation) throw new NotFoundException('Evaluación no encontrada');

    await this.prisma.secure.evaluation.delete({ where: { id } });
    return { message: 'Evaluación eliminada correctamente' };
  }

  async findEvaluationById(id: string) {
    const evaluation = await this.prisma.secure.evaluation.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        theme: { select: { id: true, title: true } },
        _count: { select: { results: true } },
      },
    });
    if (!evaluation) throw new NotFoundException('Evaluación no encontrada');
    return evaluation;
  }

  // ==================== QUESTIONS ====================

  async addQuestion(evaluationId: string, dto: CreateQuestionDto) {
    const evaluation = await this.prisma.secure.evaluation.findUnique({
      where: { id: evaluationId },
    });
    if (!evaluation) throw new NotFoundException('Evaluación no encontrada');

    // Obtener el orden máximo actual
    const maxOrder = await this.prisma.secure.question.aggregate({
      where: { evaluationId },
      _max: { order: true },
    });

    return this.prisma.secure.question.create({
      data: {
        evaluationId,
        question: dto.question,
        image: dto.image,
        options: dto.options as any,
        correctId: dto.correctId,
        order: dto.order ?? (maxOrder._max.order ?? 0) + 1,
      },
    });
  }

  async updateQuestion(id: string, dto: Partial<CreateQuestionDto>) {
    const question = await this.prisma.secure.question.findUnique({
      where: { id },
    });
    if (!question) throw new NotFoundException('Pregunta no encontrada');

    return this.prisma.secure.question.update({
      where: { id },
      data: dto.options
        ? { ...dto, options: dto.options as any }
        : (dto as any),
    });
  }

  async deleteQuestion(id: string) {
    const question = await this.prisma.secure.question.findUnique({
      where: { id },
    });
    if (!question) throw new NotFoundException('Pregunta no encontrada');

    await this.prisma.secure.question.delete({ where: { id } });
    return { message: 'Pregunta eliminada correctamente' };
  }

  // ==================== TAKE EVALUATION ====================

  async getEvaluationForUser(evaluationId: string, userId: string) {
    const evaluation = await this.prisma.secure.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            options: true,
            order: true,
            // NO incluir correctId para el usuario
          },
        },
        theme: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!evaluation) throw new NotFoundException('Evaluación no encontrada');

    // Verificar si ya completó la evaluación
    const existingResult = await this.prisma.secure.evaluationResult.findUnique({
      where: { userId_evaluationId: { userId, evaluationId } },
    });

    return {
      ...evaluation,
      alreadyCompleted: !!existingResult,
      previousResult: existingResult
        ? { score: existingResult.score, passed: existingResult.passed }
        : null,
    };
  }

  async submitEvaluation(
    evaluationId: string,
    userId: string,
    dto: SubmitEvaluationDto,
  ) {
    const evaluation = await this.prisma.secure.evaluation.findUnique({
      where: { id: evaluationId },
      include: { questions: true },
    });

    if (!evaluation) throw new NotFoundException('Evaluación no encontrada');

    // Verificar si ya completó la evaluación
    const existingResult = await this.prisma.secure.evaluationResult.findUnique({
      where: { userId_evaluationId: { userId, evaluationId } },
    });

    if (existingResult) {
      throw new BadRequestException('Ya has completado esta evaluación');
    }

    // Calcular puntuación
    let correctAnswers = 0;
    const totalQuestions = evaluation.questions.length;

    for (const answer of dto.answers) {
      const question = evaluation.questions.find(
        (q) => q.id === answer.questionId,
      );
      if (question && question.correctId === answer.selectedId) {
        correctAnswers++;
      }
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= evaluation.passingScore;

    // Guardar resultado
    const result = await this.prisma.secure.evaluationResult.create({
      data: {
        userId,
        evaluationId,
        score,
        passed,
        answers: dto.answers as any,
        timeTaken: dto.timeTaken,
      },
      include: {
        evaluation: {
          select: {
            title: true,
            passingScore: true,
            theme: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });

    return {
      ...result,
      correctAnswers,
      totalQuestions,
      message: passed
        ? '¡Felicitaciones! Has aprobado la evaluación.'
        : 'No has alcanzado el puntaje mínimo. Puedes revisar el contenido y volver a intentarlo.',
    };
  }

  async getUserResults(userId: string) {
    return this.prisma.secure.evaluationResult.findMany({
      where: { userId },
      include: {
        evaluation: {
          select: {
            title: true,
            passingScore: true,
            theme: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });
  }
}
