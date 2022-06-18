import React, { useRef, useState, useEffect } from 'react'
import WaveformSelector from './WaveformSelector'
import Keyboard from './Keyboard'
import UnisonWidthSelector from './UnisonWidthSelector'
import VolumeControl from './VolumeControl'
import ADSRSliders from './ADSRSliders'
import Filter from './Filter'
import EchoDelay from './EchoDelay'

const WAVEFORMS = [
    'sine',
    'square',
    'sawtooth',
    'triangle'
]

const NOTES = [
    {"C-3":130.81},
    {"C#/Db-3":138.59},
    {"D-3":146.83},
    {"D#/Eb-3":155.56},
    {"E-3":164.81},
    {"F-3":174.61},
    {"F#/Gb-3":185.00},
    {"G-3":196.00},
    {"G#/Ab-3":207.65},
    {"A-3":220.00},
    {"A#/Bb-3":233.08},
    {"B-3":246.94}
]

const STAGE_MAX_TIME = 2


const Synth = (params) => {
    const [waveformIndex, setWaveformIndex] = useState(0)
    const [unisonWidth, setUnisonWidth] = useState(0)
    const [frequency, setFrequency] = useState(130.81)
    const [keyTrigger, setKeyTrigger] = useState(false)
    const [attack, setAttack] = useState(0.2)
    const [decay, setDecay] = useState(0)
    const [sustain, setSustain] = useState(1 )
    const [release, setRelease] = useState(0.2)
    const audioContext = useRef(null)
    const gainNode = useRef(null)
    const [gain, setGain] = useState(0.3)
    const [filterFrequency, setFilterFrequency] = useState(1)
    const [filterQ, setFilterQ] = useState(0)
    const [echoTime, setEchoTime] = useState(0)
    const [echoFeedback, setEchoFeedback] = useState(0)


    const getAudioContext = () => {
        //stop current recording playing to avoid duplicated sounds
        if (audioContext.current != null && audioContext.current.state !=="closed") {
            audioContext.current.close( )
        }
        audioContext.current = new AudioContext({
            sampleRate: 46000
        })
        gainNode.current = audioContext.current.createGain();
        gainNode.current.connect(audioContext.current.destination)
        
        
      }


    const createOscillator = (detune) => {
        const osc = audioContext.current.createOscillator();
        osc.type = WAVEFORMS[waveformIndex]
        osc.frequency.value = frequency;
        osc.detune.value = detune
        osc.start()
        

        //filter
        const filter = audioContext.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFrequency * 46000 / 2
        filter.Q.value = filterQ * 30

        osc.connect(filter)
        return filter
        // osc.stop(audioContext.current.currentTime + 2)
        
    }
    
    const play = () => {
        gainNode.current.gain.cancelScheduledValues(audioContext.current.currentTime)
        const osc = createOscillator(0)
        const osc2 = createOscillator(-unisonWidth)
        const osc3 = createOscillator(unisonWidth)
        osc.connect(gainNode.current) 
        osc2.connect(gainNode.current) 
        osc3.connect(gainNode.current)
        gainNode.current.gain.value = gain  

        //echo effect
        if(echoTime > 0) {
            const delayNode = audioContext.current.createDelay()
            delayNode.delayTime.value = echoTime;
            delayNode.connect(gainNode.current)
    
            const gainNodeFeedback = audioContext.current.createGain()
            gainNodeFeedback.gain.value = echoFeedback
    
            osc.connect(delayNode) 
            osc2.connect(delayNode) 
            osc3.connect(delayNode)
    
            delayNode.connect(gainNodeFeedback)
            gainNodeFeedback.connect(delayNode)
        }
 



        const now = audioContext.current.currentTime;
        const attackDuration = attack * STAGE_MAX_TIME
        const attackEndTime = now + attackDuration
        const decayDuration = decay * STAGE_MAX_TIME
    
        gainNode.current.gain.setValueAtTime(0, audioContext.current.currentTime)
        gainNode.current.gain.linearRampToValueAtTime(gain, attackEndTime)
        gainNode.current.gain.setTargetAtTime(sustain * gain, attackEndTime, decayDuration)
    }

    
    const stopOscillators = () => {
        gainNode.current.gain.cancelScheduledValues(audioContext.current.currentTime)

        const now = audioContext.current.currentTime;
        const releaseDuration = release * STAGE_MAX_TIME
        const releaseEndTime = now + releaseDuration
        gainNode.current.gain.setValueAtTime(gainNode.current.gain.value, now)
        gainNode.current.gain.linearRampToValueAtTime(0, releaseEndTime)

        // audioContext.current.close()
    }
    
    useEffect(() => {
        getAudioContext()
        return (play())
    }, [keyTrigger])
    

    return(
    <div className='synth'>
        <div className='settings'>
        <WaveformSelector waveforms={WAVEFORMS} value={waveformIndex} updater={setWaveformIndex} />
        <UnisonWidthSelector updater={setUnisonWidth} unisonWidth={unisonWidth} /> 
        <VolumeControl updater={setGain} gain={gain} />
        <ADSRSliders setAttack={setAttack} setDecay={setDecay} setSustain={setSustain} setRelease={setRelease}
        attack={attack} decay={decay} sustain={sustain} release={release}
        />
        <Filter setFilterFrequency={setFilterFrequency} setFilterQ={setFilterQ} filterFrequency={filterFrequency} filterQ={filterQ} />
        <EchoDelay setEchoFeedback={setEchoFeedback} setEchoTime={setEchoTime} echoTime={echoTime} echoFeedback={echoFeedback} />
        </div>
        <button className='button' onClick={stopOscillators}>Stop</button>
        <Keyboard notes={NOTES} setKeyTrigger={setKeyTrigger} play={play} setFrequency={setFrequency} stop={stopOscillators} />
    </div>
    )
}

export default Synth