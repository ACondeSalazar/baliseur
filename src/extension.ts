import path from 'path';
import * as vscode from 'vscode';

class TagItem extends vscode.TreeItem {
    constructor(
        public label: string,
        public line: number, //if line is zero, then item is a filename
        public tags: TagItem[],
        public collapsibleState: vscode.TreeItemCollapsibleState,
        public document: vscode.TextDocument
    ) {
        super(label, collapsibleState);
        if (line == 0) {
            this.description = "";
            this.tooltip = `file ${label}`;
            this.iconPath = new vscode.ThemeIcon("file");//vscode.Uri.file("../icons/file_icon.svg");
        } else {
            this.description = line.toString();
            this.tooltip = `${label} - line ${line}`;
            this.iconPath = new vscode.ThemeIcon("tag");//vscode.Uri.file("../icons/tag_icon.svg");
        }
        this.command = {
            "title": "Go to",
            "command": "baliseur.goToTag",
            "arguments": [document, line]
        };
    }
}

class FileTagsProvider implements vscode.TreeDataProvider<TagItem> {
    _onDidChangeTreeData: vscode.EventEmitter<TagItem | undefined | void> = new vscode.EventEmitter<TagItem | undefined | void>();
    onDidChangeTreeData: vscode.Event<TagItem | undefined | void> = this._onDidChangeTreeData.event;

    update(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TagItem): vscode.TreeItem {
        return element;
    }

    getParent(element: TagItem): vscode.ProviderResult<TagItem> {
        return element;
    }

    getChildren(element?: TagItem): Thenable<TagItem[]> {
        if (!element) { //if we are getting root level items (filenames)
            let opened_documents = vscode.workspace.textDocuments;
            let document_with_tags: vscode.TextDocument[] = [];
            //only show documents with actual tags
            opened_documents.forEach(document => {
                const tags = this.getTagsForFile(document);
                if (tags.length != 0) {
                    document_with_tags.push(document);
                }
            });
            let files = document_with_tags.map(document => {
                let tags = this.getTagsForFile(document);
                let filename = vscode.workspace.asRelativePath(document.uri);// name of item is its relative path 
                if (!filename) { //mandatory but should never show
                    return new TagItem("noFileNameError", 0, [], vscode.TreeItemCollapsibleState.Collapsed, document);
                }

                return new TagItem(filename, 0, tags, vscode.TreeItemCollapsibleState.Collapsed, document);
            });
            return Promise.resolve(files);
        } else {
            return Promise.resolve(element.tags);
        }
    }

    private getTagsForFile(document: vscode.TextDocument): TagItem[] {
        let content = document.getText();

        console.log(content);
        let balises = [];
        for (let line = 0; line < document.lineCount; line++) {
            const line_text = document.lineAt(line);
            if (line_text.text.trim().startsWith('//#')) {
                let text = line_text.text.trim().substring(3);
                balises.push(new TagItem(text, line + 1, [], vscode.TreeItemCollapsibleState.None, document));
            }
        }
        console.log(balises);

        if (balises.length == 0) {
            //vscode.window.showErrorMessage('No tags found (tags are line that starts with "//#")');
            return [];
        }

        return balises;
    }
}

// Register tree view
export function activate(context: vscode.ExtensionContext) {
    let provider = new FileTagsProvider();
    //vscode.window.registerTreeDataProvider('filesTagsView', provider);

    let treeview = vscode.window.createTreeView('filesTagsView', {
        treeDataProvider: provider
      });

    vscode.commands.registerCommand('baliseur.viewTags', () => {
        provider.update();
        //treeview.reveal( new TagItem("",0,[],vscode.TreeItemCollapsibleState.None,vscode.workspace.textDocuments[0]), { expand: false, select: false });
    }); 

    
    //on any document open, update
    vscode.workspace.onDidOpenTextDocument(() => {
        provider.update();
    });

    //set command when element clicked
    vscode.commands.registerCommand('baliseur.goToTag', async (document: vscode.TextDocument, line:number) => {
        let editor = await vscode.window.showTextDocument(document);
            let position = new vscode.Position(line,0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.AtTop);
        
    });


    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
        provider.update();
    });


}