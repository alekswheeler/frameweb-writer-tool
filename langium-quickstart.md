# Welcome to your Langium VS Code Extension

## What's in the folder

This folder contains all necessary files for your language extension.

- `package.json` - the manifest file in which you declare your language support.
- `language-configuration.json` - the language configuration used in the VS Code editor, defining the tokens that are used for comments and brackets.
- `src/extension/main.ts` - the main code of the extension, which is responsible for launching a language server and client.
- `src/language/frame-web-writer-tool.langium` - the grammar definition of your language.
- `src/language/main.ts` - the entry point of the language server process.
- `src/language/frame-web-writer-tool-module.ts` - the dependency injection module of your language implementation. Use this to register overridden and added services.
- `src/language/frame-web-writer-tool-validator.ts` - an example validator. You should change it to reflect the semantics of your language.
- `src/cli/main.ts` - the entry point of the command line interface (CLI) of your language.
- `src/cli/generator.ts` - the code generator used by the CLI to write output files from DSL documents.
- `src/cli/cli-util.ts` - utility code for the CLI.

## Get up and running straight away

- Run `npm run langium:generate` to generate TypeScript code from the grammar definition.
- Run `npm run build` to compile all TypeScript code.
- Press `F5` to open a new window with your extension loaded.
- Create a new file with a file name suffix matching your language.
- Verify that syntax highlighting, validation, completion etc. are working as expected.
- Run `node ./bin/cli` to see options for the CLI; `node ./bin/cli generate <file>` generates code for a given DSL file.

## Make changes

- Run `npm run watch` to have the TypeScript compiler run automatically after every change of the source files.
- Run `npm run langium:watch` to have the Langium generator run automatically after every change of the grammar declaration.
- You can relaunch the extension from the debug toolbar after making changes to the files listed above.
- You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

## Install your extension

- To start using your extension with VS Code, copy it into the `<user home>/.vscode/extensions` folder and restart Code.
- To share your extension with the world, read the [VS Code documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) about publishing an extension.

## To Go Further

Documentation about the Langium framework is available at https://langium.org

--

A DSL for designing web applications using UML patterns from the [frameweb](https://nemo.inf.ufes.br/en/projetos/frameweb/) methodology.

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

### Run the project

Run the project in the debug mode choose any file from the `examples/` folder and save the file to see the generated output diagram.

## VS code extension

To use as a VS Code extension, download the .vsix file from the [releases](https://github.com/alekswheeler/frameweb-writer-tool/releases) page and install it.
Select any file from the `examples/` folder and save the file to see the generated output diagram.

<img width="1920" height="1027" alt="image" src="https://github.com/user-attachments/assets/d74447e7-565e-4df6-b74f-384d0e5e6f76" />

---

To see more about the language sintax see the [wiki](https://github.com/alekswheeler/frameweb-writer-tool/wiki) page (pt-br).
