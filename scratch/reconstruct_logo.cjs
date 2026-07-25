const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/SDGs/GoldLogo.jsx');
const content = fs.readFileSync(filePath, 'utf8');

// Find all path tags
const pathRegex = /<path([^>]+)d="([^"]+)"\/?>/g;
const ellipseRegex = /<ellipse([^>]+)\/?>/g;

const paths = [];
let match;
while ((match = pathRegex.exec(content)) !== null) {
  paths.push({
    index: paths.length,
    raw: match[0]
  });
}

const ellipses = [];
let elMatch;
while ((elMatch = ellipseRegex.exec(content)) !== null) {
  ellipses.push(elMatch[0]);
}

console.log(`Found ${paths.length} paths and ${ellipses.length} ellipses.`);

// Indices to separate:
// Background paths (discard): 1, 8
// Central stationary paths: 14, 90, 92
const bgIndices = new Set([1, 8]);
const centerIndices = new Set([14, 90, 92]);

const ringPathsMarkup = [];
const centerPathsMarkup = [];

paths.forEach((p) => {
  if (bgIndices.has(p.index)) {
    // Discard white backing circles
    return;
  }
  if (centerIndices.has(p.index)) {
    centerPathsMarkup.push(p.raw);
  } else {
    ringPathsMarkup.push(p.raw);
  }
});

// Ellipses are tiny dots, let's keep them in rotating rings
const ellipsesMarkup = ellipses;

const newComponentContent = `import React from 'react';

export default function GoldLogo({ className }) {
  return (
    <svg className={className} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 1920 1080" xmlSpace="preserve">
      
      {/* 1. Rotating Celestial Rings Group */}
      <g className="logo-rotating-rings">
        ${ringPathsMarkup.join('\n        ')}
        ${ellipsesMarkup.join('\n        ')}
      </g>
      
      {/* 2. Stationary Central Core Group (Sun & A) */}
      <g className="logo-center-core">
        ${centerPathsMarkup.join('\n        ')}
      </g>
      
    </svg>
  );
}
`;

fs.writeFileSync(filePath, newComponentContent, 'utf8');
console.log('Reconstructed GoldLogo.jsx successfully with grouped elements!');
