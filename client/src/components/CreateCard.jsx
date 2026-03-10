import React, { useState } from 'react'

const CreateCard = ({boardId, columnId, onCreated}) => {
  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    
    async function create (e) {
        e.preventDefault();

        setError("");
        setLoading(true)
        const body = {title: title.trim(), description: title.trim()}

        try {
            if (!title.trim()) throw new Error ("Title is required")

            const res = await fetch(`http://localhost:8080/board/${boardId}/column/${columnId}/card`, {
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
           
        }
    }
  
    return (
    <> 
    {error && <p>{error}</p>}

    <form onSubmit={create}>
             
            <input 
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            
            <input type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)} 
            />

            <button type="submit" 
            disabled ={loading}> {loading ? "Loading..." : "Create Card"}</button>

        </form>
        </>
  )
}

export default CreateCard