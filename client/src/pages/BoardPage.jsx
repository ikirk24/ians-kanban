import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CreateCard from "../components/CreateCard.jsx";
import DeleteCard from "../components/DeleteCard.jsx";
import NavBar from "../components/NavBar.jsx";
import Card from "../components/Card.jsx";
import Column from "../components/Column.jsx";
import {DragDropProvider} from '@dnd-kit/react';
import {move} from '@dnd-kit/helpers';

export default function BoardPage () {
   
    const navigate = useNavigate(); 

    let {boardId} = useParams();
    
    const [columnData, setColumnData] = useState([]);
    const [cardData, setCardData] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const previousCards = useRef(cardData);
    const previousColumns = useRef(columnData);
    const originalColumnId = useRef(null);

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

async function moveColumn (columnId, position) {

    setLoading(true)
    const body = {title: null, position: position || null};

    try {
        const res = await fetch(`http://localhost:8080/board/${boardId}/column/${columnId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body)
        })

        let columnData = null; 

        try {
            columnData = await res.json(); 
        } catch {
            columnData = null;
        }

        if (!res.ok) throw new Error(columnData?.message || "Request failed")
    } catch (err) {
        setError(err.message || "Something went wrong")
    } finally {
        setLoading(false);
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

async function moveCard (oldColumnId, newColumnId, cardId, position) {
    
    setLoading(true);

    const body = {
        oldColumnId,
        newColumnId, 
        title: null, 
        description: null, 
        position
    }

    try {
        const res = await fetch(`http://localhost:8080/board/${boardId}/column/${oldColumnId}/card/${cardId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body)
        })

        let data = null;

        try {
            data = await res.json();
        } catch {
            data = null;
        }

        if (!res.ok) throw new Error(data?.message || "Request failed")
    } catch (err) {
        setError(err.message || "Something went wrong")
    } finally {
        setLoading(false);
    }
}


    const sortedColumns = [...columnData].sort((a,b) => a.position - b.position)
    // const sortedCards = [...cardData].sort((a,b) => a.position - b.position);
    return (
        <> 
        <NavBar/>
        {error && <h1>{error}</h1>}
        {loading && <h1>Loading...</h1>}
       
       <DragDropProvider 
            
            onDragStart={(event) => {
                previousCards.current = cardData;
                previousColumns.current = columnData;

                const { source } = event.operation;

                if (source.type === "item" ) { 
                    originalColumnId.current = Number(source.group)
                }
            }}

            onDragOver={(event) => {
                const {source, target} = event.operation;

                if (source?.type === 'column') return; 

                setCardData((cards) => move(cards, event));
            }}

            onDragEnd={async (event) => {
                const {source, target} = event.operation; 

                if(event.canceled) {
                     if (source.type === 'item') {
                        setCardData(previousCards.current)
                     } 
                     return;
                    } 
                
                if (source.type === 'column') {
                   const updatedColumns = move(columnData, event).map((column, index) => ({
                    ...column, 
                    position: index + 1
                   }));

                   setColumnData(updatedColumns)

                    await Promise.all(
                        updatedColumns.map((column) => 
                            moveColumn(column.id, column.position))
                   )
                } 

                if (source.type === "item") {
                    
                    const updatedCards = move(cardData, event);

                    setCardData(updatedCards);
                    const cardId = source.id;
                    const oldColumnId = Number(originalColumnId.current)
                    const newColumnId = source.group;
                    const newPosition = source.index + 1;

                    await moveCard(oldColumnId, newColumnId, cardId, newPosition)

                }
            }}
            >

       <div className="w-full flex-1 overflow-x-auto overflow-y-hidden h-[calc(100vh-64px)]">
            <div className="flex flex-row items-start pt-16 gap-16 px-8 min-w-max">
        { columnData && sortedColumns.map((col) => (
            <Column id={col.id} key={col.id} index={col.position} title={col.title}>
                {/* <button onClick={(e) => deleteColumn(e, col.id)}> x </button> */}

            {(cardData[col.id] ?? []).map((card, index) => (
                <Card id={card.id} index={index} key={card.id} column={col.id} onDelete={(e) => setRefreshKey(prevKey => prevKey + 1)} boardId={boardId} colId={col.id} title={card.title}/>

            ))}

        <CreateCard boardId={boardId} columnId={col.id} onCreated={(e) => setRefreshKey(prevKey => prevKey + 1)
        }/>     

           </Column>
        

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
        </DragDropProvider>


        
        
        </>
    )
}