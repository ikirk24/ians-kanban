import React from 'react'
import { useState } from 'react';

const PopUpForm = ({title, description, onTitleChange, onDescriptionChange, onSubmit}) => {
    
    const [visible, setVisible] = useState(false);

    const togglePopup = () => {
        setVisible(!visible)
    }
    
    return (

    <> 

        {visible && 
        <div className='fixed h-screen top-0 w-7/10 m-auto z-1000 bg-gray-500 backdrop-blur-2xl opacity-90'>
            <form 
            className='flex-col flex h-full w-full'
            onSubmit={onSubmit}>
                <input type="text"
                value={title} 
                placeholder='Title'
                onChange={onTitleChange}
                />
                
                <input 
                className='w-1/2'
                type="text"
                value={description}
                placeholder='Description'
                onChange={onDescriptionChange}
                />
                <button 
                className='w-1/8'
                type='submit' onSubmit={togglePopup}>Submit</button>
                <button 
                className='w-1/32'
                onClick={togglePopup}>x</button>
            </form>
        </div>
        }

        {!visible && 
        <button onClick={togglePopup}>Create New Board</button>}
    </>
  )
}

export default PopUpForm