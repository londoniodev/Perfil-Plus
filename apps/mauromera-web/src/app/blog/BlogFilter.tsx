import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/types/blog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@alvarosky/ui";

interface BlogFilterProps {
    categories: Category[];
    activeCategory?: string;
}

export function BlogFilter({ categories, activeCategory }: BlogFilterProps) {
    const router = useRouter();

    const handleValueChange = (value: string) => {
        if (value === "all") {
            router.push("/blog");
        } else {
            router.push(`/blog?category=${value}`);
        }
    };

    return (
        <div className="mb-8 w-full max-w-[250px]">
            <Select
                value={activeCategory || "all"}
                onValueChange={handleValueChange}
            >
                <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Filtrar por tema" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los temas</SelectItem>
                    {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

