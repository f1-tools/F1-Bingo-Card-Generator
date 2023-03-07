// webworker.js

importScripts("https://cdn.jsdelivr.net/pyodide/v0.22.1/full/pyodide.js");

async function loadPyodideAndPackages() {
    // Load pyodide
    self.pyodide = await loadPyodide();
    // Load micropip
    await self.pyodide.loadPackage("micropip");
    // Import micropip
    self.micropip = await self.pyodide.pyimport("micropip");
    // Install fpdf
    await self.micropip.install("https://raw.githubusercontent.com/jonahhb/F1-Bingo-Card-Generator/main/fpdf-1.7.2-py2.py3-none-any.whl");

    self.resources_url = 'https://raw.githubusercontent.com/jonahhb/F1-Bingo-Card-Generator/main/resources.zip';
    self.zipResponse = await fetch(self.resources_url);
    self.zipBinary = await self.zipResponse.arrayBuffer();
    await self.pyodide.unpackArchive(self.zipBinary, "zip");

    self.pyodide.pyimport("bingo_maker");
}
let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
    // make sure loading is done
    await pyodideReadyPromise;
    // Don't bother yet with this line, suppose our API is built in such a way:
    const { id, python, ...context } = event.data;
    // The worker copies the context in its own "memory" (an object mapping name to values)
    for (const key of Object.keys(context)) {
        self[key] = context[key];
    }
    // Now is the easy part, the one that is similar to working in the main thread:
    try {
        await self.pyodide.loadPackagesFromImports(python);
        let results = await self.pyodide.runPythonAsync(python);
        self.postMessage({ results, id });
    } catch (error) {
        self.postMessage({ error: error.message, id });
    }
};