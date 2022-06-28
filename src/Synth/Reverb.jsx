import React from 'react'
import Slider from '../Util/Slider'

const Reverb = ({setReverbWetRatio, reverbWetRatio, labelRatio, resonance, dampening, setResonance, setDampening}) => {
    return (
    <div className="settings-el">
        <p>Reverb</p>
        <div className='VCF'>
            <p>W</p>
            <Slider min={0} max={1} step={0.01} value={reverbWetRatio} updater={setReverbWetRatio} label={labelRatio} />
        </div>
        <div className="VCF">
            <p>R</p>
            <Slider min={0} max={1} step={0.01} value={resonance} updater={setResonance} label={resonance} />
        </div>
        <div className="VCF">
            <p>D</p>
            <Slider min={0} max={5000} step={500} value={dampening} updater={setDampening} label={dampening} />
        </div>
    </div>

    )
}

export default Reverb