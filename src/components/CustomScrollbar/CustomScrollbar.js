import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

const CustomScrollbar = ({ children, onScrollFrame }) => {
  // Function to get the value of a CSS variable
  const getCSSVariableValue = (variable) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  };

  // Get the scrollbar thumb color from the CSS variable
  const scrollbarThumbColor = getCSSVariableValue('--scrollbar-thumb-rest');

  return (
    <Scrollbars
      autoHide
      autoHideTimeout={1000}
      autoHideDuration={200}
      onScrollFrame={onScrollFrame} // Pass onScrollFrame prop to Scrollbars
      renderThumbVertical={({ style, ...props }) => (
        <div
          {...props}
          style={{
            ...style,
            backgroundColor: scrollbarThumbColor || '#888', // Fallback color if CSS variable is not set
            borderRadius: '12px',
          }}
        />
      )}
    >
      {children}
    </Scrollbars>
  );
};

export default CustomScrollbar;
