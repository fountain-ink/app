"use client";

import { type ReactNode, useEffect, useRef } from "react";

export const SmoothScroll = ({
	children,
	speed = 0.05,
}: {
	children: ReactNode;
	speed?: number;
}) => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const smoothScrollRef = useRef<HTMLDivElement>(null);
	const requestRef = useRef<number | null>(null);
	const previousTimeRef = useRef<number | null>(null);

	const lerp = (start: number, end: number, factor: number): number =>
		start * (1 - factor) + end * factor;

	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		const smoothScrollContainer = smoothScrollRef.current;

		if (!scrollContainer || !smoothScrollContainer) return;

		let currentScroll = 0;
		let targetScroll = 0;

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			targetScroll = Math.max(
				0,
				Math.min(
					targetScroll + e.deltaY,
					smoothScrollContainer.clientHeight - window.innerHeight,
				),
			);
		};

		const smoothScrolling = (time: number) => {
			if (previousTimeRef.current !== null) {
				currentScroll = lerp(currentScroll, targetScroll, speed);
				scrollContainer.scrollTop = currentScroll;
			}
			previousTimeRef.current = time;
			requestRef.current = requestAnimationFrame(smoothScrolling);
		};

		requestRef.current = requestAnimationFrame(smoothScrolling);
		scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
			scrollContainer.removeEventListener("wheel", handleWheel);
		};
	}, [speed, lerp]);

	return (
		<div ref={scrollContainerRef} className="h-screen overflow-hidden">
			<div ref={smoothScrollRef} className="smooth-scroll">
				{children}
			</div>
		</div>
	);
};
