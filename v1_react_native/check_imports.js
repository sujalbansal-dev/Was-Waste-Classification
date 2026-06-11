const fs = require('fs');
const path = require('path');

const checkPathExistsCaseSensitive = (filepath) => {
  const dir = path.dirname(filepath);
  const base = path.basename(filepath);
  if (!fs.existsSync(dir)) return false;
  if (!fs.statSync(dir).isDirectory()) return false;
  const files = fs.readdirSync(dir);
  return files.includes(base);
};

const resolveImportPath = (baseFile, importStr) => {
  // skip external modules
  if (!importStr.startsWith('.')) return null;
  const ext = ['.js', '.jsx', '.ts', '.tsx'];
  
  let targetPath = path.resolve(path.dirname(baseFile), importStr);
  
  // try different extensions
  for (const e of ext) {
    if (checkPathExistsCaseSensitive(targetPath + e)) return targetPath + e;
  }
  
  // try as index
  for (const e of ext) {
    let p = path.join(targetPath, 'index' + e);
    if (checkPathExistsCaseSensitive(p)) return p;
  }
  
  // check if it's an asset (already has extension)
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    if (checkPathExistsCaseSensitive(targetPath)) return targetPath;
  }
  
  return null; // not found with exact casing
};

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.expo' && f !== '.git') {
        scanDir(full);
      }
    } else if (/\.(js|jsx|ts|tsx)$/.test(f)) {
      const content = fs.readFileSync(full, 'utf8');
      const importRegex = /(?:import[^\n]+from|require\()\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importStr = match[1];
        if (importStr.startsWith('.')) {
          const resolved = resolveImportPath(full, importStr);
          if (!resolved) {
            console.log(`❌ ERROR in ${full}: Cannot case-sensitively resolve '${importStr}'`);
          }
        }
      }
    }
  }
}

scanDir(path.resolve(__dirname));
