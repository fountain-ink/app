import { NextRequest, NextResponse } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';
import Arweave from 'arweave';

const query = gql`
query GetParagraphPosts($wallet: String!) {
  transactions(tags:[
    {
      name:"AppName",
      values:["Paragraph"],
    },
    {
      name:"Contributor",
      values:[$wallet]
    }
  ], sort:HEIGHT_DESC, first: 1){


    edges {
      node {
        id
      }
    }
  }
}
`;

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

const graphqlAPI = 'https://arweave.net/graphql';

interface MirrorContent {
  title: string;
  body: string;
  timestamp: number;
}

interface DecodedContent {
  content: MirrorContent;
  digest: string;
  originalDigest: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const digest = searchParams.get('digest');

  if (!digest) {
    return NextResponse.json({ error: 'Digest parameter is required' }, { status: 400 });
  }

  const client = new GraphQLClient(graphqlAPI);

  try {
    // Step 1: Get the transaction ID
    const data = await client.request(query, { digest });
    const transactionId = data.transactions.edges[0]?.node.id;

    if (!transactionId) {
      return NextResponse.json({ error: 'No transaction found' }, { status: 404 });
    }

    // Step 2: Retrieve the transaction data
    const transaction = await arweave.transactions.get(transactionId);

    // Step 3: Decode the transaction data
    const decoder = new TextDecoder();
    const decodedContent = decoder.decode(transaction.data);

    // Step 4: Parse the content
    const parsedContent: DecodedContent = JSON.parse(decodedContent);

    // Step 5: Return the structured content
    return NextResponse.json({
      title: parsedContent.content.title,
      body: parsedContent.content.body,
      timestamp: parsedContent.content.timestamp,
      digest: parsedContent.digest,
      originalDigest: parsedContent.originalDigest
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error fetching data', details: (error as Error).message }, { status: 500 });
  }
}