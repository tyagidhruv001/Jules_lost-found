import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { api } from '../../services/api';
import {
    Search, Filter, MoreVertical, Edit,
    Trash2, ExternalLink, ShieldCheck
} from 'lucide-react';

const FacultyItemsQueue = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadItems = async () => {
            try {
                const data = await api.getItems();
                setItems(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadItems();
    }, []);

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in pb-20">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Master Items Repository</h2>
                    <div className="flex gap-4">
                        <div className="relative group lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input type="text" placeholder="Global search..." className="input w-full pl-12 bg-white dark:bg-slate-900 border-none shadow-sm" />
                        </div>
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="px-8 py-4">Item Identity</th>
                                    <th className="px-8 py-4">Current Status</th>
                                    <th className="px-8 py-4">Temporal Mark</th>
                                    <th className="px-8 py-4">Custodian</th>
                                    <th className="px-8 py-4 text-right">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => <tr key={i}><td colSpan="5" className="px-8 py-6 animate-pulse bg-slate-50/50 dark:bg-slate-900/50"></td></tr>)
                                ) : items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-sm tracking-tight">{item.title}</h5>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{item.category} • {item.location}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.status === 'open' ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5' :
                                                    item.status === 'claimed' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' :
                                                        'border-slate-400 text-slate-400 bg-slate-500/5'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-xs text-slate-500">{item.date}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Security Team</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right space-x-2">
                                            <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-white transition-all">
                                                <ShieldCheck size={18} />
                                            </button>
                                            <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-white transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FacultyItemsQueue;
