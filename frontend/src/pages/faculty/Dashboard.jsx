import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { getItems } from '../../services/items.service';
import { getPendingClaims } from '../../services/firestore.service';
import { getMatchRecommendations } from '../../services/matching.service';
import MatchCard from '../../components/faculty/MatchCard';
import {
    ClipboardCheck, Users, TrendingUp, ArrowUpRight, MessageCircle,
    FileText, Clock, AlertCircle, Package, MapPin, Eye, ChevronRight, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

const FacultyDashboard = () => {
    const [allReports, setAllReports] = useState([]);
    const [pendingClaims, setPendingClaims] = useState([]);
    const [potentialMatches, setPotentialMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        resolved: 0,
        pendingClaims: 0,
        lostItems: 0,
        foundItems: 0,
        potentialMatches: 0
    });
    const [trendData, setTrendData] = useState({
        labels: [],
        datasets: []
    });
    const [categoryData, setCategoryData] = useState({
        labels: [],
        datasets: []
    });
    const [quickActions, setQuickActions] = useState({
        oldActiveItems: [],
        urgentClaims: []
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load items, claims, and matches
                const [items, claims, matches] = await Promise.all([
                    getItems(),
                    getPendingClaims(),
                    getMatchRecommendations(5)
                ]);

                setAllReports(items);
                setPendingClaims(claims);
                setPotentialMatches(matches);

                // Calculate comprehensive stats
                const lostItems = items.filter(i => i.type === 'lost');
                const foundItems = items.filter(i => i.type === 'found');

                setStats({
                    total: items.length,
                    active: items.filter(i => i.status === 'active').length,
                    resolved: items.filter(i => i.status === 'resolved' || i.status === 'claimed').length,
                    pendingClaims: claims.length,
                    lostItems: lostItems.length,
                    foundItems: foundItems.length,
                    potentialMatches: matches.length
                });

                // Calculate reports per day for trend chart (last 7 days)
                const last7Days = [];
                const today = new Date();
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    last7Days.push(date);
                }

                const labels = last7Days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));
                const lostData = last7Days.map(date => {
                    return lostItems.filter(item => {
                        const itemDate = item.createdAt?.toDate?.() || new Date(0);
                        return itemDate.toDateString() === date.toDateString();
                    }).length;
                });
                const foundData = last7Days.map(date => {
                    return foundItems.filter(item => {
                        const itemDate = item.createdAt?.toDate?.() || new Date(0);
                        return itemDate.toDateString() === date.toDateString();
                    }).length;
                });

                setTrendData({
                    labels,
                    datasets: [
                        {
                            label: 'Lost Items',
                            data: lostData,
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            fill: true
                        },
                        {
                            label: 'Found Items',
                            data: foundData,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            fill: true
                        }
                    ]
                });

                // Category breakdown
                const categoryCount = {};
                items.forEach(item => {
                    const cat = item.category || 'Other';
                    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                });

                const categoryLabels = Object.keys(categoryCount);
                const categoryValues = Object.values(categoryCount);
                const backgroundColors = [
                    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
                    '#10b981', '#06b6d4', '#ef4444', '#6366f1'
                ];

                setCategoryData({
                    labels: categoryLabels,
                    datasets: [{
                        data: categoryValues,
                        backgroundColor: backgroundColors.slice(0, categoryLabels.length),
                        borderWidth: 0
                    }]
                });

                // Quick actions - old active items (>7 days)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const oldActive = items.filter(item => {
                    const itemDate = item.createdAt?.toDate?.() || new Date();
                    return item.status === 'active' && itemDate < sevenDaysAgo;
                });

                // Urgent claims (>24 hours old)
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                const urgent = claims.filter(claim => {
                    const claimDate = claim.createdAt?.toDate?.() || new Date();
                    return claimDate < oneDayAgo;
                });

                setQuickActions({
                    oldActiveItems: oldActive.slice(0, 3),
                    urgentClaims: urgent.slice(0, 3)
                });

            } catch (err) {
                console.error('Faculty dashboard error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const formatDate = (date) => {
        if (!date) return 'Recently';
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Layout>
            <div className="space-y-10 animate-fade-in pb-20">
                {/* Faculty Stats - Enhanced */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                        {
                            label: 'Total Reports',
                            value: stats.total.toString(),
                            icon: <FileText />,
                            color: 'blue',
                            subtext: `${stats.lostItems} lost, ${stats.foundItems} found`
                        },
                        {
                            label: 'Active Items',
                            value: stats.active.toString(),
                            icon: <ClipboardCheck />,
                            color: 'amber',
                            subtext: 'Awaiting resolution'
                        },
                        {
                            label: 'Resolved',
                            value: stats.resolved.toString(),
                            icon: <TrendingUp />,
                            color: 'emerald',
                            subtext: `${Math.round((stats.resolved / stats.total) * 100) || 0}% success rate`
                        },
                        {
                            label: 'Pending Claims',
                            value: stats.pendingClaims.toString(),
                            icon: <AlertCircle />,
                            color: 'purple',
                            subtext: 'Need verification'
                        },
                        {
                            label: 'Potential Matches',
                            value: stats.potentialMatches.toString(),
                            icon: <Sparkles />,
                            color: 'pink',
                            subtext: 'High confidence'
                        }
                    ].map(s => (
                        <div
                            key={s.label}
                            className="glass-card p-8 group hover:-translate-y-1 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-4 bg-${s.color}-500/10 text-${s.color}-600 rounded-2xl`}>
                                    {s.icon}
                                </div>
                                <ArrowUpRight
                                    size={20}
                                    className="text-slate-300 group-hover:text-slate-600 transition-colors"
                                />
                            </div>
                            <h4 className="text-4xl font-extrabold tracking-tighter mb-2">{s.value}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                {s.label}
                            </p>
                            <p className="text-xs text-slate-500">{s.subtext}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Reports & Quick Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recent Reports */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Recent Reports</h3>
                                <Link
                                    to="/faculty/items"
                                    className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1"
                                >
                                    View All <ChevronRight size={16} />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div
                                            key={i}
                                            className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"
                                        ></div>
                                    ))
                                ) : allReports.length > 0 ? (
                                    allReports.slice(0, 5).map(report => (
                                        <Link
                                            key={report.id}
                                            to="/faculty/items"
                                            className="glass-card p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all"
                                        >
                                            <div className="flex items-center gap-5 flex-1 min-w-0">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {report.images && report.images.length > 0 ? (
                                                        <img
                                                            src={report.images[0]}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package size={20} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-sm tracking-tight truncate">
                                                        {report.title}
                                                    </h5>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                                                        {report.type} • {report.reportedBy?.name || 'Student'} •{' '}
                                                        {formatDate(report.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 ml-4 ${report.status === 'active'
                                                    ? 'bg-amber-500/10 text-amber-600'
                                                    : report.status === 'resolved'
                                                        ? 'bg-emerald-500/10 text-emerald-600'
                                                        : 'bg-slate-500/10 text-slate-600'
                                                    }`}
                                            >
                                                {report.status}
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-10 text-center glass-card border-dashed">
                                        <p className="text-sm font-bold text-slate-400">No reports yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {(quickActions.oldActiveItems.length > 0 || quickActions.urgentClaims.length > 0) && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Items Needing Attention</h3>
                                <div className="space-y-3">
                                    {quickActions.oldActiveItems.map(item => (
                                        <Link
                                            key={item.id}
                                            to="/faculty/items"
                                            className="glass-card p-4 flex items-center gap-4 hover:border-amber-500/30 transition-all"
                                        >
                                            <Clock size={20} className="text-amber-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{item.title}</p>
                                                <p className="text-xs text-slate-500">
                                                    Active for {Math.floor((new Date() - (item.createdAt?.toDate?.() || new Date())) / (1000 * 60 * 60 * 24))} days
                                                </p>
                                            </div>
                                            <span className="text-xs font-bold text-amber-600 flex-shrink-0">
                                                Review
                                            </span>
                                        </Link>
                                    ))}
                                    {quickActions.urgentClaims.map(claim => (
                                        <Link
                                            key={claim.id}
                                            to="/faculty/verify"
                                            className="glass-card p-4 flex items-center gap-4 hover:border-purple-500/30 transition-all"
                                        >
                                            <AlertCircle size={20} className="text-purple-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm">Pending claim verification</p>
                                                <p className="text-xs text-slate-500">
                                                    Waiting for {Math.floor((new Date() - (claim.createdAt?.toDate?.() || new Date())) / (1000 * 60 * 60))} hours
                                                </p>
                                            </div>
                                            <span className="text-xs font-bold text-purple-600 flex-shrink-0">
                                                Verify
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Potential Matches */}
                        {potentialMatches.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Sparkles size={20} className="text-pink-600" />
                                    Potential Matches
                                </h3>
                                <div className="space-y-4">
                                    {potentialMatches.map(match => (
                                        <MatchCard key={match.id} match={match} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Analytics */}
                    <div className="space-y-6">
                        {/* Trend Chart */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">Weekly Trends</h3>
                            <div className="glass-card p-6 h-[300px]">
                                <Line
                                    data={trendData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: true,
                                                position: 'bottom',
                                                labels: { font: { size: 10, weight: 'bold' }, padding: 12 }
                                            }
                                        },
                                        scales: {
                                            x: {
                                                grid: { display: false },
                                                ticks: { font: { size: 10, weight: 'bold' } }
                                            },
                                            y: {
                                                grid: { borderDash: [2, 2] },
                                                ticks: { font: { size: 10, weight: 'bold' }, stepSize: 1 }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
                            <div className="glass-card p-6">
                                <div className="h-[250px] flex items-center justify-center">
                                    {categoryData.labels.length > 0 ? (
                                        <Doughnut
                                            data={categoryData}
                                            options={{
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: true,
                                                        position: 'bottom',
                                                        labels: {
                                                            font: { size: 9, weight: 'bold' },
                                                            padding: 8,
                                                            boxWidth: 12
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-400">No data available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FacultyDashboard;
