const tokens = require('./src/lib/theme/tokens.json');

const boxShadow = Object.fromEntries(
  Object.entries(tokens.elevation).map(([key, value]) => [key, value.boxShadow]),
);

const elevation = Object.fromEntries(
  Object.entries(tokens.elevation).map(([key, value]) => [key, value.elevation]),
);

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: tokens.palette,
      spacing: tokens.spacing,
      borderRadius: tokens.radii,
      fontSize: tokens.fontSize,
      boxShadow,
      elevation,
    },
  },
  plugins: [],
};
