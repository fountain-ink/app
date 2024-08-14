import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { TypeIcon } from "lucide-react";
import { ThemeButtons } from "./ThemeButtons";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const ThemeSidebar = () => {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button className="h-10 w-10 p-0" variant="ghost">
					<TypeIcon />
				</Button>
			</SheetTrigger>

			<SheetContent>
				<SheetHeader>
					<SheetTitle>Theme Editor</SheetTitle>
					<SheetDescription>
						Choose a preset or make your own theme.
					</SheetDescription>
				</SheetHeader>
				<Tabs className="mt-4" defaultValue="account">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="presets">Presets</TabsTrigger>
						<TabsTrigger value="custom">Custom</TabsTrigger>
					</TabsList>
					<TabsContent value="presets">
						<ThemeButtons />
					</TabsContent>
					<TabsContent value="custom">
						<ThemeEditor />
					</TabsContent>
				</Tabs>
			</SheetContent>
		</Sheet>
	);
};

export const ThemeEditor = () => {
	return (
		<>
			<div className="grid gap-4 py-4">
				<div className="grid grid-cols-4 items-center gap-4">
					<Label htmlFor="color" className="text-right">
						Leading Color
					</Label>
					<Input id="color" value="#e2f3ab" className="col-span-3" />
				</div>
				<div className="grid grid-cols-4 items-center gap-4">
					<Label htmlFor="background" className="text-right">
						Background Color
					</Label>
					<Input id="background" value="#bbccaa" className="col-span-3" />
				</div>
			</div>

			<SheetFooter>
				<SheetClose asChild>
					<Button type="submit">Save changes</Button>
				</SheetClose>
			</SheetFooter>
		</>
	);
};
