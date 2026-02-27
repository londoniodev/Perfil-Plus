"use client";

import { QuestionEditor as SharedQuestionEditor, Question, ImageUploader } from "@alvarosky/ui";
import { useTenant } from "@/app/providers";
import { API_BASE } from "@/lib/config";

interface QuestionEditorProps {
    question: Question;
    onSave: (q: Question) => void;
    onCancel: () => void;
}

export default function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
    const { tenantId } = useTenant();

    const ImageUploaderWrapper = (props: any) => (
        <ImageUploader {...props} apiBase={API_BASE} tenantId={tenantId} />
    );

    return (
        <SharedQuestionEditor
            question={question}
            onSave={onSave}
            onCancel={onCancel}
            ImageUploader={ImageUploaderWrapper}
        />
    );
}
