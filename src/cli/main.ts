import type { Program } from '../language/generated/ast.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { FrameWebWriterToolLanguageMetaData } from '../language/generated/module.js';
import { createFrameWebWriterToolServices } from '../language/frame-web-writer-tool-module.js';
import { extractAstNode } from './cli-util.js';
import { generateMermaidMd } from './generator.js';
import { NodeFileSystem } from 'langium/node';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { URI } from 'langium';
import { FrameWebWorkspaceInitializer } from '../workspace-initializer.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createFrameWebWriterToolServices(NodeFileSystem).FrameWebWriterTool;
    
    await FrameWebWorkspaceInitializer.initialize(services.shared, process.cwd());
    
    const model = await extractAstNode<Program>(fileName, services);
    const generatedFilePath = generateMermaidMd(model, fileName, opts.destination);
    console.log(chalk.green(`JavaScript code generated successfully: ${generatedFilePath}`));
};

function getFileUriFromPath(fileName: string): URI {
  // Assuming 'fileName' is a full or relative path to a file
  const fullPath = path.resolve(fileName); // Resolve to an absolute path
  return URI.parse(fullPath);
}

export const debugScopeAction = async (fileName: string): Promise<void> => {
  const services =
    createFrameWebWriterToolServices(NodeFileSystem).FrameWebWriterTool;

  try {
    // Método correto para obter o URI do arquivo
    const fileUri = getFileUriFromPath(fileName);

    // Obtém ou cria o documento
    const document =
      await services.shared.workspace.LangiumDocuments.getOrCreateDocument(fileUri);
  
    // Garante que o documento está analisado
    await services.shared.workspace.DocumentBuilder.build([document]);

    // Obtém o ScopeComputation
    const scopeComputation = services.references.ScopeComputation;

    // Calcula os exports
    const exports = await scopeComputation.computeExports(document);

    // Exibe os resultados
    console.log(chalk.yellow("\n=== Scope Computation Debug ==="));
    console.log(chalk.blue(`File: ${fileName}`));
    console.log(chalk.green("\nExported Elements:"));

    if (exports.length === 0) {
      console.log(chalk.red("No exports found in this file"));
    } else {
      exports.forEach((desc) => {
        console.log(
          chalk.cyan(`- ${desc.name}`) +
            chalk.gray(` (${desc.type})`) +
            chalk.gray(` [${desc.documentUri.fsPath}]`)
        );
      });
    }

    console.log(chalk.yellow("==============================\n"));
  } catch (error) {
    console.error(chalk.red("Error debugging scope:"), error);
  }
};

export type GenerateOptions = {
    destination?: string;
}

export default function(): void {
  const program = new Command();

  program.version(JSON.parse(packageContent).version);

  const fileExtensions =
    FrameWebWriterToolLanguageMetaData.fileExtensions.join(", ");
  program
    .command("generate")
    .argument(
      "<file>",
      `source file (possible file extensions: ${fileExtensions})`
    )
    .option("-d, --destination <dir>", "destination directory of generating")
    .description(
      'generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file'
    )
    .action(generateAction);

  // Novo comando debug-scope
  program
    .command("debug-scope")
    .argument(
      "<file>",
      `source file to analyze (possible file extensions: ${fileExtensions})`
    )
    .description("debug scope computation and show exported elements")
    .action(debugScopeAction);

  program.parse(process.argv);
}
