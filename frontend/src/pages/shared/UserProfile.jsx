import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, CreditCard, Building, ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, uploadUserDocuments } from '../../services/user.service';
import DocumentUpload from '../../components/auth/DocumentUpload';

const UserProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [editData, setEditData] = useState({});

    useEffect(() => {
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            if (user) {
                const data = await getUserProfile(user.uid);
                setProfile(data);
                setEditData(data || {});
            }
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');

            // Upload photo if changed
            if (editData.newPhoto) {
                await uploadUserDocuments(user.uid, null, editData.newPhoto);
            }

            await updateUserProfile(user.uid, {
                name: editData.name,
                mobile: editData.mobile,
                dateOfBirth: editData.dateOfBirth
            });

            // Refresh profile
            await loadProfile();
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile');
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
                        <h1 className="text-3xl font-bold text-white">My Profile</h1>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-all"
                            >
                                <Edit2 size={18} />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditData(profile);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all"
                                >
                                    <X size={18} />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {saving ? 'Saving...' : 'Save'}
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
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mb-4 bg-white/5 flex items-center justify-center">
                            {profile?.profilePhotoUrl ? (
                                <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={64} className="text-white/20" />
                            )}
                        </div>

                        {isEditing && (
                            <div className="w-full max-w-xs">
                                <DocumentUpload
                                    label="Update Profile Photo"
                                    onUpload={(file) => setEditData(prev => ({ ...prev, newPhoto: file }))}
                                    accept="image/*"
                                    preview={false}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <User size={16} />
                                Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.name || ''}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                                />
                            ) : (
                                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                                    {profile?.name || 'Not set'}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Mail size={16} />
                                University Email
                            </label>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60">
                                {profile?.universityEmail || profile?.email || 'Not set'}
                            </div>
                            <p className="text-xs text-white/40 mt-1">Cannot be changed</p>
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Phone size={16} />
                                Mobile Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={editData.mobile || ''}
                                    onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                                    maxLength={10}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                                />
                            ) : (
                                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                                    {profile?.mobile || 'Not set'}
                                </div>
                            )}
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Calendar size={16} />
                                Date of Birth
                            </label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={editData.dateOfBirth || ''}
                                    onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                                />
                            ) : (
                                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                                    {profile?.dateOfBirth || 'Not set'}
                                </div>
                            )}
                        </div>

                        {/* Roll Number/Faculty ID */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <CreditCard size={16} />
                                {profile?.role === 'student' ? 'Roll Number' : 'Faculty ID'}
                            </label>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60">
                                {profile?.identifier || 'Not set'}
                            </div>
                            <p className="text-xs text-white/40 mt-1">Cannot be changed</p>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-2">
                                <Building size={16} />
                                Role
                            </label>
                            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${profile?.role === 'student'
                                    ? 'bg-cyan-500/20 text-cyan-300'
                                    : 'bg-purple-500/20 text-purple-300'
                                    }`}>
                                    {profile?.role === 'student' ? '🎓 Student' : '👨‍🏫 Faculty'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Account Status */}
                    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20">
                        <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
                        <div className="grid md:grid-cols-2 gap-4">
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
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
