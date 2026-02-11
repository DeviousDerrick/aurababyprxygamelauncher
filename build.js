import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔧 Building for Vercel...');

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

// 1. Copy Scramjet files
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

// 2. Copy BareMux files
const baremuxDir = join(__dirname, 'public', 'baremux');
if (!existsSync(baremuxDir)) {
  mkdirSync(baremuxDir, { recursive: true });
}

const baremuxPath = join(__dirname, 'node_modules', '@mercuryworkshop', 'bare-mux', 'dist');

if (existsSync(baremuxPath)) {
  console.log('📦 Copying BareMux files...');
  copyDir(baremuxPath, baremuxDir);
} else {
  console.warn('⚠️ BareMux not found, skipping...');
}

// 3. Copy Epoxy files
const epoxyDir = join(__dirname, 'public', 'epoxy');
if (!existsSync(epoxyDir)) {
  mkdirSync(epoxyDir, { recursive: true });
}

const epoxyPath = join(__dirname, 'node_modules', '@mercuryworkshop', 'epoxy-transport', 'dist');

if (existsSync(epoxyPath)) {
  console.log('📦 Copying Epoxy files...');
  copyDir(epoxyPath, epoxyDir);
} else {
  console.warn('⚠️ Epoxy not found, skipping...');
}

console.log('✅ Build complete! Ready for Vercel deployment.');
