import React, { useRef, useState, useEffect} from 'react'
import WaveformSelector from './WaveformSelector'
import Keyboard from './Keyboard'
import UnisonWidthSelector from './UnisonWidthSelector'
import VolumeControl from './VolumeControl'
import ADSRSliders from './ADSRSliders'
import Filter from './Filter'
import EchoDelay from './EchoDelay'
import Analyzer from './Analyzer'
import Reverb from './Reverb'
import { filterFrequencyFunc } from '../Util/utilFunctions'
import useMidi from '../Util/useMidi'
import usePCKeyboard from '../Util/usePCKeyboard'
import MidiToFreq from '../Util/miditofreq.json'
import OctaveChange from './OctaveChange'


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


const Synth = () => {
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
    const reverbNode = useRef(null)
    const [reverbWetRatio, setReverbWetRatio] = useState(0)
    const [resonance, setResonance] = useState(0.7)
    const [dampening, setDampening] = useState(3000)
    const [timer, setTimer] = useState(false)
    const [audioDataOsc, setAudioDataOsc] = useState(new Uint8Array(0))
    const [audioDataSpec, setAudioDataSpec] = useState(new Uint8Array(0))
    const [gain, setGain] = useState(0.3)
    const [filterFrequency, setFilterFrequency] = useState(1)
    const [filterQ, setFilterQ] = useState(0)
    const [echoTime, setEchoTime] = useState(0)
    const [echoFeedback, setEchoFeedback] = useState(0)
    const { midiNumber, midiInit } = useMidi()
    const { keyboardKey } = usePCKeyboard()
    // mid c
    const [refC, setRefC ] = useState(60)


    const getAudioContext = () => {
        //stop current recording playing to avoid duplicated sounds
        if (audioContext.current != null && audioContext.current.state !=="closed") {
            return
            // audioContext.current.close( )
        }
        audioContext.current = new AudioContext({
            sampleRate: 44100
        })
        analyser.current = audioContext.current.createAnalyser()
        dataArrayOsc.current = new Uint8Array(analyser.current.frequencyBinCount)
        dataArraySpec.current = new Uint8Array(analyser.current.frequencyBinCount)
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = gain  
        gainNode.current.connect(audioContext.current.destination)
        gainNode.current.connect(analyser.current)
        
      }


    const createOscillator = (freq, detune, actx) => {
        const osc = actx.createOscillator();
        osc.type = WAVEFORMS[waveformIndex]
        osc.frequency.value = freq;
        osc.detune.value = detune
        osc.start()
        return osc
    }

    const createOscillatorGroup = (freq, detune, name, actx) => {
        const osc = createOscillator(freq, 0, actx)
        const oscFlat = createOscillator(freq, -detune, actx)
        const oscSharp = createOscillator(freq, detune, actx)
        const oscGain = actx.createGain();
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
        
    }

    const setupFilterNode = (outputNode) => {
        if (filterNode.current === null) {
            filterNode.current = audioContext.current.createBiquadFilter()
        }
        filterNode.current.type = 'lowpass';
        filterNode.current.frequency.value = filterFrequencyFunc(filterFrequency)
        filterNode.current.Q.value = filterQ * 30
        filterNode.current.connect(outputNode)
        setupDelayNode(filterNode.current, gainNode.current)
    }


    const getAllPass = (actx, freq) => {
        const allPass = actx.createBiquadFilter();
        allPass.type = 'allpass';
        allPass.frequency.value = freq;
        return allPass;
      };

    
    const LowpassCombFilter = (actx, options) => { 
        const {dampening: frequency, resonance: gainValue, delayTime} = options
        const lowPass = actx.createBiquadFilter()
        lowPass.type = 'lowpass'
        lowPass.frequency.value = frequency
        const delay = actx.createDelay()
        delay.delayTime.value = delayTime;
        const gain = actx.createGain()
        const inputGain = actx.createGain()
        const outputGain = actx.createGain()
        gain.gain.setValueAtTime(gainValue, actx.currentTime);
        inputGain.connect(delay)
        .connect(lowPass)
        .connect(gain)
        .connect(inputGain)
        .connect(outputGain)
        return {
            lowPass,
            gain,
            inputGain,
            outputGain
        }
    }
    
    const setupReverbNode = (actx, inputNode, outputNode) => {
        if (reverbNode.current !== null) {
            inputNode.connect(reverbNode.current.wetGain)
            inputNode.connect(reverbNode.current.dryGain)
            return
        }
        const ALLPASS_FREQUENCES = [225, 556, 441, 341];
        const SAMPLE_RATE = 44100;
        const COMB_FILTER_TUNINGS = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116];
        const wetGain = actx.createGain()
        wetGain.gain.setValueAtTime(0, actx.currentTime);
        const dryGain = actx.createGain()
        dryGain.gain.setValueAtTime(1, actx.currentTime);
        const combFilters = COMB_FILTER_TUNINGS
        .map(delayPerSecond => delayPerSecond / SAMPLE_RATE)
        .map(delayTime => LowpassCombFilter(actx, {dampening, resonance, delayTime}))
        const merger = actx.createChannelMerger(2)
        const splitter = actx.createChannelSplitter(2)
        console.log(combFilters);
        const combLeft = combFilters.slice(0, 4);
        const combRight = combFilters.slice(4);
        const allPassFilters = ALLPASS_FREQUENCES.map(freq => getAllPass(actx, freq))
        console.log(allPassFilters);
        if (reverbNode.current === null) {
            reverbNode.current = {
                wetGain,
                dryGain,
                combFilters,
                merger,
                splitter,
                combFilters,
                allPassFilters
            }
        }

        inputNode.connect(wetGain).connect(splitter);
        inputNode.connect(dryGain).connect(outputNode);
        // connect first four combfilters to left splitter and merge them back
        combLeft.forEach(comb => {
          splitter.connect(comb.inputGain, 0)
          comb.outputGain.connect(merger, 0, 0);
        });
        // connect last four comb filters to right splitters and merge them back
        combRight.forEach(comb => {
            splitter.connect(comb.inputGain, 1)
            comb.outputGain.connect(merger, 0, 1);
        });
        console.log(merger);
        merger
        .connect(allPassFilters[0])
        .connect(allPassFilters[1])
        .connect(allPassFilters[2])
        .connect(allPassFilters[3])
        .connect(outputNode)
    }

    
    const setupDelayNode = (inputNode, outputNode) => {
        let isInitial = false
        if (delayNode.current === null) {
            delayNode.current = audioContext.current.createDelay()
            gainNodeFeedback.current = audioContext.current.createGain()
            isInitial = true
        }
        delayNode.current.delayTime.value = echoTime;
        gainNodeFeedback.current.gain.value = echoFeedback
        if(!isInitial) return
        delayNode.current.connect(outputNode)
        delayNode.current.connect(gainNodeFeedback.current)
        gainNodeFeedback.current.connect(delayNode.current)
        delayNode.current.connect(outputNode)
        inputNode.connect(delayNode.current)
        isInitial = false
    }



    const play = (freq, name="unnamed") => {
        getAudioContext()
        if(oscillators.current.find(o => o.name === name)) {
            oscillators.current.find(o => o.name === name).oscGain.gain.cancelScheduledValues(audioContext.current.currentTime)
        }

        if (oscillators.current.find(o => o.name === name)) {
            console.log('replace osc');
            oscillators.current.find(o => o.name === name).osc.disconnect()
            oscillators.current.find(o => o.name === name).osc.connect(oscillators.current.find(o => o.name === name).oscGain)
            oscillators.current.find(o => o.name === name).isPressed = true
            oscillators.current.find(o => o.name === name).timeStarted = audioContext.current.currentTime
        } else {
            console.log('new osc');
            oscillators.current.push(createOscillatorGroup(freq, unisonWidth, name, audioContext.current))
        }
        // filter
        setupFilterNode(gainNode.current)
        setupReverbNode(audioContext.current, oscillators.current.find(o => o.name === name).oscGain, filterNode.current, reverbNode.current)
        
        


        const now = audioContext.current.currentTime;
        const attackDuration = attack * STAGE_MAX_TIME
        const attackEndTime = now + attackDuration
        const decayDuration = decay * STAGE_MAX_TIME
    
        oscillators.current.find(o => o.name === name).oscGain.gain.setValueAtTime(0, audioContext.current.currentTime)
        oscillators.current.find(o => o.name === name).oscGain.gain.linearRampToValueAtTime(gain, attackEndTime)
        oscillators.current.find(o => o.name === name).oscGain.gain.setTargetAtTime(sustain * gain, attackEndTime, decayDuration)
    }

    // TODO support decay
    const currentOscGainValue = (now, name) => {
        let currentGain = (now - oscillators.current.find(o => o.name === name).timeStarted) / (attack * STAGE_MAX_TIME) * gain
        if (!currentGain) {
            return gainNode.current.gain.value
        }
        if ( currentGain > gainNode.current.gain.value) {
            return gainNode.current.gain.value * sustain
        }
        return currentGain
    }

    const stopOscillators = (name="unnamed") => {
        oscillators.current.find(o => o.name === name).oscGain.gain.cancelScheduledValues(audioContext.current.currentTime)
        console.log('delete', name);
        oscillators.current.find(o => o.name === name).isPressed = false
        const now = audioContext.current.currentTime;
        const releaseDuration = release * STAGE_MAX_TIME
        const releaseEndTime = now + releaseDuration
        oscillators.current.find(o => o.name === name).oscGain.gain.setValueAtTime(currentOscGainValue(now, name), now)
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
        console.log(midiNumber);
        const { name, freq } = MidiToFreq.find(el => el.id === midiNumber.id)
        if(midiNumber.pushedOn) {
            play(freq, name)
        } else {
            stopOscillators(name)
        }
    }, [midiNumber])

    useEffect(() => {
        if(!keyboardKey || !refC ) return
        const { name, freq } = MidiToFreq.find(el => el.id === ( refC + keyboardKey.noteIndex))
        if(keyboardKey.pushedOn) {
            play(freq, name)
        } else {
            stopOscillators(name)
        }
    }, [keyboardKey])


    useEffect(() => {
        if (reverbNode.current === null ) return
        reverbNode.current.wetGain.gain.value = reverbWetRatio
        reverbNode.current.dryGain.gain.value = 1 - reverbWetRatio
        reverbNode.current.combFilters.forEach(filter => {
            filter.lowPass.frequency.value = dampening
            filter.gain.gain.value = resonance
        })
    }, [reverbWetRatio, resonance, dampening])
    


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
        <Reverb setReverbWetRatio={setReverbWetRatio}
        reverbWetRatio={reverbWetRatio}
        labelRatio={`${(reverbWetRatio * 100).toFixed()}%`}
        resonance={resonance}
        setResonance={setResonance}
        dampening={dampening}
        setDampening={setDampening}
        />
        <OctaveChange setRefC={setRefC} refC={refC} />
        <Keyboard notes={MidiToFreq} play={play} stop={stopOscillators} oscillators={oscillators.current} refC={refC} />
        </div>
        {/* <button className='button' onClick={() => play(220, 'unnamed')}>Play</button>
        <button className='button' onClick={() => stopOscillators('unnamed')}>Stop</button> */}
        <div className="analyzers">
            <Analyzer audioData={audioDataOsc} timer={timer} />
            <Analyzer audioData={audioDataSpec} timer={timer} />
        </div>
    </div>
    )
}

export default Synth