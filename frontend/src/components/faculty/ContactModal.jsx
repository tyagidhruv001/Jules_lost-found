import React, { useState, useEffect } from 'react';
import { X, Mail, Copy, Check, Eye, Send } from 'lucide-react';
import { getEmailTemplates, sendNotification, generateVariables, renderTemplate } from '../../services/notification.service';

const ContactModal = ({ isOpen, onClose, student, item, defaultTemplate = null, additionalVars = {} }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate || 'item_found');
    const [customSubject, setCustomSubject] = useState('');
    const [customBody, setCustomBody] = useState('');
    const [showPreview, setShowPreview] = useState(true);
    const [copied, setCopied] = useState(false);
    const templates = getEmailTemplates();

    // Generate variables for this contact
    const variables = generateVariables(student, item, additionalVars);

    // Get current template
    const currentTemplate = templates.find(t => t.id === selectedTemplate);

    // Render email with variables
    const { subject, body } = currentTemplate
        ? renderTemplate(currentTemplate, variables)
        : { subject: customSubject, body: customBody };

    const handleSend = () => {
        sendNotification(student, selectedTemplate, variables);
        onClose();
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(student.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Contact Student</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Send Email Notification</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Student Info Card */}
                    <div className="mt-6 glass-card p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                                {student?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate">{student?.name || 'Student'}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest">
                                    {student?.role || 'Student'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {student?.email && (
                                <div className="flex items-center gap-2 group">
                                    <Mail size={16} className="text-blue-600" />
                                    <span className="truncate flex-1">{student.email}</span>
                                    <button
                                        onClick={handleCopyEmail}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                    >
                                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            )}
                            {student?.identifier && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-xs">ID:</span>
                                    <span className="font-mono text-xs">{student.identifier}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto max-h-[50vh]">
                    {/* Template Selector */}
                    <div className="mb-6">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                            Email Template
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {templates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedTemplate === template.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{template.icon}</div>
                                    <div className="text-xs font-bold truncate">{template.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview Toggle */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Email Preview</h3>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
                        >
                            <Eye size={16} />
                            {showPreview ? 'Hide' : 'Show'} Preview
                        </button>
                    </div>

                    {/* Email Preview */}
                    {showPreview && (
                        <div className="glass-card p-6 space-y-4">
                            {/* Subject */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                    Subject:
                                </label>
                                <div className="font-bold text-lg">{subject}</div>
                            </div>

                            {/* Body */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                                    Message:
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl font-mono text-sm whitespace-pre-wrap leading-relaxed">
                                    {body}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Item Context */}
                    {item && (
                        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                About Item:
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                    📦
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{item.title}</p>
                                    <p className="text-xs text-slate-500">{item.category} • {item.type}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                    <button
                        onClick={onClose}
                        className="btn bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-8 py-3 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        className="btn btn-primary flex-1 py-4 font-black uppercase tracking-widest flex items-center justify-center gap-3"
                    >
                        <Send size={20} />
                        Send Email
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactModal;
