"use client";

import React from "react";
import { ToggleButton as SharedToggleButton, PremiumIcon, PublishIcon } from "@alvarosky/ui";

interface ToggleButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    activeColor?: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
}

export default function ToggleButton(props: ToggleButtonProps) {
    return <SharedToggleButton {...props} />;
}

export { PremiumIcon, PublishIcon };
