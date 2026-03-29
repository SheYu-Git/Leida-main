import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve(process.cwd(), 'node_modules/@adplorg/capacitor-in-app-purchase/Package.swift');

try {
  if (!fs.existsSync(filePath)) process.exit(0);
  const raw = fs.readFileSync(filePath, 'utf8');
  const patched = raw.replace('from: "7.0.0"', 'from: "8.0.0"');
  if (patched !== raw) fs.writeFileSync(filePath, patched, 'utf8');
  process.exit(0);
} catch (e) {
  process.exit(0);
}
