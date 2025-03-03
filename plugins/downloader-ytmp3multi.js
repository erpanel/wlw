const fs = require('fs');
const { promisify } = require('util');
const AdmZip = require('adm-zip');
const fetch = require('node-fetch'); // Pastikan untuk memasang dependensi ini dengan `npm install node-fetch`

// Mengubah fs.writeFile menjadi fungsi berbasis Promise
const writeFile = promisify(fs.writeFile);

// Fungsi utama untuk mengunduh dan mengompres audio dari beberapa URL YouTube
async function downloadYtAlbum(urls, progressCallback) {
    // Membuat nama file ZIP dengan angka acak
    const zipPath = `audio_collection${Math.floor(Math.random() * 9999)}.zip`;
    const zip = new AdmZip();
    
    // Memisahkan URL berdasarkan baris baru dan memfilter hanya URL yang valid
    const urlList = urls.split('\n').filter(url => url.startsWith('http'));
    const total = urlList.length; // Total URL yang akan diproses
    let count = 0; // Menghitung jumlah URL yang sudah diproses
    
    for (const url of urlList) {
        try {
            // Mendapatkan informasi video dari API
            const infoRes = await fetch(`https://ytcdn.project-rian.my.id/info?url=${encodeURIComponent(url)}`);
            const info = await infoRes.json();
            
            // Lanjutkan jika judul atau bitrate tidak ditemukan
            if (!info.title || !info.audioBitrates[1]) continue;
            
            // Mengubah judul menjadi format yang aman untuk nama file
            const title = info.title.replace(/[^a-zA-Z0-9-_]/g, '_');
            const bitrate = info.audioBitrates[1];
            
            // Mengunduh audio dari API
            const audioRes = await fetch(`https://ytcdn.project-rian.my.id/audio?url=${encodeURIComponent(url)}&bitrate=${bitrate}`);
            const audioBuffer = await audioRes.arrayBuffer(); // Simpan sebagai buffer
            
            // Menambahkan file MP3 ke dalam ZIP
            zip.addFile(`${title}.mp3`, Buffer.from(audioBuffer));
            count++;
            
            // Memanggil callback untuk memperbarui status proses
            if (progressCallback) progressCallback(`Processed ${count}/${total}: ${title}`);
        } catch (error) {
            console.error(`Error processing ${url}:`, error);
        }
    }
    
    // Menyimpan ZIP ke file
    await writeFile(zipPath, zip.toBuffer());
    if (progressCallback) progressCallback(`ZIP file created: ${zipPath}`);
    return zipPath;
}

// Handler untuk bot
let handler = async (m, { conn, text }) => {
    // Validasi input URL
    if (!text) return m.reply(`💡 *Cara Penggunaan:*\n\nKirim perintah dengan URL Audio YouTube:\n.ytmp3multi https://www.youtube.com/watch?v=xxxx\nhttps://www.youtube.com/watch?v=yyyy\n...`);
    if (!/http.+youtu/.test(text)) return m.reply('⚠️ Masukkan URL YouTube yang valid');
    
    let teks = '⏳ Memulai...';
    let msg = await conn.sendMessage(m.chat, { text: teks }, { quoted: m });
    
    // Memanggil fungsi untuk mengunduh dan mengompres audio
    const makezip = await downloadYtAlbum(text, (process) => {
        teks += '\n' + process;
        conn.sendMessage(m.chat, { text: teks, edit: msg.key });
    });

    // Mengirim file ZIP ke pengguna
    m.reply('📦 Mengirim ZIP...');
    await conn.sendMessage(m.chat, { document: { url: makezip }, fileName: makezip, mimetype: 'application/zip' });
    
    // Menghapus file ZIP setelah dikirim
    fs.unlink(makezip, (err) => {
        if (err) {
            console.error(`❌ Gagal menghapus file: ${makezip}`, err);
        } else {
            console.log(`🗑️ Berhasil menghapus file: ${makezip}`);
        }
    });
};

handler.help = ["ytmp3multi"];
handler.tags = ["downloader"];
handler.command = ["ytmp3multi"];

module.exports = handler;