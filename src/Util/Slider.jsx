import React from 'react'

const Slider = ({min, max, value, updater, step=1, label}) => {


    const onChange = (e) => {
        updater(e.target.value)
    }

    return (
        <div className='slider'>
            <input type="range"
            min={min}
            max={max}
            value={value}
            step={step}
            onChange={onChange}
            />
        <span className="tooltip">{label}</span>
        </div>
    )
}

export default Slider