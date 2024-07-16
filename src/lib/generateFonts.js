// @ts-nocheck
import fs from "fs";
import path from "path";
import ts from "typescript";

const fontDirs = [
  path.join(process.cwd(), "public", "fonts", "Test Martina Plantijn"),
  // Add more font directories here
];
const outputFile = path.join(process.cwd(), "src", "styles", "fonts.css");
const tailwindConfigFile = path.join(process.cwd(), "tailwind.config.ts");

const weightMap = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
  black: 900,
};

function generateFontFaces() {
  let cssContent = "";
  const fontFamilies = [];

  for (const fontDir of fontDirs) {
    const fontFamilyName = path.basename(fontDir);
    fontFamilies.push(fontFamilyName);

    const files = fs.readdirSync(fontDir);
    for (const file of files) {
      if (file.endsWith(".woff2")) {
        const match = file.match(
          /-(light|regular|medium|bold|black)(-italic)?\.woff2$/
        );
        if (match) {
          const [, weight, style] = match;
          cssContent += `
@font-face {
  font-family: '${fontFamilyName}';
  src: url('/fonts/${fontFamilyName}/${file}') format('woff2');
  font-weight: ${weightMap[weight]};
  font-style: ${style ? "italic" : "normal"};
}
`;
        }
      }
    }
  }

  fs.writeFileSync(outputFile, cssContent);
  console.log("> Dynamic fonts generated successfully\n");

  return fontFamilies;
}

generateFontFaces();
