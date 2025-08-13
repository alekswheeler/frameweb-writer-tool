import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default [
    {
        input: 'src/extension/main.ts',
        output: {
            file: 'out/extension/main.cjs',
            format: 'cjs',
            sourcemap: true,
            exports: 'named'
        },
        external: ['vscode'],
        plugins: [
            nodeResolve({ 
                preferBuiltins: true,
                exportConditions: ['node', 'import', 'require']
            }),
            commonjs({
                transformMixedEsModules: true
            }),
            json(),
            typescript({
                tsconfig: './tsconfig.src.json',
                declaration: false,
                target: 'ES2020',
                module: 'ESNext'
            })
        ]
    },
    {
        input: 'src/language/main.ts',
        output: {
            file: 'out/language/main.cjs',
            format: 'cjs',
            sourcemap: true,
            exports: 'named'
        },
        external: ['vscode'],
        plugins: [
            nodeResolve({ 
                preferBuiltins: true,
                exportConditions: ['node', 'import', 'require']
            }),
            commonjs({
                transformMixedEsModules: true
            }),
            json(),
            typescript({
                tsconfig: './tsconfig.src.json',
                declaration: false,
                target: 'ES2020',
                module: 'ESNext'
            })
        ]
    }
];

// Instale as dependências:
// npm install --save-dev rollup @rollup/plugin-typescript @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-json

// No package.json:
// "build": "tsc -b tsconfig.src.json && rollup -c"

// Ajuste também o package.json para usar .cjs:
// "main": "./out/extension/main.cjs"