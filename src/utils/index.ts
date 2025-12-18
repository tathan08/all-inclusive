/**
 * Utility functions for the All-Inclusive extension
 */

/**
 * Get a CSS selector for an element
 */
export function getElementSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }
  
  // Generate a unique selector using nth-child
  const path: string[] = [];
  let current: Element | null = element;
  
  while (current && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase();
    
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(c => c).join('.');
      if (classes) {
        selector += `.${classes}`;
      }
    }
    
    // Add nth-child if needed for uniqueness
    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children);
      const sameTagSiblings = siblings.filter(s => s.tagName === current!.tagName);
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }
    
    path.unshift(selector);
    current = current.parentElement;
    
    // Stop if we have enough specificity (max 4 levels)
    if (path.length >= 4) break;
  }
  
  return path.join(' > ');
}

/**
 * Get a human-readable path to an element
 */
export function getElementPath(element: Element): string {
  const path: string[] = [];
  let current: Element | null = element;
  
  while (current && current !== document.body) {
    path.unshift(getElementSelector(current));
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

/**
 * Convert RGB color to hex
 */
export function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Calculate relative luminance
 */
export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse RGB color string to object
 */
export function parseRgbColor(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
  };
}

/**
 * Check if an element is visible
 */
export function isElementVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return true;
  
  const style = window.getComputedStyle(element);
  
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (parseFloat(style.opacity) === 0) return false;
  
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  
  return true;
}

/**
 * Check if element should be checked for accessibility
 * Skips elements that are intentionally hidden from assistive technologies
 */
export function shouldCheckElement(element: Element): boolean {
  const role = element.getAttribute('role');
  const ariaHidden = element.getAttribute('aria-hidden');
  
  // Skip if element has presentation or none role (semantically hidden)
  if (role === 'presentation' || role === 'none') {
    return false;
  }
  
  // Skip if explicitly hidden from assistive tech
  if (ariaHidden === 'true') {
    return false;
  }
  
  // Check if any parent element has aria-hidden="true"
  let parent = element.parentElement;
  while (parent && parent !== document.body.parentElement) {
    if (parent.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    
    // Also check if parent has presentation/none role
    const parentRole = parent.getAttribute('role');
    if (parentRole === 'presentation' || parentRole === 'none') {
      return false;
    }
    
    parent = parent.parentElement;
  }
  
  // Skip if not visible
  if (!isElementVisible(element)) {
    return false;
  }
  
  return true;
}

/**
 * Check if element has an accessible name through aria-label or aria-labelledby
 */
export function hasAccessibleName(element: Element): boolean {
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledby = element.getAttribute('aria-labelledby');
  
  if (ariaLabel || ariaLabelledby) {
    return true;
  }
  
  // Check if parent has aria-labelledby that might label this element
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    const parentLabelledby = parent.getAttribute('aria-labelledby');
    if (parentLabelledby) {
      // Parent has a label, children might be labeled by context
      return true;
    }
    parent = parent.parentElement;
  }
  
  return false;
}