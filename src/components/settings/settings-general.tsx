"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useStorage } from "@/lib/useStorage";
import { Input } from "../ui/input";

export function GeneralSettings() {
	const { isSmoothScrolling, toggleSmoothScrolling } = useStorage();

	return (
		<Card>
			<CardHeader>
				<CardTitle>General Settings</CardTitle>
				<CardDescription>Manage your general account settings.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="username">Username</Label>
					<Input id="username" placeholder="Your username" disabled />
				</div>
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" placeholder="Your email" disabled />
				</div>
				<div className="flex items-center space-x-2">
					<Switch
						id="smoothScrolling"
						checked={isSmoothScrolling}
						onCheckedChange={toggleSmoothScrolling}
					/>
					<Label htmlFor="smoothScrolling">Enable smooth scrolling</Label>
				</div>
			</CardContent>
		</Card>
	);
}
