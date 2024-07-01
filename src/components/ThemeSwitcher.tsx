"use client";

import { useTheme } from "./ThemeContext";
import { Button } from "./ui/button";

export const ThemeSwitcher = () => {
	const { theme, setTheme } = useTheme();

	return (
		<Button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
			Switch to {theme === "light" ? "Dark" : "Light"} Theme
		</Button>
	);
};
