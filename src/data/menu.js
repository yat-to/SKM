export const menu = [
    { id: '1', title: 'Dashboard', url: '/dashboard', icon: 'Home' },

    {
        id: '2',
        title: 'Penjualan',
        url: '',
        icon: 'ShoppingCart',
        children: [
            { title: 'Transaksi Baru', url: '/penjualan' },
            { title: 'Riwayat Penjualan', url: '/riwayatPenjualan' },
        ]
    },

    {
        id: '3',
        title: 'Stok Barang',
        url: '',
        icon: 'Boxes',
        children: [
            { title: 'Data Produk', url: '/produk' },
            { title: 'Tambah Stok (Restock)', url: '/restock' },
            // { title: 'Penyesuaian Stok', url: '/penyesuaianStok' },
        ]
    },

    {
        id: '4',
        title: 'Laporan',
        url: '',
        icon: 'BarChart3',
        children: [
            { title: 'Laporan Penjualan', url: '/lapPenjualan' },
            // { title: 'Laporan Laba Rugi', url: '/lapLaba' },
            // { title: 'Produk Terlaris', url: '/lapTerlaris' },
        ]
    },
    {
        id: '5', title: 'Master Data', url: '', icon: 'BookImage',
        children: [
            { title: 'Kategori', url: '/kategori' },
            { title: 'Brand', url: '/brand' },
        ]
    },
];