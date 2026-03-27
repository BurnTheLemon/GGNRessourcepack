const fs = require('fs');
const path = require('path');

const folder = process.argv[2] || '.';
const searchStr = process.argv[3] || 'magmarite';
const replaceStr = process.argv[4] || 'lemonite';

const files = fs.readdirSync(folder);

files.forEach(file => {
  if (file.includes(searchStr)) {
    const newName = file.replaceAll(searchStr, replaceStr);
    fs.renameSync(path.join(folder, file), path.join(folder, newName));
    console.log(`Renamed: ${file} → ${newName}`);
  }
});

console.log('Done!');