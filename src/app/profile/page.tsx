import { UserAvatar } from "@/components/user/UserAvatar";
import { Suspense } from "react";

export default function ProfilePage() {
	return (
		<div className="container flex flex-col items-center justify-center w-full max-w-lg lg:max-w-xl">
			<Suspense fallback={null}>
				<UserAvatar />
			</Suspense>
		</div>
	);
}
