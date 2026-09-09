import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT_DIR, 'src', 'data', 'exercises-manifest.json');
const PUBLIC_EXERCISES_DIR = path.join(ROOT_DIR, 'public', 'exercises');

async function downloadFile(url, destPath, retries = 3) {
  if (fs.existsSync(destPath)) {
    const stats = fs.statSync(destPath);
    if (stats.size > 1000) {
      return; // Already downloaded
    }
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, buffer);
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
}

async function run() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error('Manifest not found. Run curate-exercises.mjs first.');
  }

  const exercises = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const tasks = [];

  for (const ex of exercises) {
    const exDir = path.join(PUBLIC_EXERCISES_DIR, ex.id);
    tasks.push({
      url: ex.rawImageUrls[0],
      dest: path.join(exDir, '0.jpg'),
      id: `${ex.id}/0.jpg`
    });
    tasks.push({
      url: ex.rawImageUrls[1],
      dest: path.join(exDir, '1.jpg'),
      id: `${ex.id}/1.jpg`
    });
  }

  console.log(`Starting download of ${tasks.length} images...`);

  const CONCURRENCY = 12;
  let index = 0;
  let completed = 0;
  let failed = 0;

  async function worker() {
    while (index < tasks.length) {
      const current = tasks[index++];
      try {
        await downloadFile(current.url, current.dest);
        completed++;
        if (completed % 20 === 0 || completed === tasks.length) {
          console.log(`Downloaded ${completed}/${tasks.length} images`);
        }
      } catch (err) {
        console.error(`Failed ${current.id}: ${err.message}`);
        failed++;
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`Finished image downloads! Completed: ${completed}, Failed: ${failed}`);

  // Clean up manifest file as it was only needed for downloading
  if (fs.existsSync(MANIFEST_PATH)) {
    fs.unlinkSync(MANIFEST_PATH);
    console.log('Removed temporary exercises-manifest.json');
  }
}

run().catch(console.error);
