
import { describe, it, expect } from 'vitest';
import { getProfile } from '../../../src/coverage/languages.js';

describe('Language Profiles', () => {
    it('should return correct profile for extensions', () => {
        expect(getProfile('.ts')).toBeDefined();
        expect(getProfile('.py')).toBeDefined();
        expect(getProfile('.go')).toBeDefined();
        expect(getProfile('.rs')).toBeDefined();
        expect(getProfile('.sh')).toBeDefined();
        expect(getProfile('.unknown')).toBeUndefined();
    });

    describe('TypeScript/JavaScript', () => {
        const profile = getProfile('.ts')!;

        it('should match class definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'class')!.pattern;
            expect('class MyClass').toMatch(pattern);
            expect('class MyClass {').toMatch(pattern);
            expect(pattern.exec('class MyClass')![1]).toBe('MyClass');
        });

        it('should match function definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'function')!.pattern;
            expect('function myFunction').toMatch(pattern);
            expect(pattern.exec('function myFunction()')![1]).toBe('myFunction');
        });

        it('should match variable definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'variable' && p.pattern.source.includes('const'))!.pattern;
            expect('const myVar =').toMatch(pattern);
            expect('let myLet =').toMatch(pattern);
            expect(pattern.exec('const myVar = 10')![1]).toBe('myVar');
        });

        it('should match interface definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'interface')!.pattern;
            expect('interface MyInterface').toMatch(pattern);
            expect(pattern.exec('interface MyInterface {')![1]).toBe('MyInterface');
        });

        it('should match type definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'variable' && p.pattern.source.includes('type'))!.pattern;
            expect('type MyType =').toMatch(pattern);
            expect(pattern.exec('type MyType = string')![1]).toBe('MyType');
        });
    });

    describe('Python', () => {
        const profile = getProfile('.py')!;

        it('should match class definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'class')!.pattern;
            expect('class MyClass').toMatch(pattern);
            expect(pattern.exec('class MyClass:')![1]).toBe('MyClass');
        });

        it('should match function definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'function')!.pattern;
            expect('def my_func').toMatch(pattern);
            expect(pattern.exec('def my_func():')![1]).toBe('my_func');
        });
    });

    describe('Go', () => {
        const profile = getProfile('.go')!;

        it('should match function definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'function')!.pattern;
            expect('func MyFunc').toMatch(pattern);
            expect(pattern.exec('func MyFunc()')![1]).toBe('MyFunc');
        });

        it('should match type definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'variable')!.pattern;
            expect('type MyType').toMatch(pattern);
            expect(pattern.exec('type MyType struct')![1]).toBe('MyType');
        });
    });

    describe('Rust', () => {
        const profile = getProfile('.rs')!;

        it('should match function definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'function')!.pattern;
            expect('fn my_func').toMatch(pattern);
            expect(pattern.exec('fn my_func()')![1]).toBe('my_func');
        });

        it('should match struct definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'class')!.pattern;
            expect('struct MyStruct').toMatch(pattern);
            expect(pattern.exec('struct MyStruct {')![1]).toBe('MyStruct');
        });

        it('should match enum definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.kind === 'variable')!.pattern;
            expect('enum MyEnum').toMatch(pattern);
            expect(pattern.exec('enum MyEnum {')![1]).toBe('MyEnum');
        });
    });

    describe('Shell', () => {
        const profile = getProfile('.sh')!;

        it('should match function keyword definitions', () => {
            const pattern = profile.definitionPatterns.find(p => p.pattern.source.includes('function'))!.pattern;
            expect('function my_func').toMatch(pattern);
            expect(pattern.exec('function my_func')![1]).toBe('my_func');
        });

        it('should match parens definitions', () => {
            const pattern = profile.definitionPatterns.find(p => !p.pattern.source.includes('function'))!.pattern;
            expect('my_func()').toMatch(pattern);
            expect(pattern.exec('my_func() {')![1]).toBe('my_func');
        });
    });
});
