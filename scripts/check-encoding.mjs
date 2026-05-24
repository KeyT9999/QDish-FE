import fs from 'node:fs';
import path from 'node:path';

const roots = [
  'src',
  'index.html',
  '../QR_FOOD_ORDER_BE/src'
];

const extensions = new Set(['.ts', '.tsx', '.json', '.md', '.html']);
const mojibakePattern = /[\u00c3\u00c4\u00c2\u00c6\ufffd]|\u00e1\u00ba|\u00e1\u00bb|\u00e2\u20ac/;

const collectFiles = (entry) => {
  if (!fs.existsSync(entry)) return [];

  const stat = fs.statSync(entry);
  if (stat.isFile()) {
    return extensions.has(path.extname(entry)) ? [entry] : [];
  }

  return fs.readdirSync(entry, { withFileTypes: true }).flatMap((dirent) => {
    if (dirent.name === 'node_modules' || dirent.name === 'dist') return [];
    return collectFiles(path.join(entry, dirent.name));
  });
};

const failures = [];

for (const root of roots) {
  for (const file of collectFiles(root)) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (mojibakePattern.test(line)) {
        failures.push(`${file}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

if (failures.length > 0) {
  console.error('Mojibake/encoding patterns found:');
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Encoding check passed: no mojibake patterns found.');
