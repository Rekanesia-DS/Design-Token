import { readFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';
import { register, permutateThemes, getTransforms } from '@tokens-studio/sd-transforms';
import { usesReferences } from 'style-dictionary/utils';

// Register tokens-studio transforms
register(StyleDictionary, { excludeParentKeys: true });

// Custom transitive transform for shadows (CSS-compatible)
StyleDictionary.registerTransform({
  name: 'shadow/css',
  type: 'value',
  transitive: true, // Enable transitive transformations for references
  filter: (prop) => prop.attributes && prop.attributes.category === 'shadow',
  transform: (token) => {
    const shadows = Array.isArray(token.value) ? token.value : [token.value];
    return shadows
      .map(
        (shadow) =>
          `${shadow.x || 0}px ${shadow.y || 0}px ${shadow.blur || 0}px ${shadow.spread || 0}px ${shadow.color || 'transparent'}`
      )
      .join(', ');
  },
});

// Custom transitive transform for shadows (Compose-compatible)
StyleDictionary.registerTransform({
  name: 'shadow/compose',
  type: 'value',
  transitive: true, // Enable transitive transformations for references
  filter: (prop) => prop.attributes && prop.attributes.category === 'shadow',
  transform: (token) => {
    const shadows = Array.isArray(token.value) ? token.value : [token.value];
    return shadows
      .map(
        (shadow) =>
          `Shadow(x=${parseFloat(shadow.x) || 0}f, y=${parseFloat(shadow.y) || 0}f, blur=${parseFloat(shadow.blur) || 0}f, spread=${parseFloat(shadow.spread) || 0}f, color=Color(${shadow.color || '#000000'}))`
      )
      .join(', ');
  },
});

// Register custom transform group
StyleDictionary.registerTransformGroup({
  name: 'rekanesia-style',
  transforms: [
    ...getTransforms({ platform: 'css' }),
    'shadow/css',
    ...getTransforms({ platform: 'js' }),
    ...getTransforms({ platform: 'compose' }),
    'shadow/compose'
  ],
});

// Read themes and configuration
const $themes = JSON.parse(readFileSync('figma-tokens/$themes.json', 'utf-8'));
const themes = permutateThemes($themes, { separator: '_' });

const configs = Object.entries(themes).map(([name, tokensets]) => ({
  source: tokensets.map((tokenset) => `figma-tokens/${tokenset}.json`),
  log: {
    verbosity: 'verbose',
  },
  platforms: {
    css: {
      transformGroup: 'rekanesia-style',
      buildPath: 'build/css/',
      options: {
        outputReferences: true,
      },
      files: [
        {
          destination: `rekanesia-style-${name}.css`,
          format: 'css/variables',
        },
      ],
    },
    js: {
      transformGroup: 'rekanesia-style',
      buildPath: 'build/js/',
      options: {
        outputReferences: true,
      },
      files: [
        {
          destination: `rekanesia-style-${name}.js`,
          format: 'javascript/es6',
        },
      ],
    },
    compose: {
      transformGroup: 'rekanesia-style',
      buildPath: 'build/compose/',
      options: {
        outputReferences: true,
      },
      files: [
        {
          destination: `rekanesia-style-${name}.kt`,
          format: 'compose/object',
        },
      ],
    },
    android: {
      transformGroup: 'rekanesia-style',
      buildPath: 'build/android/',
      options: {
        outputReferences: true,
      },
      files: [
        {
          destination: `rekanesia-style-${name}.xml`,
          format: 'android/resources',
        },
      ],
    },
  },
}));

// Build all configurations
configs.forEach((cfg) => {
  const sd = new StyleDictionary(cfg);
  // Clean all platforms before building
  sd.cleanAllPlatforms();
  sd.buildAllPlatforms();
});
