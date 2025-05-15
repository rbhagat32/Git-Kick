import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import { getCommitMessageFromGemini } from "./utils/generate-message.js";

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

        const GEMINI_API_KEY = "AIzaSyAV9vjvO6DIph-hIP03Gg3RclNr8GZgc7M";
        if (!GEMINI_API_KEY) {
          vscode.window.showErrorMessage("Please set GEMINI_API_KEY in .env");
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
              const commitMessage = await getCommitMessageFromGemini(
                diff,
                GEMINI_API_KEY
              );

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
              console.error("Gemini API or commit error:", err);
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
