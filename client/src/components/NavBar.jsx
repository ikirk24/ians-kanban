import { Link, useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react';
import clickOutside from '../hooks/clickOutside.jsx';

const NavBar = () => {
    const navigate = useNavigate();
    const boxRef = useRef();
    const [visible, setVisible] = useState(false); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

     const togglePopup = () => {
        setVisible(!visible)
    }

    clickOutside(boxRef, () => {
        setVisible(false)
    })
    


     async function logout(e) {
        e.preventDefault();

        setLoading(true);
        setError('');

        const ok = window.confirm("Do you want to logout?")
        if (!ok) return;
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

    return (
        <>
        {error && <h1 className='text-9xl text-red-700'>{error}</h1>}

        {!error && 
    <div className='border-b-black border-b-2 p-2 w-full flex justify-between'>
        
        <p className='text-2xl'>Kirk's Kanban</p>
        
        <div>
            <input 
            type="text" 
            className='border-2 mr-4 rounded-md pl-2 pr-2 w-md'/>
            <button>Search</button>
        </div>

        <div className='flex pr-5'>
            <Link to='/profile' className='pr-5'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
            </Link>
        
            <p onClick={() => {setVisible(!visible) }} className='hover:cursor-pointer' >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            </p>
        </div>

        {visible &&
        
        <div className='w-1/6 bg-gray-700 absolute right-0 mt-10 h-1/5 rounded-lg' ref={boxRef}>
            <div className='p-4 text-gray-400 text-left text-2xl'>
            <p>Profile</p>
            <p>Update Profile</p>
            <button className='hover:cursor-pointer'
            onClick={logout} >Logout</button>
            </div>
        </div> }

    </div> }
    </>
  )
}

export default NavBar