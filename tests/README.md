# All-Inclusive Extension Tests

This directory contains test pages for validating the All-Inclusive WCAG accessibility checker extension.

## Structure

```
tests/
├── src/
│   ├── components/
│   │   ├── perceivable/     # Tests for Perceivable principle
│   │   ├── operable/        # Tests for Operable principle
│   │   ├── understandable/  # Tests for Understandable principle
│   │   └── robust/          # Tests for Robust principle
│   ├── App.tsx              # Main test page
│   ├── App.css              # Styles
│   ├── index.tsx            # React entry point
│   └── index.html           # HTML template
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## Setup

1. Install dependencies:
```bash
cd tests
npm install
```

## Usage

### Development Server
Run the test page with hot reload:
```bash
npm run dev          # All principles (31 violations expected)
npm run dev:p        # Perceivable only (8 violations)
npm run dev:o        # Operable only (11 violations)
npm run dev:u        # Understandable only (9 violations)
npm run dev:r        # Robust only (5 violations)
```
This will open the test page at `http://localhost:3000`

### Production Build
Build the test page for production:
```bash
npm run build
```
The output will be in the `dist/` directory.

## Expected Violations Summary

When running with all principles (`npm run dev`), expect **31 total violations**:

| Principle | Count | Breakdown |
|-----------|-------|----------|
| **Perceivable** | 8 | 1 Critical (missing alt)<br>2 Serious (empty alt, low contrast, empty heading)<br>5 Moderate (filename alt, overlay contrast, skipped heading, multiple H1s) |
| **Operable** | 11 | 2 Serious (div/span not keyboard accessible)<br>3 Moderate (vague links)<br>3 Serious (positive tabindex)<br>1 Moderate (hidden focusable)<br>2 Minor (negative tabindex on native) |
| **Understandable** | 9 | 3 Critical (unlabeled inputs)<br>2 Moderate (aria-label only)<br>1 Serious (radio fieldset)<br>1 Moderate (checkbox fieldset)<br>2 Serious (required fields) |
| **Robust** | 5 | 1 Serious (duplicate IDs)<br>2 Critical (buttons without names)<br>2 Moderate (inputs with aria-label but no visible label) |

**Severity Totals:** 6 Critical, 12 Serious, 11 Moderate, 2 Minor

## Test Components

Each WCAG rule has its own React component in the appropriate principle directory. All components accept a `ruleNumber` prop for dynamic numbering:

### Perceivable (3 components)
- `ImageAltTextTests.tsx` - Tests for WCAG 1.1.1
- `ColorContrastTests.tsx` - Tests for WCAG 1.4.3
- `HeadingStructureTests.tsx` - Tests for WCAG 1.3.1

### Operable (4 components)
- `KeyboardAccessibleTests.tsx` - Tests for WCAG 2.1.1
- `LinkPurposeTests.tsx` - Tests for WCAG 2.4.4
- `BypassBlocksTests.tsx` - Tests for WCAG 2.4.1
- `FocusOrderTests.tsx` - Tests for WCAG 2.4.3

### Understandable (3 components)
- `FormLabelsTests.tsx` - Tests for WCAG 3.3.2
- `FieldsetLegendTests.tsx` - Tests for WCAG 1.3.1
- `RequiredFieldsTests.tsx` - Tests for WCAG 3.3.2

### Robust (2 components)
- `ValidHtmlTests.tsx` - Tests for WCAG 4.1.1
- `AriaUsageTests.tsx` - Tests for WCAG 4.1.2

## Adding New Test Cases

To add a new test case for an existing rule:

1. Navigate to the appropriate component file
2. Add a new violation inside the component's return statement
3. Wrap it in a `<div className="violation">` with a descriptive label

Example:
```tsx
<div className="violation">
  <span className="violation-label">Description of violation:</span>
  {/* Your test case here */}
</div>
```

## Adding New Rules

To add a new rule test:

1. Create a new component in the appropriate principle directory
2. Import and add it to `App.tsx`
3. Follow the existing component patterns

## Testing with Extension

1. Load the All-Inclusive extension in Chrome (Developer mode)
2. Run `npm run dev` to start the test server
3. Open `http://localhost:3000`
4. Click the extension icon to scan for violations
5. Verify all expected violations are detected
6. Test the spotlight feature on individual violations

## Playwright Testing

This test suite is structured to support automated Playwright tests:
- Each component can be tested individually
- Consistent HTML structure for easy selector targeting
- Clear violation labels for assertion matching
