const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'application/json',
  'application/octet-stream',
];

// ─── Upload folder paths ──────────────────────────────────────────────────────
const UPLOAD_ROOT = path.join(__dirname, '../uploads');

const UPLOAD_DIRS = {
  image: path.join(UPLOAD_ROOT, 'images'),
  video: path.join(UPLOAD_ROOT, 'videos'),
  audio: path.join(UPLOAD_ROOT, 'audio'),
  pdf: path.join(UPLOAD_ROOT, 'documents'),
  document: path.join(UPLOAD_ROOT, 'documents'),
  spreadsheet: path.join(UPLOAD_ROOT, 'documents'),
  presentation: path.join(UPLOAD_ROOT, 'documents'),
  archive: path.join(UPLOAD_ROOT, 'others'),
  file: path.join(UPLOAD_ROOT, 'others'),
};

// Create all directories on startup
function ensureUploadDirs() {
  Object.values(UPLOAD_DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}
ensureUploadDirs();

// ─── Validate ─────────────────────────────────────────────────────────────────
function validateFile(file) {
  if (!file) return 'No file provided';
  if (file.size > MAX_FILE_SIZE) return 'File too large. Max size is 10MB';
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) return `File type not allowed: ${file.mimetype}`;
  return null;
}

// ─── Category ─────────────────────────────────────────────────────────────────
function getFileCategory(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
  if (mimetype.includes('sheet') || mimetype.includes('excel') || mimetype === 'text/csv')
    return 'spreadsheet';
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'presentation';
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z'))
    return 'archive';
  return 'file';
}

// ─── Save file to disk — returns { url, mimetype, size } ─────────────────────
async function saveFileToDisk(file) {
  const category = getFileCategory(file.mimetype);
  const saveDir = UPLOAD_DIRS[category];

  let buffer = file.buffer;
  let mimetype = file.mimetype;
  let ext = path.extname(file.originalname) || '';

  // Optimize raster images → WebP
  const isRasterImage = ['image/jpeg', 'image/png', 'image/webp'].includes(mimetype);
  if (isRasterImage) {
    buffer = await sharp(buffer)
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    mimetype = 'image/webp';
    ext = '.webp';
  }

  // Unique filename: timestamp-randomhex.ext
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const filepath = path.join(saveDir, filename);

  fs.writeFileSync(filepath, buffer);

  // Relative URL path served by Express static middleware
  // e.g. /uploads/images/1716023400000-abc123.webp
  const urlPath = '/uploads/' + path.relative(UPLOAD_ROOT, filepath).replace(/\\/g, '/');

  return { url: urlPath, mimetype, size: buffer.length };
}

// ─── Delete file from disk ────────────────────────────────────────────────────
function deleteFileFromDisk(urlPath) {
  try {
    if (!urlPath) return;
    const relative = urlPath.replace(/^\/uploads\//, '');
    const filepath = path.join(UPLOAD_ROOT, relative);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (err) {
    console.error('[deleteFileFromDisk]', err.message);
  }
}

module.exports = {
  validateFile,
  saveFileToDisk,
  deleteFileFromDisk,
  getFileCategory,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
};
