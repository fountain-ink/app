"use client";

import { env } from "@/env";
import Capsule, { CapsuleModal } from "@usecapsule/react-sdk";
import { useEffect, useState } from "react";

export const EmailSignup = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const [Modal, setCapsuleModalComponent] = useState<
		typeof CapsuleModal | null
	>(null);
	const [capsuleInstance, setCapsuleInstance] = useState<
		Capsule | null | undefined
	>(null);

	async function loadCapsule() {
		let loadedInstance;
		if (!capsuleInstance) {
			const CapsuleModule = await import("@usecapsule/react-sdk");

			loadedInstance = new CapsuleModule.default(
				CapsuleModule.Environment.DEVELOPMENT,
				env.NEXT_PUBLIC_CAPSULE_API_KEY
			);
		}
		return loadedInstance;
	}

	useEffect(() => {
		// Perform localStorage action
		setShouldRender(true);
		loadCapsule().then((capsule) => {
			setCapsuleInstance(capsule);
		});
	}, []);

	useEffect(() => {
		async function loadCapsuleModule() {
			const { CapsuleModal } = await import("@usecapsule/react-sdk");
			setCapsuleModalComponent(() => CapsuleModal);
		}
		loadCapsuleModule();
	}, []);

	useEffect(() => {
		loadCapsule().then((capsule) => {
			setCapsuleInstance(capsule);
		});
	}, []);

	if (!Modal || !capsuleInstance || !shouldRender) return null;

	return (
		<>
			<button
				type="button"
				onClick={() => {
					setIsOpen(true);
				}}
			>
				Open Capsule
			</button>
			<Modal
				capsule={capsuleInstance}
				appName={"NextJS Example"}
				isOpen={isOpen}
				onClose={() => {
					setIsOpen(false);
				}}
			/>
		</>
	);
};
