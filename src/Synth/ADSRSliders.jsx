import React from 'react'
import RadialSlider from '../Util/RadialSlider'
const ADSRSliders = ({ setAttack, setDecay, setSustain, setRelease, attack, decay, release, sustain}) => {  
    
    return (        
    <div className='settings-el adsr-container'>
        <div className='module-name'>VCA</div>
        <div className='knobs-container'>
            <div className='ADSR'>
            <p>ATTACK</p>
            <RadialSlider min={0} max={1} step={0.01} updater={setAttack} value={attack}/>
            </div>
            <div className='ADSR'>
            <p>DECAY</p>
            <RadialSlider min={0} max={1} step={0.01} updater={setDecay} value={decay}/>
            </div>
            <div className='ADSR'>
            <p>SUSTAIN</p>
            <RadialSlider min={0} max={1} step={0.01} updater={setSustain} value={sustain}/>
            </div>
            <div className='ADSR'>
            <p>RELEASE</p>
            <RadialSlider min={0} max={1} step={0.01} updater={setRelease} value={release}/>
            </div>
        </div>
    </div>
)

}

export default ADSRSliders