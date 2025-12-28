import { ScanResult, Violation, MessageType, Severity } from '../types';

// DOM Elements
const scanButton = document.getElementById('scanButton') as HTMLButtonElement;
const rescanButton = document.getElementById('rescanButton') as HTMLButtonElement;
const copyButton = document.getElementById('copyButton') as HTMLButtonElement;
const exportButton = document.getElementById('exportButton') as HTMLButtonElement;
const loading = document.getElementById('loading') as HTMLDivElement;
const scanInfo = document.getElementById('scanInfo') as HTMLDivElement;
const results = document.getElementById('results') as HTMLElement;
const emptyState = document.getElementById('emptyState') as HTMLElement;
const violationsList = document.getElementById('violationsList') as HTMLDivElement;
const scannedUrl = document.getElementById('scannedUrl') as HTMLDivElement;
const scannedTime = document.getElementById('scannedTime') as HTMLDivElement;
const resultsCount = document.getElementById('resultsCount') as HTMLDivElement;
const countText = document.getElementById('countText') as HTMLSpanElement;

// Stat counters
const totalCount = document.getElementById('totalCount') as HTMLSpanElement;
const criticalCount = document.getElementById('criticalCount') as HTMLSpanElement;
const seriousCount = document.getElementById('seriousCount') as HTMLSpanElement;
const moderateCount = document.getElementById('moderateCount') as HTMLSpanElement;
const minorCount = document.getElementById('minorCount') as HTMLSpanElement;

// Severity Filters
const filterCritical = document.getElementById('filterCritical') as HTMLInputElement;
const filterSerious = document.getElementById('filterSerious') as HTMLInputElement;
const filterModerate = document.getElementById('filterModerate') as HTMLInputElement;
const filterMinor = document.getElementById('filterMinor') as HTMLInputElement;

// Principle Filters
const filterPerceivable = document.getElementById('filterPerceivable') as HTMLInputElement;
const filterOperable = document.getElementById('filterOperable') as HTMLInputElement;
const filterUnderstandable = document.getElementById('filterUnderstandable') as HTMLInputElement;
const filterRobust = document.getElementById('filterRobust') as HTMLInputElement;

// Sort
const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;

let currentScanResult: ScanResult | null = null;
let currentSortOrder: 'default' | 'severity' | 'principle' = 'default';
const resolvedViolations = new Set<string>();
const expandedViolations = new Set<string>();

/**
 * Initialize the popup
 */
async function init() {
  scanButton.addEventListener('click', handleScan);
  rescanButton.addEventListener('click', handleScan);
  copyButton.addEventListener('click', handleCopy);
  exportButton.addEventListener('click', handleExport);
  
  // Add filter listeners
  [filterCritical, filterSerious, filterModerate, filterMinor, 
   filterPerceivable, filterOperable, filterUnderstandable, filterRobust].forEach(filter => {
    filter.addEventListener('change', () => displayViolations(currentScanResult));
  });

  // Add sort listener
  sortSelect.addEventListener('change', () => {
    currentSortOrder = sortSelect.value as 'default' | 'severity' | 'principle';
    displayViolations(currentScanResult);
  });

  // Load last scan result from storage
  const { lastScan } = await chrome.storage.local.get('lastScan');
  if (lastScan) {
    currentScanResult = lastScan;
    displayResults(lastScan);
  }
}

/**
 * Handle scan button click
 */
async function handleScan() {
  try {
    scanButton.disabled = true;
    rescanButton.disabled = true;
    loading.classList.remove('hidden');
    scanInfo.classList.add('hidden');
    results.classList.add('hidden');
    emptyState.classList.add('hidden');

    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.id) {
      throw new Error('No active tab found');
    }

    // Check if the URL is a restricted page
    if (tab.url && isRestrictedUrl(tab.url)) {
      throw new Error('Cannot scan this page. Chrome extensions cannot access chrome://, chrome-extension://, or Chrome Web Store pages.');
    }

    // Try to ping the content script first
    let contentScriptReady = false;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
      contentScriptReady = true;
    } catch (e) {
      // Content script not ready, will inject it programmatically
      contentScriptReady = false;
    }

    // If content script is not ready, inject it programmatically
    if (!contentScriptReady) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/index.js'],
        });
        // Wait a bit for the script to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (injectError) {
        throw new Error('Failed to inject content script. This page may not allow extensions.');
      }
    }

    // Send message to content script to scan the page
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: MessageType.SCAN_PAGE,
    });

    currentScanResult = response as ScanResult;
    
    // Store the result
    await chrome.storage.local.set({ lastScan: currentScanResult });
    
    displayResults(currentScanResult);
  } catch (error) {
    console.error('Scan failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    showError(errorMessage);
  } finally {
    scanButton.disabled = false;
    rescanButton.disabled = false;
    loading.classList.add('hidden');
  }
}

