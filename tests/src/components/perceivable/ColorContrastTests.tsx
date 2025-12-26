import React from 'react';

interface ColorContrastTestsProps {
  ruleNumber?: number;
}

const ColorContrastTests: React.FC<ColorContrastTestsProps> = ({ ruleNumber }) => {
  const styles = {
    lowContrast: {
      backgroundColor: '#fff',
      color: '#ddd',
      padding: '10px',
    },
    overlayParent: {
      position: 'relative' as const,
      padding: '20px',
      backgroundColor: '#fff',
    },
    overlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 1,
    },
    overlayText: {
      position: 'relative' as const,
      zIndex: 2,
      color: '#888',
    },
  };

  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Color Contrast Violations</h3>

      <div className="violation">
        <span className="violation-label">Low contrast text (white on light gray):</span>
        <p style={styles.lowContrast}>
          This text has insufficient contrast ratio and will be hard to read.
        </p>
      </div>

      <div className="violation">
        <span className="violation-label">Text with overlay creating low contrast:</span>
        <div style={styles.overlayParent}>
          <div style={styles.overlay}></div>
          <p style={styles.overlayText}>
            This text appears over a semi-transparent overlay, creating a contrast issue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorContrastTests;
