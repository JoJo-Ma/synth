/* eslint-disable react/prop-types */
import React from 'react';
import RadialSlider from '../Util/RadialSlider';

function UnisonWidthSelector({ updater, unisonWidth }) {
  return (
    <div className="settings-el">
      <p className="module-name">Width</p>
      <div className="knobs-container">
        <div className="VCF">
          <p style={{ color: 'transparent' }}>d</p>
          <RadialSlider min={0} max={20} value={unisonWidth} updater={updater} roundDecimal={0} />
        </div>
      </div>

    </div>
  );
}

export default UnisonWidthSelector;