/**
 * Check if URL is restricted (cannot inject content scripts)
 */
function isRestrictedUrl(url: string): boolean {
  const restrictedProtocols = ['chrome://', 'chrome-extension://', 'edge://', 'about:'];
  const restrictedDomains = ['chrome.google.com/webstore'];
  
  return restrictedProtocols.some(protocol => url.startsWith(protocol)) ||
         restrictedDomains.some(domain => url.includes(domain));
}

/**
 * Show error message to user
 */
function showError(message: string) {
  results.classList.add('hidden');
  emptyState.classList.add('hidden');
  loading.classList.add('hidden');
  
  // Create or update error display
  let errorDiv = document.getElementById('errorMessage') as HTMLDivElement;
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'errorMessage';
    errorDiv.className = 'error-message';
    document.querySelector('.container')?.appendChild(errorDiv);
  }
  
  errorDiv.innerHTML = `
    <h3>Unable to Scan Page</h3>
    <p>${escapeHtml(message)}</p>
    <p class="error-hint">Try scanning a regular website instead.</p>
  `;
  errorDiv.classList.remove('hidden');
}

/**
 * Display scan results
 */
function displayResults(scanResult: ScanResult) {
  if (!scanResult) return;

  // Hide error message if showing
  const errorDiv = document.getElementById('errorMessage');
  if (errorDiv) {
    errorDiv.classList.add('hidden');
  }

  const { summary, violations, url, timestamp } = scanResult;

  // Show scan info
  scanInfo.classList.remove('hidden');

  // Update scan info
  scannedUrl.textContent = truncateUrl(url);
  scannedUrl.title = url; // Show full URL on hover
  scannedTime.textContent = formatTimestamp(timestamp);

  // Update summary stats
  totalCount.textContent = summary.total.toString();
  criticalCount.textContent = summary.critical.toString();
  seriousCount.textContent = summary.serious.toString();
  moderateCount.textContent = summary.moderate.toString();
  minorCount.textContent = summary.minor.toString();

  if (summary.total === 0) {
    emptyState.classList.remove('hidden');
    results.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    results.classList.remove('hidden');
    displayViolations(scanResult);
  }
}

/**
 * Display filtered violations list
 */
function displayViolations(scanResult: ScanResult | null) {
  if (!scanResult) return;

  // Store current height to prevent layout shift
  const currentHeight = violationsList.scrollHeight;
  if (currentHeight > 0) {
    violationsList.style.minHeight = `${currentHeight}px`;
  }

  // Show loading state
  violationsList.classList.add('updating');

  // Small delay to show loading animation
  setTimeout(() => {
    // Get active severity filters
    const activeSeverityFilters: Severity[] = [];
    if (filterCritical.checked) activeSeverityFilters.push(Severity.CRITICAL);
    if (filterSerious.checked) activeSeverityFilters.push(Severity.SERIOUS);
    if (filterModerate.checked) activeSeverityFilters.push(Severity.MODERATE);
    if (filterMinor.checked) activeSeverityFilters.push(Severity.MINOR);

    // Get active principle filters
    const activePrincipleFilters: string[] = [];
    if (filterPerceivable.checked) activePrincipleFilters.push('perceivable');
    if (filterOperable.checked) activePrincipleFilters.push('operable');
    if (filterUnderstandable.checked) activePrincipleFilters.push('understandable');
    if (filterRobust.checked) activePrincipleFilters.push('robust');

    // Filter violations by both severity and principle
    let filteredViolations = scanResult.violations.filter(v => 
      activeSeverityFilters.includes(v.severity) && 
      activePrincipleFilters.includes(v.principle)
    );

    // Sort violations based on current sort order
    filteredViolations = sortViolations(filteredViolations, currentSortOrder);

    // Clear list
    violationsList.innerHTML = '';

    // Update count display
    updateResultsCount(filteredViolations.length, scanResult.summary.total);

    if (filteredViolations.length === 0) {
      violationsList.innerHTML = '<p class="no-results">No violations match the current filters.</p>';
      violationsList.classList.remove('updating');
      // Reset min-height after content is rendered
      requestAnimationFrame(() => {
        violationsList.style.minHeight = '';
      });
      return;
    }

    // Render violations
    filteredViolations.forEach((violation, index) => {
      const violationCard = createViolationCard(violation, index);
      violationsList.appendChild(violationCard);
    });

    // Remove loading state and reset min-height after content is rendered
    violationsList.classList.remove('updating');
    requestAnimationFrame(() => {
      violationsList.style.minHeight = '';
    });
  }, 150);
}

