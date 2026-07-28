import React, { useState, useRef, useEffect} from 'react'
import clickOutside from '../hooks/clickOutside.jsx';

const CreateCard = ({boardId, columnId, onCreated}) => {
  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visible, setVisible] = useState(false);
    const boxRef = useRef(null)
    const inputRef = useRef(null);

    
    async function create (e) {
        const API_URL = import.meta.env.VITE_API_URL;

        e.preventDefault();

        setError("");
        setLoading(true)
        const body = {title: title.trim(), description: description.trim()}

        try {
            if (!title.trim()) throw new Error ("Title is required")

            const res = await fetch(`${API_URL}/board/${boardId}/column/${columnId}/card`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body)
            })

            let cardData = null;

            try {
                cardData = await res.json()
            } catch {
                cardData = null;
            }

            if (!res.ok) throw new Error(cardData?.message || "Request failed")
            
            setTitle("");
            setDescription("")

            onCreated?.();
            
        } catch (err) {
            setError(err.message || "Something went wrong")
            
        } finally {
            setLoading(false);
            setVisible(false)
        }
    }

    useEffect(() => {
        if (visible) {
            inputRef.current?.focus();
            setError("")
        }
     }, [visible])
    
    clickOutside(boxRef, () => {
        setVisible(false);
    });
   
  
    return (
    <> 
    {error && <p className='text-white'>{error}</p>}
    
    { !visible && 
        <button className='text-gray-400 w-13/14 rounded-md mt-2 mb-2 p-1  text-left hover:bg-gray-700 hover:opacity-60 hover:text-white cursor-pointer'
        onClick={() => {setVisible(true)}}>
        + Add Card
        </button>
    
    }
    
    {visible && 
    <form onSubmit={create} className='m-4 flex flex-col' ref={boxRef}>
             
            <input 
                type="text"
                placeholder="Enter a card title..."
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='placeholder:text-gray-300 placeholder:text-left border-2 border-white pb-6 rounded-md pl-2 overflow-clip text-white w-13/14 '
            />
            
            <button type="submit" 
            className=' bg-blue-600 rounded-md p-1 mt-2 w-1/3 text-white hover:cursor-pointer hover:bg-blue-800'
            disabled ={loading}> {loading ? "Loading..." : "Add card"}</button>

        </form>
    }
        </>
  )
}

export default CreateCard