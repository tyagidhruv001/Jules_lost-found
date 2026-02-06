const admin = require('firebase-admin');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: 'demo-project'
    });
}

const db = admin.firestore();

async function seedClaim() {
    try {
        console.log('Seeding dummy claim...');

        // 1. Create a dummy item first
        const itemRef = await db.collection('items').add({
            title: 'Lost Mac Charger',
            category: 'Electronics',
            type: 'found',
            status: 'active',
            description: 'White Apple MagSafe 2 charger found in library.',
            location: 'Library',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            reportedBy: {
                uid: 'dummy_reporter',
                name: 'Jane Doe'
            }
        });
        console.log('Created dummy item:', itemRef.id);

        // 2. Create a claim for this item
        const claimRef = await db.collection('claims').add({
            itemId: itemRef.id,
            claimantId: 'dummy_claimant',
            description: 'This looks exactly like the one I lost yesterday!',
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            proofImages: ['https://placehold.co/600x400?text=Proof+Image']
        });

        console.log('Created dummy claim:', claimRef.id);
        console.log('Seed successful! Refresh the Faculty Verify Queue.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding claim:', error);
        process.exit(1);
    }
}

seedClaim();
