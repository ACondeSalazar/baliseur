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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    let view_tree = vscode.commands.registerCommand('baliseur.viewTags', function () {
        vscode.window.showInformationMessage('viewing tags');
        const active_window = vscode.window.activeTextEditor;
        if (!active_window) {
            vscode.window.showErrorMessage('Open a file first');
            return;
        }
        let document = active_window.document;
        let content = document.getText();
        console.log(content);
        let balises = [];
        for (let line = 0; line < document.lineCount; line++) {
            const line_text = document.lineAt(line);
            if (line_text.text.trim().startsWith('//#')) {
                balises.push(new Balise(line_text.text.trim().substring(3), line + 1));
                //balises.push({ line_number: line + 1, text: line_text.text.trim().substring(3) });
            }
        }
        console.log(balises);
        if (balises.length == 0) {
            vscode.window.showErrorMessage('No tags found (tags are line that starts with "//#")');
            return;
        }
        const fileTreeDataProvider = new FileTagsProvider();
        vscode.window.createTreeView('filesTagsView', { treeDataProvider: fileTreeDataProvider });
    });
    //context.subscriptions.push(view_tree);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function getBaliseObjects(doc) {
}
class FileContainer extends vscode.TreeItem {
    filename;
    balises;
    collapsibleState;
    constructor(filename, balises, collapsibleState) {
        super(filename, collapsibleState);
        this.filename = filename;
        this.balises = balises;
        this.collapsibleState = collapsibleState;
    }
}
class Balise {
    text;
    line;
    constructor(text, line) {
        this.text = text;
        this.line = line;
    }
}
class FileTagsProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            // If element has children, return them
            console.log(element);
            console.log("hasElement");
            return Promise.resolve(element.balises.map(child => new FileContainer(child.text, [], vscode.TreeItemCollapsibleState.None)));
        }
        else {
            console.log("element faulsy");
            // If no element is provided, return top-level items (file names)
            const fileContainers = vscode.workspace.textDocuments.map(doc => {
                //const childrens = this.getBaliseObjects(doc);
                console.log(doc.fileName);
                return new FileContainer(doc.fileName, [], vscode.TreeItemCollapsibleState.Collapsed);
            });
            return Promise.resolve(fileContainers);
        }
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
}
//# sourceMappingURL=extension_nul.js.map