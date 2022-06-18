import React from 'react'

const Keyboard = ({notes, play,  setKeyTrigger, setFrequency, stop}) => {
    
    const playNote = async (frequency) => {
        await setFrequency(frequency)
        setKeyTrigger(prev => !prev)
    }
    
    return(
        <div className="keyboard">
        {
            notes.map((note, index) => {
                const [name, frequency] = Object.entries(note)[0]
                return <button key={index} className='button' 
                onPointerDown={() => playNote(frequency)}
                onPointerUp={stop}
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