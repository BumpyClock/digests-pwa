import React from 'react';
import './DropShadow.css';

// Extract the RGB values outside of the component
const extractRGB = (color) => color.slice(5, -1).split(',').slice(0, 3).join(',');

// Function to calculate the opacity
const calculateOpacity = (index, total) => (0.2 * (1 - (index - 1) / (total - 1))).toFixed(2);

function DropShadow({ color, elevation }) {
  const rgb = extractRGB(color);

 const lowElevation = [
  `4.8px 1.3px 10px rgba(${rgb}, ${calculateOpacity(1, 2)})`,
  `38px 10px 80px rgba(${rgb}, ${calculateOpacity(2, 2)})`
];

  const mediumElevation = [
    `0px 1px 3px rgba(${rgb}, ${calculateOpacity(1, 4)})`,
    `0px 6px 12px rgba(${rgb}, ${calculateOpacity(2, 4)})`,
    `0px 0px 5.2px -1.7px rgba(${rgb}, ${calculateOpacity(3, 4)})`,
    `0px 0px 12.6px -2.5px rgba(${rgb}, ${calculateOpacity(4, 4)})`
  ];

  const highElevation = [
    `0px 0px 1px rgba(${rgb}, ${calculateOpacity(1, 8)})`,
    `0px 0px 3.7px -0.4px rgba(${rgb}, ${calculateOpacity(2, 8)})`,
    `0px 0px 6.8px -0.7px rgba(${rgb}, ${calculateOpacity(3, 8)})`,
    `0px 0px 11.2px -1.1px rgba(${rgb}, ${calculateOpacity(4, 8)})`,
    `0px 0px 18px -1.4px rgba(${rgb}, ${calculateOpacity(5, 8)})`,
    `0px 0px 28.1px -1.8px rgba(${rgb}, ${calculateOpacity(6, 8)})`,
    `0px 0px 42.7px -2.1px rgba(${rgb}, ${calculateOpacity(7, 8)})`,
    `0px 0px 62.9px -2.5px rgba(${rgb}, ${calculateOpacity(8, 8)})`
  ];

  const shadows = elevation === 'low' ? lowElevation : elevation === 'medium' ? mediumElevation : highElevation;

  const shadowStyle = {
    boxShadow: shadows.join(', ')
  };

  return <div className="drop-shadow" style={shadowStyle}></div>;
}

export default DropShadow;