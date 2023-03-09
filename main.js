import { asyncRun } from "./py-worker.js";

function downloadPDF(encoded_string) {
    let decoded_string = atob(encoded_string);
    let bytes = new Uint8Array(decoded_string.length);
    for (let i = 0; i < decoded_string.length; i++) {
        bytes[i] = decoded_string.charCodeAt(i);
    }
    let blob = new Blob([bytes], {type: "application/pdf"});
    let filename = "F1 Bingo Card.pdf";
    if (document.getElementById("name").value != "") {
        filename = "F1 Bingo Card - " + document.getElementById("name").value + ".pdf";
    }
    let ifg = document.createElement("iframe");
    ifg.src = (URL.createObjectURL(blob));
    ifg.title = filename;
    document.getElementById("iframe-box").appendChild(ifg);
    document.getElementById("docView").style.display = "block";
    // TODO:  pdf view height fix
    
    let link = document.getElementById("downloadButton");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.target = "_blank";

    document.getElementById("generate").style.display = "block";
    document.getElementById("name").disabled = false;
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
    //hide generate button
    document.getElementById("generate").style.display = "none";
    //disable name input
    document.getElementById("name").disabled = true;
    //show progress bar
    document.getElementById("progress").style.display = "block";
    //remove previous iframe if it exists
    let ifg = document.getElementById("iframe-box").firstChild
    if (ifg != null) {
      document.getElementById("iframe-box").removeChild(ifg);
    }
    document.getElementById("docView").style.display = "none";

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

function event(e) {
    if (e.keyCode == 13) {
        name();
    }
}

window.onload = function() {
    document.getElementById("generate").addEventListener("click", name);
    //allow enter key to trigger generate
    document.getElementById("name").addEventListener("keyup", event);

    //navbar 
}

//navbar code for burger menu for mobile
document.addEventListener('DOMContentLoaded', () => {

  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  // Add a click event on each of them
  $navbarBurgers.forEach( el => {
    el.addEventListener('click', () => {

      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');

    });
  });

});