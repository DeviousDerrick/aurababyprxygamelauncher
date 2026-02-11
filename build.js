import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔧 Building for Vercel (Pure Scramjet)...');

// Helper function to copy directories
function copyDir(src, dest) {
  const files = readdirSync(src);
  
  files.forEach(file => {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    
    if (statSync(srcPath).isDirectory()) {
      if (!existsSync(destPath)) {
        mkdirSync(destPath, { recursive: true });
      }
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`   ✓ Copied ${file}`);
    }
  });
}

// Copy Scramjet files
const scramDir = join(__dirname, 'public', 'scram');
if (!existsSync(scramDir)) {
  mkdirSync(scramDir, { recursive: true });
}

const scramjetPath = join(__dirname, 'node_modules', '@mercuryworkshop', 'scramjet', 'dist');

if (!existsSync(scramjetPath)) {
  console.error('❌ Scramjet not found in node_modules!');
  console.log('Run: npm install');
  process.exit(1);
}

console.log('📦 Copying Scramjet files...');
copyDir(scramjetPath, scramDir);

console.log('');
console.log('✅ Build complete!');
console.log('📦 Pure Scramjet (no BareMux) - Works on Vercel static hosting!');
