import type { LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import * as path from 'node:path';
import * as fs from 'fs';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import { NodeFileSystem } from 'langium/node';
import { createFrameWebWriterToolServices } from '../language/frame-web-writer-tool-module.js';
import { Program } from '../language/generated/ast.js';
import { extractAstNode, extractDestinationAndName } from '../cli/cli-util.js';
import { generateMermaidMd } from '../cli/generator.js';

let client: LanguageClient;

function getMermaidHtml(content: string): string {
    // Extração do bloco mermaid do .md (caso ele esteja dentro de ```mermaid ... ```)
    const mermaidRegex = /```mermaid\s*([\s\S]*?)```/gm;
    const match = mermaidRegex.exec(content);
    const diagramCode = match ? match[1].trim() : content.trim();

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Mermaid Preview</title>
        <script type="module">
            import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
            mermaid.initialize({ startOnLoad: true });
        </script>
    </head>
    <body>
        <div class="mermaid">
            ${diagramCode}
        </div>
    </body>
    </html>
    `;
}

function getMermaidWebviewHtml(content: string, mermaidJsUri: vscode.Uri): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <script src="${mermaidJsUri}"></script>
            <script>
                mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
            </script>
        </head>
        <body>
            <div class="mermaid">
                ${content}
            </div>
        </body>
        </html>
    `;
}

export async function showMermaidPreview(mdFilePath: string) {
    const mermaidContent = fs.readFileSync(mdFilePath, 'utf-8');

    const panel = vscode.window.createWebviewPanel(
        'mermaidPreview',
        'Mermaid Diagram Preview',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.dirname(mdFilePath))]
        }
    );

    panel.webview.html = getMermaidHtml(mermaidContent);
}

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    client = startLanguageClient(context);
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (client) {
        return client.stop();
    }
    return undefined;
}

function startLanguageClient(context: vscode.ExtensionContext): LanguageClient {
    const serverModule = context.asAbsolutePath(path.join('out', 'language', 'main.cjs'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: '*', language: 'frame-web-writer-tool' }]
    };

    // Create the language client and start the client.
    const client = new LanguageClient(
        'frame-web-writer-tool',
        'Frame Web Writer Tool',
        serverOptions,
        clientOptions
    );

    // Start the client. This will also launch the server
    client.start();
    vscode.workspace.onDidSaveTextDocument(async (doc) => {
    if (doc.languageId === 'frame-web-writer-tool') {
        const services = createFrameWebWriterToolServices(NodeFileSystem).FrameWebWriterTool;
        const model = await extractAstNode<Program>(doc.fileName, services);

        const diagramContent = generateMermaidMd(model, doc.fileName, undefined);
        const mediaFolder = path.join(context.extensionPath, 'src', 'extension', 'media');

        const panel = vscode.window.createWebviewPanel(
            'mermaidPreview',
            'Mermaid Diagram Preview',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(mediaFolder)]
            }
        );

        const mermaidPath = vscode.Uri.file(path.join(mediaFolder, 'mermaid.min.js'));
        const mermaidUri = panel.webview.asWebviewUri(mermaidPath);
        panel.webview.html = getMermaidWebviewHtml(diagramContent, mermaidUri);
    }
});

    return client;
}
