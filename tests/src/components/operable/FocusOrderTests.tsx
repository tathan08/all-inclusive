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
          <input type="text" placeholder="Field 1 (tabindex=3)" tabIndex={3} />
          <input type="text" placeholder="Field 2 (tabindex=1)" tabIndex={1} />
          <input type="text" placeholder="Field 3 (tabindex=2)" tabIndex={2} />
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
