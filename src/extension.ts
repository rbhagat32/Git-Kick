import { exec } from "child_process";
import { promisify } from "util";
import * as vscode from "vscode";

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    900
  );
  statusBarItem.text = "$(git-compare) Git-Kick";
  statusBarItem.command = "extension.commit";
  statusBarItem.tooltip = "AI generated commit messages";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  let disposable = vscode.commands.registerCommand(
    "extension.commit",
    async () => {
      try {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
          vscode.window.showErrorMessage("No workspace folder is open.");
          return;
        }

        const workspacePath = folders[0].uri.fsPath;

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Generating commit message...",
            cancellable: false,
          },
          async () => {
            let commitMessage = ".";

            const editedCommitMessage = await vscode.window.showInputBox({
              prompt: "Edit commit message",
              value: commitMessage,
              placeHolder: "Enter your commit message",
            });

            if (editedCommitMessage === undefined) {
              vscode.window.showInformationMessage("Commit cancelled.");
              return;
            }

            if (editedCommitMessage.trim() === "") {
              vscode.window.showErrorMessage("Commit message cannot be empty.");
              return;
            }

            commitMessage = editedCommitMessage;

            await execAsync(`git add .`, { cwd: workspacePath });
            await execAsync(
              `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`,
              { cwd: workspacePath }
            );

            vscode.window.showInformationMessage(
              `Code committed successfully.`
            );
          }
        );
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error: ${error.message || error}`);
        console.error(error);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
