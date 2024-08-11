import { Post } from "@lens-protocol/react-web";
import { ArrowLeftRightIcon, HeartIcon, MessageSquareIcon } from "lucide-react";

export const PostReactions = ({ post }: { post: Post }) => {
	return (
		<div className="flex flex-row gap-3 items-center justify-center text-muted-foreground text-sm">
			<div className="flex flex-row gap-1 items-center">
				<HeartIcon size={14} />
				{post.stats.upvotes}
			</div>
			<div className="flex flex-row gap-1 items-center">
				<ArrowLeftRightIcon size={14} />
				{post.stats.mirrors}
			</div>
			<div className="flex flex-row gap-1 items-center">
				<MessageSquareIcon size={14} />
				{post.stats.comments}
			</div>
		</div>
	);
};
