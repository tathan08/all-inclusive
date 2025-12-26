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
npm run dev
```
This will open the test page at `http://localhost:3000`

### Production Build
Build the test page for production:
```bash
npm run build
```
The output will be in the `dist/` directory.

## Test Components

Each WCAG rule has its own React component in the appropriate principle directory:

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
