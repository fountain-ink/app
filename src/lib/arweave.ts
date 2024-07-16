import Arweave from "arweave";
import { GraphQLClient, gql } from "graphql-request";

export const arweave = Arweave.init({
	host: "arweave.net",
	port: 443,
	protocol: "https",
});

interface TransactionNode {
	id: string;
}

interface TransactionEdge {
	node: TransactionNode;
}

interface TransactionsData {
	transactions: {
		edges: TransactionEdge[];
	};
}

export const graphqlAPI = "https://arweave.net/graphql";

export async function getTransactionId(
	query: string,
	// biome-ignore lint/suspicious/noExplicitAny: intended use
	variables: Record<string, any>,
) {
	const client = new GraphQLClient(graphqlAPI);
	const data = await client.request<TransactionsData>(query, variables);
	return data.transactions.edges[0]?.node.id;
}

export async function getDecodedContent(transactionId: string) {
	const transaction = await arweave.transactions.get(transactionId);
	const decoder = new TextDecoder();
	return decoder.decode(transaction.data);
}
