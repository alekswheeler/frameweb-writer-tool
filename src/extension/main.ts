import type {
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node.js";
import * as vscode from "vscode";
import * as path from "node:path";
import { LanguageClient, TransportKind } from "vscode-languageclient/node.js";

let client: LanguageClient;

function getMermaidWebviewHtml(
  content: string,
  mermaidUri: vscode.Uri,
  panzoomUri: vscode.Uri,
): string {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mermaid Diagram</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                }
                #mermaid-diagram {
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div id="mermaid-diagram">
                <pre class="mermaid">${content}</pre>
            </div>

            <script src="${mermaidUri}"></script>
            <script src="${panzoomUri}"></script>
            <script>
                // Inicializar o Mermaid ANTES de renderizar
                mermaid.initialize({
                    startOnLoad: true,
                    theme: 'default',
                    securityLevel: 'loose',
                    flowchart: {
                        useMaxWidth: true,
                        htmlLabels: true
                    },
                    sequence: {
                        useMaxWidth: true
                    },
                    class: {
                        useMaxWidth: true,
                        htmlLabels: true
                    }
                });

                // Aguardar o DOM carregar completamente
                document.addEventListener('DOMContentLoaded', function() {
                    // Renderizar diagramas manualmente se necessário
                    mermaid.init(undefined, document.querySelectorAll('.mermaid'));
                    
                    // Configurar pan/zoom após renderização
                    setTimeout(() => {
                        const diagramContainer = document.querySelector('#mermaid-diagram');
                        if (diagramContainer && typeof panzoom !== 'undefined') {
                            panzoom(diagramContainer, {
                                maxZoom: 5,
                                minZoom: 0.1,
                                contain: 'outside'
                            });
                        }
                    }, 500);
                });
            </script>
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
  const serverModule = context.asAbsolutePath(
    path.join("out", "language", "main.cjs"),
  );
  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
  // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
  const debugOptions = {
    execArgv: [
      "--nolazy",
      `--inspect${process.env.DEBUG_BREAK ? "-brk" : ""}=${process.env.DEBUG_SOCKET || "6009"}`,
    ],
  };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "*", language: "frame-web-writer-tool" }],
  };

  // Create the language client and start the client.
  const client = new LanguageClient(
    "frame-web-writer-tool",
    "Frame Web Writer Tool",
    serverOptions,
    clientOptions,
  );

  // Start the client. This will also launch the server
  client.start();
  vscode.workspace.onDidSaveTextDocument(async (doc) => {
    if (doc.languageId === "frame-web-writer-tool") {
      var folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0)
        vscode.window.showErrorMessage(
          "Esta extensão requer um workspace aberto (abra a pasta do projeto).",
        );
      // Enviar notificação para o server
      else
        client.sendNotification("custom/generateDiagram", {
          uri: doc.uri.toString(),
        });
    }
  });

  // Receber resultado do server
  client.onNotification(
    "custom/diagramGenerated",
    (params: { uri: string; content: string }) => {
      console.log(`Diagram generated for: ${params.uri}`);

      // Criar webview com o conteúdo
      const mediaFolder = path.join(
        context.extensionPath,
        "src",
        "extension",
        "media",
      );

      const panel = vscode.window.createWebviewPanel(
        "mermaidPreview",
        "Mermaid Diagram Preview",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(mediaFolder)],
        },
      );

      const mermaidPath = vscode.Uri.file(
        path.join(mediaFolder, "mermaid.min.js"),
      );
      const mermaidUri = panel.webview.asWebviewUri(mermaidPath);
      const panzoomPath = vscode.Uri.file(
        path.join(mediaFolder, "panzoom.min.js"),
      );
      const panzoomUri = panel.webview.asWebviewUri(panzoomPath);

      panel.webview.html = getMermaidWebviewHtml(
        params.content,
        mermaidUri,
        panzoomUri,
      );
    },
  );

  client.onNotification(
    "custom/diagramError",
    (params: { uri: string; error: string }) => {
      vscode.window.showErrorMessage(
        `Error generating diagram: ${params.error}`,
      );
    },
  );

  return client;
}
