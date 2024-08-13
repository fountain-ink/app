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
import Link from "next/link";
import { FountainLogo } from "./Icons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { UserMenu } from "./user/UserMenu";

export const Header = () => {
	return (
		<div className="fixed w-full p-2 z-[50] flex justify-between items-center">
			<Link href={"/"} className="w-10 h-10 flex items-center justify-center">
				<FountainLogo />
			</Link>
			<div className="flex gap-4">
				<Sheet>
					<SheetTrigger asChild>
						<Button className="h-10 w-10 p-0" variant="ghost">
							<TypeIcon />
						</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Edit theme</SheetTitle>
							<SheetDescription>
								Make changes to your theme. Click save when you're done.
							</SheetDescription>
						</SheetHeader>
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
					</SheetContent>
				</Sheet>

				<Link href={"/write"} className="h-10 flex items-center justify-center">
					<Button className="rounded-full px-6 font-bold">Write</Button>
				</Link>
				<UserMenu />
			</div>
		</div>
	);
};
