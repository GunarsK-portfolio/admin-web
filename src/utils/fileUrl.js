/**
 * Adds source tracking parameter to file URLs for audit logging
 * @param {string} url - The file URL
 * @param {string} source - The source identifier (e.g., 'admin-web', 'public-web')
 * @returns {string} URL with source parameter appended
 */
export function addSourceToFileUrl(url, source = 'admin-web') {
  if (!url || typeof url !== 'string') {
    return url
  }

  try {
    const urlObj = new URL(url, window.location.origin)
    urlObj.searchParams.set('source', source)
    return urlObj.toString()
  } catch {
    // Fallback for relative URLs or invalid URLs
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}source=${source}`
  }
}
