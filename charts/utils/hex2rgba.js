const hex2rgba = (hex, alpha = 1) => {
  if (hex.match(/\w\w/g)) {
    const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
    return `rgba(${r},${g},${b},${alpha})`;
  }
};

module.exports = { hex2rgba };
