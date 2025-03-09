export let base64ImageCache = {};
export const PlacementInfo = {
    L_SM_1: {
        width: 612,
        height: 792,
        image_size: { width: 116, height: 116 },
        image_position_info: {
            start: { x: 8, y: 188 },
            row_spacing: 120,
            col_spacing: 120,
            bingo_card_x_spacing: 0,
            bingo_card_y_spacing: 0,
        },
    },
    L_BM_1: {
        width: 612,
        height: 792,
        image_size: { width: 103, height: 103 },
        image_position_info: {
            start: { x: 39.5, y: 210 },
            row_spacing: 107.5,
            col_spacing: 107.5,
            bingo_card_x_spacing: 0,
            bingo_card_y_spacing: 0,
        },
    },
    L_SM_4: {
        width: 612,
        height: 792,
        image_size: { width: 55.5, height: 55.5 },
        image_position_info: {
            start: { x: 12, y: 99.5 },
            row_spacing: 58.25,
            col_spacing: 58.25,
            bingo_card_x_spacing: 299.5,
            bingo_card_y_spacing: 392,
        },
    },
    L_BM_4: {
        width: 612,
        height: 792,
        image_size: { width: 50.5, height: 50.5 },
        image_position_info: {
            start: { x: 38, y: 125.5 },
            row_spacing: 53.15,
            col_spacing: 53.15,
            bingo_card_x_spacing: 273,
            bingo_card_y_spacing: 357.5,
        },
    },
    A4_SM_1: {
        width: 595.28,
        height: 841.89,
        image_size: { width: 111, height: 111 },
        image_position_info: {
            start: { x: 11.5, y: 221 },
            row_spacing: 115.45,
            col_spacing: 115.4,
            bingo_card_x_spacing: 0,
            bingo_card_y_spacing: 0,
        },
    },
    A4_BM_1: {
        width: 595.28,
        height: 841.89,
        image_size: { width: 99.5, height: 99.5 },
        image_position_info: {
            start: { x: 41, y: 242 },
            row_spacing: 103.5,
            col_spacing: 103.5,
            bingo_card_x_spacing: 0,
            bingo_card_y_spacing: 0,
        },
    },
    A4_SM_4: {
        width: 595.28,
        height: 841.89,
        image_size: { width: 54.5, height: 54.5 },
        image_position_info: {
            start: { x: 9.75, y: 130.5 },
            row_spacing: 57,
            col_spacing: 57,
            bingo_card_x_spacing: 293.3,
            bingo_card_y_spacing: 384,
        },
    },
    A4_BM_4: {
        width: 595.28,
        height: 841.89,
        image_size: { width: 48.5, height: 48.5 },
        image_position_info: {
            start: { x: 39.75, y: 160.5 },
            row_spacing: 51.15,
            col_spacing: 51.15,
            bingo_card_x_spacing: 263,
            bingo_card_y_spacing: 344.25,
        },
    },
};
 export const ImageInfo = {
    Race: {
        directory: "imgs/PNG/race/",
        backgrounds: ["L_SM_1", "L_BM_1", "L_SM_4", "L_BM_4", "A4_SM_1", "A4_BM_1", "A4_SM_4", "A4_BM_4"],
        middle: "race_starts.png",
        alwaysIncluded: ["sc.png", "vsc.png", "red_flag.png"],
        num_of_general: 21
    },
    Season: {
        directory: "imgs/PNG/season/",
        backgrounds: ["L_SM_1", "L_BM_1", "L_SM_4", "L_BM_4", "A4_SM_1", "A4_BM_1", "A4_SM_4", "A4_BM_4"],
        middle: "race_starts.png",
        alwaysIncluded: ["sc.png", "vsc.png", "red_flag.png"],
        num_of_general: 50
    },
};