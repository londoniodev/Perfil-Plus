"use client";

import { QuestionEditor as SharedQuestionEditor, Question, ImageUploader } from "@alvarosky/ui";
import { API_BASE, TENANT_ID } from "@/lib/config";

interface QuestionEditorProps {
    question: Question;
    onSave: (q: Question) => void;
    onCancel: () => void;
}

export default function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
    const ImageUploaderWrapper = (props: any) => (
        <ImageUploader {...props} apiBase={API_BASE} tenantId={TENANT_ID} />
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
