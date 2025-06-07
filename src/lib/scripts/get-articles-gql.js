const ENDPOINT = "https://api-v2.lens.dev";

const graphqlQuery = {
  query: `
query GetArticles {
  publications(
    request: {where: {metadata: {mainContentFocus: ARTICLE}}, limit: Fifty}
  ) {
    items {
      ... on Post {
        id
      }
    }
  }
}
  `,
  variables: {
    orderBy: "TOP_REACTED",
  },
};

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Include this if your API request requires authentication
  },
  body: JSON.stringify(graphqlQuery),
});

const { data } = await response.json();

console.log(data.publications);
