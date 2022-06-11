const fs = require('fs');
const {Transform} = require("stream");
const {EOL} = require("os");

const config = {
    file: "access.log",
    ips: ["89.123.1.41", "34.48.240.111"],
    suffix: "_requests.log",
};

const lesson3 = () => {
    const readStream = new fs.ReadStream(`${__dirname}/${config.file}`, 'utf8');

    config.ips.forEach(ip => piper(ip, readStream));
};

const piper = (ip, stream) => {
    const fileWrite = new fs.WriteStream(`${__dirname}/${ip}${config.suffix}`, {flags: 'a', encoding: 'utf-8'})

    const search = new RegExp(`(${ip}.*)`, 'g');

    const transformStream = new Transform({
        transform(chunk, encoding, callback) {
            const transformedChunk = chunk.toString().match(search);

            if (transformedChunk.length) {
                transformedChunk.forEach(line => this.push(line + EOL))
            }

            callback();
        }
    });

    stream.pipe(transformStream).pipe(fileWrite);
};
lesson3();