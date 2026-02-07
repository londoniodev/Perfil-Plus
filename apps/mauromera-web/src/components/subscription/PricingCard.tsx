"use client";

import { PricingCard as SharedPricingCard } from "@alvarosky/ui";
import { GLASS_CARD_STYLES } from "@/constants/styles";

interface PricingCardProps {
    onSubscribe: () => void;
    processing: boolean;
}

export default function PricingCard({ onSubscribe, processing }: PricingCardProps) {
    return (
        <SharedPricingCard
            onSubscribe={onSubscribe}
            processing={processing}
            glassStyles={GLASS_CARD_STYLES}
        />
    );
}
