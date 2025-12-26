import React from 'react';

interface FieldsetLegendTestsProps {
  ruleNumber?: number;
}

const FieldsetLegendTests: React.FC<FieldsetLegendTestsProps> = ({ ruleNumber }) => {
  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Fieldset/Legend Violations</h3>

      <div className="violation">
        <span className="violation-label">Radio buttons without fieldset/legend:</span>
        <div className="form-group">
          <label>
            <input type="radio" name="gender" /> Male
          </label>
          <label>
            <input type="radio" name="gender" /> Female
          </label>
          <label>
            <input type="radio" name="gender" /> Other
          </label>
        </div>
      </div>

      <div className="violation">
        <span className="violation-label">Checkboxes without fieldset/legend (3+ checkboxes):</span>
        <div className="form-group">
          <label>
            <input type="checkbox" name="interests" /> Sports
          </label>
          <label>
            <input type="checkbox" name="interests" /> Music
          </label>
          <label>
            <input type="checkbox" name="interests" /> Reading
          </label>
          <label>
            <input type="checkbox" name="interests" /> Gaming
          </label>
        </div>
      </div>
    </div>
  );
};

export default FieldsetLegendTests;
