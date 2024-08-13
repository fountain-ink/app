"use client";

import { themeNames, themes } from "@/styles/themes";
import { useTheme } from "./ThemeContext";
import { Button } from "./ui/button";

export const ThemeButtons = () => {
	const { setTheme } = useTheme();

	const themeButtons = Object.values(themeNames).map((theme) => {
		const accent = themes[theme]["--accent"];

		return (
			<Button
				variant="outline"
				className="flex gap-2 w-full h-24"
				key={theme}
				onClick={() => setTheme(theme)}
			>
				<div
					className="w-6 h-6 rounded-full"
					style={{ backgroundColor: `hsl(${accent})` }}
				/>

				{theme}
			</Button>
		);
	});

	return <div className="flex flex-col gap-2">{themeButtons}</div>;
};
