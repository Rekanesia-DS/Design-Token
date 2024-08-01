import { readFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';
import { register, permutateThemes } from '@tokens-studio/sd-transforms';

// sd-transforms, 2nd parameter for options can be added
// See docs: https://github.com/tokens-studio/sd-transforms
register(StyleDictionary, {
  expand: {
    composition: true,
    typography: false,
    border: false,
    shadow: false,
  },
  excludeParentKeys: false,
});

const $themes = JSON.parse(readFileSync('$themes.json', 'utf-8'));
const themes = permutateThemes($themes, { seperator: '_' });
const configs = Object.entries(themes).map(([name, tokensets]) => ({
  source: tokensets.map((tokenset) => `${tokenset}.json`),
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      prefix: 'sd',
      buildPath: 'build/css/',
      files: [
        {
          destination: `_variables-${name}.css`,
          format: 'css/variables',
        },
      ],
    },
    js: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/js/',
      files: [
        {
          destination: `variables-${name}.js`,
          format: 'javascript/es6',
        },
      ],
    },
    Flutter: {
      buildPath: 'flutter/',
      prefix: 'flutter',
      files: [
        {
          destination: `flutter-${name}.dart`,
          format: 'flutter/class.dart',
        },
      ],
    },
    Swift: {
      buildPath: 'swift/',
      prefix: 'swift',
      files: [
        {
          destination: `variables-${name}.swift`,
          format: 'ios-swift/class.swift',
        },
      ],
    },
  },
}));

for (const cfg of configs) {
  const sd = new StyleDictionary(cfg);
  // optionally, cleanup files first..
  await sd.cleanAllPlatforms();
  await sd.buildAllPlatforms();
}
