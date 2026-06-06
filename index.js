const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        executablePath: process.env.CHROME_BIN,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        headless: true
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('Escaneá este QR con WhatsApp:');
});

client.on('ready', () => {
    console.log('✅ Bot conectado a WhatsApp!');
});

client.on('message', msg => {
    if (msg.body === '!ping') {
        msg.reply('pong');
    }
});

client.initialize();
