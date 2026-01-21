import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { createItem, uploadItemImages } from '../../services/items.service';
import { useAuth } from '../../context/AuthContext';
import {
    Info, Camera, MapPin, CheckCircle,
    ChevronRight, ChevronLeft, Send, Sparkles
} from 'lucide-react';

const ReportWizard = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        type: 'lost',
        title: '',
        category: 'Electronics',
        location: '',
        lastTimeSeen: '',
        color: '',
        description: '',
        imageFiles: [],
        images: []
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({ ...prev, imageFiles: files }));

            // Create preview URLs
            const previews = files.map(file => URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, images: previews }));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            console.log('Starting report submission...');

            // Upload images to Cloudinary first
            let imageUrls = [];
            if (formData.imageFiles.length > 0) {
                console.log('Uploading images to Cloudinary...');
                imageUrls = await uploadItemImages(formData.imageFiles);
                console.log('Images uploaded:', imageUrls);
            }

            // Create item in Firestore
            console.log('Creating item in Firestore...');
            const result = await createItem(
                {
                    ...formData,
                    images: imageUrls
                },
                user
            );
            console.log('Item created successfully:', result);

            setStep(4); // Success Step
        } catch (err) {
            console.error('Report submission error:', err);
            setError(err.message || 'Failed to submit report');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = ['Electronics', 'Wallets', 'Keys', 'Books', 'Documents', 'Clothing', 'Other'];
    const locations = ['Library', 'Academic Block A', 'Academic Block B', 'Canteen', 'Reception', 'Sports Complex'];

    return (
        <Layout>
            <div className="max-w-3xl mx-auto pb-20 animate-fade-in">
                {step < 4 && (
                    <div className="mb-12">
                        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Initialize Report</h2>
                        <div className="flex gap-2 mt-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="glass-card min-h-[500px] flex flex-col relative overflow-hidden">
                    {isSubmitting && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center">
                            <div className="spinner"></div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="p-10 space-y-8 animate-slide-right flex-1 flex flex-col">
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                    <Sparkles size={14} /> Step 01: Intelligent Classification
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, type: 'lost' }))}
                                        className={`p-6 rounded-3xl border-2 transition-all text-left ${formData.type === 'lost' ? 'border-red-500 bg-red-500/5' : 'border-slate-100 dark:border-slate-800'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${formData.type === 'lost' ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                            < ChevronLeft size={20} />
                                        </div>
                                        <h5 className="font-extrabold uppercase tracking-tight">I Lost Something</h5>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">misplaced an item</p>
                                    </button>
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, type: 'found' }))}
                                        className={`p-6 rounded-3xl border-2 transition-all text-left ${formData.type === 'found' ? 'border-amber-500 bg-amber-500/5' : 'border-slate-100 dark:border-slate-800'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${formData.type === 'found' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                            <ChevronRight size={20} />
                                        </div>
                                        <h5 className="font-extrabold uppercase tracking-tight">I Found Something</h5>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">picked up an orphaned item</p>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="label">Item Headline</label>
                                    <input
                                        type="text" className="input w-full" placeholder="e.g. My Silver Macbook Pro"
                                        value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="label">Classification</label>
                                    <select
                                        className="input w-full"
                                        value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-auto pt-10 flex border-t border-slate-100 dark:border-slate-800">
                                <button onClick={() => setStep(2)} disabled={!formData.title} className="btn btn-primary w-full py-4 font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Next Protocol Phase</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="p-10 space-y-8 animate-slide-right flex-1 flex flex-col">
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                    <MapPin size={14} /> Step 02: Spatial & Temporal Context
                                </h4>
                                <div className="space-y-2">
                                    <label className="label">Location</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="e.g. Library 2nd Floor, Near Cafeteria"
                                        value={formData.location}
                                        onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                                    />
                                    <p className="text-[10px] text-slate-500 font-medium">Be as specific as possible</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="label">Last Time Seen</label>
                                    <input
                                        type="datetime-local"
                                        className="input w-full"
                                        value={formData.lastTimeSeen}
                                        onChange={e => setFormData(p => ({ ...p, lastTimeSeen: e.target.value }))}
                                    />
                                    <p className="text-[10px] text-slate-500 font-medium">When did you last see this item?</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="label">External Color Detail</label>
                                    <input
                                        type="text" className="input w-full" placeholder="e.g. Matte Gray / Neon Blue"
                                        value={formData.color} onChange={e => setFormData(p => ({ ...p, color: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="label">Detailed Observation</label>
                                    <textarea
                                        className="input w-full min-h-[120px] p-4" placeholder="Any scratches, stickers, or unique markings..."
                                        value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="mt-auto pt-10 flex gap-4 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={() => setStep(1)} className="btn bg-slate-100 dark:bg-slate-800 font-black uppercase tracking-widest px-8">Back</button>
                                <button onClick={() => setStep(3)} disabled={!formData.location} className="btn btn-primary flex-1 py-4 font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Review Phase</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="p-10 space-y-8 animate-slide-right flex-1 flex flex-col">
                            <div className="space-y-6">
                                <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                    <Camera size={14} /> Step 03: Visual Confirmation
                                </h4>

                                {formData.images.length === 0 ? (
                                    <div className="aspect-video bg-slate-50 dark:bg-slate-950/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                                            <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                                <Camera size={32} />
                                            </div>
                                            <p className="text-sm font-bold">Click to Upload Images</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Add up to 5 photos</p>
                                        </label>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            {formData.images.map((img, idx) => (
                                                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border-2 border-blue-600/20">
                                                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageSelect}
                                            className="hidden"
                                            id="image-reupload"
                                        />
                                        <label htmlFor="image-reupload" className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer uppercase tracking-widest">
                                            Change Images
                                        </label>
                                    </div>
                                )}

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-blue-600/10">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Integrity Confirmation</h5>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">"I confirm that the details provided are accurate. I understand that misreporting is a violation of University Protocol."</p>
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                                        {error}
                                    </div>
                                )}
                            </div>
                            <div className="mt-auto pt-10 flex gap-4 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={() => setStep(2)} className="btn bg-slate-100 dark:bg-slate-800 font-black uppercase tracking-widest px-8">Back</button>
                                <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary flex-1 py-4 font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50">
                                    <Send size={20} /> {isSubmitting ? 'Publishing...' : 'Publish Report'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="p-10 space-y-8 flex-1 flex flex-col items-center justify-center text-center animate-scale-up">
                            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/40">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tight">Report Published</h2>
                            <p className="text-slate-500 font-medium max-w-xs">Your item has been logged into the global database. Our AI is now searching for potential matches.</p>
                            <div className="pt-10 w-full space-y-4">
                                <button onClick={() => navigate('/student/dashboard')} className="btn btn-primary w-full py-4 font-black uppercase tracking-widest">Return to Dashboard</button>
                                <button onClick={() => setStep(1)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Start New Report</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout >
    );
};

export default ReportWizard;
