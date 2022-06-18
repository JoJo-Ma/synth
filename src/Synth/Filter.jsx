import React from 'react'
import Slider from '../Util/Slider'


const Filter = ({setFilterFrequency, setFilterQ, filterFrequency, filterQ}) => {
    
    return (
        <div className="settings-el">
            <p>VCF</p>
            <div className='VCF'>
                <p>F</p>
                <Slider min={0} max={1} step={0.01} value={filterFrequency} updater={setFilterFrequency} />
            </div>
            <div className="VCF">
                <p>Q</p>
                <Slider min={0} max={1} step={0.01} value={filterQ} updater={setFilterQ} />
            </div>
        </div>
    )
}

export default Filter