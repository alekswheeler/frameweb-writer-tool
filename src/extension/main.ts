import type { LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import * as vscode from 'vscode';
import * as path from 'node:path';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';

let client: LanguageClient;

function getMermaidWebviewHtml(content: string, mermaidJsUri: vscode.Uri, panzoomJsUri: vscode.Uri): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {
                    margin: 0;
                    overflow: hidden;
                }
                #container {
                    width: 100vw;
                    height: 100vh;
                    cursor: grab;
                }
                .mermaid {
                    width: max-content;
                    margin: auto;
                }
                .namespace > rect {
                    fill: #f0f0f0;
                    stroke: #999999;
                    rx: 6;
                    ry: 6;
                }
            </style>
            <script src="${mermaidJsUri}"></script>
            <script src="${panzoomJsUri}"></script>
            <script>
                window.addEventListener('DOMContentLoaded', () => {
                    mermaid.initialize({ startOnLoad: true });
                    const container = document.getElementById('container');
                    panzoom(container, {
                        smoothScroll: false,
                        zoomSpeed: 0.065,
                        maxZoom: 5,
                        minZoom: 0.2
                    });
                });
            </script>
        </head>
        <body>
            <div id="container">
                <div class="mermaid">
                    ${content}
                </div>
            </div>
        </body>
        </html>
    `;
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
            // Enviar notificação para o server
            client.sendNotification('custom/generateDiagram', {
                uri: doc.uri.toString()
            });
        }
    });

    // Receber resultado do server
    client.onNotification('custom/diagramGenerated', (params: { uri: string, content: string }) => {
        console.log(`Diagram generated for: ${params.uri}`);
        
        // Criar webview com o conteúdo
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
        const panzoomPath = vscode.Uri.file(path.join(mediaFolder, 'panzoom.min.js'));
        const panzoomUri = panel.webview.asWebviewUri(panzoomPath);

        panel.webview.html = getMermaidWebviewHtml(params.content, mermaidUri, panzoomUri);
    });

    client.onNotification('custom/diagramError', (params: { uri: string, error: string }) => {
        vscode.window.showErrorMessage(`Error generating diagram: ${params.error}`);
    });

    return client;
}
