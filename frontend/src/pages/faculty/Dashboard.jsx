import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { api } from '../../services/api';
import { ClipboardCheck, Users, TrendingUp, ArrowUpRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const FacultyDashboard = () => {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadQueue = async () => {
            try {
                const data = await api.getFacultyQueue();
                setQueue(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadQueue();
    }, []);

    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            label: 'Claim Volume',
            data: [12, 19, 15, 25, 22, 10],
            borderColor: '#2563eb',
            borderWidth: 4,
            tension: 0.4,
            pointRadius: 0,
            fill: true,
            backgroundColor: 'rgba(37, 99, 235, 0.05)'
        }]
    };

    return (
        <Layout>
            <div className="space-y-10 animate-fade-in pb-20">
                {/* Faculty Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Pending Verification', value: queue.length, icon: <ClipboardCheck />, color: 'amber' },
                        { label: 'SLA Performance', value: '98%', icon: <TrendingUp />, color: 'emerald' },
                        { label: 'Active Students', value: '1,240', icon: <Users />, color: 'blue' }
                    ].map(s => (
                        <div key={s.label} className="glass-card p-8 group hover:-translate-y-1 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-4 bg-${s.color}-500/10 text-${s.color}-600 rounded-2xl`}>{s.icon}</div>
                                <ArrowUpRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </div>
                            <h4 className="text-4xl font-extrabold tracking-tighter mb-2">{s.value}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Queue Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold">Verification Queue</h3>
                            <Link to="/faculty/verify" className="text-blue-600 text-sm font-bold hover:underline">Full System View</Link>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)
                            ) : queue.length > 0 ? (
                                queue.slice(0, 5).map(claim => (
                                    <div key={claim.id} className="glass-card p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-400">
                                                ID
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-sm tracking-tight">Claim #{claim.id}</h5>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Score: <span className="text-emerald-500 font-bold">{claim.trustScore}</span> • {claim.date}
                                                </p>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/faculty/verify`}
                                            className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        >
                                            Verify
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center glass-card border-dashed">
                                    <p className="text-sm font-bold text-slate-400">All claims are currently processed.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Performance Analytics */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">Volume Trends</h3>
                        <div className="glass-card p-6 h-[300px]">
                            <Line data={chartData} options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } },
                                    y: { grid: { borderDash: [2, 2] }, ticks: { font: { size: 10, weight: 'bold' } } }
                                }
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FacultyDashboard;
