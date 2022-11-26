/* eslint-disable react/prop-types */
import React from 'react';
import RadialSlider from '../Util/RadialSlider';

function EchoDelay({
  setEchoTime, setEchoFeedback, echoTime, echoFeedback,
}) {
  return (
    <div className="settings-el echo-container">
      <p className="module-name">Echo</p>
      <div className="knobs-container">
        <div className="VCF">
          <p>E</p>
          <RadialSlider
            min={0}
            max={1}
            step={0.01}
            value={echoTime}
            updater={setEchoTime}
            label={echoTime}
          />
        </div>
        <div className="VCF">
          <p>F</p>
          <RadialSlider
            min={0}
            max={1}
            step={0.01}
            value={echoFeedback}
            updater={setEchoFeedback}
            label={echoFeedback}
          />
        </div>
      </div>
    </div>
  );
}

export default EchoDelay;
