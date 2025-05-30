import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'redirects.json');

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Initialize empty database if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

export function getAllRedirects() {
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getRedirectById(id) {
  const redirects = getAllRedirects();
  return redirects.find(r => r.id === id);
}

export function createRedirect(redirect) {
  const redirects = getAllRedirects();
  redirects.push(redirect);
  fs.writeFileSync(DB_FILE, JSON.stringify(redirects, null, 2));
  return redirect;
}

export function updateRedirect(id, update) {
  const redirects = getAllRedirects();
  const index = redirects.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  redirects[index] = { ...redirects[index], ...update };
  fs.writeFileSync(DB_FILE, JSON.stringify(redirects, null, 2));
  return redirects[index];
} 