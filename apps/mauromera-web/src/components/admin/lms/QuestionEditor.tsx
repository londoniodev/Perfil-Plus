"use client";

import { QuestionEditor as SharedQuestionEditor, Question } from "@alvarosky/ui";
import ImageUploader from "@/components/admin/ui/ImageUploader";

interface QuestionEditorProps {
    question: Question;
    onSave: (q: Question) => void;
    onCancel: () => void;
}

export default function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
    return (
        <SharedQuestionEditor
            question={question}
            onSave={onSave}
            onCancel={onCancel}
            ImageUploader={ImageUploader}
        />
    );
}
