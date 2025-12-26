import React from 'react';

interface LinkPurposeTestsProps {
  ruleNumber?: number;
}

const LinkPurposeTests: React.FC<LinkPurposeTestsProps> = ({ ruleNumber }) => {
  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Link Purpose Violations</h3>

      <div className="violation">
        <span className="violation-label">Generic link text:</span>
        <p>For more information, <a href="#">click here</a>.</p>
        <p>To continue, <a href="#">read more</a>.</p>
        <p>Check out our services <a href="#">here</a>.</p>
        <p><a href="#">Learn more</a> about our products.</p>
      </div>
    </div>
  );
};

export default LinkPurposeTests;
