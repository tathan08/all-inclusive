import React from 'react';

interface FormLabelsTestsProps {
  ruleNumber?: number;
}

const FormLabelsTests: React.FC<FormLabelsTestsProps> = ({ ruleNumber }) => {
  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Form Label Violations</h3>

      <div className="violation">
        <span className="violation-label">Input without label:</span>
        <div className="form-group">
          <input type="text" placeholder="Name" id="name-input" />
        </div>
      </div>

      <div className="violation">
        <span className="violation-label">Textarea without label:</span>
        <div className="form-group">
          <textarea placeholder="Comments"></textarea>
        </div>
      </div>

      <div className="violation">
        <span className="violation-label">Select without label:</span>
        <div className="form-group">
          <select>
            <option>Choose an option</option>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FormLabelsTests;
