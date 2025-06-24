import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Heading,
} from "@react-email/components"
import * as React from "react"
import type { BlogThemeData } from "../src/lib/settings/get-blog-data"

interface NewsletterEmailProps {
  postTitle: string
  postSubtitle?: string
  postContent: string
  postUrl: string
  coverImageUrl?: string
  blogName: string
  unsubscribeUrl?: string
  theme?: BlogThemeData | null
}

export default function NewsletterEmail({
  postTitle,
  postSubtitle,
  postContent = "",
  postUrl,
  coverImageUrl,
  blogName,
  unsubscribeUrl = "{{UnsubscribeURL}}",
  theme,
}: NewsletterEmailProps) {
  const isEditorialTheme = theme?.name === "editorial"
  const titleFont = isEditorialTheme ? "Georgia, Plantin, serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  const paragraphFont = isEditorialTheme ? "Georgia, Plantin, serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  return (
    <Html>
      <Head>
        {theme?.customCss && (
          <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />
        )}
      </Head>
      <Preview>{postTitle}</Preview>
      <Body style={main(titleFont)}>
        <Container style={container}>
          <Heading as="h1" style={h1(titleFont, isEditorialTheme)}>
            {postTitle}
          </Heading>
          
          {postSubtitle && (
            <Heading as="h2" style={h2(titleFont, isEditorialTheme)}>
              {postSubtitle}
            </Heading>
          )}
          
          {coverImageUrl && (
            <Img
              src={coverImageUrl}
              alt="Post cover image"
              style={coverImage}
            />
          )}
          
          {postContent && (
            <Section style={contentSection}>
              <Text style={contentText(paragraphFont, isEditorialTheme)}>
                {postContent.split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </Text>
            </Section>
          )}
          
          <Section>
            <Button href={postUrl} style={button}>
              Read the full post
            </Button>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you subscribed to updates from {blogName} on Fountain.
            </Text>
            <Text style={footerText}>
              To unsubscribe from these emails, click{" "}
              <Link href={unsubscribeUrl} style={link}>
                here
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = (fontFamily: string) => ({
  backgroundColor: "#ffffff",
  fontFamily,
  lineHeight: "1.6",
})

const container = {
  margin: "0 auto",
  padding: "20px",
  maxWidth: "600px",
}

const h1 = (fontFamily: string, isEditorial: boolean) => ({
  color: "#333",
  fontSize: isEditorial ? "48px" : "32px",
  fontWeight: isEditorial ? "300" : "600",
  fontStyle: isEditorial ? "italic" as const : "normal" as const,
  marginBottom: isEditorial ? "20px" : "10px",
  marginTop: "0",
  textAlign: "center" as const,
  fontFamily,
  letterSpacing: isEditorial ? "-0.8px" : "-0.025em",
  lineHeight: isEditorial ? "1.1" : "1.2",
})

const h2 = (fontFamily: string, isEditorial: boolean) => ({
  color: "#555",
  fontSize: isEditorial ? "24px" : "20px",
  fontWeight: "normal",
  marginBottom: isEditorial ? "20px" : "10px",
  marginTop: "0",
  textAlign: "center" as const,
  fontFamily,
  letterSpacing: isEditorial ? "-0.8px" : "-0.01em",
  lineHeight: "1.4",
})

const coverImage = {
  width: "100%",
  maxWidth: "600px",
  height: "auto",
  marginBottom: "20px",
  borderRadius: "8px",
}

const contentSection = {
  marginBottom: "30px",
}

const contentText = (fontFamily: string, isEditorial: boolean) => ({
  color: "#333",
  fontSize: isEditorial ? "20px" : "16px",
  lineHeight: isEditorial ? "1.6" : "1.8",
  margin: "0",
  fontFamily,
  letterSpacing: isEditorial ? "-0.2px" : "normal",
})

const button = {
  backgroundColor: "#0070f3",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "500",
  padding: "10px 20px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  marginTop: "20px",
}

const footer = {
  marginTop: "30px",
  paddingTop: "20px",
  borderTop: "1px solid #eee",
}

const footerText = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 10px 0",
}

const link = {
  color: "#0070f3",
  textDecoration: "underline",
}