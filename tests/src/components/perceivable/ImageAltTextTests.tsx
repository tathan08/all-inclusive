import React from 'react';

interface ImageAltTextTestsProps {
  ruleNumber?: number;
}

const ImageAltTextTests: React.FC<ImageAltTextTestsProps> = ({ ruleNumber }) => {
  return (
    <div className="test-section">
      <h3>{ruleNumber ? `${ruleNumber}. ` : ''}Image Alt Text Violations</h3>

      <div className="violation">
        <span className="violation-label">Missing alt attribute:</span>
        <img 
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Crect fill='%23ff6b6b' width='200' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white'%3ENo Alt%3C/text%3E%3C/svg%3E"
          width="200"
          height="100"
        />
      </div>

      <div className="violation">
        <span className="violation-label">Empty alt attribute on meaningful image:</span>
        <img 
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Crect fill='%234ecdc4' width='200' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white'%3EImportant Chart%3C/text%3E%3C/svg%3E"
          alt=""
          width="200"
          height="100"
        />
      </div>

      <div className="violation">
        <span className="violation-label">Filename as alt text:</span>
        <img 
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Crect fill='%23f9ca24' width='200' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3EProduct%3C/text%3E%3C/svg%3E"
          alt="product_image_final_v2.jpg"
          width="200"
          height="100"
        />
      </div>
    </div>
  );
};

export default ImageAltTextTests;
