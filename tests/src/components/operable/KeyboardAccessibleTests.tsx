import React from 'react';

interface KeyboardAccessibleTestsProps {
  ruleNumber?: number;
}

const KeyboardAccessibleTests: React.FC<KeyboardAccessibleTestsProps> = ({ ruleNumber }) => {
  const handleClick = () => {
    alert('Clicked!');
  };

  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Keyboard Accessibility Violations</h3>

      <div className="violation">
        <span className="violation-label">Div with onclick but no keyboard handler:</span>
        <div 
          onClick={handleClick}
          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
        >
          Click me (not keyboard accessible)
        </div>
      </div>

      <div className="violation">
        <span className="violation-label">Span with onclick but no keyboard handler:</span>
        <span 
          onClick={handleClick}
          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
        >
          Click this too (not keyboard accessible)
        </span>
      </div>
    </div>
  );
};

export default KeyboardAccessibleTests;
