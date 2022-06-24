import React from 'react'

const Keyboard = ({notes, play, stop}) => {
    
    const playNote = (frequency, name) => {
        play(frequency, name)
    }
    
    return(
        <div className="keyboard">
        {
            notes.map((note, index) => {
                const [name, frequency] = Object.entries(note)[0]
                return <button key={index} className='button' 
                onPointerDown={() => playNote(frequency, name)}
                onPointerUp={() => stop(name)}
                style={
                    name.indexOf('#') === -1 ?
                {
                    backgroundColor:'white',
                    color:'black'
                }
                :
                {
                    backgroundColor:'black'
                }
            }
                
                >{name}</button>
            })
        }
        </div>
    )
}

export default Keyboard;