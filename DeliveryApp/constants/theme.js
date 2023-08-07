import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.036;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const CARD_WIDTH = width * 0.96;
const CARD_HEIGHT = height * 0.34;

export const COLORS = {
    // base colors
    primary: "#FC6D3F", // orange
    secondary: "#CDCDD2",   // gray

    // colors
    black: "#1E1F20",
    white: "#FFFFFF",

    lightGray: "#e8e8e8",
    lightGray2: "#F6F6F7",
    lightGray3: "#EFEFF1",
    lightGray4: "#F8F8F9",
    transparent: "transparent",
    darkgray: '#636363',
    lightblue: '#1a73e9',
    lightblue2: 'rgb(28, 163, 252)',
    darkblue: '#274472',
    lightblue2Trans: 'rgba(28, 163, 252, 0.3)',
    darkgreen: '#198039',
    green: '#1fb141',
    defaultButtonColor: '#2196F3',
    ethereum: '#37367b'
};

export const SIZES = {
    // global sizes
    base: 8,
    font: 14,
    radius: 30,
    padding: 10,
    padding2: 12,

    // font sizes
    largeTitle: 50,
    h1: 30,
    h2: 22,
    h3: 20,
    h4: 18,
    body1: 30,
    body2: 20,
    body3: 16,
    body4: 14,
    body5: 12,

    // app dimensions
    width,
    height,
    ASPECT_RATIO,
    LATITUDE_DELTA,
    LONGITUDE_DELTA,
    CARD_WIDTH,
    CARD_HEIGHT
};

export const FONTS = {
    largeTitle: { fontFamily: "Roboto", fontSize: SIZES.largeTitle, lineHeight: 55 },
    h1: { fontFamily: "Roboto", fontWeight: '700', fontSize: SIZES.h1, lineHeight: 36 },
    h2: { fontFamily: "Roboto", fontWeight: '700', fontSize: SIZES.h2, lineHeight: 30 },
    h3: { fontFamily: "Roboto", fontWeight: '500', fontSize: SIZES.h3, lineHeight: 22 },
    h4: { fontFamily: "Roboto", fontWeight: '500', fontSize: SIZES.h4, lineHeight: 22 },
    body1: { fontFamily: "Roboto", fontSize: SIZES.body1, lineHeight: 36 },
    body2: { fontFamily: "Roboto", fontSize: SIZES.body2, lineHeight: 30 },
    body3: { fontFamily: "Roboto", fontSize: SIZES.body3, lineHeight: 22 },
    body4: { fontFamily: "Roboto", fontSize: SIZES.body4, lineHeight: 20 },
    body5: { fontFamily: "Roboto", fontSize: SIZES.body5, lineHeight: 14 },
};

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;