"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	DollarSign,
	FileText,
	LayoutGrid,
	Mail,
	Megaphone,
	Palette,
	Settings,
	Users,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState("general");

	const tabData = [
		{ id: "general", label: "General", icon: Settings, enabled: true },
		{ id: "themes", label: "Themes", icon: Palette, enabled: true },
		{ id: "blog", label: "Blog", icon: FileText, enabled: true },
		{
			id: "paid-follows",
			label: "Follows",
			icon: DollarSign,
			enabled: false,
		},
		{
			id: "paid-subscriptions",
			label: "Subscriptions",
			icon: DollarSign,
			enabled: false,
		},
		{
			id: "advertising",
			label: "Advertising",
			icon: Megaphone,
			enabled: false,
		},
		{ id: "newsletter", label: "Newsletter", icon: Mail, enabled: false },
		{ id: "team", label: "Team", icon: Users, enabled: false },
		{ id: "layouts", label: "Layouts", icon: LayoutGrid, enabled: false },
	];

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<h1 className="text-3xl font-bold mb-8">Settings</h1>
			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-6 h-10"
			>
				<TabsList className="flex justify-between bg-transparent">
					{tabData.map((tab) => (
						<TabsTrigger
							key={tab.id}
							value={tab.id}
							disabled={!tab.enabled}
							className={`px-4 py-2 flex items-center space-x-2 rounded-lg text-sm font-medium transition-colors
                ${
									tab.enabled
										? "bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
										: "opacity-50 cursor-not-allowed"
								}`}
						>
							{tab.icon && <tab.icon className="w-4 h-4" />}
							<span className="hidden sm:inline">{tab.label}</span>
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent value="general">
					<Card>
						<CardHeader>
							<CardTitle>General Settings</CardTitle>
							<CardDescription>
								Manage your general account settings.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="username">Username</Label>
								<Input id="username" placeholder="Your username" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input id="email" type="email" placeholder="Your email" />
							</div>
							<div className="flex items-center space-x-2">
								<Switch id="notifications" />
								<Label htmlFor="notifications">
									Enable email notifications
								</Label>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="themes">
					<Card>
						<CardHeader>
							<CardTitle>Theme Settings</CardTitle>
							<CardDescription>
								Customize the appearance of your account.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="theme">Select Theme</Label>
								<Select>
									<SelectTrigger id="theme">
										<SelectValue placeholder="Select a theme" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="light">Light</SelectItem>
										<SelectItem value="dark">Dark</SelectItem>
										<SelectItem value="system">System</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-center space-x-2">
								<Switch id="auto-theme" />
								<Label htmlFor="auto-theme">
									Automatically switch theme based on time
								</Label>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="blog">
					<Card>
						<CardHeader>
							<CardTitle>Blog Settings</CardTitle>
							<CardDescription>
								Customize your blog preferences.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="blog-title">Blog Title</Label>
									<div className="flex items-center space-x-2">
										<Switch id="use-default-title" />
										<Label htmlFor="use-default-title">
											Use default username
										</Label>
									</div>
								</div>
								<Input id="blog-title" placeholder="Your blog title" />
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="blog-description">Blog Description</Label>
									<div className="flex items-center space-x-2">
										<Switch id="use-default-description" />
										<Label htmlFor="use-default-description">
											Use default user description
										</Label>
									</div>
								</div>
								<Textarea
									id="blog-description"
									placeholder="Your blog description"
								/>
							</div>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label htmlFor="blog-background">Blog Background</Label>
									<div className="flex items-center space-x-2">
										<Switch id="use-default-background" />
										<Label htmlFor="use-default-background">
											Use default user background
										</Label>
									</div>
								</div>
								<Input id="blog-background" type="file" accept="image/*" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="default-category">Default Category</Label>
								<Select>
									<SelectTrigger id="default-category">
										<SelectValue placeholder="Select a default category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="technology">Technology</SelectItem>
										<SelectItem value="science">Science</SelectItem>
										<SelectItem value="health">Health</SelectItem>
										<SelectItem value="other">Other</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-center space-x-2">
								<Switch id="comments" />
								<Label htmlFor="comments">Enable comments on articles</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Switch id="auto-publish" />
								<Label htmlFor="auto-publish">
									Auto-publish scheduled articles
								</Label>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
