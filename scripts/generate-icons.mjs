import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const inputSvg = path.join(rootDir, "public", "Logo.svg");
const iconsDir = path.join(rootDir, "public", "icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcon({ canvasSize, contentScale, outputFilename }) {
  const maxContentDimension = Math.round(canvasSize * contentScale);
  const logoWidth = maxContentDimension;
  const logoHeight = Math.round(maxContentDimension / 2);

  const resizedLogoBuffer = await sharp(inputSvg, { density: 300 })
    .resize(logoWidth, logoHeight, { fit: "contain" })
    .png()
    .toBuffer();

  const outputPath = path.join(iconsDir, outputFilename);

  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: resizedLogoBuffer,
        gravity: "center",
      },
    ])
    .png()
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  console.log(
    `Generated ${outputFilename}: ${canvasSize}x${canvasSize} (${stats.size} bytes)`
  );
  return stats.size;
}

async function run() {
  console.log("Generating PWA icons from public/Logo.svg...");

  // 1. icon-192x192.png
  await generateIcon({
    canvasSize: 192,
    contentScale: 0.85,
    outputFilename: "icon-192x192.png",
  });

  // 2. icon-512x512.png
  await generateIcon({
    canvasSize: 512,
    contentScale: 0.85,
    outputFilename: "icon-512x512.png",
  });

  // 3. apple-touch-icon.png (180x180)
  await generateIcon({
    canvasSize: 180,
    contentScale: 0.85,
    outputFilename: "apple-touch-icon.png",
  });

  // 4. icon-maskable-512x512.png (512x512, 20% safe-zone padding -> 60% content area)
  await generateIcon({
    canvasSize: 512,
    contentScale: 0.6,
    outputFilename: "icon-maskable-512x512.png",
  });

  console.log("All icons generated successfully!");
}

run().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
