"use client";
import { Mail, MailCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

export const EmailSubscription = () => {
	const [success, setSuccess] = useState<boolean | undefined>(undefined);

  // biome-ignore lint/suspicious/noExplicitAny: 
	const handleSubmit = (event: any) => {
		event.preventDefault();

		fetch(
			`https://kualta.dev/api/subscribe?email=${event.target.email.value}&list=3`,
			{
				method: "POST",
			},
		)
			.then((res) => res.json())
			.then((data) => {
				if (data.status === 200) {
					setSuccess(true);
				} else {
					setSuccess(false);
				}
			});

		event.target.email.value = "";
	};

	return (
		<div className="flex flex-col gap-4 place-content-center items-center justify-center w-fit">
			{success === undefined ? (
				<form onSubmit={handleSubmit}>
					<div className="flex flex-row gap-2">
						<Input
							className=""
							type="email"
							name="email"
							required
							placeholder="E-mail"
						/>

						<Button
							className="hidden md:flex text-base"
							name="submit"
							type="submit"
						>
							Subscribe
						</Button>
						<Button
							size="icon"
							className="flex md:hidden px-2"
							name="submit"
							type="submit"
						>
							<Mail size={24} />
						</Button>
					</div>
				</form>
			) : (
				<div>
					<Card className="p-4 w-full bg-background flex flex-row items-center justify-center gap-4">
						Subscribed!
						<MailCheck size={24} />
					</Card>
				</div>
			)}
		</div>
	);
};
