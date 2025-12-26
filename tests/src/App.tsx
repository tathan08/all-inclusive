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
  const filter = process.env.FILTER || 'all';
  let ruleNumber = 1;

  const showPerceivable = filter === 'all' || filter === 'perceivable';
  const showOperable = filter === 'all' || filter === 'operable';
  const showUnderstandable = filter === 'all' || filter === 'understandable';
  const showRobust = filter === 'all' || filter === 'robust';

  // Define component groups
  const principles = {
    perceivable: {
      name: 'Perceivable',
      components: [ImageAltTextTests, ColorContrastTests, HeadingStructureTests],
      descriptions: ['Image alt text', 'Color contrast', 'Heading structure'],
    },
    operable: {
      name: 'Operable',
      components: [KeyboardAccessibleTests, LinkPurposeTests, BypassBlocksTests, FocusOrderTests],
      descriptions: ['Keyboard accessible', 'Link purpose', 'Bypass blocks', 'Focus order'],
    },
    understandable: {
      name: 'Understandable',
      components: [FormLabelsTests, FieldsetLegendTests, RequiredFieldsTests],
      descriptions: ['Form labels', 'Fieldset/legend', 'Required fields'],
    },
    robust: {
      name: 'Robust',
      components: [ValidHtmlTests, AriaUsageTests],
      descriptions: ['Valid HTML', 'ARIA usage'],
    },
  };

  const filterLabel = filter === 'all' ? 'All POUR Principles' : filter.charAt(0).toUpperCase() + filter.slice(1);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Accessibility Test Page</h1>
        <p>This page contains intentional accessibility violations to test the All-Inclusive WCAG checker extension.</p>
        {filter !== 'all' && (
          <p style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', color: '#1976d2' }}>
            <strong>Filter Active:</strong> Showing {filterLabel} tests only
          </p>
        )}
      </header>

      <main>
        {/* PERCEIVABLE TESTS */}
        {showPerceivable && (
          <section className="principle-section">
            <h2 className="principle-title">{principles.perceivable.name}</h2>
            {principles.perceivable.components.map((Component, index) => (
              <Component key={index} ruleNumber={ruleNumber++} />
            ))}
          </section>
        )}

        {/* OPERABLE TESTS */}
        {showOperable && (
          <section className="principle-section">
            <h2 className="principle-title">{principles.operable.name}</h2>
            {principles.operable.components.map((Component, index) => (
              <Component key={index} ruleNumber={ruleNumber++} />
            ))}
          </section>
        )}

        {/* UNDERSTANDABLE TESTS */}
        {showUnderstandable && (
          <section className="principle-section">
            <h2 className="principle-title">{principles.understandable.name}</h2>
            {principles.understandable.components.map((Component, index) => (
              <Component key={index} ruleNumber={ruleNumber++} />
            ))}
          </section>
        )}

        {/* ROBUST TESTS */}
        {showRobust && (
          <section className="principle-section">
            <h2 className="principle-title">{principles.robust.name}</h2>
            {principles.robust.components.map((Component, index) => (
              <Component key={index} ruleNumber={ruleNumber++} />
            ))}
          </section>
        )}

        {/* SUMMARY */}
        <section className="test-section summary">
          <h2>Test Summary</h2>
          <p><strong>Total Rules Tested: {ruleNumber - 1}</strong></p>
          <ul>
            {showPerceivable && (
              <li>
                <strong>{principles.perceivable.name} ({principles.perceivable.components.length}):</strong>{' '}
                {principles.perceivable.descriptions.join(', ')}
              </li>
            )}
            {showOperable && (
              <li>
                <strong>{principles.operable.name} ({principles.operable.components.length}):</strong>{' '}
                {principles.operable.descriptions.join(', ')}
              </li>
            )}
            {showUnderstandable && (
              <li>
                <strong>{principles.understandable.name} ({principles.understandable.components.length}):</strong>{' '}
                {principles.understandable.descriptions.join(', ')}
              </li>
            )}
            {showRobust && (
              <li>
                <strong>{principles.robust.name} ({principles.robust.components.length}):</strong>{' '}
                {principles.robust.descriptions.join(', ')}
              </li>
            )}
          </ul>
          <div className="instructions">
            <h3>Instructions:</h3>
            <ol>
              <li>Load the All-Inclusive extension in Chrome</li>
              <li>Open this test page</li>
              <li>Click the extension icon to run accessibility checks</li>
              <li>Verify that violations are detected for {filter === 'all' ? 'all 12' : 'the'} rule categories{filter !== 'all' ? ` (${filterLabel})` : ''}</li>
              <li>Test the spotlight feature by clicking on individual violations</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
