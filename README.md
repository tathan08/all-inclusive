# All-Inclusive

A Chrome extension for automated WCAG accessibility auditing. Inspect any website and identify accessibility issues with detailed explanations and suggestions for improvement.

## Features

- **Automated WCAG Scanning**: Checks websites against WCAG 2.2 guidelines (Levels A, AA, AAA)
- **Real-time Analysis**: Scan any page with a single click
- **Categorized Results**: Issues organized by WCAG principles:
  - **Perceivable**: Images, color contrast, text alternatives
  - **Operable**: Keyboard navigation, links, skip links
  - **Understandable**: Clear language / Predictable
  - **Robust**: Valid HTML, ARIA usage, form labels
- **Severity Levels**: Critical, Serious, Moderate, and Minor issues
- **Actionable Suggestions**: Each violation includes fix suggestions and WCAG documentation links
- **Filtering**: Filter results by severity level

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
   git clone https://github.com/yourusername/all-inclusive.git
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

## Current Rules (MVP)

**For detailed documentation of all rules, see [WCAG_RULES.md](WCAG_RULES.md)**

### Perceivable
- Image alt text (WCAG 1.1.1)
- Color contrast (WCAG 1.4.3)

### Operable
- Keyboard accessibility (WCAG 2.1.1)
- Link purpose (WCAG 2.4.4)
- Skip navigation (WCAG 2.4.1)

### Understandable
- 

### Robust
- Valid HTML - duplicate IDs (WCAG 4.1.1)
- ARIA usage - buttons and form labels (WCAG 4.1.2)

## Roadmap

### Phase 1: MVP (Current)
- [x] Basic popup UI
- [x] Page scanning
- [x] Core WCAG rules
- [x] Results display

### Phase 2: Enhanced Detection
- [x] Advanced color contrast calculation with overlay detection
- [ ] Heading structure analysis
- [ ] Form validation
- [ ] Landmark regions
- [ ] Focus order
- [ ] Language attributes

### Phase 3: Visual Overlay
- [ ] Highlight violations on page with numbered tags
- [ ] Gray overlay mode with spotlight
- [ ] Click-to-highlight from popup

### Phase 4: AI-Powered Suggestions
- [ ] Automated fix generation
- [ ] Code snippets for fixes
- [ ] Before/after previews
- [ ] Batch fix suggestions

## Acknowledgments

- WCAG 2.2 Guidelines by W3C

## Additional Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [WCAG 2.2 Understanding Docs](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Complete Rules Documentation](WCAG_RULES.md) - Detailed guide to all validated rules