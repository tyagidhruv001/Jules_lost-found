// Initial Mock Data
const INITIAL_ITEMS = [
    {
        id: '1',
        type: 'found',
        title: 'Blue iPhone 13',
        category: 'Electronics',
        color: 'Blue',
        location: 'Canteen',
        date: '2026-01-16',
        status: 'open', // open, claimed, returned
        reportedBy: 'user-002',
        images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=400'],
        description: 'Found near soda machine. Silver case.'
    },
    {
        id: '2',
        type: 'lost',
        title: 'Black Leather Wallet',
        category: 'Wallets',
        color: 'Black',
        location: 'Library',
        date: '2026-01-15',
        status: 'open',
        reportedBy: 'user-001',
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400'],
        description: 'Contains GLA ID and some cash.'
    }
];

const INITIAL_CLAIMS = [
    {
        id: 'CLM-001',
        itemId: '1',
        claimantId: 'user-001',
        status: 'pending',
        date: '2026-01-17',
        trustScore: 85,
        messages: [
            { senderId: 'user-001', text: 'Hi, I think this is my phone. It has a slight scratch on the top left.', time: '10:30 AM' }
        ]
    }
];

const INITIAL_USERS = [
    {
        id: 'user-001',
        role: 'student',
        name: 'Aman Gupta',
        identifier: '2100123', // Matches Demo Account
        email: 'student@gla.ac.in'
    },
    {
        id: 'user-002',
        role: 'faculty',
        name: 'Dr. Arun Sharma',
        identifier: 'faculty@gla.ac.in', // Matches Demo Account
        email: 'faculty@gla.ac.in'
    }
];

// Persistence Logic
const getStorage = (key, initial) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : initial;
};

const setStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const mockDb = {
    getItems: () => getStorage('gla_items', INITIAL_ITEMS),
    setItems: (items) => setStorage('gla_items', items),

    getClaims: () => getStorage('gla_claims', INITIAL_CLAIMS),
    setClaims: (claims) => setStorage('gla_claims', claims),

    getUsers: () => INITIAL_USERS,
};
