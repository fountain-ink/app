import Arweave from "@irys/arweave";
import { GraphQLClient } from "graphql-request";

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
export const arweaveAPI = "https://arweave.net";

const arweave = new Arweave({ url: arweaveAPI });

export async function getTransactionId(
  query: string,
  variables: Record<string, any>,
) {
  const client = new GraphQLClient(graphqlAPI);
  const data = await client.request<TransactionsData>(query, variables);
  return data.transactions.edges[0]?.node.id;
}

export async function getTransactionContent(transactionId: string): Promise<string | undefined> {
  try {
    const data = await arweave.transactions.getData(transactionId);

    if (data) {
      const decoder = new TextDecoder();
      const stringData = decoder.decode(data);
      return stringData;
    }

    console.error("No data found for the given transaction ID.");
    return undefined;
  } catch (error) {
    console.error("Error fetching transaction data:", error);
    return undefined;
  }
}
