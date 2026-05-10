const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(process.argv[2] || 'projects/noah-brawl-stars/src/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
if (!scripts.length) {
  throw new Error(`No script tags found in ${htmlPath}`);
}
scripts.forEach((script, index) => {
  new Function(script);
  console.log(`Compiled script ${index + 1}`);
});
