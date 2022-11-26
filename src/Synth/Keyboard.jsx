/* eslint-disable react/prop-types */
import React from 'react';

import './Keyboard.css';

function Keyboard({
  notes, play, stop, oscillators, refC,
}) {
  const playNote = (frequency, name) => {
    console.log(name);
    play(frequency, name);
  };

  const handleClassName = (name, isPressed) => {
    let className = ` ${name[0]}`;
    if (isPressed) {
      className += name.indexOf('#') === -1 ? ' wactive' : ' bactive';
    } else {
      className = name.indexOf('#') === -1 ? 'white' : 'black';
    }
    return className;
  };

  return (
    <div className="keyboard keyboard-container">
      {
            notes.slice(refC, refC + 24).map((note) => {
              const { name, freq, index } = note;
              return (
                <button
                  type="button"
                  aria-label="key"
                  key={index}
                  className={handleClassName(name, oscillators
                    .find((el) => el.name === name)?.isPressed)}
                  onPointerDown={() => playNote(freq, name)}
                  onPointerUp={() => stop(name)}
                />
              );
            })
        }
    </div>
  );
}

export default Keyboard;
