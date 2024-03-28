"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
class TagItem extends vscode.TreeItem {
    label;
    line;
    tags;
    collapsibleState;
    document;
    constructor(label, line, //if line is zero, then item is a filename
    tags, collapsibleState, document) {
        super(label, collapsibleState);
        this.label = label;
        this.line = line;
        this.tags = tags;
        this.collapsibleState = collapsibleState;
        this.document = document;
        if (line == 0) {
            this.description = "";
            this.tooltip = `file ${label}`;
            this.iconPath = new vscode.ThemeIcon("file"); //vscode.Uri.file("../icons/file_icon.svg");
        }
        else {
            this.description = line.toString();
            this.tooltip = `${label} - line ${line}`;
            this.iconPath = new vscode.ThemeIcon("tag"); //vscode.Uri.file("../icons/tag_icon.svg");
        }
        this.command = {
            "title": "Go to",
            "command": "baliseur.goToTag",
            "arguments": [document, line]
        };
    }
}
class FileTagsProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    update() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getParent(element) {
        return element;
    }
    getChildren(element) {
        if (!element) { //if we are getting root level items (filenames)
            let opened_documents = vscode.workspace.textDocuments;
            let document_with_tags = [];
            //only show documents with actual tags
            opened_documents.forEach(document => {
                const tags = this.getTagsForFile(document);
                if (tags.length != 0) {
                    document_with_tags.push(document);
                }
            });
            let files = document_with_tags.map(document => {
                let tags = this.getTagsForFile(document);
                let filename = vscode.workspace.asRelativePath(document.uri); // name of item is its relative path 
                if (!filename) { //mandatory but should never show
                    return new TagItem("noFileNameError", 0, [], vscode.TreeItemCollapsibleState.Collapsed, document);
                }
                return new TagItem(filename, 0, tags, vscode.TreeItemCollapsibleState.Collapsed, document);
            });
            return Promise.resolve(files);
        }
        else {
            return Promise.resolve(element.tags);
        }
    }
    getTagsForFile(document) {
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
function activate(context) {
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
    vscode.commands.registerCommand('baliseur.goToTag', async (document, line) => {
        let editor = await vscode.window.showTextDocument(document);
        let position = new vscode.Position(line, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.AtTop);
    });
    vscode.workspace.onDidSaveTextDocument((document) => {
        provider.update();
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map