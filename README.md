# All-Inclusive

A Chrome extension for automated WCAG accessibility auditing. Inspect any website and identify accessibility issues with detailed explanations and suggestions for improvement.

## Features

- **Automated WCAG Scanning**: Checks websites against WCAG 2.2 guidelines (Levels A, AA, AAA)
- **Real-time Analysis**: Scan any page with a single click
- **Categorized Results**: Issues organized by WCAG principles:
  - **Perceivable**: Images, color contrast, text alternatives, heading structure
  - **Operable**: Keyboard navigation, links, skip links, focus order
  - **Understandable**: Form labels, fieldsets, required fields
  - **Robust**: Valid HTML, ARIA usage, accessible names
- **Severity Levels**: Critical, Serious, Moderate, and Minor issues
- **Actionable Suggestions**: Each violation includes fix suggestions and WCAG documentation links
- **Filtering**: Filter results by severity level
- **Advanced Detection**:
  - Enhanced image alt text validation (empty alt, filename detection, generic text)
  - Color contrast with overlay detection
  - React component support (onClick handlers detected)
  - Empty and aria-hidden content detection
  - Visible label validation (aria-label-only inputs flagged)

## Project Structure

```
all-inclusive/
├── src/
│   ├── types/              # TypeScript type definitions
│   ├── rules/              # WCAG rule implementations
│   │   ├── perceivable/    
│   │   ├── operable/       
│   │   ├── understandable/ 
│   │   └── robust/         
│   ├── popup/              # Extension popup UI
│   │   ├── popup.html      # Popup HTML structure
│   │   ├── index.ts        # Popup logic
│   │   └── styles.css      # Popup styles
│   ├── content/            # Content script (runs on pages)
│   │   ├── index.ts        # Page scanner
│   │   └── styles.css      # Overlay styles (future)
│   ├── background/         # Background service worker
│   │   └── index.ts        # Extension lifecycle
│   └── utils/              # Utility functions
├── public/                 # Static assets
│   └── icons/              # Extension icons
├── manifest.json           # Chrome extension manifest
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
└── webpack.config.js       # Build configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Chrome browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tathan08/all-inclusive.git
   cd all-inclusive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from your project

### Development

```bash
# Watch mode for development
npm run dev

# Type checking
npm run typecheck

# Run tests
npm test
```

## How to Use

1. **Navigate** to any website you want to test
2. **Click** the All-Inclusive extension icon in your Chrome toolbar
3. **Press** the "Scan This Page" button
4. **Review** the accessibility issues found
5. **Filter** by severity if needed
6. **Read** suggestions and fix the issues

## Current Rules

**For detailed documentation of all rules, see [WCAG_RULES.md](WCAG_RULES.md)**

### Perceivable
- **Image alt text** (WCAG 1.1.1)
  - Missing alt attributes
  - Empty alt on meaningful images
  - Filename-like alt text detection
  - Generic alt text detection ("image", "photo", etc.)
- **Heading structure** (WCAG 1.3.1)
  - Empty headings detection
  - Skipped heading levels
  - Multiple H1 warnings
  - Missing H1 detection
- **Color contrast** (WCAG 1.4.3)
  - Overlay detection for accurate contrast calculation
  - Support for transparent/semi-transparent backgrounds
  - Large text detection (18pt+)

### Operable
- **Keyboard accessibility** (WCAG 2.1.1)
  - Detects non-keyboard-accessible divs/spans
  - React onClick handler detection (cursor: pointer)
  - Missing tabindex or keyboard event handlers
- **Link purpose** (WCAG 2.4.4)
  - Vague link text detection ("click here", "read more", "here")
  - Empty link detection
- **Skip navigation** (WCAG 2.4.1)
  - Smart detection (only checks pages with actual navigation)
  - Requires nav element with 3+ links or header with navigation
- **Focus order** (WCAG 2.4.3)
  - Positive tabindex detection
  - Hidden but focusable elements
  - Native interactive elements removed from tab order

### Understandable
- **Form labels** (WCAG 3.3.2)
  - Missing label detection
  - aria-label-only inputs flagged (moderate severity)
  - Visible label requirement for inclusivity
- **Fieldset and legend** (WCAG 1.3.1)
  - Radio button groups (serious)
  - Checkbox groups with 3+ items (moderate)
- **Required fields** (WCAG 3.3.2)
  - Visual-only indicators detected
  - Missing required/aria-required attributes

### Robust
- **Valid HTML** (WCAG 4.1.1)
  - Duplicate ID detection with usage count
- **ARIA usage** (WCAG 4.1.2)
  - Buttons without accessible names
  - aria-hidden content handling
  - Visible text detection (excludes aria-hidden elements)

## Acknowledgments

- WCAG 2.2 Guidelines by W3C

## Additional Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WCAG 2.2 Understanding Docs](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Complete Rules Documentation](WCAG_RULES.md) - Detailed guide to all validated rules