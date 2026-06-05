const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const path = require('path')

const SESSION_DIR = './session'

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Wasapp-bot', 'Chrome', '1.0.0']
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

        if(qr) {
            console.log('Escaneá este QR con WhatsApp:')
            qrcode.generate(qr, {small: true})
        }

        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode!== DisconnectReason.loggedOut
            console.log('Conexión cerrada. Reconectando:', shouldReconnect)
            if(shouldReconnect) {
                startBot()
            }
        } else if(connection === 'open') {
            console.log('✅ Bot conectado a WhatsApp!')
        }
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async m => {
        if(!m.messages[0].key.fromMe && m.messages[0].message) {
            const msg = m.messages[0]
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
            const sender = msg.key.remoteJid

            console.log('Mensaje recibido:', text)

            if(text.toLowerCase() === 'hola') {
                await sock.sendMessage(sender, { text: 'Hola! Soy tu bot de WhatsApp 🤖' })
            }
            if(text.toLowerCase() === 'menu') {
                await sock.sendMessage(sender, { text: 'Comandos disponibles:\n.hola - Saludo\n.menu - Este menú' })
            }
        }
    })
}

startBot()
