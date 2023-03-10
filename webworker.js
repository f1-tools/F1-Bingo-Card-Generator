// webworker.js

importScripts("https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js");

let step = -1;

function increment_step() {
    step += 1;
    return step;
}

function update_progress(msg) {
    if (msg != "" && msg != undefined) {
        console.log(msg);
    }
    self.postMessage({ results: increment_step(), id: 0 });
}

async function startPDF() {
    if (self.bingo_maker == undefined) {
        await loadPyodideAndPackages();
    }
    step = 6;
    update_progress("Creating card... (this may take a while)");
    self.card = await self.bingo_maker.Bingo(true);
    for (let i = 0; i < 25; i++) {
        update_progress();
        await self.card.steps(i);
    }
    update_progress("Done and ready for name");
}

async function loadPyodideAndPackages() {
    // Load pyodide
    update_progress("Loading Pyodide... (this may take a while)");
    self.pyodide = await loadPyodide();
    // Load micropip
    update_progress("Loading micropip...");
    await self.pyodide.loadPackage("micropip");
    // Import micropip
    update_progress("Importing micropip...")
    self.micropip = await self.pyodide.pyimport("micropip");
    // Install fpdf
    update_progress("Installing fpdf...");
    await self.micropip.install("https://f1-tools.github.io/F1-Bingo-Card-Generator/fpdf-1.7.2-py2.py3-none-any.whl");

    self.resources_url = 'https://f1-tools.github.io/F1-Bingo-Card-Generator/resources.zip';
    update_progress("Loading resources... (this may take a while)");
    self.zipResponse = await fetch(self.resources_url);
    update_progress("Unpacking resources... (this may take a while)");
    self.zipBinary = await self.zipResponse.arrayBuffer();
    await self.pyodide.unpackArchive(self.zipBinary, "zip");

    // Import 
    update_progress("Importing bingo_maker...");
    await self.pyodide.loadPackagesFromImports("bingo_maker");
    self.bingo_maker = await self.pyodide.pyimport("bingo_maker");
}
let pdfReadyPromise = startPDF();


self.onmessage = async (event) => {
    // make sure loading is done
    await pdfReadyPromise;
    // Don't bother yet with this line, suppose our API is built in such a way:
    const { id, cmd, ...context } = event.data;
    // The worker copies the context in its own "memory" (an object mapping name to values)
    for (const key of Object.keys(context)) {
        self[key] = context[key];
    }
    // Now is the easy part, the one that is similar to working in the main thread:
    try {
        if (cmd === "save") {
            await self.card.save();
            self.postMessage({ results: increment_step(), id });
        }
        else if (cmd === "base64") {
            const results = await self.card.base64_export();
            self.postMessage({ results, id });
            pdfReadyPromise = startPDF();
        } else {
            let set_name = self.username || "";
            await self.card.name(set_name);
            self.postMessage({ results: increment_step(), id });
        }
    } catch (error) {
        self.postMessage({ error: error.message, id });
    }
};