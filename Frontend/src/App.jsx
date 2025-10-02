import { useState } from 'react'
import {NavLink, BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import Dashboard from './Pages/Dashboard';
import NavBar from './Components/NavBar';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <NavBar />
          <div className="fixed ml-30 w-333 h-[calc(100vh-1rem)] bg-black border border-zinc-700 rounded mt-2 mr-2 p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
      </BrowserRouter>
    </>
  )
}

export default App;

