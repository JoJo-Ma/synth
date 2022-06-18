import React from 'react'
import Slider from '../Util/Slider'

const EchoDelay = ({setEchoTime, setEchoFeedback, echoTime, echoFeedback}) => {
    return (
        <div className="settings-el">
            <p>Echo/Delay</p>
            <div className='VCF'>
                <p>E</p>
                <Slider min={0} max={1} step={0.01} value={echoTime} updater={setEchoTime} />
            </div>
            <div className="VCF">
                <p>F</p>
                <Slider min={0} max={1} step={0.01} value={echoFeedback} updater={setEchoFeedback} />
            </div>
        </div>
    )
}

export default EchoDelay