const pyodideWorker = new Worker("./webworker.js");

const callbacks = {0: (data) => {
    console.log("On step " + data.results + " of 36");
    // TODO: Add a progress bar
    document.getElementById("progress").value = data.results;
  }
};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  const onSuccess = callbacks[id];
  if (id != 0) {
    delete callbacks[id];
  }
  onSuccess(data);
};

const asyncRun = (() => {
  let id = 0; // identify a Promise
  return (cmd, context) => {
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        cmd: cmd,
        id,
      });
    });
  };
})();

export { asyncRun };