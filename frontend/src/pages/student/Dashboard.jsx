import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { getItems } from '../../services/items.service';
import { getMatchRecommendations } from '../../services/matching.service';
import { FileText, Zap, Shield, Search, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState([
        { label: 'My Reports', value: '0', icon: <FileText size={20} />, color: 'cyan' },
        { label: 'Total Items', value: '0', icon: <Search size={20} />, color: 'purple' },
        { label: 'Active', value: '0', icon: <Zap size={20} />, color: 'pink' },
    ]);
    const [matches, setMatches] = useState([]);
    const [recentItems, setRecentItems] = useState([]);
    const [myReports, setMyReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ['#06b6d4', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 10,
        }]
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch all items
                const allItems = await getItems({ status: 'active', limit: 50 });

                // Filter user's reports
                const userReports = allItems.filter(item => item.reportedBy?.uid === user?.uid);

                // Get recent items (not from current user)
                const othersItems = allItems.filter(item => item.reportedBy?.uid !== user?.uid).slice(0, 4);

                setMyReports(userReports);
                setRecentItems(othersItems);

                console.log('DEBUG DASHBOARD:', {
                    currentUser: user?.uid,
                    firstItemReporter: allItems[0]?.reportedBy,
                    isMatch: allItems[0]?.reportedBy?.uid === user?.uid,
                    allItemsCount: allItems.length,
                    userReportsCount: userReports.length
                });

                // Check for matches
                const recommendations = await getMatchRecommendations(2);
                setMatches(recommendations);

                // Calculate stats
                setStats([
                    { label: 'My Reports', value: userReports.length.toString(), icon: <FileText size={20} />, color: 'cyan' },
                    { label: 'Total Items', value: allItems.length.toString(), icon: <Search size={20} />, color: 'purple' },
                    { label: 'Active', value: allItems.filter(i => i.status === 'active').length.toString(), icon: <Zap size={20} />, color: 'pink' },
                ]);

                // Calculate category distribution for chart
                const categoryCounts = {};
                allItems.forEach(item => {
                    const cat = item.category || 'Other';
                    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                });

                const labels = Object.keys(categoryCounts);
                const data = Object.values(categoryCounts);

                if (labels.length > 0) {
                    setChartData({
                        labels,
                        datasets: [{
                            data,
                            backgroundColor: ['#06b6d4', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#ef4444'],
                            borderWidth: 0,
                            hoverOffset: 10,
                        }]
                    });
                }
            } catch (err) {
                console.error('Error loading dashboard data:', err);
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
            <div className="space-y-10 animate-fade-in">
                {/* Header with Refresh */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Dashboard</h2>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors border border-cyan-500/50"
                    >
                        Refresh Data
                    </button>
                </div>

                {/* Auto-Match Banner */}
                {matches.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 flex items-center justify-between gap-6 animate-pulse-slow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-amber-500">
                                    {matches.length} Possible {matches.length === 1 ? 'Match' : 'Matches'} Found
                                </h3>
                                <p className="text-slate-400 font-medium text-sm">
                                    We found items that similar to your lost report for <span className="text-white font-bold">"{matches[0].lostItem.title}"</span>.
                                </p>
                            </div>
                        </div>
                        <Link to={`/student/items/${matches[0].foundItem.id}`} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 whitespace-nowrap">
                            View Match
                        </Link>
                    </div>
                )}

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
                        {/* My Reports Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">My Recent Reports</h3>
                                <Link to="/student/report" className="text-cyan-400 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all hover:text-cyan-300">
                                    New Report <ArrowRight size={16} />
                                </Link>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[1, 2].map(i => <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>)}
                                </div>
                            ) : myReports.length === 0 ? (
                                <div className="glass-card p-8 text-center border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl">
                                    <FileText size={48} className="mx-auto mb-4 text-white/20" />
                                    <p className="text-white/60 font-medium">No reports yet</p>
                                    <Link to="/student/report" className="inline-block mt-4 px-6 py-2 bg-cyan-500 text-white rounded-xl font-bold text-sm hover:bg-cyan-600 transition-colors">
                                        Create Your First Report
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {myReports.slice(0, 4).map(item => (
                                        <div key={item.id} className="glass-card group overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl">
                                            <div className="h-32 bg-white/5 relative overflow-hidden">
                                                {item.images && item.images.length > 0 ? (
                                                    <img src={item.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
                                                        <FileText size={48} className="text-white/20" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                                                    {item.type}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h5 className="font-bold text-sm mb-1 truncate text-white">{item.title}</h5>
                                                <p className="text-xs text-white/40 flex items-center gap-1 truncate mb-2">
                                                    <Search size={12} className="text-cyan-400 flex-shrink-0" /> {item.location}
                                                </p>
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/30 border-t border-white/5 pt-2">
                                                    <span>{item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Recently'}</span>
                                                    <span className="text-cyan-400/80">You</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                    }
                                </div>
                            )}
                        </div>

                        {/* Recent Opportunities */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Recent Activities</h3>
                                <Link to="/student/search" className="text-cyan-400 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all hover:text-cyan-300">
                                    View All <ArrowRight size={16} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {isLoading ? (
                                    [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>)
                                ) : recentItems.length === 0 ? (
                                    <div className="col-span-2 glass-card p-8 text-center border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl">
                                        <Search size={48} className="mx-auto mb-4 text-white/20" />
                                        <p className="text-white/60 font-medium">No items available yet</p>
                                    </div>
                                ) : recentItems.map(item => (
                                    <div key={item.id} className="glass-card group overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl">
                                        <div className="h-32 bg-white/5 relative overflow-hidden">
                                            {item.images && item.images.length > 0 ? (
                                                <img src={item.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                                                    <FileText size={48} className="text-white/20" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-purple-400">
                                                {item.type}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h5 className="font-bold text-sm mb-1 truncate text-white">{item.title}</h5>
                                            <p className="text-xs text-white/40 flex items-center gap-1 truncate mb-2">
                                                <Search size={12} className="text-cyan-400 flex-shrink-0" /> {item.location}
                                            </p>
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/30 border-t border-white/5 pt-2">
                                                <span>{item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Recently'}</span>
                                                <span className="text-cyan-400/80">By {item.reportedBy?.name || 'User'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                {chartData.labels.length > 0 ? chartData.labels.map((l, i) => (
                                    <div key={l} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }}></div>
                                            <span className="font-bold text-white/60 uppercase tracking-tighter">{l}</span>
                                        </div>
                                        <span className="font-extrabold text-white">{chartData.datasets[0].data[i]} items</span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-white/40 text-center">No data yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout >
    );
};

export default StudentDashboard;
