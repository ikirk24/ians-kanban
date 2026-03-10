import React from "react";
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";

export default function ProfilePage() {
    
    const navigate = useNavigate(); 
    
    const [data, setData] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch('http://localhost:8080/board', {
            method: 'GET',
            credentials: 'include'
        }).then((res) => {
            if (!res.ok) throw new Error("not authorized")
            return res.json()
        }).then(data => 
            setData(data)
        ).catch(error => setError(error.message))
    }, [createBoard])
    
    
   
   
    async function selectBoard(e, boardId) {
        e.preventDefault();

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`http://localhost:8080/board/${boardId}`, {
                credentials: 'include'
            })

            let data = null;
            try {
                data = await res.json();
            } catch {
                data = null
            }

        if (!res.ok) { 
            throw new Error (data?.message || "Request failed")
        }

        navigate(`/board/${boardId}`)
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }


    async function logout(e) {
        e.preventDefault();

        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8080/user/logout', {
                method: 'POST',
                credentials: 'include'
            })

            let data = null;
          try {
            data = await res.json();
        } catch {
            data = null
        }

        if (!res.ok) {
            throw new Error (data?.message || "Request failed")
        }

        navigate('/')
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function createBoard (e) {
        e.preventDefault();

        setLoading(true);
        setError("");

        const body = {title, description}

        if (!title) throw new Error ("Title is required")
        try {
            const res = await fetch('http://localhost:8080/board', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body)
            })

            let boardData = null;

            try {
                boardData = await res.json()
            } catch {
                boardData = null;
            }

            if (!res.ok) throw new Error(boardData?.message || "Request failed")
        } catch (err) {
            setError(err.message || "Something went wrong")
            
        } finally {
            setLoading(false);
            setTitle("");
            setDescription("")
        }
    }

    async function deleteBoard (e, boardId) {
        e.preventDefault();

        setLoading(true)

        const ok = window.confirm("Are you sure you want to delete this board? This cannot be undone.")
        if(!ok) return;

        try {
            const res = await fetch(`http://localhost:8080/board/${boardId}`, {
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

            if (!res.ok) setError(data?.message || "Request failed")
        } catch (err) {
            setError(err);
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
    <div>
        <h1 className="text-lime-600 text-6xl">You have successfully logged in</h1>
        
        {error && <h1>{error}</h1>}

        {!error && 
        <>
        <h1 className="text-5xl mt-20 mb-5">Kanban Boards</h1>
        </>}

        {data && data.result.map((board) => (
            <div key={board.id}>
                <Link to={`/board/${board.id}`}>{board.title}</Link>
                <button onClick={(e) => deleteBoard(e, board.id)}>x</button>
            </div>
        ))}

        <form action="submit" onSubmit={createBoard}>
             
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
            disabled ={loading}> {loading ? "Loading..." : "Create Board"}</button>

        </form>
        <button onClick={logout} className="mt-10">Log Out</button>
    </div>

    )
}