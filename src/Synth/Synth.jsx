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
    const dataArray = useRef([])
    const requestRef = useRef(null)
    const [timer, setTimer] = useState(false)
    const [audioData, setAudioData] = useState(new Uint8Array(0))
    const [gain, setGain] = useState(0.3)
    const [filterFrequency, setFilterFrequency] = useState(1)
    const [filterQ, setFilterQ] = useState(0)
    const [echoTime, setEchoTime] = useState(0)
    const [echoFeedback, setEchoFeedback] = useState(0)


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
        dataArray.current = new Uint8Array(analyser.current.frequencyBinCount)
        gainNode.current = audioContext.current.createGain();
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
        // osc.stop(audioContext.current.currentTime + 2)
        
    }

    const setupFilterNode = () => {
        // if (filterNode.current !== null) return
        filterNode.current = audioContext.current.createBiquadFilter();
        filterNode.current.type = 'lowpass';
        filterNode.current.frequency.value = filterFrequencyFunc(filterFrequency)
        filterNode.current.Q.value = filterQ * 30
        
        
    }
    
    const setupDelayNode = () => {
        // if(delayNode.current !== null) return
        delayNode.current = audioContext.current.createDelay()
        delayNode.current.delayTime.value = echoTime;
        delayNode.current.connect(gainNode.current)

        gainNodeFeedback.current = audioContext.current.createGain()
        gainNodeFeedback.current.gain.value = echoFeedback
        delayNode.current.connect(gainNodeFeedback.current)
        gainNodeFeedback.current.connect(delayNode.current)

    }


    const play = (freq, name="unnamed") => {
        console.log(freq);
        console.log(name);
        getAudioContext()
        gainNode.current.gain.cancelScheduledValues(audioContext.current.currentTime)
        console.log(oscillators.current.find(o => o.name === name));
        if (oscillators.current.find(o => o.name === name)) {
            console.log('replace osc');
            oscillators.current.find(o => o.name === name).osc.stop()
            oscillators.current.find(o => o.name === name).osc = createOscillator(freq, 0)
            oscillators.current.find(o => o.name === name).isPressed = true
        } else {
            console.log('new osc');
            oscillators.current.push({
                name:name,
                osc: createOscillator(freq, 0),
                isPressed: true})
        }
        // filter
        setupFilterNode()
        oscillators.current.find(o => o.name === name).osc.connect(filterNode.current)
        filterNode.current.connect(gainNode.current) 
        console.log(filterNode.current.frequency.value);

        gainNode.current.gain.value = gain  


        setupDelayNode()
        //echo effect
        filterNode.current.connect(delayNode.current) 
            // osc2.connect(delayNode) 
            // osc3.connect(delayNode)
        delayNode.current.connect(gainNode.current)

 



        const now = audioContext.current.currentTime;
        const attackDuration = attack * STAGE_MAX_TIME
        const attackEndTime = now + attackDuration
        const decayDuration = decay * STAGE_MAX_TIME
    
        gainNode.current.gain.setValueAtTime(0, audioContext.current.currentTime)
        gainNode.current.gain.linearRampToValueAtTime(gain, attackEndTime)
        gainNode.current.gain.setTargetAtTime(sustain * gain, attackEndTime, decayDuration)
    }

    
    const stopOscillators = (name="unnamed") => {
        gainNode.current.gain.cancelScheduledValues(audioContext.current.currentTime)
        console.log('delete', name);
        oscillators.current.find(o => o.name === name).isPressed = false
        const now = audioContext.current.currentTime;
        const releaseDuration = release * STAGE_MAX_TIME
        const releaseEndTime = now + releaseDuration
        console.log(releaseDuration);
        gainNode.current.gain.setValueAtTime(gainNode.current.gain.value, now)
        gainNode.current.gain.linearRampToValueAtTime(0, releaseEndTime)
        const timer = setTimeout(() => {
            if (!oscillators.current.find(o => o.name === name) ||
            oscillators.current.find(o => o.name === name).isPressed) return
            oscillators.current.find(o => o.name === name).osc.stop()
            oscillators.current.find(o => o.name === name).osc.disconnect()
            oscillators.current = oscillators.current.filter(o => o.name !== name)
        }, (releaseDuration + 0.5   ) * 1000);
        
        
        return () => clearTimeout(timer)
    }
    
    
    useEffect(() => {
        if(oscillators.current.length === 0) return
        oscillators.current.forEach((o) => {
            o.osc.type= WAVEFORMS[waveformIndex]
        })
    }, [waveformIndex])

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
            analyser.current.getByteTimeDomainData(dataArray.current)
            setAudioData(dataArray.current)
        }
        return () => clearInterval(requestRef.current)
    }, [timer])


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
        <Analyzer audioData={audioData} timer={timer} />
    </div>
    )
}

export default Synth