import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputIcon = './public/favicon.png';
const outputDir = './public/assets/icon';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

async function generateIcons() {
  try {
    console.log('Generating PWA icons from favicon...');
    
    // Generate all sizes
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);
      await sharp(inputIcon)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name}`);
    }

    // Copy favicon for backwards compatibility
    const faviconPath = path.join(outputDir, 'favicon.png');
    await sharp(inputIcon)
      .resize(64, 64, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(faviconPath);
    console.log('✓ Generated favicon.png');

    console.log('✓ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
