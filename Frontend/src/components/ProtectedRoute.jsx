import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading...</p>
                </div>
            </div>
        );
    }


    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }


    if (requiredRole && user?.role !== requiredRole) {

        const roleHierarchy = ['user', 'moderator', 'admin'];
        const userRoleIndex = roleHierarchy.indexOf(user?.role);
        const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
        
        if (userRoleIndex < requiredRoleIndex) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-zinc-900">
                    <div className="text-center">
                        <div className="text-6xl mb-4 text-red-500 font-bold">DENIED</div>
                        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                        <p className="text-zinc-400 mb-4">
                            You don't have permission to access this page.
                        </p>
                        <p className="text-sm text-zinc-500">
                            Required role: {requiredRole} | Your role: {user?.role}
                        </p>
                    </div>
                </div>
            );
        }
    }


    return children;
};

export default ProtectedRoute;