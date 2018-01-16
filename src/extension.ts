'use strict';

import * as vscode from 'vscode';

import Window = vscode.window;
import Document = vscode.TextDocument;
import Position = vscode.Position;
import Range = vscode.Range;
import Selection = vscode.Selection;
import TextDocument = vscode.TextDocument;
import TextEditor = vscode.TextEditor;

import * as http from 'http';
import * as https from 'https';

import { IncomingMessage } from 'http';
import { URL } from 'url';

export function activate(context: vscode.ExtensionContext) {

   let disposable = vscode.commands.registerCommand('extension.urlToImage', () => {
       
       let editor = Window.activeTextEditor;

        if (!editor) {
            Window.showInformationMessage('Open a file first to manipulate text selections');
            return;
        }

        for (let selection of editor.selections) {
            urlToImage(editor, selection);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

function urlToImage(editor: TextEditor, selection: Selection) {
    let urlString: string = editor.document.getText(new Range(selection.start, selection.end));
    let url: URL = new URL(urlString);
    if (url.protocol == 'http:') {
        http.get(url, result => handleMessage(result, editor, selection));
    } else if (url.protocol == 'https:') {
        https.get(url, result => handleMessage(result, editor, selection));
    } else {
        Window.showErrorMessage("Unknown URL protocol: " + url.protocol);
    }
}

function handleMessage(msg: IncomingMessage, editor: TextEditor, selection: Selection) {
    let contentType = msg.headers["content-type"];
    let data = `data:${contentType};base64,`;
    msg.setEncoding("base64");
    msg.on("data", chunk => {
        data += chunk;
    });
    msg.on("end", () => {
        editor.edit(edit => {
            edit.replace(selection, data);
        });
    });
}
