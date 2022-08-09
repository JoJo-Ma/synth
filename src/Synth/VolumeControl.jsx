import React from 'react'
import RadialSlider from '../Util/RadialSlider'

const VolumeControl = ({updater, gain}) => {
    return (
        <div className='settings-el'>
            <p className='module-name'>VOL</p>
            <div className='knobs-container'>
                <div className="VCF">
                    <p style={{color:'transparent'}}>d</p>
                    <RadialSlider min={0.0} max={1.0} step={0.01} value={gain} updater={updater} />
                </div>
            </div>
        </div>
    )
}

export default VolumeControl