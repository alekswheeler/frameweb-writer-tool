import { startLanguageServer } from 'langium/lsp';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures} from 'vscode-languageserver/node.js';
import { createFrameWebWriterToolServices } from './frame-web-writer-tool-module.js';
import { FrameWebWorkspaceManager } from './frame-web-workspace-manager.js';
import { extractAstNode } from '../cli/cli-util.js';
import { generateMermaidMd } from '../cli/generator.js';
import { Program } from './generated/ast.js';
import { URI } from 'langium';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared } = createFrameWebWriterToolServices({ connection, ...NodeFileSystem });

console.log('🔍 WorkspaceManager type:', shared.workspace.WorkspaceManager.constructor.name);
console.log('🔍 Is custom?', shared.workspace.WorkspaceManager instanceof FrameWebWorkspaceManager);

// Start the language server with the shared services
startLanguageServer(shared);

// Adicionar após startLanguageServer
// No Language Server (main.js)
connection.onNotification('custom/generateDiagram', async (params: { uri: string }) => {
    console.log(`Generating diagram for: ${params.uri}`);
    
    try {
        const documentUri = URI.parse(params.uri);
        // Obter services específicos da linguagem usando a URI do documento
        const frameWebServices = shared.ServiceRegistry.getServices(documentUri);
        
        // Usar extractAstNode com os services corretos
        const model = await extractAstNode<Program>(documentUri.fsPath, frameWebServices);
        const diagramContent = generateMermaidMd(model, params.uri, undefined);
        
        connection.sendNotification('custom/diagramGenerated', {
            uri: params.uri,
            content: diagramContent
        });
        
    } catch (error: any) {
        console.error('Error generating diagram:', error);
        connection.sendNotification('custom/diagramError', {
            uri: params.uri,
            error: error.message
        });
    }
});