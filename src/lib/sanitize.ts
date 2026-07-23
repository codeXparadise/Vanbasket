// [FIXED] - Sanitize All User Inputs
import sanitizeHtml from "sanitize-html";

/**
 * Strips untrusted script tags, malicious attributes, and dangerous inline JS.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return sanitizeHtml(input, {
    allowedTags: [], // Strip all HTML tags by default for clean text inputs
    allowedAttributes: {},
  }).trim();
}

/**
 * Sanitizes rich text content if HTML tags are intentionally allowed.
 */
export function sanitizeRichText(input: string): string {
  if (typeof input !== "string") return "";
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
