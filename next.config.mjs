/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist', // Mengubah nama folder output dari 'out' menjadi 'dist'
  trailingSlash: true, // <--- TAMBAHKAN BARIS INI
  images: {
    unoptimized: true, // <--- Tambahkan baris ini
  },
};

export default nextConfig;
