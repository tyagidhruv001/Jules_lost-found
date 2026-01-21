import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    Home, Search, PlusCircle, User, ShieldCheck, Shield,
    LogOut, Sun, Moon, Bell, Menu, X
} from 'lucide-react';

export const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const studentLinks = [
        { to: '/student/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
        { to: '/student/search', icon: <Search size={20} />, label: 'Search' },
        { to: '/student/report', icon: <PlusCircle size={20} />, label: 'Report' },
        { to: '/student/activity', icon: <User size={20} />, label: 'My Activity' },
        { to: '/student/profile', icon: <Shield size={20} />, label: 'My Profile' },
    ];

    const facultyLinks = [
        { to: '/faculty/dashboard', icon: <Home size={20} />, label: 'Overview' },
        { to: '/faculty/verify', icon: <ShieldCheck size={20} />, label: 'Verify Queue' },
        { to: '/faculty/items-queue', icon: <User size={20} />, label: 'Items Queue' },
        { to: '/faculty/search', icon: <Search size={20} />, label: 'Search All' },
        { to: '/faculty/profile', icon: <Shield size={20} />, label: 'My Profile' },
    ];

    const links = user.role === 'student' ? studentLinks : facultyLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gradient-radial from-gray-800 via-gray-900 to-[#0b0f1a] text-white overflow-hidden relative">
            {/* Animated Background Blurs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
            </div>
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-72 bg-white/5 backdrop-blur-xl border-r border-white/10 z-50">
                <div className="p-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                        <Shield size={24} />
                    </div>
                    <div>
                        <span className="block font-black text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">GLA PORTAL</span>
                        <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Integrated Asset Logic</span>
                    </div>
                </div>

                <nav className="flex-1 px-6 py-4 space-y-2 custom-scrollbar overflow-y-auto">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${isActive
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 translate-x-1'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={isActive ? 'text-white' : 'text-cyan-400'}>{link.icon}</span>
                                    {link.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-8 border-t border-white/10 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        {user?.profilePhotoUrl ? (
                            <img src={user.profilePhotoUrl} className="w-10 h-10 rounded-xl object-cover" alt={user?.name || 'User'} />
                        ) : (
                            <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0ea5e9&color=fff&bold=true`} className="w-10 h-10 rounded-xl" alt="" />
                        )}
                        <div className="flex-1 overflow-hidden">
                            <h4 className="font-black text-xs uppercase tracking-tight truncate text-white">{user?.name || 'Unknown User'}</h4>
                            <p className="text-[9px] text-cyan-400 font-black uppercase tracking-widest mt-0.5">{user?.role || 'Guest'}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-6 py-3 w-full text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut size={16} /> Logout Protocol
                    </button>
                </div>
            </aside>

            {/* Mobile Nav Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 flex items-center justify-between z-40">
                <div className="font-black text-sm uppercase tracking-widest text-cyan-400">GLA PORTAL</div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-white/5 rounded-xl text-white">
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in" onClick={() => setIsSidebarOpen(false)}>
                    <div className="w-80 bg-slate-900 border-l border-white/10 h-full p-10 animate-slide-left shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-12 text-white">
                            <span className="font-black text-xs uppercase tracking-widest text-white/60">Navigation Hub</span>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={24} /></button>
                        </div>
                        <nav className="space-y-4">
                            {links.map(link => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${isActive
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl'
                                            : 'text-white/40'
                                        }`
                                    }
                                >
                                    {link.icon} {link.label}
                                </NavLink>
                            ))}
                        </nav>
                        <div className="absolute bottom-12 left-10 right-10 space-y-4">
                            <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-6 py-4 w-full text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-500/10 rounded-2xl">
                                <LogOut size={18} /> Termination
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto lg:pt-0 pt-16 flex flex-col relative custom-scrollbar z-10">
                {/* Header - Desktop Only */}
                <header className="hidden lg:flex h-24 px-12 items-center justify-between sticky top-0 bg-black/10 backdrop-blur-lg z-30">
                    <div>
                        <h2 className="font-black text-sm uppercase tracking-[0.2em] text-white/40">Protocol Layer</h2>
                        <h3 className="font-black text-lg uppercase tracking-tight text-white mt-1">
                            {links.find(l => window.location.pathname.includes(l.to))?.label || 'Overview Area'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3.5 bg-white/5 border border-white/10 rounded-2xl shadow-sm relative hover:scale-105 active:scale-95 transition-all text-cyan-400">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-cyan-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
                        </button>
                        <div className="h-10 w-[1px] bg-white/10 mx-2"></div>
                        <div className="flex items-center gap-3 pl-2 text-white">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-tight text-white">{user?.name || 'User'}</p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-cyan-400">ID: {user?.identifier?.slice(-4) || '....'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-black">
                                {user?.name?.charAt(0) || '?'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 px-6 lg:px-12 py-10 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};
