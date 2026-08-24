import React, { useEffect } from 'react'

const Playbutton = props => {

 

    useEffect(() => {
        var playButton = document.getElementById('control');

        playButton.addEventListener('click', e => {
            e.preventDefault();
            playButton.classList.toggle('is--playing');
        });
    }, [])


    return (
       
            <div id="control">
                <div className="border"></div>
                <div className="play"></div>
                <button id="test1">channel</button>
            </div>
        
    )
}

export default Playbutton