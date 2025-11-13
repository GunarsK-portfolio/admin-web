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

  // Check if source parameter already exists
  if (url.includes('source=')) {
    return url
  }

  try {
    // Only process absolute URLs with URL constructor
    const urlObj = new URL(url)
    urlObj.searchParams.set('source', source)
    return urlObj.toString()
  } catch {
    // Fallback for relative URLs - use URL encoding for source parameter
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}source=${encodeURIComponent(source)}`
  }
}
