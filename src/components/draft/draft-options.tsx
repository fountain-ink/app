import { MoreVertical, TrashIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const DraftOptionsDropdown = ({
	onDeleteClick,
}: { onDeleteClick: () => void }) => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button
				variant="ghost"
				className="hover:bg-transparent hover:text-card-foreground opacity-0 group-hover:opacity-100
            			 data-[state=open]:opacity-100 transition-all ease-in duration-100"
				size="icon"
			>
				<MoreVertical className="h-5 w-5" />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent
			onClick={(e) => e.stopPropagation()}
			className="text-base"
		>
			<DropdownMenuItem
				onClick={onDeleteClick}
				className="flex gap-2 items-center"
			>
				<TrashIcon className="h-5 w-5" />
				Delete draft
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);
