import React from 'react'

import './Keyboard.css'

const Keyboard = ({notes, play, stop, oscillators, refC}) => {
    
    const playNote = (frequency, name) => {
        console.log(name);
        play(frequency, name)
    }

    const handleClassName = (name, isPressed) => {
        let className = ` ${name[0]}`
        if (isPressed) {
            className += name.indexOf('#') === -1 ? ' wactive' : ' bactive'
        } else {
            className = name.indexOf('#') === -1 ? "white" : "black"
        }
        return className
    }
    
    return(
        <div className="keyboard keyboard-container">
        {
            notes.slice(refC, refC + 24).map((note, index) => {
                const {name,freq, id} = note
                return <button key={index}
                className={handleClassName(name, oscillators.find(el => el.name === name)?.isPressed)}
                onPointerDown={() => playNote(freq, name)}
                onPointerUp={() => stop(name)}
                ></button>
            })
        }
        </div>
    )
}

export default Keyboard;