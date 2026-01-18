import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

const DocumentUpload = ({ label, onUpload, accept = "image/*", preview = true }) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        setError('');

        if (!selectedFile) return;

        // Validate file type
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB');
            return;
        }

        setFile(selectedFile);

        // Create preview
        if (preview) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }

        // Call onUpload callback
        if (onUpload) {
            onUpload(selectedFile);
        }
    };

    const handleRemove = () => {
        setFile(null);
        setPreviewUrl(null);
        setError('');
        if (onUpload) {
            onUpload(null);
        }
    };

    return (
        <div className="space-y-3">
            {label && (
                <label className="block text-sm font-medium text-white/80">
                    {label}
                </label>
            )}

            {!file ? (
                <div className="relative">
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        className="hidden"
                        id={`file-upload-${label}`}
                        disabled={uploading}
                    />
                    <label
                        htmlFor={`file-upload-${label}`}
                        className="flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-white/20 hover:border-cyan-300/50 bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
                    >
                        <Upload className="w-12 h-12 text-white/40 mb-3" />
                        <p className="text-sm text-white/60 mb-1">Click to upload</p>
                        <p className="text-xs text-white/40">PNG, JPG up to 5MB</p>
                    </label>
                </div>
            ) : (
                <div className="relative">
                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-xl border border-white/10"
                        />
                    )}
                    <button
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-sm text-white/80 truncate">{file.name}</p>
                        <p className="text-xs text-white/40 mt-1">
                            {(file.size / 1024).toFixed(2)} KB
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
};

export default DocumentUpload;
