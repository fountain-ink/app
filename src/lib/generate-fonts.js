// @ts-nocheck
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const fontDirs = [
  path.join(process.cwd(), "public", "fonts", "Test Martina Plantijn"),
  // Add more font directories here
];
const outputCSSFile = path.join(process.cwd(), "src", "styles", "fonts.css");
const outputTSFile = path.join(process.cwd(), "src", "styles", "fonts.ts");
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
  let tsContent = `import localFont from 'next/font/local';\n\n`;
  const fontFamilies = [];

  for (const fontDir of fontDirs) {
    const fontFamilyName = path.basename(fontDir);
    fontFamilies.push(fontFamilyName);

    const files = fs.readdirSync(fontDir);
    const fontSources = [];

    for (const file of files) {
      if (file.endsWith(".woff2")) {
        const match = file.match(/-(light|regular|medium|bold|black)(-italic)?\.woff2$/);
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
          fontSources.push(`
    {
      path: '../../public/fonts/${fontFamilyName}/${file}',
      weight: '${weightMap[weight]}',
      style: '${style ? "italic" : "normal"}',
    }`);
        }
      }
    }

    // Generate Next.js font variable
    const variableName = fontFamilyName.replace(/\s+/g, "");
    tsContent += `export const ${variableName} = localFont({
  src: [${fontSources.join(",")}
  ],
  variable: '--font-${variableName.toLowerCase()}',
});\n\n`;

    // Generate Tailwind class
    tsContent += `export const ${variableName}Class = ${variableName}.variable;\n\n`;
  }

  fs.writeFileSync(outputCSSFile, cssContent);
  fs.writeFileSync(outputTSFile, tsContent);

  // Update tailwind.config.ts
  const tailwindConfig = fs.readFileSync(tailwindConfigFile, "utf8");
  const updatedTailwindConfig = updateTailwindConfig(tailwindConfig, fontFamilies);
  fs.writeFileSync(tailwindConfigFile, updatedTailwindConfig);

  console.log("> Dynamic fonts generated and Tailwind config updated successfully\n");

  return fontFamilies;
}

function updateTailwindConfig(configContent, fontFamilies) {
  const sourceFile = ts.createSourceFile("tailwind.config.ts", configContent, ts.ScriptTarget.Latest, true);

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const transformer = (context) => {
    const visit = (node) => {
      if (ts.isPropertyAssignment(node) && node.name.getText() === "fontFamily") {
        const fontFamilyObj = node.initializer;
        if (ts.isObjectLiteralExpression(fontFamilyObj)) {
          const existingFonts = new Set(
            fontFamilyObj.properties
              .filter(ts.isPropertyAssignment)
              .map((prop) => prop.name.getText().replace(/['"]/g, "")),
          );

          const newProperties = fontFamilyObj.properties.filter(ts.isPropertyAssignment);

          for (const family of fontFamilies) {
            const variableName = family.replace(/\s+/g, "-").toLowerCase();
            if (!existingFonts.has(variableName)) {
              newProperties.push(
                ts.factory.createPropertyAssignment(
                  ts.factory.createStringLiteral(variableName),
                  ts.factory.createArrayLiteralExpression([
                    ts.factory.createStringLiteral(`var(--font-${variableName})`),
                    ts.factory.createStringLiteral("sans-serif"),
                  ]),
                ),
              );
            }
          }

          return ts.factory.updatePropertyAssignment(
            node,
            node.name,
            ts.factory.createObjectLiteralExpression(newProperties, true),
          );
        }
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (node) => ts.visitNode(node, visit);
  };

  const result = ts.transform(sourceFile, [transformer]);
  const transformedSourceFile = result.transformed[0];

  return printer.printFile(transformedSourceFile);
}

generateFontFaces();
