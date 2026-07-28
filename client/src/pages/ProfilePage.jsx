import React from "react";
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import PopUpForm from "../components/PopUpForm.jsx";
import NavBar from "../components/NavBar.jsx";
export default function ProfilePage() {
    
    const navigate = useNavigate(); 
    
    const [data, setData] = useState("");
    const [username, setUsername] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
  

    useEffect(() => {
        fetch('http://localhost:8080/board', {
            credentials: 'include'
        }).then((res) => {
            if (!res.ok) throw new Error("not authorized")
            return res.json()
        }).then(data => 
            setData(data)
        ).catch(error => setError(error.message))
    }, [createBoard])
    
    useEffect(() => {
        fetch(`http://localhost:8080/user`, {
            credentials: 'include'
        }).then((res) => {
            if (!res.ok) throw new Error("not authorized")
            return res.json()
        }).then(data => setUsername(data.result.username)
        ).catch(error => setError(error.message))
    }, [])
   
   
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

        try {
        if (!title) throw new Error ("Title is required")

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
        
        {error && <h1>{error}</h1>}

        {!error && 
        <>
        <NavBar/>
        <div className="flex flex-col items-center" >
            <h1 className="text-5xl mt-20 mb-5 border-2 w-xl p-10 rounded-2xl text-white">
            {username}'s Kanban Boards
            </h1>
         <div className="w-2xl mt-10 grid gap-4 grid-cols-3">
            {data && data.result.map((board) => (
                    <Link to={`/board/${board.id}`} key={board.id}
                    className=" bg-amber-600 rounded-2xl border-3 mb-10 h-24 w-full   text-blue-200 text-2xl  justify-center">
                        <p className=" rounded-t-xl  bg-gray-600">{board.title}</p>
                    </Link>
            ))}
        </div>   
        <PopUpForm 
        title={title}
        description={description}
        onTitleChange={(e) => setTitle(e.target.value)}
        onDescriptionChange={(e) => setDescription(e.target.value)}
        onSubmit={createBoard}
        />

        {/* <form action="submit" onSubmit={createBoard}>
             
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
            disabled ={loading}> {loading ? "Loading..." : "Create Board"}</button> */}

        {/* </form> */}
        <button onClick={logout} className="mt-10 text-white hover:cursor-pointer hover:text-gray-300">Log Out</button>
        </div> 
        </>
        }

    </div>


    )
}