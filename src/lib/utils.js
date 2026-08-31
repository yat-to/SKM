// src/lib/utils.js

/**
 * Fungsi untuk mengambil inisial 2 huruf dari nama
 * @param {string} name 
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return "?";
  
  // Bersihkan spasi di depan/belakang dan split
  const parts = name.trim().split(/\s+/);
  
  if (parts.length >= 2) {
    // Ambil huruf pertama kata ke-1 dan huruf pertama kata ke-2
    return (parts[0][1] + parts[1][0]).toUpperCase();
  }
  
  // Jika cuma 1 kata, ambil 2 huruf pertama
  return parts[0].length >= 2 
    ? parts[0].substring(0, 2).toUpperCase() 
    : parts[0][0].toUpperCase();
};

/**
 * Tambahan: Fungsi untuk format mata uang (sering dipakai di aplikasi Aset/Keuangan)
 */
export const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka);
};

/**
 * Format tanggal standar Indonesia (contoh: "1 Juli 2026")
 * @param {string|Date} date - String tanggal / ISO date / Objek Date
 * @param {boolean} withDay - Opsi tampilkan nama hari (default: false)
 * @returns {string}
 */
export const formatTanggal = (date, withDay = false) => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withDay && { weekday: 'long' })
  }).format(d);
};

/**
 * Format tanggal singkat untuk tabel/badge (contoh: "01/07/2026")
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatTanggalShort = (date) => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

/**
 * Format tanggal beserta waktu (contoh: "1 Juli 2026, 14:30")
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatTanggalWaktu = (date) => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  const formatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);

  return formatted.replace('.', ':');
};