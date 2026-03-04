import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import BoardPage from './pages/BoardPage.jsx'
import './App.css'

const router = createBrowserRouter([
    {path:'/', element: <HomePage mode = "login"/>},
    {path:'/signup', element: <HomePage mode = "signup"/>},
    {path:'/profile', element: <ProfilePage/>},
    {path:'/board/:boardId', element: <BoardPage/>}

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
