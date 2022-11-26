/* eslint-disable react/prop-types */
import React from 'react';

function OctaveChange({ refC, setRefC }) {
  const handleClick = (way) => {
    const move = 12;
    if (way === 'up') {
      if (refC + move <= 96) {
        setRefC((prev) => prev + 12);
      }
    }
    if (way === 'down') {
      if (refC - move >= 0) {
        setRefC((prev) => prev - 12);
      }
    }
  };

  return (
    <div className="settings-el buttons-container">
      <div className="module-name">Oct</div>
      <div className="buttons">
        <button type="button" onClick={() => handleClick('down')}>{'<'}</button>
        <button type="button" onClick={() => handleClick('up')}>{'>'}</button>
      </div>
    </div>
  );
}

export default OctaveChange;
