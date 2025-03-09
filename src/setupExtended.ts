import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import { configureWorker, defineUserServices } from './setupCommon.js';

export const setupConfigExtended = (): UserConfig => {
    const extensionFilesOrContents = new Map();
    extensionFilesOrContents.set('/language-configuration.json', new URL('../language-configuration.json', import.meta.url));
    extensionFilesOrContents.set('/frame-web-writer-tool-grammar.json', new URL('../syntaxes/frame-web-writer-tool.tmLanguage.json', import.meta.url));

    return {
        wrapperConfig: {
            serviceConfig: defineUserServices(),
            editorAppConfig: {
                $type: 'extended',
                languageId: 'frame-web-writer-tool',
                code: `// Frame Web Writer Tool is running in the web!`,
                useDiffEditor: false,
                extensions: [{
                    config: {
                        name: 'frame-web-writer-tool-web',
                        publisher: 'generator-langium',
                        version: '1.0.0',
                        engines: {
                            vscode: '*'
                        },
                        contributes: {
                            languages: [{
                                id: 'frame-web-writer-tool',
                                extensions: [
                                    '.frame-web-writer-tool'
                                ],
                                configuration: './language-configuration.json'
                            }],
                            grammars: [{
                                language: 'frame-web-writer-tool',
                                scopeName: 'source.frame-web-writer-tool',
                                path: './frame-web-writer-tool-grammar.json'
                            }]
                        }
                    },
                    filesOrContents: extensionFilesOrContents,
                }],                
                userConfiguration: {
                    json: JSON.stringify({
                        'workbench.colorTheme': 'Default Dark Modern',
                        'editor.semanticHighlighting.enabled': true
                    })
                }
            }
        },
        languageClientConfig: configureWorker()
    };
};

export const executeExtended = async (htmlElement: HTMLElement) => {
    const userConfig = setupConfigExtended();
    const wrapper = new MonacoEditorLanguageClientWrapper();
    await wrapper.initAndStart(userConfig, htmlElement);
};
