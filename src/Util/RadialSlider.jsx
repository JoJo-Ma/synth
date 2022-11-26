/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useDrag } from '@use-gesture/react';

import styles from './RadialSlider.module.css';

const map = (value, imin, imax, omin, omax) => (
  ((value - imin) / (imax - imin)) * (omax - omin) + omin
);

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const getElementCenter = (el) => {
  const {
    top, left, width, height,
  } = el.getBoundingClientRect();
  return [left + width / 2, top + height / 2];
};

const getAngle = ([x, y], [left, top], from, range) => {
  const adjacent = left - x;
  const opposite = top - y;
  const radians = Math.atan(opposite / adjacent) + (adjacent < 0 ? Math.PI : 0) + Math.PI / 2;
  let angle = radians * (180 / Math.PI); // Convert angle to degrees

  // Normalize the angle to start at 'from', so that the full circle starts
  // and ends at that point.
  angle = angle - from + (angle >= 0 && angle < from ? 360 : 0);

  // When the angle is outside of the given range, we want the angle to go either to the
  // start of the range, or to the end of the range, based on proximity to either end.
  if (angle > 180 + range / 2) {
    angle = 0;
  }

  return clamp(angle, 0, range);
};

function RadialSlider({
  label, min, max, value, updater, roundDecimal = 2,
}) {
  const [angle, setAngle] = useState(map(value, min, max, 40, 320));
  const bind = useDrag(({ values, event }) => {
    const angl = getAngle(getElementCenter(event.target), values, 220, 280) + 40;
    setAngle(angl);
    updater(map(angl, 40, 320, min, max).toFixed(roundDecimal));
  });

  return (
    <div {...bind()} className={`${styles.radialSlider} slider`}>
      <div className={styles.knob} style={{ '--angle': `${angle}deg` }}>
        <div className={styles.cap} />
        <div className={styles.indicator} />
        <div className={styles.numbers}>
          {[...new Array(24)].map((_, i) => {
            const angl = Math.round(i * (360 / 24));
            return (
              <div className={styles.line} style={{ '--angle': `${angl}deg` }}>
                <div className={
                angl < 140 || angl > 220
                  ? styles.stroke
                  : ''

              }
                />
              </div>
            );
          })}
        </div>
      </div>
      <span className="tooltip">{label || value}</span>
    </div>
  );
}

export default RadialSlider;
