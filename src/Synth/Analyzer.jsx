import React, { useRef, useEffect } from 'react'

const Analyzer = ({audioData, timer}) => {
    const canvas = useRef()
    
    const draw = () => {
        const height = canvas.current.height
        const width = canvas.current.width
        const context = canvas.current.getContext('2d')
        let x = 0
        const sliceWidth = (width * 1.0) / audioData.length
        context.lineWidth = 2;
        context.strokeStyle = "#BCEDF6";
        context.clearRect(0, 0, width, height);
        context.beginPath();
        context.moveTo(0, height / 2);
        for (const item of audioData) {
            const y = (item / 255.0) * height;
            context.lineTo(x, y);
            x += sliceWidth;
          }
          context.lineTo(x, height / 2);
          context.stroke();
    }
    

    useEffect(() => {
        draw()
    }, [timer] )
    

    return (
        <>
            <canvas width="300px" height="300px" ref={canvas} />
        </>
    )
}

export default Analyzer