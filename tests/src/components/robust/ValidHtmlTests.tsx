import React from 'react';

interface ValidHtmlTestsProps {
  ruleNumber?: number;
}

const ValidHtmlTests: React.FC<ValidHtmlTestsProps> = ({ ruleNumber }) => {
  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Valid HTML Violations</h3>

      <div className="violation">
        <span className="violation-label">Duplicate IDs:</span>
        <div id="duplicate-id">First element with duplicate ID</div>
        <div id="duplicate-id">Second element with same ID</div>
        <button id="duplicate-id">Third element with same ID</button>
      </div>
    </div>
  );
};

export default ValidHtmlTests;
