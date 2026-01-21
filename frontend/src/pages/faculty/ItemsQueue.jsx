import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { getItems, updateItemStatus } from '../../services/items.service';
import { getUserProfile } from '../../services/user.service';
import ContactModal from '../../components/faculty/ContactModal';
import {
    Search, Filter, Eye, MoreVertical, Edit,
    Trash2, ExternalLink, ShieldCheck, X, Check,
    MapPin, Calendar, User, Mail, Phone, Package, Send
} from 'lucide-react';

const FacultyItemsQueue = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactStudent, setContactStudent] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        type: 'all', // all, lost, found
        category: 'all',
        status: 'all' // all, active, resolved, claimed
    });

    // Load items
    const loadItems = async () => {
        setIsLoading(true);
        try {
            const data = await getItems();
            setItems(data);
            setFilteredItems(data);
        } catch (err) {
            console.error('Error loading items:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    // Apply filters and search
    useEffect(() => {
        let result = [...items];

        // Apply type filter
        if (filters.type !== 'all') {
            result = result.filter(item => item.type === filters.type);
        }

        // Apply category filter
        if (filters.category !== 'all') {
            result = result.filter(item => item.category === filters.category);
        }

        // Apply status filter
        if (filters.status !== 'all') {
            result = result.filter(item => item.status === filters.status);
        }

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.location?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query)
            );
        }

        setFilteredItems(result);
    }, [items, filters, searchQuery]);

    // Get unique categories from items
    const categories = [...new Set(items.map(item => item.category))].filter(Boolean);

    // Handle status update
    const handleStatusUpdate = async (itemId, newStatus) => {
        try {
            setIsUpdating(true);
            await updateItemStatus(itemId, newStatus);
            await loadItems();
            setShowDetailModal(false);
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update item status');
        } finally {
            setIsUpdating(false);
        }
    };

    // View item details
    const viewItemDetail = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Items Repository</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                            {filteredItems.length} of {items.length} items displayed
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title, description, location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input w-full pl-12 bg-white dark:bg-slate-900 border-none shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={16} className="text-slate-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Type Filter */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="input w-full text-sm"
                            >
                                <option value="all">All Types</option>
                                <option value="lost">Lost Items</option>
                                <option value="found">Found Items</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="input w-full text-sm"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="input w-full text-sm"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="resolved">Resolved</option>
                                <option value="claimed">Claimed</option>
                            </select>
                        </div>
                    </div>

                    {/* Active filters indicator */}
                    {(filters.type !== 'all' || filters.category !== 'all' || filters.status !== 'all' || searchQuery) && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Active filters:</span>
                            {filters.type !== 'all' && (
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-bold">
                                    Type: {filters.type}
                                </span>
                            )}
                            {filters.category !== 'all' && (
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-xs font-bold">
                                    Category: {filters.category}
                                </span>
                            )}
                            {filters.status !== 'all' && (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-bold">
                                    Status: {filters.status}
                                </span>
                            )}
                            {searchQuery && (
                                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold">
                                    Search: "{searchQuery}"
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setFilters({ type: 'all', category: 'all', status: 'all' });
                                    setSearchQuery('');
                                }}
                                className="text-xs font-bold text-slate-500 hover:text-red-600 ml-auto"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Items Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="px-8 py-4">Item Details</th>
                                    <th className="px-8 py-4">Type</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Location</th>
                                    <th className="px-8 py-4">Reported By</th>
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i}>
                                            <td colSpan="7" className="px-8 py-6 animate-pulse bg-slate-50/50 dark:bg-slate-900/50"></td>
                                        </tr>
                                    ))
                                ) : filteredItems.length > 0 ? (
                                    filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                                        {item.images && item.images.length > 0 ? (
                                                            <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package size={20} className="text-slate-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h5 className="font-bold text-sm tracking-tight truncate">{item.title}</h5>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase truncate">
                                                            {item.category}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.type === 'lost'
                                                    ? 'bg-red-500/10 text-red-600'
                                                    : 'bg-green-500/10 text-green-600'
                                                    }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.status === 'active' ? 'border-amber-500/20 text-amber-600 bg-amber-500/5' :
                                                    item.status === 'claimed' ? 'border-blue-500/20 text-blue-500 bg-blue-500/5' :
                                                        'border-emerald-500/20 text-emerald-600 bg-emerald-500/5'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                                                        {item.location || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                                                        {item.reportedBy?.name || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-xs text-slate-500">
                                                {formatDate(item.createdAt)}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => viewItemDetail(item)}
                                                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-8 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <Package size={48} className="mb-4 opacity-20" />
                                                <p className="font-bold uppercase tracking-widest text-xs">No items found</p>
                                                <p className="text-xs mt-1">Try adjusting your filters or search query</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Item Detail Modal */}
            {showDetailModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 flex justify-between items-start z-10">
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight">{selectedItem.title}</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    Item ID: {selectedItem.id}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Images */}
                            {selectedItem.images && selectedItem.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedItem.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`${selectedItem.title} ${idx + 1}`}
                                            className="w-full h-40 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Item Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package size={16} className="text-blue-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</span>
                                    </div>
                                    <p className="font-bold text-lg capitalize">{selectedItem.type}</p>
                                </div>

                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Filter size={16} className="text-purple-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</span>
                                    </div>
                                    <p className="font-bold text-lg capitalize">{selectedItem.category}</p>
                                </div>

                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin size={16} className="text-red-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</span>
                                    </div>
                                    <p className="font-bold text-sm">{selectedItem.location || 'N/A'}</p>
                                </div>

                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={16} className="text-green-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</span>
                                    </div>
                                    <p className="font-bold text-sm">{formatDate(selectedItem.createdAt)}</p>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedItem.description && (
                                <div className="glass-card p-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Description</h4>
                                    <p className="text-sm leading-relaxed">{selectedItem.description}</p>
                                </div>
                            )}

                            {/* Color */}
                            {selectedItem.color && (
                                <div className="glass-card p-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Color</h4>
                                    <p className="text-sm font-bold capitalize">{selectedItem.color}</p>
                                </div>
                            )}

                            {/* Reporter Info */}
                            <div className="glass-card p-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Reported By</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-slate-400" />
                                        <span className="font-bold">{selectedItem.reportedBy?.name || 'Unknown'}</span>
                                    </div>
                                    {selectedItem.reportedBy?.email && (
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-slate-400" />
                                            <a href={`mailto:${selectedItem.reportedBy.email}`} className="text-blue-600 hover:underline text-sm">
                                                {selectedItem.reportedBy.email}
                                            </a>
                                        </div>
                                    )}
                                    {selectedItem.reportedBy?.identifier && (
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck size={16} className="text-slate-400" />
                                            <span className="text-sm font-mono">{selectedItem.reportedBy.identifier}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer - Status Actions */}
                            <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Quick Actions</h5>

                                {/* Contact Reporter Button */}
                                {selectedItem.reportedBy && (
                                    <button
                                        onClick={() => {
                                            setContactStudent(selectedItem.reportedBy);
                                            setShowContactModal(true);
                                        }}
                                        className="btn bg-blue-500 text-white hover:bg-blue-600 w-full py-3 font-bold uppercase tracking-widest flex items-center justify-center gap-2 mb-4"
                                    >
                                        <Send size={18} />
                                        Contact Reporter
                                    </button>
                                )}

                                <div className="grid grid-cols-3 gap-3">
                                    {selectedItem.status !== 'active' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedItem.id, 'active')}
                                            disabled={isUpdating}
                                            className="btn bg-amber-500 text-white hover:bg-amber-600 px-6 py-3 font-bold text-sm disabled:opacity-50"
                                        >
                                            Mark as Active
                                        </button>
                                    )}
                                    {selectedItem.status !== 'claimed' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedItem.id, 'claimed')}
                                            disabled={isUpdating}
                                            className="btn bg-blue-500 text-white hover:bg-blue-600 px-6 py-3 font-bold text-sm disabled:opacity-50"
                                        >
                                            Mark as Claimed
                                        </button>
                                    )}
                                    {selectedItem.status !== 'resolved' && (
                                        <button
                                            onClick={() => handleStatusUpdate(selectedItem.id, 'resolved')}
                                            disabled={isUpdating}
                                            className="btn bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 font-bold text-sm disabled:opacity-50"
                                        >
                                            Mark as Resolved
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-3">
                                    Current Status: <span className="font-bold capitalize">{selectedItem.status}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Modal */}
            <ContactModal
                isOpen={showContactModal}
                onClose={() => {
                    setShowContactModal(false);
                    setContactStudent(null);
                }}
                student={contactStudent}
                item={selectedItem}
                defaultTemplate="item_found"
            />
        </Layout>
    );
};

export default FacultyItemsQueue;
