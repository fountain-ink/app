import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { BlogSettings } from "./BlogSettings";
import { GeneralSettings } from "./GeneralSettings";
import { ThemeSettings } from "./ThemeSettings";

const tabData = [
	{ id: "general", label: "General", icon: Settings, enabled: true },
	{ id: "themes", label: "Themes", icon: Palette, enabled: true },
	{ id: "blog", label: "Blog", icon: FileText, enabled: true },
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

export default function SettingsPage() {
	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<h1 className="text-3xl font-bold mb-8">Settings</h1>
			<Tabs defaultValue="general" className="space-y-6 h-10">
				<TabsList className="flex justify-start gap-2 bg-transparent">
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
					<GeneralSettings />
				</TabsContent>

				<TabsContent value="themes">
					<ThemeSettings />
				</TabsContent>

				<TabsContent value="blog">
					<BlogSettings />
				</TabsContent>
			</Tabs>
		</div>
	);
}
