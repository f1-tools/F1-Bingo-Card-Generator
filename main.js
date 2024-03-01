import { base64ImageCache, PlacementInfo, ImageInfo } from './consts.js';

async function getBase64ImageFromURL(url) {
    if (base64ImageCache[url]) {
        return base64ImageCache[url];
    } else {
        let base64Image = new Promise((resolve, reject) => {
            var img = new Image();
            img.setAttribute("crossOrigin", "anonymous");

            img.onload = () => {
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                var dataURL = canvas.toDataURL("image/png");

                resolve(dataURL);
            };

            img.onerror = (error) => {
                reject(error);
            };

            img.src = url;
        });
        base64ImageCache[url] = base64Image;
        return base64Image;
    }
}

async function MakeSingleBingoCard(docDefinition, pageType, bingoCardType, num = 1, steps) {
    console.log("MakeSingleBingoCard");
    let pi = PlacementInfo[pageType]; // pi = placement info
    let ii = ImageInfo[bingoCardType]; // ii = image info

    let pageWidth = pi.width;
    let pageHeight = pi.height;

    let start = pi.image_position_info.start;
    let row_spacing = pi.image_position_info.row_spacing;
    let col_spacing = pi.image_position_info.col_spacing;
    let image_size = pi.image_size;

    let imagedir = ii.directory;
    let background = imagedir + pageType + ".png";
    let middle_img = imagedir + ii.middle;

    let stepsCompleted = 0;

    for (let cardNum = 0; cardNum < num; cardNum++) {
        // create bool 5x5 array of false values to keep track of which squares have been filled
        let filledSquares = Array(5).fill(false).map(() => Array(5).fill(false));

        // place the middle image
        docDefinition.content.push({
            image: await getBase64ImageFromURL(middle_img),
            width: image_size.width,
            height: image_size.height,
            absolutePosition: {
                x:
                    start.x +
                    2 * col_spacing,
                y:
                    start.y +
                    2 * row_spacing
            }
        });
        filledSquares[2][2] = true;

        // place the always included images in random unfilled squares
        for (let i = 0; i < ii.alwaysIncluded.length; i++) {
            let image = ii.alwaysIncluded[i];
            let x, y;
            do {
                x = Math.floor(Math.random() * 5);
                y = Math.floor(Math.random() * 5);
            } while (filledSquares[x][y]);
            docDefinition.content.push({
                image: await getBase64ImageFromURL(imagedir + image),
                width: image_size.width,
                height: image_size.height,
                absolutePosition: {
                    x:
                        start.x +
                        y * col_spacing,
                    y:
                        start.y +
                        x * row_spacing
                }
            });
            filledSquares[x][y] = true;
        }

        // fill the remaining squares with random images from general images with no repeats
        let used_imgs = [];
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (!filledSquares[row][col]) {
                    let image = Math.floor(Math.random() * ii.num_of_general) + 1;
                    while (used_imgs.includes(image)) {
                        image = Math.floor(Math.random() * ii.num_of_general) + 1;
                    }
                    used_imgs.push(image);
                    docDefinition.content.push({
                        image: await getBase64ImageFromURL(imagedir + image + ".png"),
                        width: image_size.width,
                        height: image_size.height,
                        absolutePosition: {
                            x:
                                start.x +
                                col * col_spacing,
                            y:
                                start.y +
                                row * row_spacing
                        }
                    });
                }
            }
        }
        // place the background
        // gets placed after so that page break works better
        docDefinition.content.push({
            image: await getBase64ImageFromURL(background),
            width: pageWidth,
            height: pageHeight,
            pageBreak: cardNum < num-1 ? "after" : "",
            absolutePosition: { x: 0, y: 0 },
        });
        stepsCompleted++;
        updateProgressBar((stepsCompleted / steps) * 100);
    }
    return docDefinition;
}

