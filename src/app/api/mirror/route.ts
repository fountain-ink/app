import { NextRequest, NextResponse } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';

const query = gql`
  query GetMirrorTransactions($digest: String!) {
    transactions(tags:[
      {
        name:"App-Name",
        values:["MirrorXYZ"],
      },
      {
        name:"Original-Content-Digest",
        values:[$digest]
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

const graphqlAPI = 'https://arweave.net/graphql';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const digest = searchParams.get('digest');

  if (!digest) {
    return NextResponse.json({ error: 'Digest parameter is required' }, { status: 400 });
  }

  const client = new GraphQLClient(graphqlAPI);

  try {
    const data = await client.request(query, { digest });
    return NextResponse.json(data);
  } catch (error) {
    console.error('GraphQL request error:', error);
    return NextResponse.json({ error: 'Error fetching data', details: (error as Error).message }, { status: 500 });
  }
}