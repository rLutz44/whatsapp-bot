const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal'); // Import qrcode-terminal

const client = new Client({
    authStrategy: new LocalAuth(), // Saves the session, so you don’t need to scan the QR every time
    puppeteer: {
        headless: true, // Run in headless mode
        args: [
            '--no-sandbox', // Disable the sandbox
            '--disable-setuid-sandbox', // Disable setuid sandbox
            '--disable-dev-shm-usage', // Prevent shared memory issues
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Required for some containerized environments
            '--disable-gpu'
        ],
        timeout: 120000, // Set the timeout to 120 seconds
    }
});

client.on('ready', () => {
    console.log('✅ Bot is online!');
});

const forwardingNumber = '18002428478@c.us'; // Replace with the number to forward messages to
var originalSenderNumber = null;
var asker;

client.on('message_create', async message => {
    console.log(`📩 New message: ${message.body}`);
    // console.log(message);

    if (message.isGroupMsg || message.from.endsWith('@g.us')) {
        if (!message.mentionedIds.includes(client.info.wid._serialized)) {
            console.log('📢 Ignoring group message (bot not mentioned).');
            return; // Ignore group messages where the bot is not mentioned
        }
        console.log('🔔 Bot was mentioned in a group message.');
    }

    // Forward the message to the specified number
    if (!message.fromMe && message.from !== forwardingNumber) {
        console.log(`➡️ Forwarding message to ${forwardingNumber}`);
        originalSenderNumber = message.from;
        await client.sendMessage(forwardingNumber, message.body);
    }

    // Handle replies from the forwarding number
    if (message.from === forwardingNumber && originalSenderNumber) {
        // const originalSender = message.body.match(/Message from (.*?):/);
        // const senderNumber = originalSender[1];
        //senderChat = originalSender.
        const reply = message.body; // Remove the prefix
        console.log(`⬅️ Forwarding reply to ${originalSenderNumber}`);
        await client.sendMessage(originalSenderNumber, reply);
        originalSenderNumber = null;
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
    console.log(`Raw QR Code Data: ${qr}`); // Output the raw QR code data
    qrcode.generate(qr, { small: true }); // Render QR code in the terminal
});

client.on('error', (err) => {
    console.error('❌ An error occurred:', err);
});

client.initialize();