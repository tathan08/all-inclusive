import { AccessibilityRule, Violation, WCAGPrinciple, WCAGLevel, Severity } from '../../types';
import { getElementSelector, getRelativeLuminance, getContrastRatio, parseRgbColor, shouldCheckElement, hasAccessibleName } from '../../utils';

/**
 * Check for images without alt text
 * WCAG 1.1.1 - Non-text Content (Level A)
 */
export const imageAltText: AccessibilityRule = {
  id: 'image-alt-text',
  name: 'Images must have alternative text',
  description: 'All images must have alt attributes to provide text alternatives for screen readers',
  principle: WCAGPrinciple.PERCEIVABLE,
  wcagCriteria: '1.1.1',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    const images = root.querySelectorAll('img');

    images.forEach((img, index) => {
      // Skip if element should not be checked (hidden, presentation role, etc.)
      if (!shouldCheckElement(img)) {
        return;
      }
      
      // Skip if element already has accessible name via aria-label/aria-labelledby
      if (hasAccessibleName(img)) {
        return;
      }
      
      const alt = img.getAttribute('alt');
      const title = img.getAttribute('title');
      
      // Check if alt is missing (but only flag if no other accessible name exists)
      if (alt === null && !title) {
        const uniqueId = `violation-${Date.now()}-${index}`;
        img.setAttribute('data-violation', uniqueId);
        
        violations.push({
          id: `image-alt-${index}`,
          ruleId: 'image-alt-text',
          principle: WCAGPrinciple.PERCEIVABLE,
          wcagCriteria: '1.1.1',
          level: WCAGLevel.A,
          severity: Severity.CRITICAL,
          message: 'Image missing alt attribute',
          description: 'This image does not have an alt attribute. Screen reader users cannot understand what this image conveys.',
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: img.outerHTML.substring(0, 200),
          suggestion: 'Add an alt attribute with a descriptive text. If the image is decorative, use alt="". You can also use aria-label as an alternative.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html',
        });
      }
    });

    return violations;
  },
};

/**
 * Check for sufficient color contrast
 * WCAG 1.4.3 - Contrast (Minimum) (Level AA)
 */
export const colorContrast: AccessibilityRule = {
  id: 'color-contrast',
  name: 'Text must have sufficient color contrast',
  description: 'Text should have a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text',
  principle: WCAGPrinciple.PERCEIVABLE,
  wcagCriteria: '1.4.3',
  level: WCAGLevel.AA,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    const checkedElements = new Set<Element>();
    
    // Only check visible text elements with actual content
    const textElements = root.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, li, td, th, label, button');
    
    textElements.forEach((element) => {
      // Skip if element should not be checked (hidden, presentation role, etc.)
      if (!shouldCheckElement(element)) {
        return;
      }
      
      // Skip if already checked or is a child of a checked element
      if (checkedElements.has(element)) return;
      
      const htmlElement = element as HTMLElement;
      
      // Skip if element has no text content
      const textContent = htmlElement.textContent?.trim();
      if (!textContent || textContent.length === 0) return;
      
      const styles = window.getComputedStyle(htmlElement);
      
      // Skip very small elements (likely icons or decorative)
      const rect = htmlElement.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;
      
      const color = styles.color;
      const backgroundColor = getEffectiveBackgroundColor(htmlElement);
      
      // Only check if we have both colors
      if (!color || !backgroundColor) return;
      
      const foreground = parseRgbColor(color);
      const background = parseRgbColor(backgroundColor);
      
      if (!foreground || !background) return;
      
      // Calculate actual contrast ratio
      const contrastRatio = getContrastRatio(foreground, background);
      
      // Determine required contrast based on font size
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = parseInt(styles.fontWeight) || 400;
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
      
      const requiredRatio = isLargeText ? 3.0 : 4.5;
      
      // Only flag if contrast is actually insufficient
      if (contrastRatio < requiredRatio) {
        checkedElements.add(element);
        
        const uniqueId = `violation-${Date.now()}-${violations.length}`;
        htmlElement.setAttribute('data-violation', uniqueId);
        
        violations.push({
          id: `contrast-${element.tagName}-${violations.length}`,
          ruleId: 'color-contrast',
          principle: WCAGPrinciple.PERCEIVABLE,
          wcagCriteria: '1.4.3',
          level: WCAGLevel.AA,
          severity: contrastRatio < (requiredRatio - 1) ? Severity.SERIOUS : Severity.MODERATE,
          message: 'Insufficient color contrast',
          description: `Text has a contrast ratio of ${contrastRatio.toFixed(2)}:1, but requires ${requiredRatio}:1. Color: ${color}, Background: ${backgroundColor}`,
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: element.outerHTML.substring(0, 200),
          suggestion: `Increase contrast to at least ${requiredRatio}:1. Consider using a ${contrastRatio < requiredRatio ? 'darker text color or lighter background' : 'different color combination'}.`,
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
        });
      }
    });

    return violations;
  },
};

/**
 * Get effective background color by checking for overlaying elements and traversing up the DOM tree
 */
function getEffectiveBackgroundColor(element: HTMLElement): string | null {
  // First, check if there's an element overlaying this one
  const rect = element.getBoundingClientRect();
  
  // Check the center point of the element
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Get the topmost element at this position
  const topElement = document.elementFromPoint(centerX, centerY);
  
  // If the top element is not our element or a child, there might be an overlay
  if (topElement && topElement !== element && !element.contains(topElement)) {
    // Check if this overlaying element has a background color
    const overlayBgColor = window.getComputedStyle(topElement as HTMLElement).backgroundColor;
    if (overlayBgColor && overlayBgColor !== 'rgba(0, 0, 0, 0)' && overlayBgColor !== 'transparent') {
      const rgb = parseRgbColor(overlayBgColor);
      if (rgb) {
        // Check opacity - if mostly opaque, use this as the background
        if (overlayBgColor.includes('rgba')) {
          const alphaMatch = overlayBgColor.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)/);
          if (alphaMatch && parseFloat(alphaMatch[1]) >= 0.5) {
            return overlayBgColor;
          }
        } else {
          // Solid color, use it
          return overlayBgColor;
        }
      }
    }
  }
  
  // No overlay detected or overlay is transparent, traverse up the DOM tree
  let current: HTMLElement | null = element;
  
  while (current && current !== document.body.parentElement) {
    const bgColor = window.getComputedStyle(current).backgroundColor;
    
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      const rgb = parseRgbColor(bgColor);
      // Check if color has opacity
      if (rgb && bgColor.includes('rgba')) {
        const alphaMatch = bgColor.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)/);
        if (alphaMatch && parseFloat(alphaMatch[1]) < 0.1) {
          // Very transparent, keep looking
          current = current.parentElement;
          continue;
        }
      }
      return bgColor;
    }
    
    current = current.parentElement;
  }
  
  // Default to white if no background found
  return 'rgb(255, 255, 255)';
}

export default [imageAltText, colorContrast];
