"use client";

import Capsule, {
	CapsuleModal,
	EmailTheme,
	Environment,
} from "@usecapsule/react-sdk";
// Import styles if using v3.5.0 or greater of `@usecapsule/react-sdk`
import "@usecapsule/react-sdk/styles.css";
import React, { useState } from "react";

const constructorOpts = {
	// Email configurations
	emailTheme: "light" as EmailTheme,
	emailPrimaryColor: "#007bff",
	githubUrl: "https://github.com/example",
	linkedinUrl: "https://www.linkedin.com/company/example",
	xUrl: "https://x.com/example",
	homepageUrl: "https://example.com",
	supportUrl: "mailto:support@example.com", // Can also be a webpage URL
};

const CapsuleAuth = () => {
	const [isOpen, setIsOpen] = useState(false); // Use any state management you wish, this is purely an example!

	const capsule = new Capsule(
		Environment.BETA,
		process.env.CAPSULE_API_KEY,
		constructorOpts, 
	);

	return (
		<div>
			<button type="button" onClick={() => setIsOpen(true)}>
				Sign in With Email
			</button>
			<CapsuleModal
				capsule={capsule}
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				appName="Your App Name" // Name of your application
				logo="https://example.com/logo.png" // URL for your logo
				theme={{
					backgroundColor: "#ffffff", // Background color of the modal
					foregroundColor: "#000000", // Foreground/highlight color of the modal
				}}

				// oAuthMethods={["GOOGLE", "TWITTER", "DISCORD"]} // Social login options
			/>
		</div>
	);
};

export default CapsuleAuth;