async function MakeMultipleBingoCards(docDefinition, pageType, bingoCardType, num = 1, steps) {
    console.log("MakeMultipleBingoCards");
    let pi = PlacementInfo[pageType]; // pi = placement info
    let ii = ImageInfo[bingoCardType]; // ii = image info

    let pageWidth = pi.width;
    let pageHeight = pi.height;

    let start = pi.image_position_info.start;
    let row_spacing = pi.image_position_info.row_spacing;
    let col_spacing = pi.image_position_info.col_spacing;
    let bingo_card_x_spacing = pi.image_position_info.bingo_card_x_spacing;
    let bingo_card_y_spacing = pi.image_position_info.bingo_card_y_spacing;
    let image_size = pi.image_size;

    let imagedir = ii.directory;
    let background = imagedir + pageType + ".png";
    let middle_img = imagedir + ii.middle;

    let stepsCompleted = 0;

    for (let cardNum = 0; cardNum < num; cardNum++) {
        for (let card_row = 0; card_row < 2; card_row++) {
            for (let card_col = 0; card_col < 2; card_col++) {
                // create bool 5x5 array of false values to keep track of which squares have been filled
                let filledSquares = Array(5).fill(false).map(() => Array(5).fill(false));

                // place the middle image
                docDefinition.content.push({
                    image: await getBase64ImageFromURL(middle_img),
                    width: image_size.width,
                    height: image_size.height,
                    absolutePosition: {
                        x:
                            start.x +
                            2 * col_spacing +
                            card_col * bingo_card_x_spacing,
                        y:
                            start.y +
                            2 * row_spacing +
                            card_row * bingo_card_y_spacing
                    }
                });
                filledSquares[2][2] = true;

                // place the always included images in random unfilled squares
                for (let i = 0; i < ii.alwaysIncluded.length; i++) {
                    let image = ii.alwaysIncluded[i];
                    let x, y;
                    do {
                        x = Math.floor(Math.random() * 5);
                        y = Math.floor(Math.random() * 5);
                    } while (filledSquares[x][y]);
                    docDefinition.content.push({
                        image: await getBase64ImageFromURL(imagedir + image),
                        width: image_size.width,
                        height: image_size.height,
                        absolutePosition: {
                            x:
                                start.x +
                                y * col_spacing +
                                card_col * bingo_card_x_spacing,
                            y:
                                start.y +
                                x * row_spacing +
                                card_row * bingo_card_y_spacing
                        }
                    });
                    filledSquares[x][y] = true;
                }

                // fill the remaining squares with random images from general images with no repeats
                let used_imgs = [];
                for (let row = 0; row < 5; row++) {
                    for (let col = 0; col < 5; col++) {
                        if (!filledSquares[row][col]) {
                            let image = Math.floor(Math.random() * ii.num_of_general) + 1;
                            while (used_imgs.includes(image)) {
                                image = Math.floor(Math.random() * ii.num_of_general) + 1;
                            }
                            used_imgs.push(image);
                            docDefinition.content.push({
                                image: await getBase64ImageFromURL(imagedir + image + ".png"),
                                width: image_size.width,
                                height: image_size.height,
                                absolutePosition: {
                                    x:
                                        start.x +
                                        col * col_spacing +
                                        card_col * bingo_card_x_spacing,
                                    y:
                                        start.y +
                                        row * row_spacing +
                                        card_row * bingo_card_y_spacing
                                }
                            });
                        }
                    }
                }
                stepsCompleted++;
            }
        }
        // place the background
        // gets placed after so that page break works better
        docDefinition.content.push({
            image: await getBase64ImageFromURL(background),
            width: pageWidth,
            height: pageHeight,
            pageBreak: cardNum < num-1 ? "after" : "",
            absolutePosition: { x: 0, y: 0 },
        });
        stepsCompleted++;
        updateProgressBar((stepsCompleted / steps) * 100);
    }
    return docDefinition;
}

