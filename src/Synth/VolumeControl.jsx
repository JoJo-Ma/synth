import React from 'react'
import Slider from '../Util/Slider'

const VolumeControl = ({updater, gain}) => {
    return (
        <div className='settings-el'>
            <p>Volume</p><p>{gain}</p>
            <Slider min={0.0} max={1.0} step={0.01} value={gain} updater={updater} />
        </div>
    )
}

export default VolumeControl