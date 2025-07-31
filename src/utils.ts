// Utility functions for Tumblr2Moose
import path from 'path';

export function formatDateFolder(dateStr: string): string {
  // Converts ISO date to YYYY-MM-DDTHH-MM
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}-${min}`;
}

export function zeroPad(num: number, length: number = 2): string {
  return String(num).padStart(length, '0');
}

export function getMediaExtension(url: string): string {
  return path.extname(url).split('?')[0] || '.jpg';
}

export function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
}
