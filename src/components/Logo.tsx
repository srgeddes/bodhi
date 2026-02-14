"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
	size?: "sm" | "md" | "lg";
	showText?: boolean;
	className?: string;
}

const sizes = {
	sm: { icon: 28, text: "text-base" },
	md: { icon: 44, text: "text-2xl" },
	lg: { icon: 80, text: "text-4xl" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
	const { icon, text } = sizes[size];

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Image src="/images/logo.png" alt="Bodhi" width={icon} height={icon} className="object-contain" />
			{showText && <span className={cn("font-semibold tracking-tight text-foreground", text)}>Bodhi</span>}
		</div>
	);
}
