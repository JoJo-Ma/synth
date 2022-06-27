import React, { useRef, useState, useEffect} from 'react'
import WaveformSelector from './WaveformSelector'
import Keyboard from './Keyboard'
import UnisonWidthSelector from './UnisonWidthSelector'
import VolumeControl from './VolumeControl'
import ADSRSliders from './ADSRSliders'
import Filter from './Filter'
import EchoDelay from './EchoDelay'
import Analyzer from './Analyzer'
import { filterFrequencyFunc } from '../Util/utilFunctions'
import useMidi from '../Util/useMidi'
import MidiToFreq from '../Util/miditofreq.json'

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
    const [attack, setAttack] = useState(0.2)
    const [decay, setDecay] = useState(0)
    const [sustain, setSustain] = useState(1 )
    const [release, setRelease] = useState(0.2)
    const audioContext = useRef(null)
    const oscillators = useRef([])
    const filterNode = useRef(null)
    const delayNode = useRef(null)
    const gainNodeFeedback = useRef(null)
    const gainNode = useRef(null)
    const analyser = useRef(null)
    const dataArrayOsc = useRef([])
    const dataArraySpec = useRef([])
    const requestRef = useRef(null)
    const convolverNode = useRef(null)
    const [timer, setTimer] = useState(false)
    const [audioDataOsc, setAudioDataOsc] = useState(new Uint8Array(0))
    const [audioDataSpec, setAudioDataSpec] = useState(new Uint8Array(0))
    const [gain, setGain] = useState(0.3)
    const [filterFrequency, setFilterFrequency] = useState(1)
    const [filterQ, setFilterQ] = useState(0)
    const [echoTime, setEchoTime] = useState(0)
    const [echoFeedback, setEchoFeedback] = useState(0)
    const { midiNumber, midiInit } = useMidi()

    const getAudioContext = () => {
        //stop current recording playing to avoid duplicated sounds
        if (audioContext.current != null && audioContext.current.state !=="closed") {
            return
            // audioContext.current.close( )
        }
        audioContext.current = new AudioContext({
            sampleRate: 46000
        })
        analyser.current = audioContext.current.createAnalyser()
        dataArrayOsc.current = new Uint8Array(analyser.current.frequencyBinCount)
        dataArraySpec.current = new Uint8Array(analyser.current.frequencyBinCount)
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = gain  
        gainNode.current.connect(audioContext.current.destination)
        gainNode.current.connect(analyser.current)
        
      }


    const createOscillator = (freq, detune) => {
        const osc = audioContext.current.createOscillator();
        osc.type = WAVEFORMS[waveformIndex]
        osc.frequency.value = freq;
        osc.detune.value = detune
        osc.start()
        return osc
    }

    const createOscillatorGroup = (freq, detune, name) => {
        const osc = createOscillator(freq, 0)
        const oscFlat = createOscillator(freq, -detune)
        const oscSharp = createOscillator(freq, detune)
        const oscGain = audioContext.current.createGain();
        osc.connect(oscGain)
        oscFlat.connect(oscGain)
        oscSharp.connect(oscGain)


        return {
            osc,
            oscFlat,
            oscSharp,
            name,
            isPressed: true,
            oscGain
        }
        // osc.stop(audioContext.current.currentTime + 2)
        
    }

    const setupFilterNode = () => {
        if (filterNode.current === null) {
            filterNode.current = audioContext.current.createBiquadFilter()
        }
        filterNode.current.type = 'lowpass';
        filterNode.current.frequency.value = filterFrequencyFunc(filterFrequency)
        filterNode.current.Q.value = filterQ * 30
         
        setupReverbNode()
        
        
    }
    
    const setupDelayNode = () => {
        let isInitial = false
        if (delayNode.current === null) {
            delayNode.current = audioContext.current.createDelay()
            gainNodeFeedback.current = audioContext.current.createGain()
            isInitial = true
        }
        delayNode.current.delayTime.value = echoTime;
        gainNodeFeedback.current.gain.value = echoFeedback
        console.log(delayNode.current.delayTime.value);
        if(!isInitial) return
        delayNode.current.connect(gainNode.current)
        delayNode.current.connect(gainNodeFeedback.current)
        gainNodeFeedback.current.connect(delayNode.current)
        delayNode.current.connect(gainNode.current)
        convolverNode.current.connect(delayNode.current)
        isInitial = false
    }

    const setupReverbNode = () => {
        if (convolverNode.current === null) {
            convolverNode.current = audioContext.current.createConvolver() 
        }
        filterNode.current.connect(convolverNode.current)
        convolverNode.current.connect(gainNode.current)
        setupDelayNode()
    }

    const play = (freq, name="unnamed") => {
        console.log(freq);
        console.log(name);
        getAudioContext()
        if(oscillators.current.find(o => o.name === name)) {
            oscillators.current.find(o => o.name === name).oscGain.gain.cancelScheduledValues(audioContext.current.currentTime)
        }
        console.log(oscillators.current.find(o => o.name === name));
        if (oscillators.current.find(o => o.name === name)) {
            console.log('replace osc');
            oscillators.current.find(o => o.name === name).osc.disconnect()
            oscillators.current.find(o => o.name === name).osc.connect(oscillators.current.find(o => o.name === name).oscGain)
            oscillators.current.find(o => o.name === name).isPressed = true
        } else {
            console.log('new osc');
            oscillators.current.push(createOscillatorGroup(freq, unisonWidth, name))
        }
        // filter
        setupFilterNode()
        oscillators.current.find(o => o.name === name).oscGain.connect(filterNode.current)
        
        
        


        const now = audioContext.current.currentTime;
        const attackDuration = attack * STAGE_MAX_TIME
        const attackEndTime = now + attackDuration
        const decayDuration = decay * STAGE_MAX_TIME
    
        oscillators.current.find(o => o.name === name).oscGain.gain.setValueAtTime(0, audioContext.current.currentTime)
        oscillators.current.find(o => o.name === name).oscGain.gain.linearRampToValueAtTime(gain, attackEndTime)
        oscillators.current.find(o => o.name === name).oscGain.gain.setTargetAtTime(sustain * gain, attackEndTime, decayDuration)
    }

    
    const stopOscillators = (name="unnamed") => {
        oscillators.current.find(o => o.name === name).oscGain.gain.cancelScheduledValues(audioContext.current.currentTime)
        console.log('delete', name);
        oscillators.current.find(o => o.name === name).isPressed = false
        const now = audioContext.current.currentTime;
        const releaseDuration = release * STAGE_MAX_TIME
        const releaseEndTime = now + releaseDuration
        console.log(releaseDuration);
        oscillators.current.find(o => o.name === name).oscGain.gain.setValueAtTime(gainNode.current.gain.value, now)
        oscillators.current.find(o => o.name === name).oscGain.gain.linearRampToValueAtTime(0, releaseEndTime)
        const timer = setTimeout(() => {
            if (!oscillators.current.find(o => o.name === name) ||
            oscillators.current.find(o => o.name === name).isPressed) return
            oscillators.current.find(o => o.name === name).osc.disconnect()
            // oscillators.current = oscillators.current.filter(o => o.name !== name)
        }, (releaseDuration) * 1000);
        
        
        return () => clearTimeout(timer)
    }
    
    
    useEffect(() => {
        if(oscillators.current.length === 0) return
        oscillators.current.forEach((o) => {
            o.osc.type= WAVEFORMS[waveformIndex]
        })
    }, [waveformIndex])

    useEffect(() => {
        if(oscillators.current.length === 0) return
        console.log('changing detune');
        oscillators.current.forEach((o) => {
            o.oscSharp.detune.value= unisonWidth
            o.oscFlat.detune.value= -unisonWidth
        })
    }, [unisonWidth])
    

    useEffect(() => {
        if (gainNode.current === null) return
        gainNode.current.gain.value = gain
    }, [gain])

    useEffect(() => {
        if (filterNode.current === null) return
        filterNode.current.frequency.value = filterFrequencyFunc(filterFrequency)
        filterNode.current.Q.value = filterQ * 30
    }, [filterFrequency, filterQ])
    

    useEffect(() => {
        requestRef.current = setInterval(() => setTimer(timer => !timer), 1000/15)
        if(audioContext.current !== null) {
            analyser.current.getByteTimeDomainData(dataArrayOsc.current)
            setAudioDataOsc(dataArrayOsc.current)
            analyser.current.getByteFrequencyData(dataArraySpec.current)
            setAudioDataSpec(dataArraySpec.current)
        }
        return () => clearInterval(requestRef.current)
    }, [timer])

    useEffect(() => {
        if(!midiInit) return
        console.log('ici');
        console.log(midiNumber);
        const { id, name, freq} = MidiToFreq.find(el => el.id === midiNumber.id)
        if(midiNumber.pushedOn) {
            play(freq, name)
        } else {
            stopOscillators(name)
        }
    }, [midiNumber])


    return(
    <div className='synth'>
        <div className='settings'>
        <WaveformSelector waveforms={WAVEFORMS} value={waveformIndex} updater={setWaveformIndex} />
        <UnisonWidthSelector updater={setUnisonWidth} unisonWidth={unisonWidth} /> 
        <VolumeControl updater={setGain} gain={gain} />
        <ADSRSliders setAttack={setAttack} setDecay={setDecay} setSustain={setSustain} setRelease={setRelease}
        attack={attack} decay={decay} sustain={sustain} release={release}
        />
        <Filter setFilterFrequency={setFilterFrequency} setFilterQ={setFilterQ} filterFrequency={filterFrequency} filterQ={filterQ} labelFilterFrequency={filterNode.current !== null  && filterNode.current.frequency.value} />
        <EchoDelay setEchoFeedback={setEchoFeedback} setEchoTime={setEchoTime} echoTime={echoTime} echoFeedback={echoFeedback} />
        </div>
        <button className='button' onClick={() => play(220, 'unnamed')}>Play</button>
        <button className='button' onClick={() => stopOscillators('unnamed')}>Stop</button>
        <Keyboard notes={NOTES} play={play} stop={stopOscillators} />
        <div className="analyzers">
            <Analyzer audioData={audioDataOsc} timer={timer} />
            <Analyzer audioData={audioDataSpec} timer={timer} />
        </div>
    </div>
    )
}

export default Synth