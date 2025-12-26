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

    // Helper function to check if image appears decorative
    const isLikelyDecorative = (img: HTMLImageElement): boolean => {
      // Check for decorative indicators
      const role = img.getAttribute('role');
      if (role === 'presentation' || role === 'none') return true;
      
      // Very small images are likely decorative (icons, spacers)
      const rect = img.getBoundingClientRect();
      if (rect.width <= 10 || rect.height <= 10) return true;
      
      return false;
    };

    // Helper function to check if alt text looks like a filename
    const looksLikeFilename = (text: string): boolean => {
      const filenamePatterns = [
        /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i,  // File extensions
        /^(DSC|IMG|PHOTO|IMAGE)_?\d+/i,  // Camera filenames
        /^[a-z0-9_-]{10,}\.(jpg|png|gif)/i,  // Long filename-like
        /^(image|photo|picture|img)\d+/i,  // Generic + number
      ];
      return filenamePatterns.some(pattern => pattern.test(text));
    };

    // Helper function to check if alt text is generic
    const isGenericAltText = (text: string): boolean => {
      const genericTerms = ['image', 'photo', 'picture', 'graphic', 'img', 'icon'];
      const normalized = text.toLowerCase().trim();
      return genericTerms.includes(normalized);
    };

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
        return;
      }

      // Check for empty alt on non-decorative images
      if (alt === '' && !isLikelyDecorative(img as HTMLImageElement)) {
        const uniqueId = `violation-${Date.now()}-${index}-empty`;
        img.setAttribute('data-violation', uniqueId);
        
        violations.push({
          id: `image-alt-empty-${index}`,
          ruleId: 'image-alt-text',
          principle: WCAGPrinciple.PERCEIVABLE,
          wcagCriteria: '1.1.1',
          level: WCAGLevel.A,
          severity: Severity.SERIOUS,
          message: 'Non-decorative image has empty alt text',
          description: 'This image appears to be meaningful but has an empty alt attribute. Screen reader users will not be able to understand what this image conveys.',
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: img.outerHTML.substring(0, 200),
          suggestion: 'Add descriptive alt text that conveys the purpose and content of the image. If the image is truly decorative, consider adding role="presentation".',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html',
        });
        return;
      }

      // Check for poor quality alt text (filenames, generic terms)
      if (alt && alt.trim().length > 0) {
        if (looksLikeFilename(alt)) {
          const uniqueId = `violation-${Date.now()}-${index}-filename`;
          img.setAttribute('data-violation', uniqueId);
          
          violations.push({
            id: `image-alt-filename-${index}`,
            ruleId: 'image-alt-text',
            principle: WCAGPrinciple.PERCEIVABLE,
            wcagCriteria: '1.1.1',
            level: WCAGLevel.A,
            severity: Severity.MODERATE,
            message: 'Image alt text appears to be a filename',
            description: `The alt text "${alt}" looks like a filename, which is not helpful for screen reader users.`,
            element: `[data-violation="${uniqueId}"]`,
            htmlSnippet: img.outerHTML.substring(0, 200),
            suggestion: 'Replace the filename with descriptive text that explains what the image shows or its purpose in the context of the page.',
            learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html',
          });
          return;
        }

        if (isGenericAltText(alt)) {
          const uniqueId = `violation-${Date.now()}-${index}-generic`;
          img.setAttribute('data-violation', uniqueId);
          
          violations.push({
            id: `image-alt-generic-${index}`,
            ruleId: 'image-alt-text',
            principle: WCAGPrinciple.PERCEIVABLE,
            wcagCriteria: '1.1.1',
            level: WCAGLevel.A,
            severity: Severity.MODERATE,
            message: 'Image alt text is too generic',
            description: `The alt text "${alt}" is too generic and doesn't describe the specific content of the image.`,
            element: `[data-violation="${uniqueId}"]`,
            htmlSnippet: img.outerHTML.substring(0, 200),
            suggestion: 'Use descriptive alt text that specifically describes what the image shows or its purpose. Generic terms like "image" or "photo" are not helpful.',
            learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html',
          });
        }
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

/**
 * Check for proper heading structure
 * WCAG 1.3.1 - Info and Relationships (Level A)
 * WCAG 2.4.6 - Headings and Labels (Level AA)
 */
export const headingStructure: AccessibilityRule = {
  id: 'heading-structure',
  name: 'Headings must be properly structured',
  description: 'Headings should follow a logical hierarchy without skipping levels, and pages should have an H1',
  principle: WCAGPrinciple.PERCEIVABLE,
  wcagCriteria: '1.3.1',
  level: WCAGLevel.A,
  check: (root: Element | Document): Violation[] => {
    const violations: Violation[] = [];
    const headings = root.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // Track heading levels and their positions
    const headingLevels: { level: number; element: HTMLHeadingElement; index: number }[] = [];
    
    headings.forEach((heading, index) => {
      const htmlHeading = heading as HTMLHeadingElement;
      const level = parseInt(htmlHeading.tagName.charAt(1), 10);
      
      // Check for empty headings BEFORE shouldCheckElement
      // Empty headings might be filtered out by visibility checks
      const textContent = htmlHeading.textContent?.trim();
      if (!textContent || textContent.length === 0) {
        const uniqueId = `violation-${Date.now()}-${index}-empty`;
        htmlHeading.setAttribute('data-violation', uniqueId);
        
        violations.push({
          id: `heading-empty-${index}`,
          ruleId: 'heading-structure',
          principle: WCAGPrinciple.PERCEIVABLE,
          wcagCriteria: '2.4.6',
          level: WCAGLevel.AA,
          severity: Severity.SERIOUS,
          message: 'Empty heading found',
          description: `An ${htmlHeading.tagName} heading has no text content. Empty headings confuse screen reader users.`,
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: htmlHeading.outerHTML.substring(0, 200),
          suggestion: 'Add descriptive text to the heading or remove it if it serves no purpose.',
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
        });
        return;
      }
      
      // Skip if element should not be checked (hidden, presentation role, etc.)
      if (!shouldCheckElement(heading)) {
        return;
      }
      
      headingLevels.push({ level, element: htmlHeading, index });
    });
    
    // Check for missing H1
    const h1Count = headingLevels.filter(h => h.level === 1).length;
    if (h1Count === 0 && headingLevels.length > 0) {
      const firstHeading = headingLevels[0].element;
      const uniqueId = `violation-${Date.now()}-no-h1`;
      firstHeading.setAttribute('data-violation', uniqueId);
      
      violations.push({
        id: 'heading-missing-h1',
        ruleId: 'heading-structure',
        principle: WCAGPrinciple.PERCEIVABLE,
        wcagCriteria: '1.3.1',
        level: WCAGLevel.A,
        severity: Severity.SERIOUS,
        message: 'Page missing H1 heading',
        description: 'This page has no H1 heading. The H1 should be used for the main page title to help users understand the page structure.',
        element: `[data-violation="${uniqueId}"]`,
        htmlSnippet: `First heading: ${firstHeading.outerHTML.substring(0, 200)}`,
        suggestion: 'Add an H1 heading at the top of the page that describes the main content or purpose of the page.',
        learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
      });
    }
    
    // Check for multiple H1s (often considered bad practice, though not strictly forbidden in HTML5)
    if (h1Count > 1) {
      headingLevels
        .filter(h => h.level === 1)
        .slice(1) // Skip the first H1
        .forEach(({ element, index }) => {
          const uniqueId = `violation-${Date.now()}-${index}-multiple-h1`;
          element.setAttribute('data-violation', uniqueId);
          
          violations.push({
            id: `heading-multiple-h1-${index}`,
            ruleId: 'heading-structure',
            principle: WCAGPrinciple.PERCEIVABLE,
            wcagCriteria: '1.3.1',
            level: WCAGLevel.A,
            severity: Severity.MODERATE,
            message: 'Multiple H1 headings found',
            description: `This page has ${h1Count} H1 headings. Best practice is to have only one H1 per page to clearly identify the main topic.`,
            element: `[data-violation="${uniqueId}"]`,
            htmlSnippet: element.outerHTML.substring(0, 200),
            suggestion: 'Change additional H1 headings to H2 or lower levels based on their relationship to the main heading.',
            learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
          });
        });
    }
    
    // Check for skipped heading levels
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i];
      const previous = headingLevels[i - 1];
      const levelDifference = current.level - previous.level;
      
      // If we skip more than one level (e.g., H2 to H4)
      if (levelDifference > 1) {
        const uniqueId = `violation-${Date.now()}-${current.index}-skipped`;
        current.element.setAttribute('data-violation', uniqueId);
        
        violations.push({
          id: `heading-skipped-level-${current.index}`,
          ruleId: 'heading-structure',
          principle: WCAGPrinciple.PERCEIVABLE,
          wcagCriteria: '1.3.1',
          level: WCAGLevel.A,
          severity: Severity.MODERATE,
          message: `Heading level skipped from H${previous.level} to H${current.level}`,
          description: `This H${current.level} heading follows an H${previous.level} heading, skipping ${levelDifference - 1} level(s). This breaks the document outline and confuses screen reader users.`,
          element: `[data-violation="${uniqueId}"]`,
          htmlSnippet: current.element.outerHTML.substring(0, 200),
          suggestion: `Use H${previous.level + 1} instead, or restructure your headings to follow a logical hierarchy (H1 → H2 → H3, etc.).`,
          learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
        });
      }
    }
    
    return violations;
  },
};

export default [imageAltText, colorContrast, headingStructure];
