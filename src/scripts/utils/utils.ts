// forked from: https://github.com/mikolalysenko/to-px/blob/master/index.js

const PIXELS_PER_INCH = 96;

const DEFAULT_UNITS: { [key: string]: number } = {
    'ch':  8,
    'ex':  7.15625,
    'em':  16,
    'rem': 16,
    'in':  PIXELS_PER_INCH,
    'cm':  PIXELS_PER_INCH / 2.54,
    'mm':  PIXELS_PER_INCH / 25.4,
    'pt':  PIXELS_PER_INCH / 72,
    'pc':  PIXELS_PER_INCH / 6,
    'px':  1,
    '':    1,
}

/**
 * parse out the exact pixel value and the associated unit for
 * {@code unit}.
 *
 * @param unit a unit string, such as 10px, that is to be parsed.
 * @return tuple, where the first value is the number part of the
 *         unit and the second is the unit string.
 */
export function parseUnit(unit: string): [number, string] | undefined {
    let match = /(\d+(?:\.\d*)?)(.*)/.exec(unit);

    if (match) {
        let [value, unitString] = match.slice(1,3);
        return [parseFloat(value), unitString.trim()];
    }
}

/**
 * convert a unit string to a single numberical pixel value.
 *
 * @param unit a unit string, such as 10em that's to be converted.
 * @return the pixel value equivalent to {@code unit}.
 */
export function unitToPx(unit: string): number | undefined {
    if (!unit) return undefined; // no conversion

    let parsedValue;
    if ((parsedValue = parseUnit(unit)) !== undefined) {
        let [num, unitKey] = parsedValue as [number, string];

        if (!isNaN(num) && Object.keys(DEFAULT_UNITS).includes(unitKey)) {
            return num * DEFAULT_UNITS[unitKey];
        }
    }
}

/**
 * convert an ex number value to it's equivelent pixel values.
 *
 * @param value the number of ex's to be converted.
 * @return number of pixels equivalent to {@code value} ex's.
 */
export function exToPx(value: number) {
    return unitToPx(`${value}ex`);
}
