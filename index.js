const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal'); // Import qrcode-terminal

const client = new Client({
    authStrategy: new LocalAuth() // Saves the session, so you don’t need to scan the QR every time
});

client.on('ready', () => {
    console.log('✅ Bot is online!');
});

client.on('message_create', message => {
    console.log(`📩 New message: ${message.body}`);
    // console.log(message);

    if (message.isGroupMsg) {
        console.log('📢 Ignoring group message.');
        return; // Ignore group messages
    }

    // Allow the bot to respond to messages sent by yourself
    if (message.fromMe && message.body.toLowerCase() === 'hello') {
        message.reply('Hey there! I am your WhatsApp bot. 😊');
    }

    //Handle messages from others
     if (!message.fromMe && message.body.toLowerCase() === 'hello') {
        message.reply('Hey there! I am your WhatsApp bot. 😊');
    } 
});

// Add error handling
client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.error('❌ Client was logged out:', reason);
});

// Render QR code in the terminal
client.on('qr', (qr) => {
    console.log('📱 Scan this QR code to log in:');
    qrcode.generate(qr, { small: true }); // Render QR code in the terminal
});

client.on('error', (err) => {
    console.error('❌ An error occurred:', err);
});

client.initialize();