import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { api } from '../../services/api';
import { FileText, Zap, Shield, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StudentDashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Reports', value: '12', icon: <FileText size={20} />, color: 'cyan' },
        { label: 'Matches', value: '15', icon: <Zap size={20} />, color: 'purple' },
        { label: 'Trust Score', value: '740', icon: <Shield size={20} />, color: 'pink' },
    ]);
    const [recentItems, setRecentItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const items = await api.getItems();
                setRecentItems(items.slice(0, 4));
                // In a real app, we'd fetch actual stats too
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const chartData = {
        labels: ['Bags', 'Tech', 'IDs', 'Keys'],
        datasets: [{
            data: [12, 19, 3, 5],
            backgroundColor: ['#06b6d4', '#a855f7', '#ec4899', '#10b981'],
            borderWidth: 0,
            hoverOffset: 10,
        }]
    };

    return (
        <Layout>
            <div className="space-y-10 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map(s => (
                        <div key={s.label} className="glass-card p-8 flex items-center gap-6 group hover:-translate-y-2 hover:shadow-cyan-500/10 transition-all border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl">
                            <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform ${s.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                                    s.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                                        'bg-pink-500/20 text-pink-400'
                                }`}>
                                {s.icon}
                            </div>
                            <div>
                                <h4 className="text-3xl font-extrabold text-white tracking-tight">{s.value}</h4>
                                <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Recent Opportunities</h3>
                            <Link to="/student/search" className="text-cyan-400 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all hover:text-cyan-300">
                                View Search <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isLoading ? (
                                [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>)
                            ) : recentItems.map(item => (
                                <Link to={`/student/items/${item.id}`} key={item.id} className="glass-card group overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl">
                                    <div className="h-32 bg-white/5 relative overflow-hidden">
                                        <img src={item.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                                            {item.type}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h5 className="font-bold text-sm mb-1 truncate text-white">{item.title}</h5>
                                        <p className="text-xs text-white/40 flex items-center gap-1">
                                            <Search size={12} className="text-cyan-400" /> {item.location} • {item.date}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Analytics */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white">Insights</h3>
                        <div className="glass-card p-6 border border-white/10 bg-white/5 backdrop-blur-xl rounded-3xl flex flex-col items-center justify-center min-h-[300px]">
                            <div className="w-48 h-48 mb-6">
                                <Doughnut
                                    data={chartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false }
                                        },
                                        cutout: '75%'
                                    }}
                                />
                            </div>
                            <div className="w-full space-y-3">
                                {chartData.labels.map((l, i) => (
                                    <div key={l} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }}></div>
                                            <span className="font-bold text-white/60 uppercase tracking-tighter">{l}</span>
                                        </div>
                                        <span className="font-extrabold text-white">{chartData.datasets[0].data[i]}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentDashboard;
