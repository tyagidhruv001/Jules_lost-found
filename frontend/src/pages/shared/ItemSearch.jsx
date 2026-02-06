import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../../components/layout/Layout';
import { getItems } from '../../services/items.service';
import { Search, Filter, X, ChevronDown, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ItemSearch = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        status: ''
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        try {
            // Build filters object
            const queryFilters = {};
            if (filters.type) queryFilters.type = filters.type;
            if (filters.category) queryFilters.category = filters.category;
            if (filters.status) queryFilters.status = filters.status;

            const data = await getItems(queryFilters);

            // Client-side search filtering
            let filteredData = data;
            if (search) {
                const searchLower = search.toLowerCase();
                filteredData = data.filter(item =>
                    item.title?.toLowerCase().includes(searchLower) ||
                    item.description?.toLowerCase().includes(searchLower) ||
                    item.location?.toLowerCase().includes(searchLower)
                );
            }

            setItems(filteredData);
        } catch (err) {
            console.error('Search error:', err);
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadItems();
        }, 300);
        return () => clearTimeout(timer);
    }, [loadItems]);

    const categories = ['Electronics', 'Wallets', 'Keys', 'Books', 'Documents', 'Clothing'];

    const clearFilters = () => {
        setFilters({ type: '', category: '', status: '' });
        setSearch('');
    };

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in pb-20">
                {/* Search Bar Area */}
                <div className="relative group max-w-2xl mx-auto">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search for items, locations, or descriptions..."
                        className="input w-full pl-14 pr-14 h-16 text-lg rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 border-none group-focus-within:ring-2 ring-blue-600/20 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${isFilterOpen ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <Filter size={20} />
                    </button>
                </div>

                {/* Filter Panel */}
                {isFilterOpen && (
                    <div className="glass-card p-8 animate-slide-down max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-visible">
                        <div className="space-y-2">
                            <label className="label">Item Type</label>
                            <select
                                className="input w-full bg-slate-50 dark:bg-slate-800"
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            >
                                <option value="">All Types</option>
                                <option value="lost">Lost Items</option>
                                <option value="found">Found Items</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="label">Category</label>
                            <select
                                className="input w-full bg-slate-50 dark:bg-slate-800"
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="label">Current Status</label>
                            <select
                                className="input w-full bg-slate-50 dark:bg-slate-800"
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="claimed">Claimed</option>
                                <option value="returned">Returned</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                            <button onClick={clearFilters} className="text-xs font-bold text-slate-500 hover:text-red-500 flex items-center gap-1 uppercase tracking-widest">
                                <X size={14} /> Clear All
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Grid */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold">{items.length} Items Found</h3>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
                        </div>
                    ) : items.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map(item => (
                                <Link to={`/student/items/${item.id}`} key={item.id} className="glass-card group overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-300">
                                    <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                        <img src={item.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${item.type === 'lost' ? 'bg-red-500/90 text-white' : 'bg-emerald-500 text-white shadow-emerald-500/20'}`}>
                                            {item.type}
                                        </div>

                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h4 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium mb-4">{item.category} • {item.location}</p>
                                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${item.status === 'open' ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/5' : 'border-slate-500/20 text-slate-500 bg-slate-500/5'
                                                }`}>
                                                {item.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 glass-card">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                                <Search size={40} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No items found</h3>
                            <p className="text-slate-500 mb-8">Try adjusting your filters or use different keywords.</p>
                            <button onClick={clearFilters} className="btn btn-primary px-8">Clear all filters</button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ItemSearch;
