#!/usr/bin/env node

/**
 * Folder Scanner
 * ---------------
 * Recursively scans a folder and writes its structure (files + subfolders)
 * into a readable .txt file (like a "tree" view).
 *
 * Usage:
 *   node folder-scan.js [targetFolder] [outputFile]
 *
 * Examples:
 *   node folder-scan.js
 *   node folder-scan.js "C:\Users\me\Documents"
 *   node folder-scan.js ./my-project scan-result.txt
 *
 * If no arguments are given, it scans the current directory and
 * writes the result to "folder-scan-result.txt".
 */

const fs = require('fs');
const path = require('path');

// ---- Configuration ----
const targetDir = path.resolve(process.argv[2] || '.');
const outputFile = path.resolve(process.argv[3] || 'folder-scan-result.txt');

// Folders you almost never want to scan (keeps output clean & fast)
const IGNORE_DIRS = new Set(['node_modules', '.git', '.DS_Store']);

// ---- Helpers ----
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = -1;
  do {
    size /= 1024;
    unitIndex++;
  } while (size >= 1024 && unitIndex < units.length - 1);
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function scanDir(dirPath, prefix, lines, stats) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    lines.push(`${prefix}[Error reading folder: ${err.message}]`);
    return;
  }

  // Sort: folders first, then files, alphabetically
  entries = entries
    .filter((e) => !IGNORE_DIRS.has(e.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      stats.folderCount++;
      lines.push(`${prefix}${connector}${entry.name}/`);
      scanDir(fullPath, childPrefix, lines, stats);
    } else {
      stats.fileCount++;
      let sizeLabel = '';
      try {
        const size = fs.statSync(fullPath).size;
        stats.totalSize += size;
        sizeLabel = ` (${formatSize(size)})`;
      } catch (err) {
        sizeLabel = ' (unreadable)';
      }
      lines.push(`${prefix}${connector}${entry.name}${sizeLabel}`);
    }
  });
}

// ---- Run ----
function main() {
  if (!fs.existsSync(targetDir)) {
    console.error(`Error: folder not found -> ${targetDir}`);
    process.exit(1);
  }

  const stats = { folderCount: 0, fileCount: 0, totalSize: 0 };
  const lines = [];

  const header = [
    'FOLDER SCAN REPORT',
    '==================',
    `Root folder : ${targetDir}`,
    `Generated   : ${new Date().toLocaleString()}`,
    '',
  ];

  lines.push(`${path.basename(targetDir)}/`);
  scanDir(targetDir, '', lines, stats);

  const footer = [
    '',
    '------------------',
    `Folders scanned : ${stats.folderCount}`,
    `Files scanned   : ${stats.fileCount}`,
    `Total size      : ${formatSize(stats.totalSize)}`,
  ];

  const output = [...header, ...lines, ...footer].join('\n');

  fs.writeFileSync(outputFile, output, 'utf8');
  console.log(`Done! Scanned ${stats.fileCount} files in ${stats.folderCount} folders.`);
  console.log(`Report written to: ${outputFile}`);
}

main();