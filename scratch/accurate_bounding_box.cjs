const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/SDGs/GoldLogo.jsx');
const content = fs.readFileSync(filePath, 'utf8');

const pathRegex = /<path([^>]+)d="([^"]+)"/g;
let match;
let pathIndex = 0;

const parsedPaths = [];

function getBoundingBox(d) {
  // Simple tokenization of the path string
  const tokens = d.match(/[a-df-z]|[-+]?[0-9]*\.?[0-9]+/gi) || [];
  
  let currentX = 0;
  let currentY = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  let i = 0;
  let currentCommand = '';
  
  function updateBounds(x, y) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  
  while (i < tokens.length) {
    const token = tokens[i];
    if (/[a-z]/i.test(token)) {
      currentCommand = token;
      i++;
    } else {
      // It's a number
      if (currentCommand === 'M') {
        currentX = Number(tokens[i]);
        currentY = Number(tokens[i+1]);
        updateBounds(currentX, currentY);
        i += 2;
      } else if (currentCommand === 'm') {
        currentX += Number(tokens[i]);
        currentY += Number(tokens[i+1]);
        updateBounds(currentX, currentY);
        i += 2;
      } else if (currentCommand === 'L') {
        currentX = Number(tokens[i]);
        currentY = Number(tokens[i+1]);
        updateBounds(currentX, currentY);
        i += 2;
      } else if (currentCommand === 'l') {
        currentX += Number(tokens[i]);
        currentY += Number(tokens[i+1]);
        updateBounds(currentX, currentY);
        i += 2;
      } else if (currentCommand === 'C') {
        // C x1 y1, x2 y2, x y
        currentX = Number(tokens[i+4]);
        currentY = Number(tokens[i+5]);
        updateBounds(Number(tokens[i]), Number(tokens[i+1]));
        updateBounds(Number(tokens[i+2]), Number(tokens[i+3]));
        updateBounds(currentX, currentY);
        i += 6;
      } else if (currentCommand === 'c') {
        // c dx1 dy1, dx2 dy2, dx dy
        const x1 = currentX + Number(tokens[i]);
        const y1 = currentY + Number(tokens[i+1]);
        const x2 = currentX + Number(tokens[i+2]);
        const y2 = currentY + Number(tokens[i+3]);
        currentX += Number(tokens[i+4]);
        currentY += Number(tokens[i+5]);
        updateBounds(x1, y1);
        updateBounds(x2, y2);
        updateBounds(currentX, currentY);
        i += 6;
      } else if (currentCommand === 'S') {
        // S x2 y2, x y
        currentX = Number(tokens[i+2]);
        currentY = Number(tokens[i+3]);
        updateBounds(Number(tokens[i]), Number(tokens[i+1]));
        updateBounds(currentX, currentY);
        i += 4;
      } else if (currentCommand === 's') {
        // s dx2 dy2, dx dy
        const x2 = currentX + Number(tokens[i]);
        const y2 = currentY + Number(tokens[i+1]);
        currentX += Number(tokens[i+2]);
        currentY += Number(tokens[i+3]);
        updateBounds(x2, y2);
        updateBounds(currentX, currentY);
        i += 4;
      } else if (currentCommand === 'H') {
        currentX = Number(tokens[i]);
        updateBounds(currentX, currentY);
        i += 1;
      } else if (currentCommand === 'h') {
        currentX += Number(tokens[i]);
        updateBounds(currentX, currentY);
        i += 1;
      } else if (currentCommand === 'V') {
        currentY = Number(tokens[i]);
        updateBounds(currentX, currentY);
        i += 1;
      } else if (currentCommand === 'v') {
        currentY += Number(tokens[i]);
        updateBounds(currentX, currentY);
        i += 1;
      } else {
        // For other commands (A, a, Q, q etc.), default safety step
        i++;
      }
    }
  }
  return { minX, maxX, minY, maxY };
}

while ((match = pathRegex.exec(content)) !== null) {
  const attrs = match[1];
  const d = match[2];
  const bounds = getBoundingBox(d);
  
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const centerX = bounds.minX + width / 2;
  const centerY = bounds.minY + height / 2;
  
  const className = attrs.includes('st0') ? 'st0' : 'st1';
  parsedPaths.push({
    index: pathIndex++,
    className,
    bounds,
    width, height,
    centerX, centerY,
    raw: match[0] + '/>'
  });
}

console.log(`Accurately parsed ${parsedPaths.length} paths.`);

// Let's print out the paths sorted by their centerX distance from 960 and width
parsedPaths.forEach((p) => {
  console.log(`Path ${p.index}: class=${p.className}, center=(${p.centerX.toFixed(1)}, ${p.centerY.toFixed(1)}), size=(${p.width.toFixed(1)} x ${p.height.toFixed(1)}), bounds=[X: ${p.bounds.minX.toFixed(1)} to ${p.bounds.maxX.toFixed(1)}, Y: ${p.bounds.minY.toFixed(1)} to ${p.bounds.maxY.toFixed(1)}]`);
});