/**
 * Sort violations based on the selected sort order
 */
function sortViolations(violations: Violation[], sortOrder: 'default' | 'severity' | 'principle'): Violation[] {
  if (sortOrder === 'default') {
    // Keep original order (as they appear on the page)
    return violations;
  }

  const sorted = [...violations];

  if (sortOrder === 'severity') {
    // Sort by severity: Critical > Serious > Moderate > Minor
    const severityOrder: Record<Severity, number> = {
      [Severity.CRITICAL]: 0,
      [Severity.SERIOUS]: 1,
      [Severity.MODERATE]: 2,
      [Severity.MINOR]: 3,
    };
    
    sorted.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  } else if (sortOrder === 'principle') {
    // Sort by POUR principle: Perceivable > Operable > Understandable > Robust
    const principleOrder: Record<string, number> = {
      'perceivable': 0,
      'operable': 1,
      'understandable': 2,
      'robust': 3,
    };
    
    sorted.sort((a, b) => principleOrder[a.principle] - principleOrder[b.principle]);
  }

  return sorted;
}

/**
 * Update the results count display
 */
function updateResultsCount(shown: number, total: number) {
  resultsCount.classList.remove('hidden');
  
  if (shown === total) {
    countText.textContent = `Showing all ${total} violation${total !== 1 ? 's' : ''}`;
  } else {
    countText.textContent = `Showing ${shown} of ${total} violation${total !== 1 ? 's' : ''}`;
  }
  
  // Add a brief highlight animation
  resultsCount.classList.add('updated');
  setTimeout(() => {
    resultsCount.classList.remove('updated');
  }, 500);
}

/**
 * Create a violation card element
 */
function createViolationCard(violation: Violation, index: number): HTMLElement {
  const violationId = `${violation.element}-${violation.message}`;
  const isResolved = resolvedViolations.has(violationId);
  const isExpanded = expandedViolations.has(violationId);
  
  const card = document.createElement('div');
  card.className = `violation-card severity-${violation.severity}`;
  if (isResolved) {
    card.classList.add('resolved');
  }
  if (!isExpanded) {
    card.classList.add('collapsed');
  }
  
  const header = document.createElement('div');
  header.className = 'violation-header';
  
  const checkbox = document.createElement('div');
  checkbox.className = 'resolve-checkbox';
  if (isResolved) {
    checkbox.classList.add('checked');
    checkbox.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>';
  }
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation();
    if (resolvedViolations.has(violationId)) {
      resolvedViolations.delete(violationId);
      card.classList.remove('resolved');
    } else {
      resolvedViolations.add(violationId);
      card.classList.add('resolved');
    }
    checkbox.classList.toggle('checked');
    if (checkbox.classList.contains('checked')) {
      checkbox.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>';
    } else {
      checkbox.innerHTML = '';
    }
  });
  
  const title = document.createElement('h3');
  title.className = 'violation-title';
  title.innerHTML = `
    <span class="violation-number">${index + 1}</span>
    <span>${violation.message}</span>
  `;
  
  const toggleButton = document.createElement('div');
  toggleButton.className = 'toggle-button';
  toggleButton.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"/></svg>';
  if (isExpanded) {
    toggleButton.classList.add('expanded');
  }
  
  header.appendChild(checkbox);
  header.appendChild(title);
  header.appendChild(toggleButton);
  
  // Make entire header clickable for toggle
  header.style.cursor = 'pointer';
  header.addEventListener('click', (e) => {
    // Don't toggle if clicking the checkbox
    if ((e.target as HTMLElement).closest('.resolve-checkbox')) {
      return;
    }
    
    if (expandedViolations.has(violationId)) {
      expandedViolations.delete(violationId);
      card.classList.add('collapsed');
      toggleButton.classList.remove('expanded');
    } else {
      expandedViolations.add(violationId);
      card.classList.remove('collapsed');
      toggleButton.classList.add('expanded');
    }
  });
  
  const content = document.createElement('div');
  content.className = 'violation-content';
  
  const meta = document.createElement('div');
  meta.className = 'violation-meta';
  meta.innerHTML = `
    <span class="severity-tag severity-${violation.severity}">${violation.severity}</span>
    <span class="wcag-tag">${violation.principle.toUpperCase()}</span>
    <span class="wcag-tag">WCAG ${violation.wcagCriteria} (Level ${violation.level})</span>
  `;
  
  const description = document.createElement('p');
  description.className = 'violation-description';
  description.textContent = violation.description;
  
  const elementInfo = document.createElement('div');
  elementInfo.className = 'violation-element';
  elementInfo.innerHTML = `
    <strong>Element:</strong>
    <code>${escapeHtml(violation.htmlSnippet)}</code>
  `;
  
  card.appendChild(header);
  content.appendChild(meta);
  content.appendChild(description);
  content.appendChild(elementInfo);
  
  if (violation.suggestion) {
    const suggestion = document.createElement('div');
    suggestion.className = 'violation-suggestion';
    suggestion.innerHTML = `<strong>Suggestion:</strong> ${violation.suggestion}`;
    content.appendChild(suggestion);
  }
  
  // Footer with Search in code and Learn More links
  const footer = document.createElement('div');
  footer.className = 'violation-footer';
  
  const searchButton = document.createElement('button');
  searchButton.className = 'search-in-code';
  searchButton.textContent = 'Spotlight element';
  searchButton.title = 'Toggle spotlight: Highlight this element and gray out the rest of the page';
  searchButton.addEventListener('click', () => inspectElement(violation.element));
  footer.appendChild(searchButton);
  
  if (violation.learnMoreUrl) {
    const learnMore = document.createElement('a');
    learnMore.className = 'learn-more';
    learnMore.href = violation.learnMoreUrl;
    learnMore.target = '_blank';
    learnMore.textContent = 'Learn More →';
    footer.appendChild(learnMore);
  }
  
  content.appendChild(footer);
  card.appendChild(content);
  
  return card;
}

