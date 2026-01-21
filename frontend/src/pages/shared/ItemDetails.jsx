import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Calendar, MapPin, Tag, User,
    MessageCircle, Shield, ArrowLeft,
    CheckCircle, Clock, AlertTriangle, Send, Package
} from 'lucide-react';

const ItemDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClaiming, setIsClaiming] = useState(false);
    const [claimMessage, setClaimMessage] = useState('');
    const [showClaimModal, setShowClaimModal] = useState(false);

    useEffect(() => {
        const loadItem = async () => {
            try {
                const data = await api.getItemById(id);
                if (!data) return navigate(-1);
                setItem(data);
            } catch (err) {
                console.error(err);
                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        };
        loadItem();
    }, [id, navigate]);

    const handleClaim = async (e) => {
        e.preventDefault();
        setIsClaiming(true);
        try {
            await api.createClaim(id, {
                claimantId: user.id,
                message: claimMessage,
                trustScore: 75
            });
            setShowClaimModal(false);
            // Refresh item to show claimed status
            const updated = await api.getItemById(id);
            setItem(updated);
        } catch (err) {
            console.error(err);
        } finally {
            setIsClaiming(false);
        }
    };

    if (isLoading) return <Layout><div className="flex items-center justify-center h-full"><div className="spinner"></div></div></Layout>;

    if (!item) return <Layout><div className="flex items-center justify-center h-full"><p>Item not found</p></div></Layout>;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-all group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Search
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Visuals */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-4">
                            {item.images && item.images.length > 0 ? (
                                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover rounded-[1.5rem]" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center">
                                    <Package size={80} className="text-slate-400" />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-square bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'}`}>
                                    {item.type}
                                </span>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status === 'open' ? 'border-emerald-500 text-emerald-600 bg-emerald-500/5' : 'border-slate-400 text-slate-400'}`}>
                                    {item.status}
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold uppercase tracking-tighter mb-6">{item.title}</h1>
                            <p className="text-lg text-slate-500 leading-relaxed font-medium">{item.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {[
                                { icon: <MapPin className="text-blue-600" />, label: 'Location', value: item.location },
                                { icon: <Calendar className="text-amber-500" />, label: 'Reported Date', value: item.date },
                                { icon: <Tag className="text-emerald-500" />, label: 'Category', value: item.category },
                                { icon: <User className="text-indigo-500" />, label: 'Color Detail', value: item.color }
                            ].map((detail, idx) => (
                                <div key={idx} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                                        {detail.icon} {detail.label}
                                    </div>
                                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">{detail.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                            {user.role === 'student' && item.status === 'open' && (
                                <button
                                    onClick={() => setShowClaimModal(true)}
                                    className="btn btn-primary w-full py-5 text-lg font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20"
                                >
                                    Initiate Claim Request
                                </button>
                            )}

                            {item.status !== 'open' && (
                                <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Item Verification in Progress</h4>
                                        <p className="text-xs text-slate-500">This item is currently locked for review by campus security.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-1">Item Lifecycle</h4>
                            <div className="space-y-0 relative">
                                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
                                <div className="flex items-start gap-6 relative p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl">
                                    <div className="w-4 h-4 rounded-full bg-blue-600 mt-1 z-10 shadow-lg shadow-blue-500/50 ring-4 ring-white dark:ring-slate-900"></div>
                                    <div>
                                        <p className="text-sm font-bold">Reported on Campus</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">{item.date} • Security Checked</p>
                                    </div>
                                </div>
                                {item.status === 'claimed' && (
                                    <div className="flex items-start gap-6 relative p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl">
                                        <div className="w-4 h-4 rounded-full bg-amber-500 mt-1 z-10 shadow-lg shadow-amber-500/50 ring-4 ring-white dark:ring-slate-900"></div>
                                        <div>
                                            <p className="text-sm font-bold">Claim Verification Pending</p>
                                            <p className="text-[10px] text-slate-500 uppercase font-black">Today • Under Faculty Review</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Claim Modal */}
            {showClaimModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in" onClick={() => setShowClaimModal(false)}>
                    <div className="glass-card w-full max-w-lg p-10 animate-scale-up relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowClaimModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <ArrowLeft size={20} className="rotate-90" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Shield size={40} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Claim Verification</h3>
                            <p className="text-sm text-slate-500 font-medium">Please provide a detailed description of ownership to fast-track your approval.</p>
                        </div>

                        <form onSubmit={handleClaim} className="space-y-6">
                            <div className="space-y-2">
                                <label className="label">Ownership Proof / Details</label>
                                <textarea
                                    className="input w-full min-h-[120px] p-4 text-base"
                                    placeholder="e.g. Identity marks, unique contents, or serial numbers..."
                                    value={claimMessage}
                                    onChange={e => setClaimMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" disabled={isClaiming} className="btn btn-primary w-full py-4 text-lg font-black uppercase tracking-widest">
                                {isClaiming ? 'Processing Request...' : 'Submit Claim Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ItemDetails;
