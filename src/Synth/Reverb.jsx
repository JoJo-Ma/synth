import React from 'react'
import RadialSlider from '../Util/RadialSlider'

const Reverb = ({setReverbWetRatio, reverbWetRatio, labelRatio, resonance, dampening, setResonance, setDampening}) => {
    return (
    <div className="settings-el reverb-container">
        <p className='module-name'>Reverb</p>
        <div className='knobs-container'>
            <div className='VCF'>
                <p>W</p>
                <RadialSlider min={0} max={1} step={0.01} value={reverbWetRatio} updater={setReverbWetRatio} label={labelRatio} />
            </div>
            <div className="VCF">
                <p>R</p>
                <RadialSlider min={0} max={1} step={0.01} value={resonance} updater={setResonance} label={resonance} />
            </div>
            <div className="VCF">
                <p>D</p>
                <RadialSlider min={0} max={5000} step={500} value={dampening} updater={setDampening} label={dampening} />
            </div>
        </div>
    </div>

    )
}

export default Reverb