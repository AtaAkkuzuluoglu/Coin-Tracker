"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Get saved theme from localStorage
        const savedTheme = localStorage.getItem("coin-tracker-theme") as Theme | null;
        if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
            setThemeState(savedTheme);
        } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            setThemeState("light");
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            // Update document class and save to localStorage
            const root = document.documentElement;
            root.classList.remove("dark", "light");
            root.classList.add(theme);
            localStorage.setItem("coin-tracker-theme", theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    // Return children immediately but with default theme to prevent hydration mismatch
    // The useEffect will update the theme after hydration
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
