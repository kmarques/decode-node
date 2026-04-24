#! /usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

const toWatchFolder = path.join(process.cwd(), 'to-watch');
(async () => {
    try {
        console.log(`Watching ${toWatchFolder}`);
        const watcher = fs.watch(toWatchFolder);
        for await (const event of watcher) {
            console.log(`File "${event.filename}" has been modified`);
            try {
                await fs.access(path.join(toWatchFolder, event.filename), fs.constants.F_OK);
            } catch (err) {
                console.debug(`File "${event.filename}" not found, must have been moved already or deleted`);
                continue;
            }
            const extension = path.extname(event.filename).slice(1);
            const destinationFolder = path.join(process.cwd(), extension);
            await fs.access(destinationFolder, fs.constants.W_OK);
            console.log(`Extension folder "${extension}" is found and writable`);
            await fs.rename(path.join(toWatchFolder, event.filename), path.join(destinationFolder, event.filename));
            console.log(`File "${event.filename}" has been moved to "${destinationFolder}"`);
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.debug(`Extension folder is not found, file will be ignored`)
        }
        if (err.code === 'EACCES') {
            console.debug(`Extension folder is not writable, file will be ignored`)
        }
        if (err.name === 'AbortError')
            return;
        throw err;
    }
})();
