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
  Font,
} from "@react-email/components"
import * as React from "react"
import type { BlogThemeData } from "../src/lib/settings/get-blog-data"

interface NewsletterEmailProps {
  postTitle: string
  postSubtitle?: string
  postUrl: string
  coverImageUrl?: string
  blogName: string
  authorUsername?: string
  unsubscribeUrl?: string
  theme?: BlogThemeData | null
}

export default function NewsletterEmail({
  postTitle,
  postSubtitle,
  postUrl,
  coverImageUrl,
  blogName,
  authorUsername,
  unsubscribeUrl = "{{UnsubscribeURL}}",
  theme,
}: NewsletterEmailProps) {
  const isEditorialTheme = theme?.name === "editorial"
  const titleFont = isEditorialTheme ? "'Libre Baskerville', Georgia, serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  
  const articleStyles = `
    .article { background-color: ${theme?.customBackground || "#ffffff"}; color: ${theme?.customColor || "#000000"}; }
    .article .title { 
      color: ${theme?.customColor || "#000000"}; 
      font-family: ${titleFont}; 
      font-size: ${isEditorialTheme ? "48px" : "32px"};
      font-weight: ${isEditorialTheme ? "300" : "600"};
      font-style: ${isEditorialTheme ? "italic" : "normal"};
      line-height: ${isEditorialTheme ? "1.1" : "1.2"};
      letter-spacing: ${isEditorialTheme ? "-0.8px" : "-0.025em"};
      text-align: center;
      margin: 1rem 0;
    }
    .article .subtitle { 
      color: #666666; 
      font-family: ${titleFont}; 
      font-size: ${isEditorialTheme ? "24px" : "20px"};
      font-weight: 400;
      line-height: 1.4;
      letter-spacing: ${isEditorialTheme ? "-0.8px" : "-0.01em"};
      text-align: center;
      margin: 1rem 0;
    }
    .article img { border-radius: 0.5rem; width: 100%; height: auto; }
    .article a { text-decoration: none; }
  `
  
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Libre Baskerville"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.gstatic.com/s/librebaskerville/v14/kmKnZrc3Hgbbcjq75U4uslyuy4kn0qNZaxMaC82U-ro.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Libre Baskerville"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.gstatic.com/s/librebaskerville/v14/kmKiZrc3Hgbbcjq75U4uslyuy4kn0qNcW7BYPMGMGjGhRg.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <Font
          fontFamily="Libre Baskerville"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.gstatic.com/s/librebaskerville/v14/kmKhZrc3Hgbbcjq75U4uslyuy4kn0qNcaxMaC97hLsrdoz0.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="italic"
        />
        <style dangerouslySetInnerHTML={{ __html: articleStyles }} />
        {theme?.customCss && (
          <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />
        )}
      </Head>
      <Preview>{postTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={articleSection} className="article">
            <Link href={postUrl} style={{ textDecoration: "none", color: "inherit" }}>
              <Heading as="h1" style={title(titleFont, isEditorialTheme)} className="title">
                {postTitle}
              </Heading>
              
              {postSubtitle && (
                <Heading as="h2" style={subtitle(titleFont, isEditorialTheme)} className="subtitle">
                  {postSubtitle}
                </Heading>
              )}
            </Link>
            
            {coverImageUrl && (
              <Link href={postUrl}>
                <Img
                  src={coverImageUrl}
                  alt="Post cover image"
                  style={coverImageStyle}
                />
              </Link>
            )}
          </Section>
          
          <Section style={buttonSection}>
            <Button href={postUrl} style={buttonStyle}>
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

const main = {
  backgroundColor: "#ffffff",
  color: "#000000",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  lineHeight: "1.6",
}

const container = {
  margin: "0 auto",
  padding: "20px",
  maxWidth: "600px",
}

const articleSection = {
  marginBottom: "20px",
}

const title = (titleFont: string, isEditorial: boolean) => ({
  color: "#000000",
  marginTop: "1rem",
  marginBottom: "1rem",
  fontSize: isEditorial ? "48px" : "32px",
  textAlign: "center" as const,
  fontFamily: titleFont,
  fontWeight: isEditorial ? "300" : "600",
  fontStyle: isEditorial ? "italic" : "normal",
  lineHeight: isEditorial ? "1.1" : "1.2",
  letterSpacing: isEditorial ? "-0.8px" : "-0.025em",
})

const subtitle = (titleFont: string, isEditorial: boolean) => ({
  color: "#666666",
  marginTop: "1rem",
  marginBottom: "1rem",
  textAlign: "center" as const,
  fontFamily: titleFont,
  fontWeight: "400" as const,
  fontStyle: "normal" as const,
  fontSize: isEditorial ? "24px" : "20px",
  lineHeight: "1.4",
  letterSpacing: isEditorial ? "-0.8px" : "-0.01em",
})

const coverImageStyle = {
  width: "100%",
  maxWidth: "600px",
  height: "auto",
  marginBottom: "20px",
  borderRadius: "0.5rem",
}



const buttonSection = {
  textAlign: "center" as const,
  marginTop: "40px",
  marginBottom: "40px",
}

const buttonStyle = {
  backgroundColor: "hsl(20, 14.3%, 4.1%)",
  borderRadius: "0.375rem",
  color: "hsl(0, 0%, 95%)",
  fontSize: "14px",
  fontWeight: "500",
  padding: "10px 16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  width: "100%",
  maxWidth: "280px",
  transition: "all 150ms",
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