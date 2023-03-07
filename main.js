import { asyncRun } from "./py-worker.js";

function downloadPDF(encoded_string) {
    let decoded_string = atob(encoded_string);
    let bytes = new Uint8Array(decoded_string.length);
    for (let i = 0; i < decoded_string.length; i++) {
        bytes[i] = decoded_string.charCodeAt(i);
    }
    let blob = new Blob([bytes], {type: "application/pdf"});
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    let filename = "F1 Bingo Card.pdf";
    if (document.getElementById("name").value != "") {
        filename = "F1 Bingo Card - " + document.getElementById("name").value + ".pdf";
    }
    link.download = filename;
    link.click();
    document.getElementById("generate").style.display = "block";
    document.getElementById("progress").style.display = "none";
    document.getElementById("progress").value = 0;

}

async function download() {
    try {
      const { results, error } = await asyncRun('base64', {});
      if (results) {
        console.log("Done 3/3");
        downloadPDF(results);
      } else if (error) {
        console.log("pyodideWorker error: ", error);
      }
    } catch (e) {
      console.log(
        `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`,
      );
    }
  }

async function save() {
    try {
      const { results, error } = await asyncRun('save', {});
      if (results) {
        console.log("Done 2/3");
        download();
      } else if (error) {
        console.log("pyodideWorker error: ", error);
      }
    } catch (e) {
      console.log(
        `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`,
      );
    }
  }

async function name() {
  try {
    document.getElementById("generate").style.display = "none";
    document.getElementById("progress").style.display = "block";
    const { results, error } = await asyncRun('name', {username: document.getElementById("name").value});
    if (results) {
        console.log("Done 1/3");
        save();
    } else if (error) {
      console.log("pyodideWorker error: ", error);
    }
  } catch (e) {
    console.log(
      `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`,
    );
  }
}

window.onload = function() {
    document.getElementById("generate").addEventListener("click", name);
    // TODO: allow enter key to trigger generate
}