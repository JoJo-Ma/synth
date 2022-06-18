import React from 'react'
import Slider from '../Util/Slider'

const UnisonWidthSelector = ({updater, unisonWidth}) => {
    return (
        <div className='settings-el'>
            <p>Unison width</p><p>{unisonWidth}</p>
            <Slider min={0} max={20} value={unisonWidth} updater={updater} />
        </div>
    )
}

export default UnisonWidthSelector