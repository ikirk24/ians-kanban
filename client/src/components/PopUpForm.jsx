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
        <div className='fixed text-white inset-0 flex h-3/10 w-3/10 rounded-2xl items-center justify-center m-auto  bg-black backdrop-blur-3xl opacity-90'>
            <form 
            className='flex-col flex gap-4'
            onSubmit={onSubmit}>

                <h2 className='text-white text-2xl font-semibold'>Make a Board</h2>
               
                <input type="text"
                value={title} 
                placeholder='Title'
                onChange={onTitleChange}
                className='text-white rounded-md border border-gray-500 p-1'
                />
                
                <input 
                className='w-1/2 text-white rounded-md border border-gray-500 p-1'
                type="text"
                value={description}
                placeholder='Description'
                onChange={onDescriptionChange}
                />
            <div className='flex justify-end gap-6'>
                <button 
                type='button'
                className=' text-white px-4 py-2 hover:cursor-pointer'
                onClick={togglePopup}>Cancel
                </button>

                <button 
                className=' rounded-md px-4 py-2 hover:cursor-pointer'
                type='submit'>Submit
                </button>
                
               
                </div>
            </form>
        </div>
        }

        {!visible && 
        <button onClick={togglePopup} className='text-white border-b-black hover:cursor-pointer hover:text-gray-300'>Create New Board</button>}
    </>
  )
}

export default PopUpForm