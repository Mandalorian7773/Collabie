import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const NavBar = () => {
    const location = useLocation();
    
    return (
        <>
            <nav className="fixed bg-black p-4 h-screen w-30 absolute left-0 top-0 flex flex-col items-center">
                <div className="text-white font-bold text-xl mb-8">
                    <h1>Collabie</h1>
                </div>
                
                <div className="flex flex-col space-y-6">
                    <Link 
                        to="/dashboard" 
                        className={`p-2 rounded-lg ${location.pathname === '/dashboard' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                        title="Dashboard"
                    >
                        <div className="w-6 h-6 flex items-center justify-center">
                            🏠
                        </div>
                    </Link>
                    
                    <Link 
                        to="/servers" 
                        className={`p-2 rounded-lg ${location.pathname.startsWith('/server') || location.pathname === '/servers' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
                        title="Servers"
                    >
                        <div className="w-6 h-6 flex items-center justify-center">
                            🏢
                        </div>
                    </Link>
                </div>
            </nav>
        </>
    )
}

export default NavBar;