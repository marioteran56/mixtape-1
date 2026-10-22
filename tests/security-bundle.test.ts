import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EDITORIAL_TRACK_ENTRIES,
  PRIVATE_LETTER_CONTENT,
} from '../src/server/editorial-content';

function getAllFilesRecursively(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFilesRecursively(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Seguridad del Bundle Público y Archivos del Cliente', () => {
  it('verifica que src/client/ e index.html nunca importen ni incluyan la carta privada ni las dedicatorias', () => {
    const rootDir = path.resolve(__dirname, '..');
    const clientFiles = [
      path.join(rootDir, 'index.html'),
      ...getAllFilesRecursively(path.join(rootDir, 'src/client')),
    ];

    const forbiddenSnippets = [
      PRIVATE_LETTER_CONTENT.paragraphs[0].slice(5, 45),
      PRIVATE_LETTER_CONTENT.closingBody.slice(5, 45),
      EDITORIAL_TRACK_ENTRIES[0].dedication!.slice(5, 40),
      EDITORIAL_TRACK_ENTRIES[1].dedication!.slice(5, 40),
      'editorial-content',
    ];

    for (const filePath of clientFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const snippet of forbiddenSnippets) {
        expect(content).not.toContain(snippet);
      }
    }
  });

  it('verifica que el directorio dist/ (cuando está compilado) no contenga textos privados ni mapas de código (.map)', () => {
    const distDir = path.resolve(__dirname, '../dist');
    if (!fs.existsSync(distDir)) {
      return;
    }

    const distFiles = getAllFilesRecursively(distDir);
    expect(distFiles.length).toBeGreaterThan(0);

    for (const filePath of distFiles) {
      expect(filePath.endsWith('.map')).toBe(false);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).not.toContain(PRIVATE_LETTER_CONTENT.paragraphs[0].slice(5, 45));
      expect(content).not.toContain(EDITORIAL_TRACK_ENTRIES[0].dedication!.slice(5, 40));
      expect(content).not.toContain('SPOTIFY_CLIENT_SECRET');
    }
  });
});
