import type { WorkspaceFolder } from 'vscode-languageserver-types';
import type { LangiumSharedCoreServices } from 'langium';
import { DefaultWorkspaceManager, URI, UriUtils } from 'langium';
import type { LangiumDocument, FileSystemNode } from 'langium';
import { CancellationToken } from 'vscode-languageserver';
import fs from 'fs';
import path from 'path';
import { LangiumSharedServices } from 'langium/lsp';

/**
 * Custom Workspace Manager for Langium workspace management.
 * 
 * This custom implementation allows overriding Langium's default workspace manager
 * when additional control is needed. While the default implementation is sufficient
 * for most projects (e.g this project), this custom manager provides extended capabilities for specific
 * use cases where finer control over workspace operations is required.
 * 
 * The primary functionality of this class is the static 'initialize' method, which
 * addresses limitations of the CLI in handling project files and workspace directories
 * correctly. This implementation ensures proper workspace initialization and management.
 * 
 * Contact: aleks.vix@outlook.com
 * GitHub: alekswheeler
 * 
 * @author Alex Oliveira
 * @version 1.0
 */

export class FrameWebWorkspaceManager extends DefaultWorkspaceManager {

    private services: LangiumSharedCoreServices;

    constructor(services: LangiumSharedCoreServices) {
        super(services);
        this.services = services;
    }

    override async initializeWorkspace(folders: WorkspaceFolder[], cancelToken = CancellationToken.None): Promise<void> {
        folders.forEach((folder, index) => {
            console.log(`  [${index}] ${folder.name}: ${folder.uri}`);
        });

        try {
            // Usa a lógica do FrameWebWorkspaceInitializer
            const documents = await this.performFrameworkFileStartup(folders);
            console.log(`📄 Total documents collected: ${documents.length}`);
            
            // Log cada documento encontrado
            documents.forEach((doc, index) => {
                console.log(`  [${index}] ${doc.uri.toString()}`);
            });

            await this.documentBuilder.build(documents, this.initialBuildOptions, cancelToken);
            
            // Debug estado final
            this.debugFinalState();

        } catch (error) {
            console.error('Error initializing workspace:', error);
            throw error;
        }
    }

    /**
     * Nova implementação baseada na FrameWebWorkspaceInitializer
     * que busca especificamente por arquivos de framework
     */
    protected async performFrameworkFileStartup(folders: WorkspaceFolder[]): Promise<LangiumDocument[]> {
        const documents: LangiumDocument[] = [];
        
        for (const folder of folders) {
            const folderPath = this.getRootFolder(folder);
            console.log(`🔍 Searching for framework files in: ${folderPath.fsPath}`);
            
            // Busca todos os arquivos de framework recursivamente
            const frameworkFiles = this.findFrameworkFiles(folderPath.fsPath);
            
            console.log(`📦 Found ${frameworkFiles.length} framework files in ${folder.name}`);
            
            // Cria documentos para cada arquivo encontrado
            for (const filePath of frameworkFiles) {
                try {
                    const uri = URI.file(filePath);
                    console.log(`📝 Creating document for: ${uri.toString()}`);
                    
                    const document = await this.langiumDocuments.getOrCreateDocument(uri);
                    documents.push(document);
                    
                    if (!this.langiumDocuments.hasDocument(document.uri)) {
                        this.langiumDocuments.addDocument(document);
                    }
                } catch (error) {
                    console.error(`❌ Error creating document for ${filePath}:`, error);
                }
            }
        }

        // Carrega documentos adicionais se necessário
        const collector = (document: LangiumDocument) => {
            console.log(`📋 Additional document collected: ${document.uri.toString()}`);
            documents.push(document);
            if (!this.langiumDocuments.hasDocument(document.uri)) {
                this.langiumDocuments.addDocument(document);
            }
        };

        await this.loadAdditionalDocuments(folders, collector);
        
        this._ready.resolve();
        return documents;
    }

    /**
     * Encontra todos os arquivos de framework (.fwt) recursivamente
     * Baseado na implementação do FrameWebWorkspaceInitializer
     */
    private findFrameworkFiles(rootPath: string): string[] {
        const frameworkFiles: string[] = [];
        
        const findFilesRecursively = (currentPath: string): void => {
            try {
                // Verifica se o diretório existe
                if (!fs.existsSync(currentPath)) {
                    return;
                }
                
                const stats = fs.statSync(currentPath);
                
                // Se for arquivo, verifica se é do framework
                if (stats.isFile()) {
                    const ext = path.extname(currentPath).toLowerCase();
                    if (ext === '.fwt') {
                        frameworkFiles.push(currentPath);
                        console.log(`   ✅ Found: ${path.basename(currentPath)}`);
                    }
                    return;
                }
                
                // Se for diretório, busca recursivamente (ignorando node_modules e diretórios ocultos)
                if (stats.isDirectory()) {
                    const dirName = path.basename(currentPath);
                    
                    // Ignora node_modules e diretórios ocultos
                    if (dirName === 'node_modules' || dirName === 'out' || dirName.startsWith('.')) {
                        return;
                    }
                    
                    const items = fs.readdirSync(currentPath);
                    
                    for (const item of items) {
                        const fullPath = path.join(currentPath, item);
                        findFilesRecursively(fullPath);
                    }
                }
                
            } catch (error) {
                console.error(`   ❌ Error accessing ${currentPath}:`, error);
            }
        };
        
        // Inicia a busca recursiva
        findFilesRecursively(rootPath);
        
        console.log(`📦 Total framework files found: ${frameworkFiles.length}`);
        return frameworkFiles;
    }

    // Mantém os métodos originais como fallback
    protected override async performStartup(folders: WorkspaceFolder[]): Promise<LangiumDocument[]> {
        // Agora usa a nova implementação
        return this.performFrameworkFileStartup(folders);
    }

