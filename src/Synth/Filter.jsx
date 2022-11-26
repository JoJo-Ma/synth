/* eslint-disable react/prop-types */
import React from 'react';
import RadialSlider from '../Util/RadialSlider';

function Filter({
  setFilterFrequency, setFilterQ, filterFrequency, filterQ, labelFilterFrequency,
}) {
  return (
    <div className="settings-el filter-container">
      <p className="module-name">VCF</p>
      <div className="knobs-container">
        <div className="VCF">
          <p>CUTOFF</p>
          <RadialSlider
            min={0}
            max={1}
            step={0.01}
            value={filterFrequency}
            updater={setFilterFrequency}
            label={labelFilterFrequency}
          />
        </div>
        <div className="VCF">
          <p>RESONANCE</p>
          <RadialSlider min={0} max={1} step={0.01} value={filterQ} updater={setFilterQ} />
        </div>
      </div>
    </div>
  );
}

export default Filter;
