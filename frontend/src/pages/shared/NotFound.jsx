import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-red-500/10 animate-bounce">
                <AlertCircle size={48} />
            </div>
            <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">404</h1>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">The page has been misplaced.</h2>
            <p className="text-slate-500 mb-12 max-w-sm font-medium">It looks like the resource you are searching for doesn't exist in our portal. Like most lost items, it might be in our database—but not here.</p>
            <Link to="/" className="btn btn-primary px-10 py-4 flex items-center gap-3">
                <ArrowLeft size={20} /> Return to Safety
            </Link>
        </div>
    );
};

export default NotFound;
