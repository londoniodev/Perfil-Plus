const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const dirsToScan = ['apps', 'packages'];
const extensions = ['.ts', '.tsx', '.prisma'];

let snakeCaseCount = 0;
let kebabCaseCount = 0;
const snakeCaseSnippets = [];
const kebabCaseSnippets = [];

function isExcluded(filePath) {
  return filePath.includes('node_modules') || 
         filePath.includes('.next') || 
         filePath.includes('dist') || 
         filePath.includes('build');
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!isExcluded(fullPath)) {
        scanDir(fullPath);
      }
    } else {
      if (extensions.some(ext => fullPath.endsWith(ext))) {
        analyzeFile(fullPath);
      }
    }
  }
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(rootDir, filePath);
  
  // Exclude comments roughly and string literals roughly? No, let's just grep the lines.
  const snakeRegex = /\b[a-z][a-z0-9]*_[a-z0-9_]+\b/g;
  const kebabRegex = /\b[a-z][a-z0-9]*-[a-z0-9-]+\b/g;

  lines.forEach((line, index) => {
    // Ignore import lines and css module stuff to reduce noise
    if (line.trim().startsWith('import ') || line.trim().startsWith('export ')) {
        // We'll still analyze module exports/imports if they match, but mostly keep
    }
    
    let match;
    let hasSnake = false;
    let hasKebab = false;

    // Check snake_case
    while ((match = snakeRegex.exec(line)) !== null) {
      snakeCaseCount++;
      if (snakeCaseSnippets.length < 50) {
        snakeCaseSnippets.push(`- **${relativePath}:${index + 1}**: \`${match[0]}\`\n  \`${line.trim().substring(0, 100)}\``);
      }
      hasSnake = true;
    }

    // Check kebab_case
    // We want to skip obvious Tailwind classes like `className="..."` or `tw="..."`
    if (!line.includes('className=') && !line.includes('class=') && !line.includes('tw=')) {
        while ((match = kebabRegex.exec(line)) !== null) {
          kebabCaseCount++;
          if (kebabCaseSnippets.length < 50) {
            kebabCaseSnippets.push(`- **${relativePath}:${index + 1}**: \`${match[0]}\`\n  \`${line.trim().substring(0, 100)}\``);
          }
          hasKebab = true;
        }
    }
  });
}

dirsToScan.forEach(dir => {
  const fullDirPath = path.join(rootDir, dir);
  if (fs.existsSync(fullDirPath)) {
    scanDir(fullDirPath);
  }
});

const report = `
# Analisis de Nomenclatura (snake_case y kebab-case)

## Resumen
- **snake_case**: ${snakeCaseCount} ocurrencias (común en APIs externas y DBs).
- **kebab-case** (fuera de clases CSS): ${kebabCaseCount} ocurrencias (puede ser en configuraciones o IDs de URLs).

## Ejemplos de snake_case
${snakeCaseSnippets.join('\n')}

## Ejemplos de kebab-case (Posibles variables o JSON keys)
${kebabCaseSnippets.join('\n')}

---
**Conclusión inicial**: Hay ${snakeCaseCount} variables/propiedades en \`snake_case\` que deberían ser transformadas en las interfaces/DTOs a \`camelCase\`.
`;

fs.writeFileSync(path.join(rootDir, 'analysis_results.md'), report);
console.log('Analysis saved to analysis_results.md');
