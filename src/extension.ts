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

        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage('Open a file first to manipulate text selections');
            return;
        }

        let e = Window.activeTextEditor;
        let d = e.document;
        let selections = e.selections;

        urlToImage(e, d, selections);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}

function urlToImage(e: TextEditor, d: TextDocument, selections: Selection[]) {
    for (var x = 0; x < selections.length; x++) {
        let sel = selections[x];
        let urlString: string = d.getText(new Range(sel.start, sel.end));
        let url: URL = new URL(urlString);
        if (url.protocol == 'http:') {
            http.get(url, result => handleMessage(result, e, sel));
        } else if (url.protocol == 'https:') {
            https.get(url, result => handleMessage(result, e, sel));
        } else {
            vscode.window.showErrorMessage("Unknown URL protocol: " + url.protocol);
        }
    }
}

function handleMessage(msg: IncomingMessage, e: TextEditor, sel: Selection) {
    let contentType = msg.headers["content-type"];
    let data = 'data:' + contentType + ";base64,";
    msg.setEncoding("base64");
    msg.on("data", chunk => {
        data += chunk;
    });
    msg.on("end", () => {
        e.edit(edit => {
            edit.replace(sel, data);
        });
    });
}
