const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const ac = new AbortController();
const { signal } = ac;
//setTimeout(() => ac.abort(), 60000);

const PITFALL_FOLDER = "./pitfall";
const PITFALL_FULL_FOLDER = path.join(process.cwd(), PITFALL_FOLDER);

async function routeFileEvent(event) {
    const { filename } = event;
    const extension = path.extname(filename);
    const EXTENSION_FOLDER = path.join(PITFALL_FULL_FOLDER, '..', 'sorted_folder', extension.slice(1));
    try {
        await fs.access(EXTENSION_FOLDER, fs.constants.F_OK | fs.constants.W_OK);
    } catch (error) {
        if (error.message.includes('no such file'))
            await fs.mkdir(EXTENSION_FOLDER, { recursive: true });
        else await fs.chmod(EXTENSION_FOLDER, 777);
    }
    await fs.rename(path.join(PITFALL_FULL_FOLDER, filename), path.join(EXTENSION_FOLDER, filename));
}

function wait(xSeconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, xSeconds * 1000);
    });
}

function pollFolderEvent(folderPath, { signal }) {
    return (async function* () {
        let aborted = false;
        signal.addEventListener("abort", () => (aborted = true), {
            once: true,
        });
        while (true) {
            await wait(5);
            if (aborted) break;
            const filenames = await fs.readdir(folderPath);
            for (const filename of filenames) {
                yield { eventType: "rename", filename };
            }
        }
    })();
}

(async () => {
    try {
        await fs.access(PITFALL_FULL_FOLDER, fs.constants.R_OK | fs.constants.X_OK);
        const watchGenerator = os.platform === "win32" ? pollFolderEvent : fs.watch;
        const watcher = watchGenerator(PITFALL_FULL_FOLDER, { signal, recursive: true });
        for await (const event of watcher)
            await routeFileEvent(event);
    } catch (error) {
        console.error(error);
    }
})()