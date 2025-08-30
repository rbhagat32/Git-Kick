import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import { getCommitMessageFromDeepseek } from "./utils/generate-message.js";

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

        const DEEPSEEK_API_KEY =
          "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";
        if (!DEEPSEEK_API_KEY) {
          vscode.window.showErrorMessage("Please set DEEPSEEK_API_KEY in .env");
          return;
        }

        const { stdout: diff } = await execAsync("git diff HEAD", {
          cwd: workspacePath,
        });

        if (!diff.trim()) {
          vscode.window.showErrorMessage(
            "No changes detected since last commit."
          );
          return;
        }

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Generating commit message...",
            cancellable: false,
          },
          async () => {
            try {
              let commitMessage = await getCommitMessageFromDeepseek(
                diff,
                DEEPSEEK_API_KEY
              );

              const editCommitMessage = await vscode.window.showInputBox({
                prompt: "Edit commit message",
                value: commitMessage,
                placeHolder: "Enter your commit message",
              });

              if (editCommitMessage === undefined) {
                vscode.window.showInformationMessage("Commit cancelled.");
                return;
              }

              if (editCommitMessage.trim() === "") {
                vscode.window.showErrorMessage(
                  "Commit message cannot be empty."
                );
                return;
              }

              commitMessage = editCommitMessage;

              await execAsync(`git add .`, { cwd: workspacePath });
              await execAsync(
                `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`,
                { cwd: workspacePath }
              );

              vscode.window.showInformationMessage(
                `Committed with message: "${commitMessage}"`
              );
            } catch (err: any) {
              vscode.window.showErrorMessage(
                `Error generating commit message: ${err.message || err}`
              );
              console.error("Deepseek API or commit error:", err);
            }
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
