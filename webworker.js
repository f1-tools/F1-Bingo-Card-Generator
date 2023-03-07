// webworker.js

importScripts("https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js");

async function loadPyodideAndPackages() {
    // Load pyodide
    console.log("Loading Pyodide... (this may take a while)");
    self.pyodide = await loadPyodide();
    // Load micropip
    console.log("Loading micropip...");
    await self.pyodide.loadPackage("micropip");
    // Import micropip
    console.log("Importing micropip...")
    self.micropip = await self.pyodide.pyimport("micropip");
    // Install fpdf
    console.log("Installing fpdf...");
    await self.micropip.install("https://raw.githubusercontent.com/f1-tools/F1-Bingo-Card-Generator/main/fpdf-1.7.2-py2.py3-none-any.whl");

    self.resources_url = 'https://raw.githubusercontent.com/f1-tools/F1-Bingo-Card-Generator/main/resources.zip';
    console.log("Loading resources... (this may take a while)");
    self.zipResponse = await fetch(self.resources_url);
    console.log("Unpacking resources... (this may take a while)");
    self.zipBinary = await self.zipResponse.arrayBuffer();
    await self.pyodide.unpackArchive(self.zipBinary, "zip");

    // Import 
    console.log("Importing bingo_maker...");
    await self.pyodide.loadPackagesFromImports("bingo_maker");
    self.bingo_maker = await self.pyodide.pyimport("bingo_maker");

    console.log("Creating card... (this may take a while)");
    // TODO: break up init into smaller functions so we can show progress
    self.card = await self.bingo_maker.Bingo();
}
let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
    // make sure loading is done
    await pyodideReadyPromise;
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
            self.postMessage({ results: "Done", id });
        }
        else if (cmd === "base64") {
            const results = await self.card.base64_export();
            self.postMessage({ results, id });
        } else {
            let set_name = self.username || "";
            await self.card.name(set_name);
            self.postMessage({ results: "Done", id });
        }
    } catch (error) {
        self.postMessage({ error: error.message, id });
    }
};