import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Dashboard Blueprint Theme Tokens', () => {
  it('harmonizes admin.css with public blueprint tokens', () => {
    const css = fs.readFileSync(path.join(__dirname, '../app/styles/admin.css'), 'utf-8');
    expect(css).toContain('Cadivity Hairline');
    expect(css).toContain('Cadivity Blueprint Palette');
    expect(css).toContain('--radius: 0.125rem');
  });

  it('harmonizes instructor.css with public blueprint tokens', () => {
    const css = fs.readFileSync(path.join(__dirname, '../app/styles/instructor.css'), 'utf-8');
    expect(css).toContain('Cadivity Hairline');
    expect(css).toContain('Cadivity Blueprint Palette');
    expect(css).toContain('--radius: 0.125rem');
  });

  it('harmonizes student.css with public blueprint tokens removing indigo', () => {
    const css = fs.readFileSync(path.join(__dirname, '../app/styles/student.css'), 'utf-8');
    expect(css).toContain('Cadivity Hairline');
    expect(css).toContain('no legacy indigo');
    expect(css).toContain('--radius: 0.125rem');
  });
});
