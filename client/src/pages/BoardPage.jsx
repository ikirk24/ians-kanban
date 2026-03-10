import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CreateCard from "../components/CreateCard.jsx";

export default function BoardPage () {
   
    let {boardId} = useParams();
    
    const [columnData, setColumnData] = useState([]);
    const [cardData, setCardData] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    
    useEffect(() => {

        const fetchColumn = async () => {
            
            try {
            
            setLoading(true)
            setError("")
            
            const colRes = await fetch(`http://localhost:8080/board/${boardId}/column`, {
            credentials: 'include'
            });
            
            if (!colRes.ok) throw new Error("not authorized");
            const colData = await colRes.json()
            setColumnData(colData.columns);

            const columnCards = await Promise.all(
                colData.columns.map(async (col) => {
                
                    const res = await fetch(`http://localhost:8080/board/${boardId}/column/${col.id}/card`, {
                    credentials: 'include'
                    });

                    if (!res.ok) throw new Error ("not authorized");
                    const data = await res.json();
                    const cards = data.result
                    return [col.id, cards];
                })
            );
            setCardData(Object.fromEntries(columnCards))
            } catch (err) {
                console.error(err)
                setError(err.message)
                setColumns([])
                setCardData({})
            }finally {
                setLoading(false)
            } 
        }
        
        fetchColumn();
        
        
}, [refreshKey])

async function createColumn (e) {
        e.preventDefault();

        setError("");
        setLoading(true)
        const body = {title}

        if (!title) throw new Error ("Title is required")
        try {
            const res = await fetch(`http://localhost:8080/board/${boardId}/column`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body)
            })

            let columnData = null;

            try {
                columnData = await res.json()
            } catch {
                columnData = null;
            }

            if (!res.ok) throw new Error(columnData?.message || "Request failed")
        } catch (err) {
            setError(err.message || "Something went wrong")
            
        } finally {
            setLoading(false);
            setTitle("");
            setRefreshKey(prevKey => prevKey + 1)
        }
    }
   




    return (
        <> 
        {error && <h1>{error}</h1>}
        {loading && <h1>Loading...</h1>}
        { columnData && columnData.map((col) => (
            <div key={col.id}> 
                <h1 className="text-4xl text-blue-700">{col.title}</h1>

            {(cardData[col.id] ?? []).map((card) => (
                <div key={card.id}>
                    <p>{card.title}</p></div>
            ))}

        <CreateCard boardId={boardId} columnId={col.id} onCreated={(e) => setRefreshKey(prevKey => prevKey + 1)
}/>

           
            </div>

        ))}

        
        <form action="submit" onSubmit={createColumn}>
             
            <input 
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <button type="submit"
            disabled ={loading}> {loading ? "Loading..." : "Create Column"}</button>

        </form>

    
        </>
    )
}