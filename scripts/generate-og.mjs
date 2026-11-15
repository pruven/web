import sharp from 'sharp';
await sharp(
  Buffer.from(
    `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="white"/><pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1" fill="#c4b5fd"/></pattern><rect x="600" width="600" height="630" fill="url(#dots)"/><text x="64" y="92" font-size="38" font-family="sans-serif" fill="#0a0b0d">pruven</text><text x="60" y="340" font-size="124" letter-spacing="-7" font-family="sans-serif" fill="#0a0b0d">Software</text><text x="60" y="458" font-size="124" letter-spacing="-7" font-family="sans-serif" fill="#0a0b0d">in motion.</text><text x="64" y="564" font-size="18" font-family="monospace" fill="#5f6672">EXPERIMENTAL SOFTWARE &amp; FREELANCE DEVELOPMENT</text></svg>`,
  ),
)
  .png()
  .toFile('public/og.png');
