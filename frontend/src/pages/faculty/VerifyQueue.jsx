import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { api } from '../../services/api';
import {
    Check, X, MessageSquare, AlertCircle,
    ChevronRight, ArrowRight, Shield, User
} from 'lucide-react';

const VerifyQueue = () => {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [note, setNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const loadQueue = async () => {
        setIsLoading(true);
        try {
            const data = await api.getFacultyQueue();
            setQueue(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadQueue();
    }, []);

    const handleVerify = async (status) => {
        if (!selectedClaim) return;
        setIsProcessing(true);
        try {
            await api.verifyClaim(selectedClaim.id, { status, note });
            setSelectedClaim(null);
            setNote('');
            await loadQueue();
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in pb-20">
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Active Verifications</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                            {queue.length} Pending Approval Processes
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-280px)]">
                    {/* List Area */}
                    <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl animate-pulse"></div>)
                        ) : queue.length > 0 ? (
                            queue.map(claim => (
                                <div
                                    key={claim.id}
                                    onClick={() => setSelectedClaim(claim)}
                                    className={`glass-card p-6 flex items-center justify-between cursor-pointer transition-all border-2 ${selectedClaim?.id === claim.id ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-600/5' : 'border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-slate-400">
                                            {claim.id.split('-')[1]}
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-sm uppercase tracking-tight mb-1">Claim #{claim.id}</h4>
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${claim.trustScore}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-black tracking-widest text-slate-400">SCORE: {claim.trustScore}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className={selectedClaim?.id === claim.id ? 'text-blue-600' : 'text-slate-300'} />
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                                <Shield size={48} className="mb-4 opacity-50" />
                                <p className="font-bold uppercase tracking-widest text-xs">Clear Workspace Protocol</p>
                            </div>
                        )}
                    </div>

                    {/* Detail/Verification Area */}
                    <div className="glass-card flex flex-col overflow-hidden relative">
                        {selectedClaim ? (
                            <div className="flex-1 flex flex-col">
                                <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-black uppercase tracking-tight">Review Claim</h3>
                                            <p className="text-[10px] font-black text-slate-500 tracking-widest">SUBMITTED ON {selectedClaim.date}</p>
                                        </div>
                                        <div className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl">
                                            <User size={24} />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl space-y-4">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Claimant Statement</h5>
                                        <p className="text-sm font-medium leading-relaxed italic text-slate-700 dark:text-slate-300">
                                            "{selectedClaim.messages[0]?.text}"
                                        </p>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 overflow-y-auto">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Adjudication Notes</h5>
                                    <textarea
                                        className="input w-full min-h-[140px] p-4 text-sm"
                                        placeholder="Add private faculty notes or instructions for the student..."
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                    />
                                </div>

                                <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                                    <button
                                        onClick={() => handleVerify('rejected')}
                                        disabled={isProcessing}
                                        className="btn bg-white dark:bg-slate-800 text-red-500 border border-red-500/20 px-8 py-3 font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10"
                                    >
                                        <X size={18} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleVerify('approved')}
                                        disabled={isProcessing}
                                        className="btn btn-primary flex-1 py-4 font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
                                    >
                                        <Check size={20} /> Approve Claim
                                    </button>
                                </div>

                                {isProcessing && (
                                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-[2rem]">
                                        <div className="spinner"></div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                    <MessageSquare size={40} className="opacity-20" />
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-tight mb-2">Workspace Idle</h4>
                                <p className="text-sm font-medium max-w-xs px-8">Select a claim from the queue to start the verification protocol.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default VerifyQueue;
