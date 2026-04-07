import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CreateCard from "../components/CreateCard.jsx";
import DeleteCard from "../components/DeleteCard.jsx";
import NavBar from "../components/NavBar.jsx";

export default function BoardPage () {
   
    const navigate = useNavigate(); 

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
        const body = {title: title.trim()}

        try {

            if (!title.trim()) throw new Error ("Title is required")

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
   
async function deleteColumn(e, columnId) {
        e.preventDefault();

        setLoading(true)

        try {


            const res = await fetch(`http://localhost:8080/board/${boardId}/column/${columnId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            })

            let data = null;

            try {
                data = await res.json()
            } catch {
                data = null;
            }

            if (!res.ok) throw new Error(data?.message || "Request failed")
        } catch (err) {
            setError(err.message || "Something went wrong")
            
        } finally {
            setLoading(false);
            setRefreshKey(prevKey => prevKey + 1)
        }
    }


    const sortedColumns = [...columnData].sort((a,b) => a.position - b.position)
    // const sortedCards = [...cardData].sort((a,b) => a.position - b.position);
    return (
        <> 
        <NavBar/>
        {error && <h1>{error}</h1>}
        {loading && <h1>Loading...</h1>}
       <div className="w-full overflow-x-auto overflow-y-hidden ml-10">
            <div className="flex flex-row items-start pt-16 gap-16 min-w-max">
        { columnData && sortedColumns.map((col) => (
            <div key={col.id} className="border-2 rounded-2xl bg-black opacity-75 w-1/6"> 
                <h1 className="text-xl text-left pl-4  font-bold text-gray-100">{col.title}</h1>
                {/* <button onClick={(e) => deleteColumn(e, col.id)}> x </button> */}

            {(cardData[col.id] ?? []).map((card) => (
                <div key={card.id} className="flex justify-between text-gray-300 pl-2 mt-2 ml-2 mr-2 bg-gray-900 rounded-md p-1 text-lg text-left ">
                    <p className="">{card.title}</p>
                    <DeleteCard boardId={boardId} columnId={col.id} cardId={card.id} onDelete={(e) => setRefreshKey(prevKey => prevKey + 1)}/>
                </div>

            ))}

        <CreateCard boardId={boardId} columnId={col.id} onCreated={(e) => setRefreshKey(prevKey => prevKey + 1)
}/>     

           </div>

        ))}
        <form action="submit" onSubmit={createColumn} className="border-2 rounded-2xl bg-gray-500 opacity-75 w-1/6">
             
            <input 
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <button type="submit"
            disabled ={loading}> {loading ? "Loading..." : "Create Column"}</button>

        </form>
        </div>
            </div>

        
        
        </>
    )
}