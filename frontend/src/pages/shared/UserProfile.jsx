import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, CreditCard, Building, ArrowLeft, Edit2, Save, X, Camera, Trash2, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, uploadUserDocuments } from '../../services/user.service';
import { getMyReports, getMyClaims } from '../../services/firestore.service';
import DocumentUpload from '../../components/auth/DocumentUpload';

const UserProfile = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ reports: 0, claims: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [editData, setEditData] = useState({});
    const [localPreview, setLocalPreview] = useState(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            if (user) {
                const [data, reports, claims] = await Promise.all([
                    getUserProfile(user.uid),
                    getMyReports(user.uid),
                    getMyClaims(user.uid)
                ]);
                setProfile(data);
                setEditData(data || {});
                setStats({
                    reports: reports.length,
                    claims: claims.length
                });
            }
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const isPhotoDirty = !!(editData.newPhoto || editData.removePhoto);


    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditData(prev => ({ ...prev, newPhoto: file, removePhoto: false }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoDelete = () => {
        setEditData(prev => ({ ...prev, newPhoto: null, removePhoto: true }));
        setLocalPreview('DELETE');
    };

    const handleCancelPhoto = () => {
        setEditData(prev => ({ ...prev, newPhoto: null, removePhoto: false }));
        setLocalPreview(null);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            console.log('Starting photo save...', { hasNewPhoto: !!editData.newPhoto, shouldRemove: !!editData.removePhoto });

            // Upload photo if changed
            if (editData.newPhoto) {
                console.log('Uploading new photo to Cloudinary...');
                const result = await uploadUserDocuments(user.uid, null, editData.newPhoto);
                console.log('Upload successful:', result);
            } else if (editData.removePhoto) {
                console.log('Removing profile photo from Firestore...');
                await updateUserProfile(user.uid, {
                    profilePhotoUrl: null,
                    profilePhotoPublicId: null
                });
                console.log('Photo removed successfully');
            }

            // Refresh profile on this page
            console.log('Refreshing profile data...');
            await loadProfile();
            // Refresh user context to update sidebar avatar
            console.log('Refreshing auth context...');
            await refreshUser();
            setLocalPreview(null);
            setEditData({});
            console.log('Profile update complete!');
        } catch (err) {
            console.error('Profile update error:', err);
            setError('Failed to update profile: ' + (err.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-cyan-900">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-cyan-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/${profile?.role}/dashboard`)}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white">My Profile</h1>
                            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-black">Verified Identity</p>
                        </div>
                        {isPhotoDirty && (
                            <div className="flex gap-2 animate-fade-in">
                                <button
                                    onClick={handleCancelPhoto}
                                    className="px-4 py-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-50 text-xs font-bold shadow-lg shadow-green-500/20"
                                >
                                    <Save size={16} />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200">
                            {error}
                        </div>
                    )}

                    {/* Profile Photo Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 bg-white/5 flex items-center justify-center">
                                {localPreview === 'DELETE' ? (
                                    <User size={64} className="text-white/20" />
                                ) : localPreview ? (
                                    <img src={localPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : profile?.profilePhotoUrl ? (
                                    <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-white/20" />
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoSelect}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="absolute bottom-0 right-0 flex gap-1">
                                {((localPreview && localPreview !== 'DELETE') || (!localPreview && profile?.profilePhotoUrl)) ? (
                                    <button
                                        onClick={handlePhotoDelete}
                                        className="p-1.5 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all border-2 border-slate-900"
                                        title="Remove Photo"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-1.5 rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 transition-all border-2 border-slate-900"
                                        title="Upload Photo"
                                    >
                                        <Camera size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <User size={16} />
                                Full Name
                            </label>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                                {profile?.name || 'Not set'}
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Calendar size={16} />
                                Date of Birth
                            </label>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                                {profile?.dateOfBirth || 'Not set'}
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Phone size={16} />
                                Mobile Number
                            </label>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                                {profile?.mobile || 'Not set'}
                            </div>
                        </div>

                        {/* Personal Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Mail size={16} />
                                Personal Email
                            </label>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white truncate">
                                {profile?.personalEmail || profile?.email || 'Not set'}
                            </div>
                        </div>

                        {/* Identifier */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <CreditCard size={16} />
                                {profile?.role === 'student' ? 'University Roll Number' : 'Faculty ID'}
                            </label>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                                {profile?.identifier || 'Not set'}
                            </div>
                        </div>

                        {/* University Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Building size={16} />
                                University Email
                            </label>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white truncate">
                                {profile?.universityEmail || 'Not set'}
                            </div>
                        </div>
                    </div>

                    {/* Account Status */}
                    {/* Activity Stats */}
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20">
                            <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-white/80">Email Verified</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-white/80">Mobile Verified</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                            <h3 className="text-lg font-semibold text-white mb-4">My Activity</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{stats.reports}</div>
                                        <div className="text-xs text-white/60 uppercase tracking-wider font-bold">Reports Filed</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">{stats.claims}</div>
                                        <div className="text-xs text-white/60 uppercase tracking-wider font-bold">Claims Made</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
