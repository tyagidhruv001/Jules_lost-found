import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/layout/Layout';
import { getPendingClaims, verifyClaim } from '../../services/firestore.service';
import { getItemById } from '../../services/items.service';
import { getUserProfile } from '../../services/user.service';
import {
    Check, X, MessageSquare, AlertCircle,
    ChevronRight, ArrowRight, Shield, User,
    Mail, Phone, MapPin, Calendar, Package, Image as ImageIcon
} from 'lucide-react';

const VerifyQueue = () => {
    const [claims, setClaims] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [claimItem, setClaimItem] = useState(null);
    const [claimantProfile, setClaimantProfile] = useState(null);
    const [note, setNote] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const loadQueue = async () => {
        setIsLoading(true);
        try {
            const data = await getPendingClaims();
            setClaims(data);
        } catch (err) {
            console.error('Error loading claims:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadQueue();
    }, []);

    // Load item and claimant details when a claim is selected
    useEffect(() => {
        const loadClaimDetails = async () => {
            if (!selectedClaim) {
                setClaimItem(null);
                setClaimantProfile(null);
                return;
            }

            setLoadingDetail(true);
            try {
                // Load the item being claimed
                const item = await getItemById(selectedClaim.itemId);
                setClaimItem(item);

                // Try to load claimant profile
                try {
                    const profile = await getUserProfile(selectedClaim.claimantId);
                    setClaimantProfile(profile);
                } catch (err) {
                    console.error('Error loading claimant profile:', err);
                    setClaimantProfile(null);
                }
            } catch (err) {
                console.error('Error loading claim details:', err);
            } finally {
                setLoadingDetail(false);
            }
        };

        loadClaimDetails();
    }, [selectedClaim]);

    const handleVerify = async (decision) => {
        if (!selectedClaim) return;

        setIsProcessing(true);
        try {
            await verifyClaim(selectedClaim.id, decision, note);
            setSelectedClaim(null);
            setNote('');
            await loadQueue();
        } catch (err) {
            console.error('Error verifying claim:', err);
            alert('Failed to verify claim. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate trust score (simple heuristic)
    const calculateTrustScore = (claim, profile) => {
        let score = 50; // Base score

        // Has description
        if (claim.description && claim.description.length > 20) score += 15;

        // Has proof images
        if (claim.proofImages && claim.proofImages.length > 0) score += 20;

        // User is verified
        if (profile?.emailVerified) score += 10;
        if (profile?.mobileVerified) score += 5;

        return Math.min(100, score);
    };

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in pb-20">
                {/* Header */}
                <div className="glass-card p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">Claim Verification Queue</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                {claims.length} Pending {claims.length === 1 ? 'Claim' : 'Claims'}
                            </p>
                        </div>
                        <button
                            onClick={loadQueue}
                            className="btn bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 text-sm font-bold"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-280px)]">
                    {/* Claims List */}
                    <div className="overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl animate-pulse"></div>
                            ))
                        ) : claims.length > 0 ? (
                            claims.map(claim => {
                                const trustScore = calculateTrustScore(claim, null);
                                return (
                                    <div
                                        key={claim.id}
                                        onClick={() => setSelectedClaim(claim)}
                                        className={`glass-card p-6 cursor-pointer transition-all border-2 ${selectedClaim?.id === claim.id
                                                ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-600/5'
                                                : 'border-transparent hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                                                    {claim.id.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-extrabold text-sm uppercase tracking-tight mb-1 truncate">
                                                        Claim Request
                                                    </h4>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${trustScore >= 75 ? 'bg-emerald-500' :
                                                                        trustScore >= 50 ? 'bg-amber-500' :
                                                                            'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${trustScore}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[10px] font-black tracking-widest text-slate-400">
                                                            CONFIDENCE: {trustScore}%
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-bold">
                                                        {formatDate(claim.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight
                                                size={20}
                                                className={selectedClaim?.id === claim.id ? 'text-blue-600' : 'text-slate-300'}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                <Shield size={48} className="mb-4 opacity-50" />
                                <p className="font-bold uppercase tracking-widest text-xs">No Pending Claims</p>
                                <p className="text-xs mt-1 text-center">All claims have been processed</p>
                            </div>
                        )}
                    </div>

                    {/* Claim Detail Panel */}
                    <div className="glass-card flex flex-col overflow-hidden relative">
                        {selectedClaim ? (
                            loadingDetail ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col">
                                    {/* Header */}
                                    <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-2xl font-black uppercase tracking-tight">Review Claim</h3>
                                                <p className="text-[10px] font-black text-slate-500 tracking-widest">
                                                    SUBMITTED {formatDate(selectedClaim.createdAt)}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-blue-600/10 text-blue-600 rounded-2xl">
                                                <User size={24} />
                                            </div>
                                        </div>

                                        {/* Claimant Info */}
                                        {claimantProfile && (
                                            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl space-y-3">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                                    Claimant Information
                                                </h5>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <User size={16} className="text-blue-600" />
                                                        <span className="font-bold">{claimantProfile.name}</span>
                                                    </div>
                                                    {claimantProfile.email && (
                                                        <div className="flex items-center gap-3">
                                                            <Mail size={16} className="text-purple-600" />
                                                            <span className="text-sm">{claimantProfile.email}</span>
                                                            {claimantProfile.emailVerified && (
                                                                <span className="text-[9px] px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full font-bold">
                                                                    VERIFIED
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {claimantProfile.identifier && (
                                                        <div className="flex items-center gap-3">
                                                            <Shield size={16} className="text-emerald-600" />
                                                            <span className="text-sm font-mono">{claimantProfile.identifier}</span>
                                                        </div>
                                                    )}
                                                    {claimantProfile.mobile && (
                                                        <div className="flex items-center gap-3">
                                                            <Phone size={16} className="text-orange-600" />
                                                            <span className="text-sm">{claimantProfile.mobile}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Body - Scrollable */}
                                    <div className="p-8 flex-1 overflow-y-auto space-y-6">
                                        {/* Item Being Claimed */}
                                        {claimItem && (
                                            <div>
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                                    Item Being Claimed
                                                </h5>
                                                <div className="glass-card p-4">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        {claimItem.images && claimItem.images.length > 0 ? (
                                                            <img
                                                                src={claimItem.images[0]}
                                                                alt={claimItem.title}
                                                                className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                                <Package size={24} className="text-slate-400" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h6 className="font-bold">{claimItem.title}</h6>
                                                            <p className="text-xs text-slate-500">
                                                                {claimItem.category} • {claimItem.type}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                                        {claimItem.location && (
                                                            <div className="flex items-center gap-2">
                                                                <MapPin size={12} />
                                                                <span>{claimItem.location}</span>
                                                            </div>
                                                        )}
                                                        {claimItem.description && (
                                                            <p className="mt-2">{claimItem.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Claim Description */}
                                        {selectedClaim.description && (
                                            <div>
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                                    Claim Description
                                                </h5>
                                                <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl">
                                                    <p className="text-sm font-medium leading-relaxed italic text-slate-700 dark:text-slate-300">
                                                        "{selectedClaim.description}"
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Proof Images */}
                                        {selectedClaim.proofImages && selectedClaim.proofImages.length > 0 && (
                                            <div>
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                                    Proof Images
                                                </h5>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {selectedClaim.proofImages.map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt={`Proof ${idx + 1}`}
                                                            className="w-full h-32 object-cover rounded-2xl border border-slate-200 dark:border-slate-700"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Faculty Notes */}
                                        <div>
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                                Verification Notes
                                            </h5>
                                            <textarea
                                                className="input w-full min-h-[120px] p-4 text-sm"
                                                placeholder="Add notes about this verification (optional)..."
                                                value={note}
                                                onChange={e => setNote(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer - Action Buttons */}
                                    <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                                        <button
                                            onClick={() => handleVerify('rejected')}
                                            disabled={isProcessing}
                                            className="btn bg-white dark:bg-slate-800 text-red-500 border-2 border-red-500/20 px-8 py-3 font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            <X size={18} /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleVerify('approved')}
                                            disabled={isProcessing}
                                            className="btn btn-primary flex-1 py-4 font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            <Check size={20} /> Approve Claim
                                        </button>
                                    </div>

                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
                                            <div className="spinner"></div>
                                        </div>
                                    )}
                                </div>
                            )
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                    <MessageSquare size={40} className="opacity-20" />
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-tight mb-2">Select a Claim</h4>
                                <p className="text-sm font-medium max-w-xs">
                                    Choose a claim from the list to review and verify
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default VerifyQueue;
