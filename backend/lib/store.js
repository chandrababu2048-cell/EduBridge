// EduBridge JSON file store helper
// Provides safe read/write for the local JSON data files used in the MVP.
// When Supabase is wired up (see supabase/migrations/001_teacher_student.sql),
// these functions can be swapped out for DB calls without touching route code.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

/**
 * Read a JSON store file.
 * @param {string} filename  e.g. 'teachers.json'
 * @returns {object}         Parsed object, or {} if the file doesn't exist / is corrupt
 */
export const readStore = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`store.readStore(${filename}) error:`, err.message);
    return {};
  }
};

/**
 * Write data to a JSON store file (pretty-printed for easy debugging).
 * @param {string} filename  e.g. 'teachers.json'
 * @param {object} data      The full object to serialise
 */
export const writeStore = (filename, data) => {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`store.writeStore(${filename}) error:`, err.message);
    throw err; // re-throw so route handlers can return a 500
  }
};
