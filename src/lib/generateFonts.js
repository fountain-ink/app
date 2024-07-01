// @ts-nocheck
import fs from "fs";
import path from "path";

const fontDir = path.join(
	process.cwd(),
	"public",
	"fonts",
	"Test Martina Plantijn",
);
const outputFile = path.join(process.cwd(), "src", "styles", "fonts.css");

const weightMap = {
	light: 300,
	regular: 400,
	medium: 500,
	bold: 700,
	black: 900,
};


function generateFontFaces() {
	let cssContent = "";

	// biome-ignore lint/complexity/noForEach: it's ok
	fs.readdirSync(fontDir).forEach((file) => {
		if (file.endsWith(".woff2")) {
			const match = file.match(
				/-(light|regular|medium|bold|black)(-italic)?\.woff2$/,
			);

			if (match) {
				const [, weight, style] = match;

				cssContent += `
@font-face {
  font-family: 'Test Martina Plantijn';
  src: url('/fonts/Test Marjtina Plantijn/${file}') format('woff2');
  font-weight: ${weightMap[weight]};
  font-style: ${style ? "italic" : "normal"};
}
`;
			}
		}
	});

	fs.writeFileSync(outputFile, cssContent);
	console.log("fonts.css file generated successfully.");
}

generateFontFaces();
