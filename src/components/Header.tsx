"use client";

import { Suspense } from "react";
import { FountainLogo } from "./Icons";
import { UserAvatar } from "./user/UserAvatar";

export const Header = () => {
	return (
		<div className="fixed w-full p-2 z-[50] backdrop-blur-sm flex justify-between items-center">
			<div className="w-10 h-10 flex items-center justify-center">
				<FountainLogo />
			</div>
			<Suspense fallback={null}>
				<UserAvatar />
			</Suspense>
		</div>
	);
};
