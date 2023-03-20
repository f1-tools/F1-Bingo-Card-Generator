import { asyncRun } from './py-worker.js';

let num_runs = 0;

function re_init() {
    let include_margins = document.getElementById('margins').checked;
    asyncRun('margins', { margins: include_margins });
}

function downloadPDF(encoded_string) {
    let decoded_string = atob(encoded_string);
    let bytes = new Uint8Array(decoded_string.length);
    for (let i = 0; i < decoded_string.length; i++) {
        bytes[i] = decoded_string.charCodeAt(i);
    }
    let blob = new Blob([bytes], { type: 'application/pdf' });
    let filename = 'F1 Bingo Card.pdf';
    if (document.getElementById('name').value != '') {
        filename =
            'F1 Bingo Card - ' + document.getElementById('name').value + '.pdf';
    }
    let ifg = document.createElement('iframe');
    ifg.src =
        URL.createObjectURL(blob) +
        '#toolbar=0&navpanes=0&statusbar=0&messages=0&scrollbar=0&view=FitH';
    ifg.title = filename;
    ifg.classList.add('has-ratio');
    document.getElementById('iframe-box').appendChild(ifg);
    document.getElementById('docView').style.display = 'block';

    // generate download button
    let link = document.getElementById('downloadButton');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.target = '_blank';
    link.onclick = function () {
        gtag('event', 'file_downloaded', {});
    };

    gtag('event', 'file_generated', {});

    // reset generate button
    document.getElementById('generate').style.display = 'block';
    document.getElementById('name').disabled = false;
    document.getElementById('progress').style.display = 'none';
    document.getElementById('progress').value = 0;
}

async function download() {
    try {
        const { results, error } = await asyncRun('base64', {
            margins: document.getElementById('margins').checked,
        });
        if (results) {
            console.log('Done 3/3');
            downloadPDF(results);
        } else if (error) {
            console.log('pyodideWorker error: ', error);
            gtag('event', 'exception', {
                description: 'pyodideWorker error',
                error: error,
                stack: new Error().stack || 'no stack trace',
                fatal: true,
            });
        }
    } catch (e) {
        console.log(
            `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
        );
        gtag('event', 'exception', {
            description: 'pyodideWorker error',
            error: JSON.stringify(e),
            stack: new Error().stack || 'no stack trace',
            fatal: true,
        });
    }
}

async function save() {
    try {
        const { results, error } = await asyncRun('save', {});
        if (results) {
            console.log('Done 2/3');
            download();
        } else if (error) {
            console.log('pyodideWorker error: ', error);
            gtag('event', 'exception', {
                description: 'pyodideWorker error',
                error: error,
                stack: new Error().stack || 'no stack trace',
                fatal: true,
            });
        }
    } catch (e) {
        console.log(
            `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
        );
        gtag('event', 'exception', {
            description: 'pyodideWorker error',
            error: JSON.stringify(e),
            stack: new Error().stack || 'no stack trace',
            fatal: true,
        });
    }
}

async function name() {
    try {
        num_runs += 1;
        //hide generate button
        document.getElementById('generate').style.display = 'none';
        //disable name input
        document.getElementById('name').disabled = true;
        //show progress bar
        document.getElementById('progress').style.display = 'block';
        //remove previous iframe if it exists
        let ifg = document.getElementById('iframe-box').firstChild;
        if (ifg != null) {
            document.getElementById('iframe-box').removeChild(ifg);
        }
        document.getElementById('docView').style.display = 'none';

        let name = document.getElementById('name').value;

        gtag('event', 'generate_button', {
            name: name,
            run_number: num_runs,
        });

        const { results, error } = await asyncRun('name', {
            username: name,
            margins: document.getElementById('margins').checked,
        });
        if (results) {
            console.log('Done 1/3');
            save();
        } else if (error) {
            console.log('pyodideWorker error: ', error);
            gtag('event', 'exception', {
                description: 'pyodideWorker error',
                error: error,
                stack: new Error().stack || 'no stack trace',
                fatal: true,
            });
        }
    } catch (e) {
        console.log(
            `Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
        );
        gtag('event', 'exception', {
            description: 'pyodideWorker error',
            error: JSON.stringify(e),
            stack: new Error().stack || 'no stack trace',
            fatal: true,
        });
    }
}

function event(e) {
    if (e.key === 'Enter' || e.keyCode == 13) {
        name();
    }
}

window.onload = function () {
    document.getElementById('generate').addEventListener('click', name);
    //allow enter key to trigger generate
    document.getElementById('name').addEventListener('keyup', event);

    document.getElementById('margins').addEventListener('change', re_init);
};

//navbar code for burger menu for mobile
document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(
        document.querySelectorAll('.navbar-burger'),
        0
    );

    // Add a click event on each of them
    $navbarBurgers.forEach((el) => {
        el.addEventListener('click', () => {
            // Get the target from the "data-target" attribute
            const target = el.dataset.target;
            const $target = document.getElementById(target);

            // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
            el.classList.toggle('is-active');
            $target.classList.toggle('is-active');
        });
    });

    // get all a elements in #navbarBasicExample
    const $navbarLinks = Array.prototype.slice.call(
        document.querySelectorAll('#navbarBasicExample a'),
        0
    );

    const $navbarMenu = document.getElementById('navbarBasicExample');

    // add click event to each link
    $navbarLinks.forEach((el) => {
        el.addEventListener('click', () => {
            // remove is-active class from all navbar-burger elements
            $navbarBurgers.forEach((el) => {
                el.classList.remove('is-active');
            });

            // remove is-active class from navbar-menu
            $navbarMenu.classList.remove('is-active');
        });
    });
});
