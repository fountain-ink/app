import fs from "node:fs";
import path from "node:path";
import { globalThemes, defaultThemeName } from "@/styles/themes";

export interface EmailContentProps {
  blogName: string;
  title: string;
  subtitle?: string;
  coverUrl?: string;
  contentHtml: string;
  postUrl: string;
}

const articleCssPath = path.join(process.cwd(), "src", "styles", "article.css");
const articleCss = fs.readFileSync(articleCssPath, "utf8");

function getThemeCss() {
  const theme = globalThemes[defaultThemeName];
  const vars = { ...theme.light, ...theme.shared } as Record<string, string>;
  const cssVars = Object.entries(vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n");
  return `:root{${cssVars}}`;
}

export function renderEmail({ blogName, title, subtitle, coverUrl, contentHtml, postUrl }: EmailContentProps) {
  const styles = `${getThemeCss()}\n${articleCss}\nbody{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;}header{margin-bottom:20px;text-align:center;}footer{margin-top:30px;padding-top:20px;border-top:1px solid #eee;font-size:14px;color:#666;text-align:center;}.button{display:inline-block;background-color:#0070f3;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;margin-top:20px;}`;
  const subtitleHtml = subtitle ? `<h2 class="subtitle">${subtitle}</h2>` : "";
  const coverHtml = coverUrl ? `<img src="${coverUrl}" alt="cover" class="cover" />` : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${styles}</style></head><body><header><h2>${blogName}</h2></header><article class="article"><h1 class="title">${title}</h1>${subtitleHtml}${coverHtml}<div>${contentHtml}</div><p style="text-align:center"><a href="${postUrl}" class="button">Read the full post</a></p></article><footer><p>You're receiving this email because you subscribed to ${blogName}.</p><p>To unsubscribe, click <a href="{{UnsubscribeURL}}">here</a>.</p></footer></body></html>`;
}
