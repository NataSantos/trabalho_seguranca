/**
 * Remove HTML/XML tags and JavaScript event handlers from a string.
 * This prevents stored XSS attacks by stripping dangerous content.
 */
export function sanitize(value: string): string {
  return (
    value
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove remaining HTML tags (open + close)
      .replace(/<[^>]*>/g, '')
      // Remove javascript: protocol URIs
      .replace(/javascript\s*:/gi, 'blocked:')
      // Remove on* event handlers (onclick, onerror, onload, etc.)
      .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
      // Trim whitespace
      .trim()
  );
}
