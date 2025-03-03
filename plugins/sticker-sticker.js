const fs = require('fs');

let handler = async (m, { conn, command, usedPrefix }) => {
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        console.log('MIME type:', mime); // Log MIME type

        if (/image/.test(mime)) {
            let media = await q.download();
            if (!media) throw new Error('Gagal mengunduh gambar.');
            console.log('Image media downloaded'); // Log download success
            conn.fakeReply(m.chat, 'Silahkan tunggu, sedang diproses...', '0@s.whatsapp.net', 'Sticker Maker', 'status@broadcast');
            let encmedia = await conn.sendImageAsSticker(m.chat, media, m, { packname: global.packname, author: global.author });
            await fs.unlinkSync(encmedia);
            console.log('Image sticker sent'); // Log sticker send success
        } else if (/video/.test(mime)) {
            if ((q.msg || q).seconds > 7) {
                console.log('Video terlalu panjang:', (q.msg || q).seconds, 'detik'); // Log video length
                return conn.fakeReply(m.chat, 'Maksimal durasi video adalah 6 detik!', '0@s.whatsapp.net', 'Sticker Maker', 'status@broadcast');
            }
            let media = await q.download();
            if (!media) throw new Error('Gagal mengunduh video.');
            console.log('Video media downloaded'); // Log download success
            conn.fakeReply(m.chat, 'Silahkan tunggu, sedang diproses...', '0@s.whatsapp.net', 'Sticker Maker', 'status@broadcast');
            let encmedia = await conn.sendVideoAsSticker(m.chat, media, m, { packname: global.packname, author: global.author });
            await fs.unlinkSync(encmedia);
            console.log('Video sticker sent'); // Log sticker send success
        } else {
            console.log('Unsupported MIME type or no media found:', mime);
            throw new Error(`Kirim Gambar/Video Dengan Caption ${usedPrefix + command}\nDurasi Video 1-6 Detik`);
        }
    } catch (err) {
        console.error('Error:', err); // Log any errors
        conn.fakeReply(m.chat, `Terjadi kesalahan: ${err.message}`, '0@s.whatsapp.net', 'Sticker Maker', 'status@broadcast');
    }
};

handler.help = ['sticker'];
handler.tags = ['sticker'];
handler.command = /^(stiker|s|sticker)$/i;
handler.limit = true; // No limit

module.exports = handler;

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|mp4)/, 'gi'));
};