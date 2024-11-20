import { readFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';
import { register, permutateThemes } from '@tokens-studio/sd-transforms';

// sd-transforms, 2nd parameter for options can be added
// See docs: https://github.com/tokens-studio/sd-transforms
register(StyleDictionary);

const $themes = JSON.parse(readFileSync('figma-tokens/$themes.json', 'utf-8'));
const themes = permutateThemes($themes, { seperator: '_' });
const configs = Object.entries(themes).map(([name, tokensets]) => ({
  source: tokensets.map((tokenset) => `figma-tokens/${tokenset}.json`),
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
          destination: `_variables-${name}.css`,
          format: 'css/variables',
        },
      ],
    },
    js: {
      transformGroup: 'tokens-studio',
      buildPath: 'build/js/',
      options: {
        outputReferences: true,
      },
      files: [
        {
          destination: `variables-${name}.js`,
          format: 'javascript/es6',
        },
      ],
    },
    compose: {
      buildPath: "build/compose/",
      transformGroup: "compose",
      options: {
        outputReferences: true,
      },
      files: [
        {
          destination: `variables-${name}.kt`,
          format: "compose/object"
        }
      ]
    }
  },
}));

for (const cfg of configs) {
  const sd = new StyleDictionary(cfg);
  // optionally, cleanup files first..
  await sd.cleanAllPlatforms();
  await sd.buildAllPlatforms();
}
