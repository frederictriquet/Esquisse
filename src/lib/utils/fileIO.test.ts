import { describe, it, expect, beforeEach } from 'vitest';
import {
	FILE_FORMAT_VERSION,
	validateEsquisseFile,
	createEsquisseFile,
	serializeEsquisseFile,
	deserializeEsquisseFile,
	type EsquisseFile
} from './fileIO';
import type { Stroke } from '$lib/types';

describe('File I/O Utilities', () => {
	let validStroke: Stroke;
	let validFile: EsquisseFile;

	beforeEach(() => {
		validStroke = {
			id: 'stroke-1',
			color: '#000000',
			width: 2,
			points: [
				{ x: 0, y: 0 },
				{ x: 10, y: 10 },
				{ x: 20, y: 20 }
			],
			timestamp: Date.now()
		};

		validFile = {
			version: FILE_FORMAT_VERSION,
			created: '2025-01-01T00:00:00.000Z',
			modified: '2025-01-01T00:00:00.000Z',
			strokes: [validStroke]
		};
	});

	describe('validateEsquisseFile', () => {
		it('should validate a correct file', () => {
			expect(validateEsquisseFile(validFile)).toBe(true);
		});

		it('should reject non-object input', () => {
			expect(validateEsquisseFile(null)).toBe(false);
			expect(validateEsquisseFile(undefined)).toBe(false);
			expect(validateEsquisseFile('string')).toBe(false);
			expect(validateEsquisseFile(123)).toBe(false);
			expect(validateEsquisseFile([])).toBe(false);
		});

		it('should reject file without version', () => {
			const invalid = { ...validFile, version: undefined };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should reject file without created date', () => {
			const invalid = { ...validFile, created: undefined };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should reject file without modified date', () => {
			const invalid = { ...validFile, modified: undefined };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should reject file without strokes array', () => {
			const invalid = { ...validFile, strokes: undefined };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should reject file with non-array strokes', () => {
			const invalid = { ...validFile, strokes: 'not-array' };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should accept file with empty strokes array', () => {
			const valid = { ...validFile, strokes: [] };
			expect(validateEsquisseFile(valid)).toBe(true);
		});

		it('should reject file with invalid stroke (missing id)', () => {
			const invalidStroke = { ...validStroke, id: undefined };
			const invalid = { ...validFile, strokes: [invalidStroke] };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should reject file with invalid stroke (missing color)', () => {
			const invalidStroke = { ...validStroke, color: undefined };
			const invalid = { ...validFile, strokes: [invalidStroke] };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should reject file with invalid stroke (invalid width)', () => {
			const invalidStroke = { ...validStroke, width: 0 };
			const invalid = { ...validFile, strokes: [invalidStroke] };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should reject file with invalid stroke (negative width)', () => {
			const invalidStroke = { ...validStroke, width: -5 };
			const invalid = { ...validFile, strokes: [invalidStroke] };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should reject file with invalid stroke (empty points)', () => {
			const invalidStroke = { ...validStroke, points: [] };
			const invalid = { ...validFile, strokes: [invalidStroke] };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should reject file with invalid stroke (invalid point)', () => {
			const invalidStroke = {
				...validStroke,
				points: [{ x: 0, y: 0 }, { x: 'invalid', y: 10 }]
			};
			const invalid = { ...validFile, strokes: [invalidStroke as any] };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should reject file with invalid stroke (missing timestamp)', () => {
			const invalidStroke = { ...validStroke, timestamp: undefined };
			const invalid = { ...validFile, strokes: [invalidStroke] };
			expect(validateEsquisseFile(invalid)).toBe(false);
		});

		it('should validate file with multiple valid strokes', () => {
			const stroke2 = { ...validStroke, id: 'stroke-2', timestamp: Date.now() + 1000 };
			const stroke3 = { ...validStroke, id: 'stroke-3', timestamp: Date.now() + 2000 };
			const valid = { ...validFile, strokes: [validStroke, stroke2, stroke3] };
			expect(validateEsquisseFile(valid)).toBe(true);
		});
	});

	describe('createEsquisseFile', () => {
		it('should create a file with correct structure', () => {
			const strokes = [validStroke];
			const file = createEsquisseFile(strokes);

			expect(file.version).toBe(FILE_FORMAT_VERSION);
			expect(file.strokes).toEqual(strokes);
			expect(typeof file.created).toBe('string');
			expect(typeof file.modified).toBe('string');
		});

		it('should preserve created date from existing file', () => {
			const existingFile = validFile;
			const newFile = createEsquisseFile([validStroke], existingFile);

			expect(newFile.created).toBe(existingFile.created);
			expect(newFile.modified).not.toBe(existingFile.modified);
		});

		it('should update modified date', () => {
			const file1 = createEsquisseFile([validStroke]);
			const file2 = createEsquisseFile([validStroke], file1);

			expect(new Date(file2.modified).getTime()).toBeGreaterThanOrEqual(
				new Date(file1.modified).getTime()
			);
		});

		it('should handle empty strokes array', () => {
			const file = createEsquisseFile([]);

			expect(file.strokes).toEqual([]);
			expect(file.version).toBe(FILE_FORMAT_VERSION);
		});
	});

	describe('serializeEsquisseFile', () => {
		it('should serialize to valid JSON', () => {
			const json = serializeEsquisseFile(validFile);
			const parsed = JSON.parse(json);

			expect(parsed).toEqual(validFile);
		});

		it('should use pretty formatting', () => {
			const json = serializeEsquisseFile(validFile);

			// Check for indentation (should have newlines and spaces)
			expect(json).toContain('\n');
			expect(json).toContain('  ');
		});

		it('should serialize file with multiple strokes', () => {
			const stroke2 = { ...validStroke, id: 'stroke-2' };
			const file = { ...validFile, strokes: [validStroke, stroke2] };
			const json = serializeEsquisseFile(file);
			const parsed = JSON.parse(json);

			expect(parsed.strokes).toHaveLength(2);
		});
	});

	describe('deserializeEsquisseFile', () => {
		it('should deserialize valid JSON', () => {
			const json = serializeEsquisseFile(validFile);
			const deserialized = deserializeEsquisseFile(json);

			expect(deserialized).toEqual(validFile);
		});

		it('should throw error for invalid JSON', () => {
			expect(() => deserializeEsquisseFile('invalid json')).toThrow('Invalid JSON format');
		});

		it('should throw error for invalid file structure', () => {
			const invalidJson = JSON.stringify({ invalid: 'structure' });
			expect(() => deserializeEsquisseFile(invalidJson)).toThrow('Invalid Esquisse file format');
		});

		it('should throw error for file with invalid stroke', () => {
			const invalidFile = {
				...validFile,
				strokes: [{ ...validStroke, width: -1 }]
			};
			const json = JSON.stringify(invalidFile);

			expect(() => deserializeEsquisseFile(json)).toThrow('Invalid Esquisse file format');
		});

		it('should handle file with empty strokes', () => {
			const emptyFile = { ...validFile, strokes: [] };
			const json = JSON.stringify(emptyFile);
			const deserialized = deserializeEsquisseFile(json);

			expect(deserialized.strokes).toEqual([]);
		});
	});

	describe('Round trip serialization', () => {
		it('should maintain data through serialize/deserialize cycle', () => {
			const file = createEsquisseFile([validStroke]);
			const json = serializeEsquisseFile(file);
			const deserialized = deserializeEsquisseFile(json);

			expect(deserialized).toEqual(file);
		});

		it('should handle complex strokes', () => {
			const complexStroke: Stroke = {
				id: 'complex-1',
				color: '#ff5733',
				width: 5.5,
				points: Array.from({ length: 100 }, (_, i) => ({
					x: Math.sin(i * 0.1) * 100,
					y: Math.cos(i * 0.1) * 100
				})),
				timestamp: Date.now()
			};

			const file = createEsquisseFile([complexStroke]);
			const json = serializeEsquisseFile(file);
			const deserialized = deserializeEsquisseFile(json);

			expect(deserialized.strokes[0]).toEqual(complexStroke);
		});
	});
});
