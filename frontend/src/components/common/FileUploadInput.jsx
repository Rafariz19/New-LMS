import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, X } from 'lucide-react';

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xls', '.xlsx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function FileUploadInput({
  label = 'Pilih Berkas',
  helperText = 'Format yang didukung: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), Gambar (.jpg, .png). Maks 10MB.',
  onChange,
  file,
  name,
  required = false,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    // Cek ukuran file
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Ukuran file melebihi batas maksimal 10MB.');
      return false;
    }

    // Cek ekstensi file
    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Format file tidak diizinkan. Gunakan: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFile = (newFile) => {
    if (validateFile(newFile)) {
      if (onChange) {
        onChange(newFile);
      }
    } else {
      if (onChange) onChange(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (inputRef.current) inputRef.current.value = '';
    setError('');
    if (onChange) onChange(null);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-textPrimary mb-1.5">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragActive
            ? 'border-primary bg-indigo-50/50'
            : file
            ? 'border-emerald-300 bg-emerald-50/30'
            : error
            ? 'border-error bg-rose-50/30'
            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          className="hidden"
          accept={ALLOWED_EXTENSIONS.join(',')}
          onChange={handleChange}
        />

        {file ? (
          <div className="flex items-center justify-between p-2 bg-surface rounded-lg border border-emerald-200">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <File className="w-5 h-5" />
              </div>
              <div className="text-left truncate">
                <p className="text-sm font-medium text-textPrimary truncate">{file.name}</p>
                <p className="text-xs text-textSecondary">{formatSize(file.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-full text-slate-400 hover:text-error hover:bg-rose-50 transition-colors"
              title="Hapus file terpilih"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 bg-indigo-50 text-primary rounded-xl mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-textPrimary">
              <span className="text-primary font-semibold">Klik untuk memilih</span> atau seret file ke sini
            </p>
            {helperText && <p className="text-xs text-textSecondary mt-1.5 max-w-sm">{helperText}</p>}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-error">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
