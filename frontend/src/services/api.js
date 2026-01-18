import { mockDb } from './mockDb';

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    login: async ({ identifier, password, role }) => {
        await delay();
        const users = mockDb.getUsers();

        // Find user by identifier (Roll No / Email)
        const user = users.find(u =>
            (u.identifier === identifier || u.email === identifier) &&
            u.role === role
        );

        if (user) {
            // Mock password check
            const correctPassword = role === 'student' ? 'Student@123' : 'Faculty@123';

            if (password === correctPassword) {
                return { success: true, user, isDemo: true };
            } else {
                throw new Error('Incorrect password. Please try again.');
            }
        }

        throw new Error('Invalid credentials or unauthorized role access.');
    },

    getItems: async (filters = {}) => {
        await delay();
        let items = mockDb.getItems();
        if (filters.type) items = items.filter(i => i.type === filters.type);
        if (filters.category) items = items.filter(i => i.category === filters.category);
        if (filters.status) items = items.filter(i => i.status === filters.status);
        if (filters.search) {
            const s = filters.search.toLowerCase();
            items = items.filter(i => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s));
        }
        return items;
    },

    getItemById: async (id) => {
        await delay();
        const items = mockDb.getItems();
        return items.find(i => i.id === id);
    },

    createItem: async (payload) => {
        await delay();
        const items = mockDb.getItems();
        const newItem = {
            ...payload,
            id: Math.random().toString(36).substr(2, 9),
            status: 'open',
            date: new Date().toISOString().split('T')[0]
        };
        mockDb.setItems([newItem, ...items]);
        return newItem;
    },

    createClaim: async (itemId, payload) => {
        await delay();
        const claims = mockDb.getClaims();
        const newClaim = {
            ...payload,
            id: 'CLM-' + Math.floor(1000 + Math.random() * 9000),
            itemId,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            messages: payload.message ? [{ senderId: payload.claimantId, text: payload.message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] : []
        };
        mockDb.setClaims([newClaim, ...claims]);
        return newClaim;
    },

    getMyReports: async (userId) => {
        await delay();
        const items = mockDb.getItems();
        return items.filter(i => i.reportedBy === userId);
    },

    getMyClaims: async (userId) => {
        await delay();
        const claims = mockDb.getClaims();
        return claims.filter(c => c.claimantId === userId);
    },

    getFacultyQueue: async () => {
        await delay();
        const claims = mockDb.getClaims();
        return claims.filter(c => c.status === 'pending');
    },

    verifyClaim: async (claimId, { status, note }) => {
        await delay();
        const claims = mockDb.getClaims();
        const items = mockDb.getItems();

        const claimIndex = claims.findIndex(c => c.id === claimId);
        if (claimIndex === -1) throw new Error('Claim not found');

        claims[claimIndex].status = status;
        if (note) {
            claims[claimIndex].messages.push({
                senderId: 'faculty',
                text: note,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }
        mockDb.setClaims([...claims]);

        // If approved, update item status
        if (status === 'approved') {
            const itemIndex = items.findIndex(i => i.id === claims[claimIndex].itemId);
            if (itemIndex !== -1) {
                items[itemIndex].status = 'claimed';
                mockDb.setItems([...items]);
            }
        }

        return claims[claimIndex];
    },

    getLatestActivity: async (limit = 3) => {
        await delay(500);
        const items = mockDb.getItems();

        // Get most recent items sorted by date
        const recentItems = [...items]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);

        // Transform to landing page format
        return recentItems.map(item => ({
            id: item.id,
            emoji: getEmojiForCategory(item.category),
            bgColor: getColorForCategory(item.category),
            title: item.title,
            status: item.type === 'lost' ? 'Lost' : 'Found',
            statusColor: item.type === 'lost' ? 'text-red-400' : 'text-green-400',
            location: item.location,
            timestamp: new Date(item.date)
        }));
    }
};

// Helper functions for Latest Activity
const getEmojiForCategory = (category) => {
    const emojiMap = {
        'electronics': '🎧',
        'accessories': '🎒',
        'keys': '🔑',
        'wallet': '👛',
        'phone': '📱',
        'laptop': '💻',
        'books': '📚',
        'clothing': '👕',
        'jewelry': '💍',
        'cards': '💳',
        'id-cards': '🪪',
        'bags': '🎒',
        'stationery': '✏️',
        'other': '📦'
    };
    return emojiMap[category?.toLowerCase()] || '📦';
};

const getColorForCategory = (category) => {
    const colorMap = {
        'electronics': 'bg-blue-500/30',
        'accessories': 'bg-purple-500/30',
        'keys': 'bg-yellow-500/30',
        'wallet': 'bg-pink-500/30',
        'phone': 'bg-cyan-500/30',
        'laptop': 'bg-indigo-500/30',
        'books': 'bg-orange-500/30',
        'clothing': 'bg-red-500/30',
        'jewelry': 'bg-emerald-500/30',
        'cards': 'bg-teal-500/30',
        'id-cards': 'bg-slate-500/30',
        'bags': 'bg-purple-500/30',
        'stationery': 'bg-amber-500/30',
        'other': 'bg-gray-500/30'
    };
    return colorMap[category?.toLowerCase()] || 'bg-gray-500/30';
};
