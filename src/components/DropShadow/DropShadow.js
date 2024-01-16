import React from 'react';
import PropTypes from 'prop-types';
import './DropShadow.css';
import tinycolor from 'tinycolor2';


const easeInQuad = (x) => x * x;

function renderBoxShadows(state) {
  const boxShadows = [];

  const getX = (i) => {
    const startX = 0;
    const endX = state.horizontalDistance;
    return startX + easeInQuad((i + 1) / state.layerAmount) * (endX - startX);
  };

  const getY = (i) => {
    const startY = 0;
    const endY = state.verticalDistance;
    return startY + easeInQuad((i + 1) / state.layerAmount) * (endY - startY);
  };

  const getBlur = (i) => {
    const startBlur = 0;
    const endBlur = state.blur;
    return startBlur + easeInQuad((i + 1) / state.layerAmount) * (endBlur - startBlur);
  };

  let getAlpha = (i) => state.opacity;
  if (state.shadowStyle === "sharp") {
    getAlpha = (i) => {
      const increment = state.opacity / state.layerAmount;
      return state.opacity - i * increment;
    };
  } else if (state.shadowStyle === "soft") {
    getAlpha = (i) => {
      const increment = state.opacity / state.layerAmount;
      return (i + 1) * increment;
    };
  }

  for (let i = 0; i < state.layerAmount; i++) {
    const x = getX(i).toFixed(0);
    const y = getY(i).toFixed(0);
    const blur = getBlur(i).toFixed(0);
    const hsl = state.shadowHsl;
    const alpha = getAlpha(i).toFixed(2);
  
    boxShadows.push({ x, y, blur, hsl, alpha }); // Add HSL to the object
  }

  return boxShadows;
}

function renderCssShadows(state) {
  const boxShadows = renderBoxShadows(state);
  return boxShadows.map(({ x, y, blur, hsl, alpha }) => 
    `${x}px ${y}px ${blur}px hsla(${hsl.h}, ${hsl.s * 100}%, ${hsl.l * 100}%, ${alpha})`
  ).join(", ");
}

function lowerLuminance(color, percent) {
  const hsl = color.toHsl();
  hsl.l -= hsl.l * (percent / 100);
  hsl.l = Math.max(0, hsl.l); // Ensure luminance is not less than 0
  return tinycolor(hsl);
}

function DropShadow({ color, elevation, shadowStyle, layerAmount, opacity, blur, horizontalDistance }) {
  let parsedColor = tinycolor(color);
  if (!parsedColor.isValid()) {
    parsedColor.set('black');
  }
  parsedColor = lowerLuminance(parsedColor, 20);
  const hsl = parsedColor.toHsl();
  const state = {
    shadowStyle: shadowStyle || "soft",
    layerAmount: layerAmount || 5,
    opacity: opacity || 0.2,
    blur: blur || elevation,
    verticalDistance: elevation,
    horizontalDistance: horizontalDistance || 0,
    shadowHsl: hsl,
  };

  const shadowStyleProps = {
    boxShadow: renderCssShadows(state)
  };
  // console.log("🚀 ~ DropShadow ~ shadowStyleProps:", shadowStyleProps)

  return <div className="drop-shadow" style={shadowStyleProps}></div>;
}

DropShadow.propTypes = {
  color: PropTypes.string.isRequired,
  elevation: PropTypes.number.isRequired,
  shadowStyle: PropTypes.string,
  layerAmount: PropTypes.number,
  opacity: PropTypes.number,
  blur: PropTypes.number,
  horizontalDistance: PropTypes.number
};

export default DropShadow;