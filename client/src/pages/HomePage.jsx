import React, {useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HomePage({
    mode = "login",  
    onSuccess,
    baseUrl = "http://localhost:8080"
    })
     
    {

    const isSignUp = mode === "signup"

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    
    async function handleSubmit (e) {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = isSignUp ? "/user/signup" : "/user"
            const url = `${baseUrl}${endpoint}`

            const body = {username, password}

            if(!username || !password) throw new Error ("Username and password are required");

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(body)
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

            onSuccess?.data;
            !isSignUp ? navigate('/profile') : navigate('/')
        } catch(err) {
            setError(err.message || "Something went wrong")
        } finally {
            setLoading(false);
            setUsername("")
            setPassword("")
        }
    }
    
    return (
        <>
        <h1 className="text-white absolute">KANBAN DEMO BY IAN KIRK</h1>
        <div class="homeContainer">
            <form onSubmit={handleSubmit}>
            <h1 class='text-blue-400 text-3xl pb-5' >{isSignUp ? "Sign up" : "Log in"}</h1>
                
                <input 
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />

                <br />

                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                 />

                <br />
                
                <button 
                className="w-2xs mb-4"
                type="submit"
                disabled={loading}>
                    {loading ? "Please wait..." : isSignUp ? "Create Account" : "Log in"}
                </button>

                {isSignUp ? <p> Already have an account? <Link to="/" className="text-blue-500" onClick={() => setError(null)}>Sign in</Link></p> : 
                <p> Don't have an account yet? <Link to="/signup" className="text-blue-500" onClick={() => setError(null)}>Sign Up</Link></p>}

                {error && <p>{error}</p>}
            </form>
        </div>
        </>
    )
}
