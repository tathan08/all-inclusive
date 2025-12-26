import React from 'react';

interface FocusOrderTestsProps {
  ruleNumber?: number;
}

const FocusOrderTests: React.FC<FocusOrderTestsProps> = ({ ruleNumber }) => {
  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Focus Order Violations</h3>

      <div className="violation">
        <span className="violation-label">Positive tabindex values:</span>
        <div>
          <label htmlFor="focus-field1">Field 1:</label>
          <input id="focus-field1" type="text" placeholder="Field 1 (tabindex=3)" tabIndex={3} />
          <label htmlFor="focus-field2">Field 2:</label>
          <input id="focus-field2" type="text" placeholder="Field 2 (tabindex=1)" tabIndex={1} />
          <label htmlFor="focus-field3">Field 3:</label>
          <input id="focus-field3" type="text" placeholder="Field 3 (tabindex=2)" tabIndex={2} />
        </div>
      </div>

      <div className="violation">
        <span className="violation-label">Hidden but focusable element:</span>
        <button style={{ display: 'none' }} tabIndex={0}>
          Hidden Button
        </button>
      </div>

      <div className="violation">
        <span className="violation-label">Native interactive with negative tabindex:</span>
        <div>
          <a href="#" tabIndex={-1}>Link removed from tab order</a>
          {' '}
          <button tabIndex={-1}>Button removed from tab order</button>
        </div>
      </div>
    </div>
  );
};

export default FocusOrderTests;
