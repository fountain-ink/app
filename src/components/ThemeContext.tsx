"use client";
import { ThemeType, themes } from "@/styles/themes";
import React, {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface ThemeContextType {
	theme: ThemeType;
	setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const [theme, setTheme] = useState<ThemeType>("light");

	useEffect(() => {
		const root = document.documentElement;
		const themeEntries = Object.entries(themes[theme]);

		for (let i = 0; i < themeEntries.length; i++) {
			// biome-ignore lint/style/noNonNullAssertion: inteded use
			const [key, value] = themeEntries[i]!;

			root.style.setProperty(`--${key}`, value);
		}
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = (): ThemeContextType => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
