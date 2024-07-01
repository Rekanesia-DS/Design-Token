import { readFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';
import {
  registerTransforms,
  permutateThemes,
} from '@tokens-studio/sd-transforms';

// sd-transforms, 2nd parameter for options can be added
// See docs: https://github.com/tokens-studio/sd-transforms
registerTransforms(StyleDictionary);

const $themes = JSON.parse(readFileSync('$themes.json', 'utf-8'));
const themes = permutateThemes($themes, { seperator: '_' });
const configs = Object.entries(themes).map(([name, tokensets]) => ({
  source: tokensets.map((tokenset) => `${tokenset}.json`),
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      options: {
        outputReferences: true,
      },
      buildPath: 'build/css/',
      files: [
        {
          destination: `rekanesia-${name.toLowerCase()}.css`,
          format: 'css/variables',
        },
      ],
    },
    js: {
      transformGroup: 'tokens-studio',
      transforms: ['name/camel'],
      options: {
        outputReferences: true,
      },
      buildPath: 'build/js/',
      files: [
        {
          destination: `rekanesia-${name.toLowerCase()}.js`,
          format: 'javascript/es6',
        },
      ],
    },
    flutter: {
      transformGroup: 'tokens-studio',
      transforms: ['name/camel','color/hex8flutter','size/flutter/remToDouble'],
      options: {
        outputReferences: true,
      },
      buildPath: 'build/flutter/',
      files: [
        {
          destination: `rekanesia-${name.toLowerCase()}.dart`,
          format: 'flutter/class.dart',
        },
      ],
    },
    ios: {
      transformGroup: 'tokens-studio',
      transforms: ['name/camel'],
      options: {
        outputReferences: true,
      },
      buildPath: 'build/ios/',
      files: [
        {
          destination: `rekanesia-${name.toLowerCase()}.swift`,
          format: 'ios-swift/class.swift',
        },
      ],
    },
    android: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab'],
      options: {
        outputReferences: true,
      },
      buildPath: 'build/android/',
      files: [
        {
          destination: `rekanesia-${name.toLowerCase()}.xml`,
          format: 'android/resources',
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
