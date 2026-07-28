import React from 'react'
import { useState } from 'react';
const DeleteCard = ({boardId, columnId, cardId, onDelete}) => {
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;
    
    async function deleteC(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/${boardId}/column/${columnId}/card/${cardId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            })

            let data = null

            try {
                data = await res.json();
            } catch {
                data = null
            }

            if (!res.ok) throw new Error (data?.message || "Request failed")

            onDelete?.();
        } catch (err) {
        setError(err)
        console.error(err)
        } finally {
            setLoading(false)
        }
    }
    return (
    <>
    {error && <p>{error}</p>}

    <button onClick={deleteC} disabled ={loading}>
        x
    </button>
    </>
  )
}

export default DeleteCard