const handler = async (m, { conn, command }) => {
    try {
        console.log(`Command received: ${command}`); // Log command received
        const pin = !command.includes('un');
        console.log(`Pin status: ${pin}`); // Log pin status

        await conn.chatModify({ pin: pin }, m.chat);
        m.reply(`Chat berhasil di *${pin ? 'pin' : 'unpin'}*.`);
    } catch (e) {
        console.error(`Error occurred: ${e.message}`); // Log error message
        m.reply('Gagal, coba lagi nanti.');
    }
}

handler.help = ['pinchat', 'unpinchat'];
handler.tags = ['owner'];
handler.command = /^((un)?pin(chats?))$/i;

handler.owner = true;

module.exports = handler;