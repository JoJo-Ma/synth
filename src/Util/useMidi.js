import { useEffect, useState } from 'react';

const useMidi = () => {
  const [midiNumber, setMidiNumber] = useState();
  const [midiInit, setMidiInit] = useState(false);

  function getMIDIMessage(msg) {
    if (msg.data[2] === 0) {
      setMidiNumber({ id: msg.data[1], pushedOn: false });
      return;
    }
    setMidiNumber({ id: msg.data[1], pushedOn: true });
  }

  useEffect(() => {
    function onMIDISuccess(midiAccess) {
      const inputs = midiAccess.inputs.values();
      // loop over all available inputs and listen for any MIDI input
      for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = getMIDIMessage;
      }
    }
    navigator.requestMIDIAccess().then(onMIDISuccess);
    setMidiInit(true);
  }, []);

  return { midiNumber, midiInit };
};

export default useMidi;
