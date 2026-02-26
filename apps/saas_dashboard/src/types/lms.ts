export interface Theme {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string | null;
    order: number;
    published: boolean;
    courses?: Course[];
    evaluation?: { id: string; title: string } | null;
    _count?: { courses: number };
}

export interface Course {
    id: string;
    themeId: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string | null;
    order: number;
    isFree: boolean;
    published: boolean;
    theme?: { id: string; title: string; slug: string };
    lessons?: Lesson[];
    _count?: { lessons: number };
    progress?: { completed: number; total: number };
}

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    slug: string;
    content?: string;
    videoUrl: string | null;
    duration: number | null;
    order: number;
    published: boolean;
    course?: {
        id: string;
        title: string;
        slug: string;
        theme?: { id: string; title: string; slug: string };
    };
    completed?: boolean;
    navigation?: {
        prev: { slug: string; title: string } | null;
        next: { slug: string; title: string } | null;
    };
    userProgress?: { completed: boolean; watchedTime: number };
}

export interface Evaluation {
    id: string;
    themeId: string;
    title: string;
    description: string | null;
    passingScore: number;
    timeLimit: number | null;
    questions?: Question[];
    theme?: { id: string; title: string; slug: string };
    alreadyCompleted?: boolean;
    previousResult?: { score: number; passed: boolean } | null;
}

export interface Question {
    id: string;
    question: string;
    options: { id: string; text: string }[];
    order: number;
}

export interface EvaluationResult {
    id: string;
    score: number;
    passed: boolean;
    timeTaken: number | null;
    completedAt: string;
    correctAnswers?: number;
    totalQuestions?: number;
    message?: string;
    evaluation?: {
        title: string;
        passingScore: number;
        theme?: { id: string; title: string };
    };
}

export interface CourseProgress {
    course: {
        id: string;
        title: string;
        slug: string;
        theme?: { id: string; title: string };
    };
    lessons: { completed: number; total: number };
    lastActivity: string;
}