    protected override async traverseFolder(
        workspaceFolder: WorkspaceFolder, 
        folderPath: URI, 
        fileExtensions: string[], 
        collector: (document: LangiumDocument) => void
    ): Promise<void> {
        
        try {
            const content = await this.fileSystemProvider.readDirectory(folderPath);
            
            await Promise.all(content.map(async entry => {
                const shouldInclude = this.includeEntry(workspaceFolder, entry, fileExtensions);
                
                if (shouldInclude) {
                    if (entry.isDirectory) {
                        await this.traverseFolder(workspaceFolder, entry.uri, fileExtensions, collector);
                    } else if (entry.isFile) {
                        const document = await this.langiumDocuments.getOrCreateDocument(entry.uri);
                        collector(document);
                    }
                }
            }));
        } catch (error) {
            console.error('Error traversing folder:', error);
            throw error;
        }
    }

    protected override includeEntry(workspaceFolder: WorkspaceFolder, entry: FileSystemNode, fileExtensions: string[]): boolean {
        const name = UriUtils.basename(entry.uri);
        const shouldInclude = super.includeEntry(workspaceFolder, entry, fileExtensions);
        
        // Log detalhado sobre decisões de inclusão
        if (!shouldInclude) {
            if (name.startsWith('.')) {
                // Ignora arquivos ocultos
            } else if (entry.isDirectory && (name === 'node_modules' || name === 'out')) {
                // Ignora diretórios desnecessários
            } else if (entry.isFile) {
                const extname = UriUtils.extname(entry.uri);
                console.log(`   ⏭️ Skipping file with extension: ${extname}`);
            }
        }
        
        return shouldInclude;
    }

    protected override getRootFolder(workspaceFolder: WorkspaceFolder): URI {
        const rootUri = super.getRootFolder(workspaceFolder);
        console.log(`📁 Root folder: ${rootUri.toString()}`);
        return rootUri;
    }

    // ✅ MÉTODO DE DEBUG PARA VERIFICAR ESTADO FINAL
    private debugFinalState(): void {
        const documents = this.langiumDocuments.all.toArray();
        const indexManager = this.services.workspace.IndexManager;
        
        console.log(`🗂️ Total documents in workspace: ${documents.length}`);
        
        documents.forEach((doc, index) => {
            console.log(`   [${index}] ${doc.uri.toString()}`);
        });
        
        const allElements = indexManager.allElements().toArray();
        console.log(`🔍 Total indexed elements: ${allElements.length}`);
        
        const elementsByType = new Map<string, number>();
        allElements.forEach((element) => {
            const type = element.type;
            elementsByType.set(type, (elementsByType.get(type) || 0) + 1);
        });
        
        console.log('📊 Elements by type:');
        elementsByType.forEach((count, type) => {
            console.log(`   ${type}: ${count}`);
        });
    }

    async forceReindex(): Promise<void> {
        console.log('🔄 Force reindexing workspace...');
        
        const allDocs = this.langiumDocuments.all.toArray();
        console.log(`📚 Reindexing ${allDocs.length} documents`);
        
        await this.documentBuilder.build(allDocs, { 
            validation: true 
        });
        
        this.debugFinalState();
    }

    /**
     * Custom initializer for CLI
     */
    static async initialize(services: LangiumSharedServices, rootPath: string) {
        const files = this.findFrameworkFiles(rootPath);
        
        for (const file of files) {
            const uri = URI.file(file);
            await services.workspace.LangiumDocuments.getOrCreateDocument(uri);
        }
        
        await services.workspace.DocumentBuilder.build(
            services.workspace.LangiumDocuments.all.toArray()
        );
        
        // console.log(`🎯 Workspace initialized with ${files.length} files`);
    }

    /**
     * discovering and loading all framework-specific files (.fwt) recursively
     */
    static findFrameworkFiles(rootPath: string): string[] {
        const frameworkFiles: string[] = [];
        
        // console.log(`🔍 Searching for framework files in: ${rootPath}`);
        
        const findFilesRecursively = (currentPath: string): void => {
            try {
                // Verifica se o diretório existe
                if (!fs.existsSync(currentPath)) {
                    // console.log(`   📂 Directory does not exist: ${currentPath}`);
                    return;
                }
                
                const stats = fs.statSync(currentPath);
                
                // Se for arquivo, verifica se é do framework
                if (stats.isFile()) {
                    const ext = path.extname(currentPath).toLowerCase();
                    if (ext === '.fwt') {
                        frameworkFiles.push(currentPath);
                        // console.log(`   ✅ Found: ${path.basename(currentPath)}`);
                    }
                    return;
                }
                
                // Se for diretório, busca recursivamente (ignorando node_modules e diretórios ocultos)
                if (stats.isDirectory()) {
                    const dirName = path.basename(currentPath);
                    
                    // Ignora node_modules e diretórios ocultos
                    if (dirName === 'node_modules' || dirName.startsWith('.')) {
                        // console.log(`   ⏭️  Skipping: ${dirName}`);
                        return;
                    }
                    
                    // console.log(`   📂 Entering: ${dirName}`);
                    
                    const items = fs.readdirSync(currentPath);
                    
                    for (const item of items) {
                        const fullPath = path.join(currentPath, item);
                        findFilesRecursively(fullPath);
                    }
                }
                
            } catch (error) {
                console.error(`   ❌ Error accessing ${currentPath}:`, error);
            }
        };
        
        // Inicia a busca recursiva
        findFilesRecursively(rootPath);
        
        // console.log(`📦 Total framework files found: ${frameworkFiles.length}`);
        return frameworkFiles;
    }
}