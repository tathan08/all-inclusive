import React from 'react';

interface HeadingStructureTestsProps {
  ruleNumber?: number;
}

const HeadingStructureTests: React.FC<HeadingStructureTestsProps> = ({ ruleNumber }) => {
  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Heading Structure Violations</h3>

      <div className="violation">
        <span className="violation-label">Skipped heading level (H3 to H5):</span>
        <h3>Section Title</h3>
        <h5>Subsection - Skipped H4</h5>
        <p>Content here...</p>
      </div>

      <div className="violation">
        <span className="violation-label">Empty heading:</span>
        <h4></h4>
      </div>

      <div className="violation">
        <span className="violation-label">Multiple H1 elements:</span>
        <h1>Second H1 on Page</h1>
      </div>
    </div>
  );
};

export default HeadingStructureTests;
