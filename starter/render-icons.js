'use strict';
/* Renders app/icon.svg to the two PNGs the manifest lists. A development tool: needs Playwright.
 * Run `node render-icons.js` after changing the SVG. */
const path = require('node:path');
const fs = require('node:fs');

(async () => {
  const { chromium } = require('playwright');
  const svg = fs.readFileSync(path.join(__dirname, 'app', 'icon.svg'), 'utf8');
  const browser = await chromium.launch();
  for (const size of [192, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<style>*{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
    await page.screenshot({ path: path.join(__dirname, 'app', `icon-${size}.png`) });
    await page.close();
  }
  await browser.close();
})();
