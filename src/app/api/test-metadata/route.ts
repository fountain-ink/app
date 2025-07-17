import { NextResponse } from "next/server";
import { generateEnhancedMetadata } from "@/lib/seo/metadata";
import { generateArticleSchema, generatePersonSchema, generateBlogSchema } from "@/lib/seo/structured-data";

export async function GET() {
  const testCases = {
    article: generateEnhancedMetadata({
      title: "Test Article",
      description: "This is a test article",
      path: "/p/testuser/test-article",
      ogImage: "https://example.com/image.jpg",
      ogType: "article",
      article: {
        publishedTime: new Date().toISOString(),
        author: "testuser",
        tags: ["test", "seo"],
      },
    }),
    
    profile: generateEnhancedMetadata({
      title: "@testuser",
      description: "Test user profile",
      path: "/b/testuser", // User profiles canonically point to blog
      ogType: "profile",
    }),
    
    blog: generateEnhancedMetadata({
      title: "Test Blog",
      description: "This is a test blog",
      path: "/b/testblog",
      ogType: "website",
    }),
  };

  // Test structured data generation
  const structuredData = {
    article: generateArticleSchema({
      title: "Test Article",
      description: "Test description",
      datePublished: new Date().toISOString(),
      author: { name: "Test Author", url: "https://fountain.ink/u/testauthor" },
      url: "https://fountain.ink/p/testuser/test-article",
      tags: ["test", "seo"],
    }),
    
    person: generatePersonSchema({
      name: "Test User",
      username: "testuser",
      description: "Test bio",
      url: "https://fountain.ink/u/testuser",
    }),
    
    blog: generateBlogSchema({
      name: "Test Blog",
      description: "Test blog description",
      url: "https://fountain.ink/b/testblog",
      author: { name: "Test Author" },
    }),
  };

  return NextResponse.json({
    metadata: testCases,
    structuredData: structuredData,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}