/**
 * Handle copy to clipboard button click
 */
async function handleCopy() {
  if (!currentScanResult) {
    return;
  }

  try {
    // Create export data
    const exportData = {
      timestamp: new Date().toISOString(),
      url: currentScanResult.url || 'unknown',
      summary: currentScanResult.summary,
      violations: currentScanResult.violations
    };

    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Copy to clipboard
    await navigator.clipboard.writeText(jsonString);
    
    // Show feedback
    const originalText = copyButton.textContent;
    copyButton.textContent = '✓ Copied!';
    copyButton.disabled = true;
    
    setTimeout(() => {
      copyButton.textContent = originalText;
      copyButton.disabled = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    copyButton.textContent = '✗ Failed';
    setTimeout(() => {
      copyButton.textContent = 'Copy to Clipboard';
    }, 2000);
  }
}

/**Handle export button click
 */
function handleExport() {
  if (!currentScanResult) {
    return;
  }

  // Create export data
  const exportData = {
    timestamp: new Date().toISOString(),
    url: currentScanResult.url || 'unknown',
    summary: currentScanResult.summary,
    violations: currentScanResult.violations
  };

  // Convert to JSON
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Create blob and download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  // Generate filename with timestamp
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  a.download = `accessibility-report-${date}-${time}.json`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 
 * Open DevTools and inspect the element
 */
async function inspectElement(elementSelector: string) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    // Send message to content script to inspect element
    await chrome.tabs.sendMessage(tab.id, {
      type: 'INSPECT_ELEMENT',
      selector: elementSelector
    });
  } catch (error) {
    console.error('Failed to inspect element:', error);
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Truncate URL intelligently while preserving the domain
 */
function truncateUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname + urlObj.search + urlObj.hash;
    
    const maxLength = 50;
    
    // If the full URL is short enough, return it
    if (url.length <= maxLength) {
      return url;
    }
    
    // Always include the protocol and domain
    const prefix = `${urlObj.protocol}//${domain}`;
    
    // Calculate remaining space for the path
    const remainingSpace = maxLength - prefix.length;
    
    if (remainingSpace <= 3) {
      // Not enough space for path, just show domain
      return prefix;
    }
    
    // Truncate the path if needed
    if (path.length > remainingSpace) {
      const truncatedPath = path.substring(0, remainingSpace - 3) + '...';
      return prefix + truncatedPath;
    }
    
    return prefix + path;
  } catch (e) {
    // If URL parsing fails, do simple truncation
    return url.length > 50 ? url.substring(0, 47) + '...' : url;
  }
}

/**
 * Format timestamp to readable date and time
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  return `${dateStr} at ${timeStr}`;
}

// Initialize when popup loads
init();