/**
 * @param {Object} docDefinition - the pdfMake docDefinition object // gets modified and returned
 * @param {string} pageType - the page type of bingo card to create
 * it can be one of the following:
 * - L_SM_1: Letter Size, Small Margins, 1 bingo card per page
 * - L_BM_1: Letter Size, Big Margins, 1 bingo card per page
 * - L_SM_4: Letter Size, Small Margins, 4 bingo cards per page
 * - L_BM_4: Letter Size, Big Margins, 4 bingo cards per page
 * - A4_SM_1: A4 Size, Small Margins, 1 bingo card per page
 * - A4_BM_1: A4 Size, Big Margins, 1 bingo card per page
 * - A4_SM_4: A4 Size, Small Margins, 4 bingo cards per page
 * - A4_BM_4: A4 Size, Big Margins, 4 bingo cards per page
 * @param {string} bingoCardType - the season or race type of bingo card to create
 *
 * @returns {Object} - the modified docDefinition object
 */
async function MakeBingoCard(docDefinition, pageType, bingoCardType, num = 1, steps) {
    if (pageType.includes("1")) { // 1 bingo card per page
        console.log("MakeSingleBingoCard");
        docDefinition = MakeSingleBingoCard(docDefinition, pageType, bingoCardType, num, steps);
    } else { // 4 bingo cards per page
        console.log("MakeMultipleBingoCards");
        docDefinition = MakeMultipleBingoCards(docDefinition, pageType, bingoCardType, num, steps);
    }
    return docDefinition;
}

async function generate() {
    // make gen button disappear
    document.getElementById('generate').style.display = 'none';
    // make progress bar appear
    document.getElementById('progressBar').style.display = 'block';
    updateProgressBar(0);
    // remove any existing iframe
    const targetElement = document.querySelector('#iframe-box');
    while (targetElement.firstChild) {
        targetElement.removeChild(targetElement.firstChild);
    }
    console.log("generate");
    let docDefinition = {
        info: {
            title: "Generated at f1-tools.github.io/F1-Bingo-Card-Generator/",
            author: "f1-tools.github.io",
            subject: "F1 Bingo Cards"
        },
        margins: [0, 0, 0, 0],
        content: [],
    };

    // get the cardType, pageSize, marginSize, partyMode, and numToGen states from the form dropdowns
    let cardType = document.getElementById("cardType").value;
    let pageSize = document.getElementById("pageSize").value;
    let marginSize = document.getElementById("marginSize").value;
    let partyMode = document.getElementById("partyMode").value;
    let numToGen = parseInt(document.getElementById("numToGen").value);

    // get number of steps to take for progress bar
    let steps = numToGen;

    // set the page size for the pdf
    docDefinition.pageSize = pageSize;

    // set the arguments for the MakeBingoCard function
    let pageType = "";
    if (pageSize == "Letter") {
        pageType += "L";
    } else {
        pageType += "A4";
    }
    if (marginSize == "Small") {
        pageType += "_SM_";
    } else {
        pageType += "_BM_";
    }
    if (partyMode == "On") {
        pageType += "4";
        steps *= 4;
    } else {
        pageType += "1";
    }

    // call the MakeBingoCard function and open the pdf
    docDefinition = await MakeBingoCard(docDefinition, pageType, cardType, numToGen, steps);

    // create the pdf
    console.log("create pdf");
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    console.log("pdf created");
    // have download button work
    document.getElementById('downloadButton').onclick = function () {
        console.log("download pdf");
        pdfDocGenerator.download();
    };
    // have iframe display the pdf
    pdfDocGenerator.getDataUrl((dataUrl) => {
        const targetElement = document.querySelector('#iframe-box');
        // add the iframe
        const iframe = document.createElement('iframe');
        iframe.src = dataUrl;
        targetElement.appendChild(iframe);
    });
    // show the pdf view
    document.getElementById('docView').style.display = 'block';

    //reset things 
    document.getElementById('generate').style.display = 'block';
    document.getElementById('progressBar').style.display = 'none';
    updateProgressBar(0);
    console.log("done");
}

async function updateProgressBar(progressBarPercent) {
    document.getElementById('progressBar').value = progressBarPercent;
}

window.onload = function () {
    document.getElementById('generate').addEventListener('click', generate);
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
