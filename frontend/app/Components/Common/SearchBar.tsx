"use client";

import { Search } from "lucide-react";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";

export interface SearchBarProps {
    placeholder?: string;
    onSearch?: (value: string) => void;
    defaultValue?: string;
    className?: string;
    variant?: "default" | "rounded";
    size?: "sm" | "md" | "lg";
}

/**
 * Reusable SearchBar component for dashboard pages
 *
 * @param placeholder - Placeholder text for the search input
 * @param onSearch - Callback function when search value changes
 * @param defaultValue - Initial value for the search input
 * @param className - Additional CSS classes
 * @param variant - Visual style variant (default: rounded pill, rounded: fully rounded)
 * @param size - Size of the search bar (sm, md, lg)
 */
export function SearchBar({
    placeholder = "Search...",
    onSearch,
    defaultValue = "",
    className = "",
    variant = "rounded",
    size = "md",
}: SearchBarProps) {
    const [value, setValue] = useState(defaultValue);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setValue(newValue);
            onSearch?.(newValue);
        },
        [onSearch],
    );

    // Size classes
    const sizeClasses = {
        sm: "h-9 text-sm",
        md: "h-11 text-sm",
        lg: "h-12 text-base",
    };

    // Icon size classes
    const iconSizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    // Variant classes
    const variantClasses = {
        default: "rounded-md",
        rounded: "rounded-full",
    };

    return (
        <div className={`relative w-full ${className}`}>
            <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${iconSizeClasses[size]}`}
            />
            <Input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={`w-full border-none bg-accent pl-10 pr-4 placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 ${sizeClasses[size]} ${variantClasses[variant]}`}
            />
        </div>
    );
}

export default SearchBar;
