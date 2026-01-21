import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { getItems } from '../../services/items.service';
import { useAuth } from '../../context/AuthContext';
import { FileText, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyActivity = () => {
    const [reports, setReports] = useState([]);
    const [claims, setClaims] = useState([]);
    const [activeTab, setActiveTab] = useState('reports');
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Fetch user's reports
                const allItems = await getItems();
                const userReports = allItems.filter(item => item.reportedBy?.uid === user?.uid);
                setReports(userReports);

                // Claims feature not implemented yet
                setClaims([]);
            } catch (err) {
                console.error('Activity error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        if (user?.uid) {
            loadData();
        }
    }, [user?.uid]);

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Your Activity</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Lifecycle Management</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            My Reports ({reports.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('claims')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'claims' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            My Claims ({claims.length})
                        </button>
                    </div>

                    {/* Content List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)
                        ) : activeTab === 'reports' ? (
                            reports.length > 0 ? reports.map(report => (
                                <Link to={`/student/items/${report.id}`} key={report.id} className="glass-card p-6 flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                            <FileText className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${report.type === 'lost' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                    {report.type}
                                                </span>
                                                <h4 className="font-extrabold text-sm uppercase tracking-tight">{report.title}</h4>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                                {report.location} • {report.createdAt?.toDate ? new Date(report.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${report.status === 'open' ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5' : 'border-slate-500/20 text-slate-500'
                                        }`}>
                                        {report.status}
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-20 text-center glass-card border-dashed">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No reports archived</p>
                                </div>
                            )
                        ) : (
                            claims.length > 0 ? claims.map(claim => (
                                <Link to={`/student/search`} key={claim.id} className="glass-card p-6 flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                            <MessageSquare className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-sm uppercase tracking-tight mb-1">Claim #{claim.id}</h4>
                                            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">TRUST LEVEL: {claim.trustScore} • {claim.date}</p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${claim.status === 'approved' ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5' :
                                        claim.status === 'pending' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' :
                                            'border-red-500/20 text-red-500 bg-red-500/5'
                                        }`}>
                                        {claim.status === 'approved' ? <CheckCircle size={12} /> : claim.status === 'pending' ? <Clock size={12} /> : <XCircle size={12} />}
                                        {claim.status}
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-20 text-center glass-card border-dashed">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active claims found</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MyActivity;
