class LabselsetColorsManager {
  colormap: Record<string, string>;
  size: number;
  labels: Set<string>;

  constructor() {
    this.colormap = {};
    this.size = 0;
    this.labels = new Set();
  }

  addLabel(label: string) {
    if (this.labels.has(label)) {
    } else {
      this.labels.add(label);
      this.recolor();
    }
  }

  getLabelColor(label: string) {
    this.addLabel(label);
    return this.colormap[label];
  }

  private recolor() {
    const s = 0.32;
    const l = 0.6;
    let h = 0;
    const num = this.labels.size;
    const step = 359 / num;
    this.colormap = {};
    this.labels.forEach((label) => {
      this.colormap[label] = HSLToHex(h, s, l);
      h += step;
    });
  }
}

function HSLToHex(H: number, S: number, L: number): string {
  const rgb = HSL2RGB(H, S, L);
  return RGB2HEX(rgb);
}

/**
 * Convert RGB Array to HEX
 *
 * @param {Array} RGBArray - [R, G, B]
 * @returns {String} 6 digits hex starting with #
 */
var RGB2HEX = function (RGBArray: Array<number>): string {
  var hex = "#";
  RGBArray.forEach(function (value) {
    if (value < 16) {
      hex += 0;
    }
    hex += value.toString(16);
  });
  return hex;
};

/**
 * Convert HSL to RGB
 *
 * @see {@link http://zh.wikipedia.org/wiki/HSL和HSV色彩空间} for further information.
 * @param {Number} H Hue ∈ [0, 360)
 * @param {Number} S Saturation ∈ [0, 1]
 * @param {Number} L Lightness ∈ [0, 1]
 * @returns {Array} R, G, B ∈ [0, 255]
 */
var HSL2RGB = function (H: number, S: number, L: number): Array<number> {
  H /= 360;

  var q = L < 0.5 ? L * (1 + S) : L + S - L * S;
  var p = 2 * L - q;

  return [H + 1 / 3, H, H - 1 / 3].map(function (color) {
    if (color < 0) {
      color++;
    }
    if (color > 1) {
      color--;
    }
    if (color < 1 / 6) {
      color = p + (q - p) * 6 * color;
    } else if (color < 0.5) {
      color = q;
    } else if (color < 2 / 3) {
      color = p + (q - p) * 6 * (2 / 3 - color);
    } else {
      color = p;
    }
    return Math.round(color * 255);
  });
};
const colorManaer = new LabselsetColorsManager();
export default colorManaer;
