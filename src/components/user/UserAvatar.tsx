"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { Suspense } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const SessionAvatar = () => {
	const { data: session, loading, error } = useSession();

	if (loading) {
		return <AvatarSuspense />;
	}

	if (error) {
		toast.error(error.message);
		return <AvatarSuspense />;
	}

	if (session.type !== SessionType.WithProfile) {
		return null;
	}

	const avatar =
		session?.profile?.metadata?.picture?.__typename === "ImageSet"
			? session?.profile?.metadata?.picture?.optimized?.uri ||
			  session?.profile?.metadata?.picture?.raw?.uri
			: session?.profile?.metadata?.picture?.image.optimized?.uri ||
			  session?.profile?.metadata?.picture?.image.raw?.uri;

	return (
		<Avatar className="w-full h-full m-0">
			<AvatarImage src={avatar} />

			<AvatarFallback>
				<AvatarSuspense />
			</AvatarFallback>
		</Avatar>
	);
};

const AvatarSuspense = () => {
	return (
		<div className="flex h-full w-full items-center justify-center rounded-full bg-muted" />
	);
};

export const UserAvatar = ({ size = 40 }: { size?: number }) => {
	return (
		<Suspense fallback={null}>
			<div style={{ width: size, height: size }}>
				<SessionAvatar />
			</div>
		</Suspense>
	);
};
