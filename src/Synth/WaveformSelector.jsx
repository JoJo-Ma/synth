import React from 'react'
import Slider from '../Util/Slider'

const WaveformSelector = ({ waveforms, value, updater}) => {
    return (
        <div className='waveform-selector settings-el'>
            <p>Waveform</p>
            <p>{waveforms[value]}</p>
            <Slider min={0} max={waveforms.length - 1} value={value} updater={updater} />
        </div>
    )
}

export default WaveformSelector