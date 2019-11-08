
export const hexColor = (color) => {
    if (!isNaN(color.match(/^ *[a-f0-9]{6} *$/i) ? parseInt(color, 16) : NaN)) {
        return true;
    } else if (color === '') {
        return true;
    }

    return 'Please provide a valid color hex number.';
}

