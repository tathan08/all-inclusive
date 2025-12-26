import React from 'react';
import './App.css';

// Perceivable components
import ImageAltTextTests from './components/perceivable/ImageAltTextTests';
import ColorContrastTests from './components/perceivable/ColorContrastTests';
import HeadingStructureTests from './components/perceivable/HeadingStructureTests';

// Operable components
import KeyboardAccessibleTests from './components/operable/KeyboardAccessibleTests';
import LinkPurposeTests from './components/operable/LinkPurposeTests';
import BypassBlocksTests from './components/operable/BypassBlocksTests';
import FocusOrderTests from './components/operable/FocusOrderTests';

// Understandable components
import FormLabelsTests from './components/understandable/FormLabelsTests';
import FieldsetLegendTests from './components/understandable/FieldsetLegendTests';
import RequiredFieldsTests from './components/understandable/RequiredFieldsTests';

// Robust components
import ValidHtmlTests from './components/robust/ValidHtmlTests';
import AriaUsageTests from './components/robust/AriaUsageTests';

const App: React.FC = () => {
  let ruleNumber = 1;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Accessibility Test Page</h1>
        <p>This page contains intentional accessibility violations to test the All-Inclusive WCAG checker extension.</p>
      </header>

      <main>
        {/* PERCEIVABLE TESTS */}
        <section className="principle-section">
          <h2 className="principle-title">Perceivable</h2>
          <ImageAltTextTests ruleNumber={ruleNumber++} />
          <ColorContrastTests ruleNumber={ruleNumber++} />
          <HeadingStructureTests ruleNumber={ruleNumber++} />
        </section>

        {/* OPERABLE TESTS */}
        <section className="principle-section">
          <h2 className="principle-title">Operable</h2>
          <KeyboardAccessibleTests ruleNumber={ruleNumber++} />
          <LinkPurposeTests ruleNumber={ruleNumber++} />
          <BypassBlocksTests ruleNumber={ruleNumber++} />
          <FocusOrderTests ruleNumber={ruleNumber++} />
        </section>

        {/* UNDERSTANDABLE TESTS */}
        <section className="principle-section">
          <h2 className="principle-title">Understandable</h2>
          <FormLabelsTests ruleNumber={ruleNumber++} />
          <FieldsetLegendTests ruleNumber={ruleNumber++} />
          <RequiredFieldsTests ruleNumber={ruleNumber++} />
        </section>

        {/* ROBUST TESTS */}
        <section className="principle-section">
          <h2 className="principle-title">Robust</h2>
          <ValidHtmlTests ruleNumber={ruleNumber++} />
          <AriaUsageTests ruleNumber={ruleNumber++} />
        </section>

        {/* SUMMARY */}
        <section className="test-section summary">
          <h2>Test Summary</h2>
          <p><strong>Total Rules Tested: 12</strong></p>
          <ul>
            <li><strong>Perceivable (3):</strong> Image alt text, Color contrast, Heading structure</li>
            <li><strong>Operable (4):</strong> Keyboard accessible, Link purpose, Bypass blocks, Focus order</li>
            <li><strong>Understandable (3):</strong> Form labels, Fieldset/legend, Required fields</li>
            <li><strong>Robust (2):</strong> Valid HTML, ARIA usage</li>
          </ul>
          <div className="instructions">
            <h3>Instructions:</h3>
            <ol>
              <li>Load the All-Inclusive extension in Chrome</li>
              <li>Open this test page</li>
              <li>Click the extension icon to run accessibility checks</li>
              <li>Verify that violations are detected for all 12 rule categories</li>
              <li>Test the spotlight feature by clicking on individual violations</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
