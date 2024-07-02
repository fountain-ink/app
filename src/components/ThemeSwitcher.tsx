"use client";

import { themeNames, themes } from "@/styles/themes";
import { useTheme } from "./ThemeContext";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const ThemeSwitcher = () => {
	const { theme, setTheme } = useTheme();

	const themeButtons = Object.values(themeNames).map((theme) => {
		const accent = themes[theme].accent;
		// const background = themes[theme].background;
		// const foreground = themes[theme].foreground;

		return (
			<DropdownMenuItem
				className="flex gap-2"
				key={theme}
				onClick={() => setTheme(theme)}
				// style={{
				// 	backgroundColor: `hsl(${background})`,
				// 	color: `hsl(${foreground})`,
				// }}
			>
				<div
					className="w-6 h-6 rounded-full"
					style={{ backgroundColor: `hsl(${accent})` }}
				/>

				{theme}
			</DropdownMenuItem>
		);
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<div className="flex gap-2">
					<div className="w-6 h-6 rounded-full bg-accent" />
					Switch Theme
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Article Theme</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{themeButtons}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
