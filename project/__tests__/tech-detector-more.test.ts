import { describe, it, expect } from 'vitest';
import { detectTechnologies, getTechDependencies } from '../lib/tech-detector';

describe('tech-detector additional tests', () => {
  it('detectTechnologies handles different casings and synonyms', () => {
    const s = 'We will use ReactJS, NODE.JS and TailwindCSS in this project';
    const detected = detectTechnologies(s);
    expect(detected).toEqual(expect.arrayContaining(['react', 'node', 'tailwind']));
  });

  it('getTechDependencies returns arrays for known techs', () => {
    const deps = getTechDependencies(['react', 'typescript']);
    expect(deps).toHaveProperty('dependencies');
    expect(Array.isArray(deps.dependencies)).toBe(true);
    expect(deps.dependencies).toEqual(expect.arrayContaining(['react']));
  });
});
