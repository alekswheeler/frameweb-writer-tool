# frameweb-writer-tool

A DSL for generating web applications with framework-agnostic code generation.

## Quick Start

### 1. Generate Language Files
```sh
npm run langium:generate
```

### 2. Build Project
```sh
npm run build
```
The build process uses Rollup to generate optimized code files.

### 3. Generate Output
```sh
node ./bin/cli.js generate ./examples/application.fwt
```

Choose any file from the `examples/` folder to see the generated output.

## Example Usage
```sh
# Generate from different example files
node ./bin/cli.js generate ./examples/simple.fwt
node ./bin/cli.js generate ./examples/complex.fwt
```