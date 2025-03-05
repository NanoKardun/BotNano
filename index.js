const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] });

//list chat nya
const replies = [
    'Bacot Item nigga lu!',
    'Lu hitam diem deh',
    'Bisa gasih gausah manggil-manggil gua mulu',
    'Nigga nigga',
    'Serah lu dah anjing'
];

//buat ngitung mention per user
const mentionCount = {};

// Pemberitahuan kalau bot nya udah On
client.on('ready', () => {
    console.log('Babu udah nyala King');
});

client.on('messageCreate', async (message) => {
    // Biar bot nggak ngomong sndiri
    if (message.author.bot) return;

    // Respon khusus buat !halo atau !Halo (Case sensitif)
    if (message.content.toLowerCase() === '!halo') {
        message.reply('Bacot lu!');
    }

    // Cek kalo bot di mention, tapi gak respon ke balesan bot
    if (message.mentions.has(client.user) && message.author.id !== client.user.id) {
        const userId = message.author.id;


    // Insialisasi hitungan mention user kl blm ada
    if (!mentionCount[userId]) mentionCount[userId] = 0;

    //kalo mention lebih dr 5 ga respon
    if (mentionCount[userId] < replies.length) {
        const reply = replies[mentionCount[userId]];
        message.reply(reply);
        mentionCount[userId]++;

        if (mentionCount[userId] ===replies.length) {
            setTimeout(() => {
                mentionCount[userId] = 0;
            }, 10000); //reset 10 detik
        }
    }
}

// command play lagu dari yt
if (message.content.startsWith('!play ')) {
    const url = message.content.split(' ')[1];
    if (!url) return message.reply('Mana link lagunya bego');
    
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply(' masuk voice dulu blok! ');

    if (!voiceChannel.permissionsFor(client.user).has('Speak')) {
        return message.reply('Gua ga dapet izin buat yapping disini, kasih izin dulu su');
    }


    try {
        const stream = await play.stream(url);
        const resource = createAudioResource(stream.stream, { inputType: stream.type});
        const player = createAudioPlayer();



        const connection =joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,selfDeaf: true
        });

        connection.on(VoiceConnectionStatus.Signalling, () => {
            console.log('Koneksi dalam tahap signalling...');
        });

        connection.on(VoiceConnectionStatus.Connecting, () => {
            console.log('Bot lagi nyoba connect ke voice channel...');
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('Bot udah connect dan siap muter lagu!');
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log('Bot disconnected dari voice channel!');
        });

        connection.on(VoiceConnectionStatus.Destroyed, () => {
            console.log('Koneksi bot dihancurkan!');
        });

        player.play(resource);
        player.on(AudioPlayerStatus.Playing, () => {
            console.log('Lagu mulai diputar!');
        });
        
        player.on(AudioPlayerStatus.Buffering, () => {
            console.log('Masih buffering...');
        });
        
        player.on(AudioPlayerStatus.AutoPaused, () => {
            console.log('Player autopause, mungkin karena nggak ada listener.');
        });
        
        player.on(AudioPlayerStatus.Paused, () => {
            console.log('Lagu dipause.');
        });
        
        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Player dalam keadaan idle.');
        });
        
        console.log('Resource dibuat:', resource); //log resource
        console.log('player status setelah play:', player.state.status); //log status player


        connection.subscribe(player);

        player.on('error', (error) => {
            console.error('Player error:', error);
            message.reply('Ada error pas muter lagu king');
        });

        resource.playStream.on('error', (error) => {
            console.error('Stream error:', error);
        })
        
        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
            message.reply('Lagu dah gw puter jinkk')
        })


        message.reply('lagi muter jinkk! ');
    } catch (error) {
        console.error(error);
        message.reply('Gagal muter lagu, cek lagi linknya.');
    }
}
});

client.login('isitokenndiri')
