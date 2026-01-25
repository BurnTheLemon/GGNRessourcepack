const fs = require('fs');
const path = require('path');

const currentDir = process.cwd();

fs.readdirSync(currentDir, { withFileTypes: true }).forEach(entry => {
  if (entry.isFile() && entry.name.endsWith('.json')) {
    const fileName = entry.name;
    const baseName = path.parse(fileName).name;
    const targetDir = path.join(currentDir, baseName);
    const sourcePath = path.join(currentDir, fileName);
    const targetPath = path.join(targetDir, fileName);

    // Create folder if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir);
    }

    // Move file
    fs.renameSync(sourcePath, targetPath);
  }
});

console.log('JSON files organized.');
