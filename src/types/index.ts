/**
 * WCAG Principle Types
 */
export enum WCAGPrinciple {
  PERCEIVABLE = 'perceivable',
  OPERABLE = 'operable',
  UNDERSTANDABLE = 'understandable',
  ROBUST = 'robust',
}

/**
 * WCAG Conformance Levels
 */
export enum WCAGLevel {
  A = 'A',
  AA = 'AA',
  AAA = 'AAA',
}

/**
 * Severity of the accessibility issue
 */
export enum Severity {
  CRITICAL = 'critical',
  SERIOUS = 'serious',
  MODERATE = 'moderate',
  MINOR = 'minor',
}

/**
 * Represents a single accessibility violation found on the page
 */
export interface Violation {
  id: string;
  ruleId: string;
  principle: WCAGPrinciple;
  wcagCriteria: string; // e.g., "1.4.3", "2.1.1"
  level: WCAGLevel;
  severity: Severity;
  message: string;
  description: string;
  element: string; // CSS selector
  htmlSnippet: string;
  suggestion?: string;
  learnMoreUrl?: string;
}

/**
 * Results of an accessibility scan
 */
export interface ScanResult {
  url: string;
  timestamp: number;
  violations: Violation[];
  summary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    byPrinciple: {
      [key in WCAGPrinciple]: number;
    };
  };
}

/**
 * Individual accessibility rule checker
 */
export interface AccessibilityRule {
  id: string;
  name: string;
  description: string;
  principle: WCAGPrinciple;
  wcagCriteria: string;
  level: WCAGLevel;
  check: (element: Element | Document) => Violation[];
}

/**
 * Message types for Chrome extension communication
 */
export enum MessageType {
  SCAN_PAGE = 'SCAN_PAGE',
  SCAN_COMPLETE = 'SCAN_COMPLETE',
  HIGHLIGHT_ELEMENT = 'HIGHLIGHT_ELEMENT',
  CLEAR_HIGHLIGHTS = 'CLEAR_HIGHLIGHTS',
  INSPECT_ELEMENT = 'INSPECT_ELEMENT',
}

/**
 * Messages sent between popup, background, and content scripts
 */
export interface Message {
  type: MessageType;
  data?: any;
}

/**
 * Storage structure for scan results
 */
export interface StoredData {
  lastScan?: ScanResult;
  scanHistory?: ScanResult[];
  settings?: {
    autoScan: boolean;
    showMinorIssues: boolean;
    targetLevel: WCAGLevel;
  };
}
