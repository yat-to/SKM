// lib/logger.js

/**
 * Console logger khusus untuk memantau data Dashboard di Inspect Element.
 * @param {'SUCCESS' | 'ERROR'} status - Status dari permintaan API ('SUCCESS' atau 'ERROR')
 * @param {Object} payload - Response data dari server atau error object
 */
export const logDashboard = (status, payload) => {
    const isSuccess = status === 'SUCCESS';
    const headerColor = isSuccess 
        ? 'background: #10b981; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px;' 
        : 'background: #ef4444; color: white; font-weight: bold; padding: 2px 8px; border-radius: 4px;';

    console.groupCollapsed(
        `%c[DASHBOARD API] ${status} - ${new Date().toLocaleTimeString('id-ID')}`, 
        headerColor
    );

    if (isSuccess) {
        console.log('%cSummary Data:', 'color: #3b82f6; font-weight: bold;', payload.summary);

        console.group('Detail Datasets');
        console.log('📈 Tren Kepuasan (Line Chart):');
        console.table(payload.trenKepuasan || []);

        console.log('📊 Kategori Kepuasan (Bar Chart):');
        console.table(payload.kategoriKepuasan || []);

        console.log('⭐ Skor per Layanan:');
        console.table(payload.kepuasanPerLayanan || []);

        console.log('💬 Komentar Terbaru:');
        console.table(payload.komentarPengguna || []);
        console.groupEnd();

        if (payload.responseTime) {
            console.log(`⏱️ Waktu Respon API: ${payload.responseTime}`);
        }

        console.log('%cFull Raw Response Payload:', 'color: #8b5cf6; font-weight: bold;', payload);
    } else {
        console.error('❌ Error Detail:', payload);
    }

    console.groupEnd();
};