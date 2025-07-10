import NewsletterEmail from "./newsletter-email"

export default function NewsletterEmailTest() {
  return (
    <NewsletterEmail
      postTitle="The Rise of Onchain Identity"
      postSubtitle="Exploring the future of digital identity in the blockchain era"
      postUrl="https://fountain.ink/p/stani/the-rise-of-onchain-identity"
      coverImageUrl="https://api.grove.storage/dc6be48bdbaeb48faf2590ed57cf92bb87940e4a05a81f5e657ac197f5cac612"
      blogName="Fountain"
      authorUsername="stani"
      unsubscribeUrl="https://listmonk.example.com/subscription/manage/test-uuid"
      theme={{
        name: "editorial",
        customCss: `
          .article h1 {
            color: #1a1a1a !important;
          }
          
          .article p {
            max-width: 680px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .article blockquote {
            border-left: 4px solid #0070f3;
            padding-left: 1.5rem;
            font-style: italic;
          }
        `
      }}
    />
  )
}