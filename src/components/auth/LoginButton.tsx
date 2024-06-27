"use client";

import { generatePayload, login } from "@/actions/auth"; // we'll add this file in the next section
import { signLoginPayload } from "thirdweb/auth";
import {
	useActiveAccount,
	useActiveWalletChain,
	useConnect,
} from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

export const LoginButton = () => {
	const account = useActiveAccount();
	const chain = useActiveWalletChain();
	const { connect, isConnecting, error } = useConnect();

	async function handleClick() {
		let activeAccount;
		if (!account) {
			const wallet = await connect(async () => {
				const wallet = createWallet("io.metamask"); // update this to your wallet of choice or create a custom UI to select wallets
				await wallet.connect();
				return wallet;
			});
			activeAccount = wallet.getAccount();
		} else {
			activeAccount = account;
		}
		// Step 1: fetch the payload from the server
		const payload = await generatePayload({
			address: account.address,
			chainId: chain.id,
		});
		// Step 2: Sign the payload
		const signatureResult = await signLoginPayload({
			account,
			payload,
		});
		// Step 3: Send the signature to the server for verification
		const finalResult = await login(signatureResult);

		alert(finalResult.valid ? "Login successful" : "Login failed");
	}

	return (
		<button type="button" disabled={!account} onClick={handleClick}>
			Login
		</button>
	);
};

export default LoginButton;
