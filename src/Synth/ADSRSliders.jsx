import React from 'react'
import Slider from '../Util/Slider'
const ADSRSliders = ({ setAttack, setDecay, setSustain, setRelease, attack, decay, release, sustain}) => {  
    
    return (        
    <div className='settings-el'>
        <p>VCA</p>
        <div className='ADSR'>
        <p>A</p>
        <Slider min={0} max={1} step={0.01} updater={setAttack} value={attack}/>
        </div>
        <div className='ADSR'>
        <p>D</p>
        <Slider min={0} max={1} step={0.01} updater={setDecay} value={decay}/>
        </div>
        <div className='ADSR'>
        <p>S</p>
        <Slider min={0} max={1} step={0.01} updater={setSustain} value={sustain}/>
        </div>
        <div className='ADSR'>
        <p>R</p>
        <Slider min={0} max={1} step={0.01} updater={setRelease} value={release}/>
        </div>
    </div>
)

}

export default ADSRSliders