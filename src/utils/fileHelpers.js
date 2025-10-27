/**
 * Formats a file size in bytes to a human-readable string
 * @param {number} bytes - The file size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB", "245.5 KB")
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
