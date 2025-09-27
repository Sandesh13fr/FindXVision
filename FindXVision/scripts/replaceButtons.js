import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const PRIMARY_BUTTON_PATH = path.join(SRC_DIR, 'components', 'Common', 'PrimaryButton');

const filesProcessed = [];
const filesUpdated = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
    } else if (/\.(jsx?|tsx?)$/i.test(entry.name)) {
      processFile(entryPath);
    }
  });
}

function removeButtonFromImport(importStatement) {
  const importContentMatch = importStatement.match(/\{([^}]+)\}/);
  if (!importContentMatch) {
    return importStatement;
  }

  const specifiers = importContentMatch[1]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== 'Button' && !part.startsWith('Button as '));

  if (specifiers.length === 0) {
    return null;
  }

  const newSpecifierContent = ` { ${specifiers.join(', ')} } `;
  return importStatement.replace(/\{[^}]+\}/, newSpecifierContent);
}

function ensurePrimaryButtonImport(content, filePath) {
  if (/PrimaryButton\s+from/.test(content)) {
    return content;
  }

  const relativePath = path
    .relative(path.dirname(filePath), PRIMARY_BUTTON_PATH)
    .replace(/\\/g, '/')
    .replace(/\.jsx?$/, '');

  const normalizedPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  const importLine = `import PrimaryButton from '${normalizedPath}';\n`;

  const importBlockMatch = content.match(/^(import[^;]+;\s*)+/m);
  if (importBlockMatch) {
    const insertIndex = importBlockMatch.index + importBlockMatch[0].length;
    return content.slice(0, insertIndex) + importLine + content.slice(insertIndex);
  }

  return importLine + content;
}

function processFile(filePath) {
  filesProcessed.push(filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('Button') || content.includes('PrimaryButton from')) {
    return;
  }

  let originalContent = content;
  let modified = false;

  // Handle destructured imports from @mui/material
  content = content.replace(/import\s+\{[^}]+\}\s+from\s+['"]@mui\/material['"];?/g, (match) => {
    if (!/Button/.test(match)) {
      return match;
    }
    const updated = removeButtonFromImport(match);
    modified = true;
    return updated || '';
  });

  // Handle default Button import from @mui/material/Button
  content = content.replace(/import\s+Button\s+from\s+['"]@mui\/material\/Button['"];?/g, () => {
    modified = true;
    return '';
  });

  // Handle default import with other specifiers (rare)
  content = content.replace(/import\s+Button\s*,\s*\{([^}]+)\}\s+from\s+['"]@mui\/material['"];?/g, (match, group) => {
    const specifiers = group
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => part !== 'Button' && !part.startsWith('Button as '));
    const rebuilt = specifiers.length > 0 ? `import { ${specifiers.join(', ')} } from '@mui/material';` : '';
    modified = true;
    return rebuilt;
  });

  // Replace component usage
  const openTagRegex = /<Button(?=[\s>])/g;
  const closeTagRegex = /<\/Button>/g;
  if (openTagRegex.test(content)) {
    content = content.replace(openTagRegex, '<PrimaryButton');
    modified = true;
  }
  if (closeTagRegex.test(content)) {
    content = content.replace(closeTagRegex, '</PrimaryButton>');
    modified = true;
  }

  if (!modified) {
    return;
  }

  content = ensurePrimaryButtonImport(content, filePath);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesUpdated.push(filePath);
  }
}

walk(SRC_DIR);

console.log(`Processed ${filesProcessed.length} files.`);
console.log(`Updated ${filesUpdated.length} files with PrimaryButton.`);
if (filesUpdated.length > 0) {
  console.log('Updated files:');
  filesUpdated.forEach((file) => console.log(` - ${path.relative(PROJECT_ROOT, file)}`));
}
