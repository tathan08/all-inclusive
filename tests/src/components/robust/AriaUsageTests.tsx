import React from 'react';

interface AriaUsageTestsProps {
  ruleNumber?: number;
}

const AriaUsageTests: React.FC<AriaUsageTestsProps> = ({ ruleNumber }) => {
  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}ARIA Usage Violations</h3>

      <div className="violation">
        <span className="violation-label">Button without accessible name:</span>
        <button></button>
        {' '}
        <button>
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="violation">
        <span className="violation-label">Input with aria-label but no visible label:</span>
        <div className="form-group">
          <input type="text" aria-label="Username" id="username-aria" />
          <input type="password" aria-label="Password" id="password-aria" />
        </div>
      </div>
    </div>
  );
};

export default AriaUsageTests;
