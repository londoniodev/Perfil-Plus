"use client";

import Link from "next/link";
import {
    ActiveSubscriptionCard as SharedActiveSubscriptionCard
} from "@alvarosky/ui";
import { GLASS_CARD_STYLES } from "@/constants/styles";

interface ActiveSubscriptionCardProps {
    endDate: string | null;
    onCancel: () => void;
}

export default function ActiveSubscriptionCard({ endDate, onCancel }: ActiveSubscriptionCardProps) {
    return (
        <SharedActiveSubscriptionCard
            endDate={endDate}
            onCancel={onCancel}
            coursesHref="/cursos"
            glassStyles={GLASS_CARD_STYLES}
        />
    );
}
