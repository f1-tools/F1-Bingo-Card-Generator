import { asyncRun } from "./py-worker.js";

const init_script = `card = Bingo()`;

const empty_context = {};

async function begin() {
  try {
    const { results, error } = await asyncRun(init_script, empty_context);
    if (results) {
      console.log("pyodideWorker return results: ", results);
    } else if (error) {
      console.log("pyodideWorker error: ", error);
    }
  } catch (e) {
    console.log(
      `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`,
    );
  }
}

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
}

const save_script = `
from js import username
card.name(username)
card.save()
encoding_string = card.base64()
encoding_string
`;

async function name() {
  try {
    const { results, error } = await asyncRun(save_script, {username: document.getElementById("name").value});
    if (results) {
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

main();