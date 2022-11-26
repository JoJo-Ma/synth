/* eslint-disable react/prop-types */
import React from 'react';
import RadialSlider from '../Util/RadialSlider';

function WaveformSelector({ waveforms, value, updater }) {
  return (
    <div className="waveform-selector settings-el">
      <p className="module-name">OSC</p>
      <div className="knobs-container">
        <div className="VCF">
          <p style={{ color: 'transparent' }}>s</p>
          <RadialSlider
            min={0}
            max={waveforms.length - 1}
            value={value}
            updater={updater}
            roundDecimal={0}
            label={waveforms[value]}
          />
        </div>
      </div>
    </div>
  );
}

export default WaveformSelector;
