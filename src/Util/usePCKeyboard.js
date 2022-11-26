import { useEffect, useState } from 'react';

const keyToNote = [
  {
    keyboardKey: 'a',
    noteIndex: 0,
    noteName: 'C',
  },
  {
    keyboardKey: 'w',
    noteIndex: 1,
    noteName: 'C#',
  },
  {
    keyboardKey: 's',
    noteIndex: 2,
    noteName: 'D',
  },
  {
    keyboardKey: 'e',
    noteIndex: 3,
    noteName: 'D#',
  },
  {
    keyboardKey: 'd',
    noteIndex: 4,
    noteName: 'E',
  },
  {
    keyboardKey: 'f',
    noteIndex: 5,
    noteName: 'F',
  },
  {
    keyboardKey: 't',
    noteIndex: 6,
    noteName: 'F#',
  },
  {
    keyboardKey: 'g',
    noteIndex: 7,
    noteName: 'G',
  },
  {
    keyboardKey: 'y',
    noteIndex: 8,
    noteName: 'G#',
  },
  {
    keyboardKey: 'h',
    noteIndex: 9,
    noteName: 'A',
  },
  {
    keyboardKey: 'u',
    noteIndex: 10,
    noteName: 'A#',
  },
  {
    keyboardKey: 'j',
    noteIndex: 11,
    noteName: 'B',
  },
];

const usePCKeyboard = () => {
  const [keyboardKey, setKeyboardKey] = useState();
  const [hold, setHold] = useState(false);

  useEffect(() => {
    window.addEventListener(
      'keydown',
      (event) => {
        if (event.repeat) return;
        if (hold) return;
        setHold(true);
        const match = keyToNote.find((el) => el.keyboardKey === event.key);
        if (!match) return;
        setKeyboardKey({
          pushedOn: true,
          eventKey: event.key,
          noteIndex: match.noteIndex,
          noteName: match.noteName,
        });
      },

      false,
    );
    window.addEventListener(
      'keyup',
      (event) => {
        setHold(false);
        const match = keyToNote.find((el) => el.keyboardKey === event.key);
        if (!match) return;
        setKeyboardKey({
          pushedOn: false,
          eventKey: event.key,
          noteIndex: match.noteIndex,
          noteName: match.noteName,
        });
      },

      false,
    );
  }, []);

  return { keyboardKey };
};

export default usePCKeyboard;
