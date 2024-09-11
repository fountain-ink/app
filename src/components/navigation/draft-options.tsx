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
				className="hover:bg-accent hover:text-muted-foreground stroke-1 hover:stroke-2"
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
