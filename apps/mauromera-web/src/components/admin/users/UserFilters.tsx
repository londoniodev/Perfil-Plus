"use client";

import React from "react";
import { UserFilters as SharedUserFilters } from "@alvarosky/ui";

interface UserFiltersProps {
    search: string;
    role: string;
    subscription: string;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: string) => void;
    onSubscriptionChange: (value: string) => void;
}

export default function UserFilters(props: UserFiltersProps) {
    return <SharedUserFilters {...props} />;
}

