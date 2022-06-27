import React, {useEffect, useState} from 'react'

const useMidi = () => {
    const [midiNumber, setMidiNumber] = useState()
    const [midiInit, setMidiInit] = useState(false)

    function onMIDISuccess(midiAccess) {
      var inputs = midiAccess.inputs.values();
      // loop over all available inputs and listen for any MIDI input
      for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
          // each time there is a midi message call the onMIDIMessage function
          input.value.onmidimessage = getMIDIMessage;
      }
    }
    

    function getMIDIMessage(msg) {
      if (msg.data[2] === 0) {
        setMidiNumber({id:msg.data[1], pushedOn:false})
        return
      }
      setMidiNumber({id:msg.data[1], pushedOn:true})
    }
    

    useEffect(() => {
      navigator.requestMIDIAccess().then(onMIDISuccess);
      setMidiInit(true)
    },[])

    return { midiNumber, midiInit }

  }
  
  export default useMidi