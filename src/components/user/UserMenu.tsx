"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearCookies } from "@/lib/clearCookies";
import { SessionType, useLogout, useSession } from "@lens-protocol/react-web";
import { ArrowLeftRightIcon, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectWalletButton } from "../auth/ConnectWallet";
import { ProfileSelect } from "../auth/ProfileSelect";
import { AvatarSuspense, SessionAvatar } from "./UserAvatar";

export const UserMenu = () => {
	const { data: session, loading, error } = useSession();
	const { isConnected: isWalletConnected } = useAccount();
	const { disconnect } = useDisconnect();
	const { execute: logout, loading: logoutLoading } = useLogout();

	if (loading) return <AvatarSuspense />;

	if (error) {
		toast.error(error.message);
		return null;
	}

	if (!isWalletConnected) {
		return <ConnectWalletButton />;
	}

	if (session.type !== SessionType.WithProfile) {
		return <ProfileSelect onSuccess={() => {}} />;
	}

	const handle = session.profile?.handle?.localName;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					<SessionAvatar />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48 mt-1">
				<Link href={`/u/${handle}`} passHref>
					<DropdownMenuItem className="flex justify-end gap-2 items-center text-base">
						<span>Profile</span>
						<User className="h-5 w-5" />
					</DropdownMenuItem>
				</Link>
				<DropdownMenuItem
					onClick={() => {
						logout();
						clearCookies();
					}}
					disabled={logoutLoading}
					className="flex justify-end gap-2 items-center text-base"
				>
					<span>Switch Profile</span>
					<ArrowLeftRightIcon className="h-5 w-5" />
				</DropdownMenuItem>
				<Link href="/settings" passHref>
					<DropdownMenuItem className="flex justify-end gap-2 items-center text-base">
						<span>Settings</span>
						<Settings className="h-5 w-5" />
					</DropdownMenuItem>
				</Link>

				<DropdownMenuItem
					onClick={() => {
						disconnect();
            logout();
						clearCookies();
					}}
					className="flex justify-end gap-2 items-center text-base"
				>
					<span>Disconnect</span>
					<LogOut className="h-5 w-5" />
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
