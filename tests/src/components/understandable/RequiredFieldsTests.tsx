import React from 'react';

interface RequiredFieldsTestsProps {
  ruleNumber?: number;
}

const RequiredFieldsTests: React.FC<RequiredFieldsTestsProps> = ({ ruleNumber }) => {
  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Required Field Violations</h3>

      <div className="violation">
        <span className="violation-label">Visual indicator without required attribute:</span>
        <div className="form-group">
          <label htmlFor="email-req">Email Address *</label>
          <input type="email" id="email-req" placeholder="your@email.com" />
        </div>
      </div>

      <div className="violation">
        <span className="violation-label">"Required" text without required attribute:</span>
        <div className="form-group">
          <label htmlFor="phone-req">Phone Number (required)</label>
          <input type="tel" id="phone-req" />
        </div>
      </div>
    </div>
  );
};

export default RequiredFieldsTests;
