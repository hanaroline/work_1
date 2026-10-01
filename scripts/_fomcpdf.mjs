import { chromium } from 'playwright';
import path from 'node:path';
const src = process.argv[2], out = process.argv[3];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await b.newPage();
await pg.goto('file://' + path.resolve(src), { waitUntil: 'load' });
await pg.emulateMedia({ media: 'print' });
await pg.pdf({ path: out, format: 'A4', printBackground: true,
  margin: { top: '11mm', bottom: '11mm', left: '10mm', right: '10mm' } });
await b.close();
console.log('made', out);
