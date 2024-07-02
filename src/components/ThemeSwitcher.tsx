"use client";

import { themeNames, themes } from "@/styles/themes";
import { ChevronDown } from "lucide-react";
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
	const { setTheme } = useTheme();

	const themeButtons = Object.values(themeNames).map((theme) => {
		const accent = themes[theme]["--accent"];

		return (
			<DropdownMenuItem
				className="flex gap-2"
				key={theme}
				onClick={() => setTheme(theme)}
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
				<div className="flex gap-2 items-center">
					<div className="w-6 h-6 rounded-full bg-accent" />
					Switch Theme
					<ChevronDown size={16} />
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
