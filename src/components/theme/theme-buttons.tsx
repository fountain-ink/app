"use client";

import { themeNames, globalThemes } from "@/styles/themes";
import { useTheme } from "./theme-context";
import { Button } from "../ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

export const ThemeButtons = () => {
	const { setTheme } = useTheme();

	const themeButtons = Object.values(themeNames).map((theme) => {
		const foreground = globalThemes[theme]["--foreground"];
		const background = globalThemes[theme]["--background"];
		const themeName = theme;
		const placeholderText =
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

		return (
			<Button
				variant="outline"
				className="flex flex-col items-start overflow-visible text-left gap-2 w-full h-fit p-8"
				style={{
					backgroundColor: `hsl(${background})`,
					color: `hsl(${foreground})`,
				}}
				key={theme}
				onClick={() => setTheme(theme)}
			>
				<h1 className="font-bold text-5xl font-martina">{themeName}</h1>
				<p className="text-md break-all whitespace-normal">{placeholderText}</p>
			</Button>
		);
	});

	return <div className="flex flex-col gap-2">{themeButtons}</div>;
};

