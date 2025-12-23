import { describe, it, expect } from 'vitest';

import { detectTechnologies, getTechDisplayName, getTechIcon, getTechDependencies } from '../lib/tech-detector';
import { getDemoPlan } from '../lib/demo-data';
import { mockProjectPlan, mockProjectFiles, mockUIComponents } from '../data/mockData';

describe('Quick coverage smoke tests', () => {
  it('mock data exports look correct', () => {
    expect(mockProjectPlan).toBeDefined();
    expect(mockProjectPlan.id).toBe('1');
    expect(Array.isArray(mockProjectPlan.techStack)).toBe(true);

    expect(Array.isArray(mockProjectFiles)).toBe(true);
    expect(mockProjectFiles.length).toBeGreaterThan(0);

    expect(Array.isArray(mockUIComponents)).toBe(true);
    expect(mockUIComponents.length).toBeGreaterThan(0);
  });

  it('detectTechnologies finds common techs', () => {
    const detected = detectTechnologies('Build a Next.js + TypeScript app with Tailwind and Node.js');
    expect(detected).toEqual(expect.arrayContaining(['next', 'typescript', 'tailwind', 'node']));
  });

  it('getTechDisplayName and getTechIcon return strings', () => {
    const name = getTechDisplayName('react');
    const icon = getTechIcon('react');
    expect(typeof name).toBe('string');
    expect(typeof icon).toBe('string');
  });

  it('getTechDependencies returns dependency arrays', () => {
    const deps = getTechDependencies(['react', 'node']);
    expect(deps).toHaveProperty('dependencies');
    expect(deps).toHaveProperty('devDependencies');
    expect(Array.isArray(deps.dependencies)).toBe(true);
    expect(Array.isArray(deps.devDependencies)).toBe(true);
  });

  it('getDemoPlan returns a plan for Next.js prompts', () => {
    const plan = getDemoPlan('I need a Next.js TypeScript project with Prisma');
    expect(plan).toBeDefined();
    expect(Array.isArray(plan.stack)).toBe(true);
    expect(plan.stack.length).toBeGreaterThan(0);
  });
});
