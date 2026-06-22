import { describe, it, expect } from 'vitest';
import { getSystemPrompt } from '../prompts/systemPrompts.js';

describe('getSystemPrompt', () => {
  it('includes the subject in the output', () => {
    const prompt = getSystemPrompt('Math', 'little', 'english');
    expect(prompt).toContain('Math');
  });

  it('uses the 6–10 age range for little kids', () => {
    const prompt = getSystemPrompt('Math', 'little', 'english');
    expect(prompt).toContain('6 to 10 years old');
  });

  it('uses the 11–14 age range for older kids', () => {
    const prompt = getSystemPrompt('Math', 'older', 'english');
    expect(prompt).toContain('11 to 14 years old');
  });

  it('requests Telugu when language is telugu', () => {
    const prompt = getSystemPrompt('Math', 'little', 'telugu');
    expect(prompt).toContain('Telugu');
  });

  it('requests simple English when language is english', () => {
    const prompt = getSystemPrompt('Math', 'little', 'english');
    expect(prompt).toContain('simple English');
  });

  it.each(['Math', 'Science', 'English', 'Civic Sense', 'My Rights', 'Communication'])(
    'generates a non-trivial prompt for subject %s',
    (subject) => {
      const prompt = getSystemPrompt(subject, 'little', 'english');
      expect(prompt.length).toBeGreaterThan(200);
    }
  );

  it('falls back gracefully for an unknown subject', () => {
    const prompt = getSystemPrompt('Dinosaurs', 'little', 'english');
    expect(prompt).toContain('Dinosaurs');
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('always includes the Childline India helpline number', () => {
    const prompt = getSystemPrompt('Math', 'little', 'english');
    expect(prompt).toContain('1098');
  });

  it('always includes the CHILD SAFETY section', () => {
    const prompt = getSystemPrompt('Science', 'older', 'english');
    expect(prompt).toContain('CHILD SAFETY');
  });

  it('uses the little-kids Respect & Safety prompt (safe touch)', () => {
    const prompt = getSystemPrompt('Respect & Safety', 'little', 'english');
    expect(prompt).toContain('safe touch');
  });

  it('uses the older-kids Respect & Safety prompt (consent)', () => {
    const prompt = getSystemPrompt('Respect & Safety', 'older', 'english');
    expect(prompt).toContain('consent');
  });

  it('all prompts instruct Claude to avoid producing explicit content', () => {
    const subjects = ['Math', 'Science', 'English', 'Civic Sense', 'My Rights', 'Respect & Safety', 'Communication'];
    for (const subject of subjects) {
      for (const age of ['little', 'older']) {
        const prompt = getSystemPrompt(subject, age, 'english');
        // The safety guardrail section must tell Claude what NOT to produce
        expect(prompt.toLowerCase()).toContain('never produce');
      }
    }
  });
});
