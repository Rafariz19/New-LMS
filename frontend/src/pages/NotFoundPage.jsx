import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="p-4 rounded-3xl bg-indigo-50 text-primary mb-6">
        <HelpCircle className="w-16 h-16" />
      </div>
      <h1 className="text-4xl font-extrabold text-textPrimary tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-textPrimary mt-2">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-textSecondary max-w-md mt-2 mb-8">
        Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tautan yang Anda tuju salah.
      </p>
      <Link to="/">
        <Button variant="primary" icon={Home} size="lg">
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}
