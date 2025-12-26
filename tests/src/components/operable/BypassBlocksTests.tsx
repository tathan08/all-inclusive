import React from 'react';

interface BypassBlocksTestsProps {
  ruleNumber?: number;
}

const BypassBlocksTests: React.FC<BypassBlocksTestsProps> = ({ ruleNumber }) => {
  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Bypass Blocks Violation</h3>

      <div className="violation">
        <span className="violation-label">No skip navigation link:</span>
        <p>This page has no "Skip to main content" link at the beginning.</p>
        <p>Note: Check page top - there should be a skip link but there isn't one.</p>
      </div>
    </div>
  );
};

export default BypassBlocksTests;
