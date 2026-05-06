const fs = require('fs');
const path = require('path');

function createWav(filename, generateSamples, duration, sampleRate = 44100) {
    const numSamples = Math.floor(sampleRate * duration);
    const numChannels = 1;
    const bitsPerSample = 16;

    const blockAlign = numChannels * (bitsPerSample / 8);
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const chunkSize = 36 + dataSize;

    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF chunk descriptor
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(chunkSize, 4);
    buffer.write('WAVE', 8);

    // fmt sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);

    // data sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Write samples
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        let sample = generateSamples(t, i, numSamples);
        // clamp
        sample = Math.max(-1, Math.min(1, sample));
        buffer.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
    }

    fs.writeFileSync(filename, buffer);
    console.log('Generated:', filename);
}

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// 1. Jump (sweep up)
createWav(path.join(assetsDir, 'jump.wav'), (t, i, total) => {
    const freq = 300 + (600 - 300) * (i / total);
    const env = 1 - (i / total);
    return Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.3 * env;
}, 0.15);

// 2. Double Jump (higher sweep up)
createWav(path.join(assetsDir, 'double_jump.wav'), (t, i, total) => {
    const freq = 500 + (900 - 500) * (i / total);
    const env = 1 - (i / total);
    return Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.3 * env;
}, 0.15);

// 3. Coin (high pitch ping)
createWav(path.join(assetsDir, 'coin.wav'), (t, i, total) => {
    const freq = 1200 + (1600 - 1200) * (i / total);
    const env = Math.exp(-10 * (i / total));
    return Math.sin(2 * Math.PI * freq * t) * 0.4 * env;
}, 0.1);

// 4. Game Over (sweep down)
createWav(path.join(assetsDir, 'gameover.wav'), (t, i, total) => {
    const freq = 400 - (300) * (i / total);
    const env = 1 - (i / total);
    return Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.4 * env;
}, 0.6);

// 5. Music (simple repetitive chip tune)
createWav(path.join(assetsDir, 'music.wav'), (t, i, total) => {
    const bps = 4; // beats per second
    const beat = Math.floor(t * bps) % 8;
    const notes = [220, 220, 330, 220, 440, 330, 220, 220]; // A3, A3, E4, A3, A4, E4, A3, A3
    const freq = notes[beat];
    // Add some arpeggio/vibrato
    const vibrato = Math.sin(2 * Math.PI * 8 * t) * 10;
    const vol = 0.1 * (1 - ((t * bps) % 1)); // Envelope per beat
    return Math.sign(Math.sin(2 * Math.PI * (freq + vibrato) * t)) * vol;
}, 8.0); // 8 second loop
