#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const EventEmitter = require('events');
const inquirer = require('inquirer');
const yargs = require("yargs");
const { Transform } = require("stream");
const { EOL } = require("os");

const search = () => {
    class MyEmitter extends EventEmitter { }

    const myEmitter = new MyEmitter();
    const options = yargsConf();
    const search = new RegExp(`(.*${options.search}.*)`, 'g');

    const showFileContents = async (filepath) => {
        if (isFile(filepath)) {
            return new Promise((resolve) => {
                const transformStream = transformChunks(search);
                const stream = fs.createReadStream(filepath, 'utf-8');
                stream.on('end', resolve);
                stream.pipe(transformStream).pipe(process.stdout);
            });
        } else {
            const filesInPath = await getFileNamesInDirectory(filepath);
            const userInput = await promptUser(filesInPath);
            myEmitter.emit("changePath", path.join(filepath, userInput));
        }
    }

    myEmitter.on("changePath", (path) => {
        showFileContents(path).catch(console.log);
    });
    myEmitter.emit("changePath", options.path ?? process.cwd())
};

const isFile = (filepath) => {
    return fs.lstatSync(filepath).isFile();
};

const getFileNamesInDirectory = async (directory) => {
    return await new Promise((resolve) => {
        fs.readdir(directory, (err, data) => {
            if (directory !== "/") {
                data.unshift("..");
            }
            resolve(data);
        });
    });
}

const promptUser = async (choices) => {
    const optionKey = 'optionKey';
    const result = await inquirer.prompt([{
        name: optionKey,
        type: 'list',
        message: 'Please choose a file to read',
        choices,
    }]);
    return result[optionKey];
};

const yargsConf = () => {
    return yargs
        .usage("Usage: -p <path>")
        .option("p", {
            alias: "path",
            describe: "Path to file",
            type: "string",
            demandOption: false
        })
        .option("s", {
            alias: "search",
            describe: "Search string in file",
            type: "string",
            demandOption: true
        })
        .argv;
};

const transformChunks = (search) => {
    return new Transform({
        transform(chunk, encoding, callback) {
            const transformedChunk = chunk.toString().match(search);

            if (transformedChunk?.length) {
                transformedChunk.forEach(line => {
                    this.push(`| ${line.trim()} ${EOL}|----------------------------------- ${EOL}`)
                })
            }

            callback();
        }
    });
};

search();