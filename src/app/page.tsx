"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles, BarChart3, Shield, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { TextAnimate } from "@/components/ui/text-animate";
import { Spotlight } from "@/components/ui/spotlight";
import { Logo } from "@/components/Logo";
import { DashboardPreview } from "@/components/DashboardPreview";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/lib/api-client";

const features = [
	{
		icon: Sparkles,
		title: "AI-Powered Insights",
		description: "Automatic transaction categorization, anomaly detection, and personalized financial intelligence.",
	},
	{
		icon: BarChart3,
		title: "Custom Dashboards",
		description: "Build your perfect view with drag-and-drop widgets or describe what you want in plain English.",
	},
	{
		icon: Shield,
		title: "Bank-Grade Security",
		description: "AES-256 encryption, read-only bank access, and zero storage of credentials.",
	},
];

export default function LandingPage() {
	const router = useRouter();
	const setUser = useAuthStore((s) => s.setUser);
	const [demoLoading, setDemoLoading] = useState(false);

	const handleTryDemo = async () => {
		setDemoLoading(true);
		try {
			const res = await apiClient.post<{ data: { user: { id: string; email: string; name: string | null; emailVerified: boolean; mfaEnabled: boolean }; token: string } }>(
				"/api/auth/demo"
			);
			setUser(res.data.user);
			router.push("/dashboard");
		} catch {
			setDemoLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen bg-background overflow-hidden">
			{/* Gradient mesh blobs */}
			<div className="fixed inset-0 -z-10 overflow-hidden">
				<motion.div
					className="absolute top-[10%] left-[15%] h-[600px] w-[600px] rounded-full bg-[#b8c5b0] blur-[100px] animate-blob-drift"
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.4 }}
					transition={{ duration: 2 }}
				/>
				<motion.div
					className="absolute top-[50%] right-[10%] h-[500px] w-[500px] rounded-full bg-[#c4a882] blur-[120px] animate-blob-drift-reverse"
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.3 }}
					transition={{ duration: 2, delay: 0.3 }}
				/>
				<motion.div
					className="absolute bottom-[10%] left-[40%] h-[400px] w-[400px] rounded-full bg-[#b8b0c5] blur-[80px] animate-blob-drift"
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.25 }}
					transition={{ duration: 2, delay: 0.5 }}
				/>
			</div>

			{/* Header */}
			<header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/60 backdrop-blur-md border-b border-border/50">
				<BlurFade delay={0.2}>
					<Logo size="md" />
				</BlurFade>
				<BlurFade delay={0.2}>
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/login">Sign in</Link>
						</Button>
						<Button size="sm" asChild>
							<Link href="/register">Get Started</Link>
						</Button>
					</div>
				</BlurFade>
			</header>

			{/* Hero */}
			<section className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-20">
				<Spotlight className="-top-40 left-0 md:left-60 md:-top-20 opacity-60" fill="var(--primary)" />

				<div className="flex flex-col items-center text-center max-w-3xl mx-auto">
					<TextGenerateEffect
						words="Your finances, simplified."
						className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground"
						startDelay={0.3}
						duration={0.8}
					/>

					<BlurFade delay={1.3}>
						<p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
							A calm, thoughtful approach to understanding your money. Connect your accounts, build custom dashboards, and let AI handle the rest.
						</p>
					</BlurFade>

					<div className="mt-10 flex flex-col sm:flex-row gap-3">
						<BlurFade delay={2.0}>
							<Button size="lg" asChild>
								<Link href="/register">
									Get Started Free
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</BlurFade>
						<BlurFade delay={2.2}>
							<Button size="lg" variant="outline" onClick={handleTryDemo} disabled={demoLoading}>
								{demoLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up demo...</> : "Try Demo"}
							</Button>
						</BlurFade>
					</div>
				</div>
			</section>

			{/* Dashboard preview */}
			<section className="relative -mt-32 px-6 pb-32">
				<DashboardPreview />
			</section>

			{/* Features */}
			<section className="px-6 py-32 max-w-5xl mx-auto">
				<BlurFade delay={0.1} inView>
					<TextAnimate animation="blurInUp" by="word" startOnView className="text-center text-3xl font-bold tracking-tight text-foreground mb-4">
						Everything you need
					</TextAnimate>
				</BlurFade>
				<BlurFade delay={0.2} inView>
					<p className="text-center text-muted-foreground mb-16 max-w-lg mx-auto">
						Powerful features wrapped in a calm, minimal interface designed to reduce financial anxiety.
					</p>
				</BlurFade>

				<div className="grid gap-8 md:grid-cols-3">
					{features.map((feature, index) => (
						<BlurFade key={feature.title} delay={0.3 + index * 0.15} inView>
							<div className="relative flex flex-col gap-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-10 h-full overflow-hidden transition-colors hover:border-border">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<feature.icon className="h-5 w-5 text-primary" />
								</div>
								<h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
							</div>
						</BlurFade>
					))}
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border/50 px-6 py-12">
				<div className="max-w-5xl mx-auto flex items-center justify-between">
					<BlurFade delay={0.1} inView>
						<Logo size="sm" />
					</BlurFade>
					<BlurFade delay={0.1} inView>
						<p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Bodhi. All rights reserved.</p>
					</BlurFade>
				</div>
			</footer>
		</div>
	);
}
