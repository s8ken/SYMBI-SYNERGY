import * as vscode from "vscode";
import { getApiBase, fetchJson, saveToken } from "./net";
import { SymbiLedgerProvider } from "./ledgerView";
import { getConsoleHtml } from "./webviewHtml";

export async function activate(ctx: vscode.ExtensionContext) {
  // Status bar indicator
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  status.text = "$(shield) SYMBI: …";
  status.tooltip = "SYMBI mode";
  status.show();
  ctx.subscriptions.push(status);
  refreshMode(status).catch(() => void 0);

  // Ledger tree
  const provider = new SymbiLedgerProvider(ctx);
  vscode.window.registerTreeDataProvider("symbi.ledger", provider);

  // Commands
  ctx.subscriptions.push(
    vscode.commands.registerCommand("symbi.openConsole", () => openConsole(ctx)),
    vscode.commands.registerCommand("symbi.verifyLedger", () => verifyLedger(ctx)),
    vscode.commands.registerCommand("symbi.setApiBase", setApiBase),
    vscode.commands.registerCommand("symbi.saveToken", () => saveToken(ctx)),
    vscode.commands.registerCommand("symbi.roundtable", () => roundtable(ctx))
  );
}

export function deactivate() {}

async function refreshMode(status: vscode.StatusBarItem) {
  try {
    const base = getApiBase();
    if (!base) { status.text = "$(shield) SYMBI: offline"; return; }
    const res = await fetch(base + "/healthz");
    status.text = res.ok ? "$(shield) SYMBI: normal" : "$(shield) SYMBI: hibernation";
  } catch {
    status.text = "$(shield) SYMBI: offline";
  } finally {
    setTimeout(() => refreshMode(status), 30000);
  }
}

function openConsole(ctx: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel("symbi.console", "SYMBI Console", vscode.ViewColumn.Beside, {
    enableScripts: true, retainContextWhenHidden: true
  });
  panel.webview.html = getConsoleHtml();
  panel.webview.onDidReceiveMessage(async (msg) => {
    if (msg?.type === "send") {
      try {
        const data = await fetchJson("/api/assistant/message", ctx, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg.text })
        });
        panel.webview.postMessage({ type: "reply", data });
      } catch (e: any) {
        panel.webview.postMessage({ type: "error", error: String(e?.message || e) });
      }
    }
  });
}

async function verifyLedger(ctx: vscode.ExtensionContext) {
  const id = await vscode.window.showInputBox({ prompt: "session_id to verify" });
  if (!id) return;
  try {
    const res = await fetchJson(`/api/ledger/verify?session_id=${encodeURIComponent(id)}`, ctx);
    if (res.ok) vscode.window.showInformationMessage(`Ledger OK (${res.count})`);
    else vscode.window.showWarningMessage(`Break at index ${res.break_at} (event: ${res.event_id || "?"})`);
  } catch (e: any) {
    vscode.window.showErrorMessage(String(e?.message || e));
  }
}

async function setApiBase() {
  const val = await vscode.window.showInputBox({
    prompt: "Set SYMBI API base URL",
    value: getApiBase() || "http://localhost:5000"
  });
  if (!val) return;
  await vscode.workspace.getConfiguration("symbi").update("apiBase", val, vscode.ConfigurationTarget.Workspace);
  vscode.window.showInformationMessage(`symbi.apiBase set to ${val}`);
}

async function roundtable(ctx: vscode.ExtensionContext) {
  const task = await vscode.window.showInputBox({ prompt: "Describe the goal/task for agents to propose on" });
  if (!task) return;
  try {
    const data = await fetchJson("/api/bridge/orchestrate", ctx, {
      method: "POST",
      body: JSON.stringify({ task, agents: ["v0", "codex", "trae"], context: {} })
    });
    
    // Show conflict information if present
    if (data.conflicts && data.conflicts.hasConflicts) {
      const conflictMsg = `⚠️ Conflicts detected: ${data.conflicts.conflictCount} conflicts (${data.conflicts.riskLevel} risk)`;
      vscode.window.showWarningMessage(conflictMsg);
    }
    
    const picks = (data.proposals || []).map((p: any) => ({
      label: `${p.agent_key} • ${p.proposal?.proposal_id || "?"} • score ${(p.score ?? 0).toFixed(2)}`,
      detail: p.proposal?.goal,
      description: data.conflicts?.riskLevel === 'high' ? '⚠️ High Risk' : 
                  data.conflicts?.riskLevel === 'medium' ? '⚠️ Medium Risk' : '✅ Low Risk',
      p
    }));
    
    const choice: any = await vscode.window.showQuickPick(picks, { 
      placeHolder: "Pick a proposal to inspect/dispatch",
      ignoreFocusOut: true
    });
    if (!choice) return;

    // Validate proposal before showing approval options
    const validationData = await fetchJson("/api/bridge/validate", ctx, {
      method: "POST",
      body: JSON.stringify({ 
        agent_key: choice.p.agent_key, 
        proposal: choice.p.proposal, 
        allProposals: data.proposals,
        context: {} 
      })
    });

    let approvalOptions = ["Cancel"];
    let infoMessage = `Agent: ${choice.p.agent_key}\nProposal: ${choice.p.proposal?.goal}\n\n`;

    if (validationData.validation.approved) {
      approvalOptions.unshift("✅ Dispatch (Approved)");
      infoMessage += "✅ Approval Status: APPROVED\n";
    } else {
      approvalOptions.unshift("⚠️ Force Dispatch (Override)", "📋 Review Details");
      infoMessage += "❌ Approval Status: BLOCKED\n";
      infoMessage += `Reasons: ${validationData.validation.reasons.join(', ')}\n`;
    }

    if (validationData.validation.warnings.length > 0) {
      infoMessage += `⚠️ Warnings: ${validationData.validation.warnings.join(', ')}\n`;
    }

    if (validationData.validation.requirements.length > 0) {
      infoMessage += `📋 Requirements: ${validationData.validation.requirements.join(', ')}\n`;
    }

    if (validationData.validation.conflicts.hasConflicts) {
      infoMessage += `🔍 Conflicts: ${validationData.validation.conflicts.conflictCount} (${validationData.validation.conflicts.riskLevel} risk)\n`;
    }

    // Show approval dialog with validation results
    const approve = await vscode.window.showQuickPick(approvalOptions, { 
      placeHolder: "Approve dispatch?",
      ignoreFocusOut: true
    });

    if (approve?.startsWith("📋 Review Details")) {
      // Show detailed validation information
      const detailsMsg = `Validation Details:\n\n${JSON.stringify(validationData, null, 2)}`;
      vscode.window.showInformationMessage(detailsMsg, { modal: true });
      return;
    }

    if (approve?.startsWith("✅ Dispatch") || approve?.startsWith("⚠️ Force Dispatch")) {
      const forceApproval = approve.startsWith("⚠️ Force Dispatch");
      
      if (forceApproval) {
        const confirmForce = await vscode.window.showWarningMessage(
          "Are you sure you want to force dispatch? This bypasses safety checks.", 
          { modal: true }, 
          "Yes, Force Dispatch", 
          "Cancel"
        );
        if (confirmForce !== "Yes, Force Dispatch") return;
      }

      const res = await fetchJson("/api/bridge/dispatch", ctx, {
        method: "POST",
        body: JSON.stringify({ 
          agent_key: choice.p.agent_key, 
          proposal: choice.p.proposal, 
          allProposals: data.proposals,
          context: {},
          forceApproval: forceApproval
        })
      });
      
      const status = res.ok ? (forceApproval ? "forced" : "approved") : "error";
      const message = `Dispatched to ${choice.p.agent_key}: ${status}`;
      
      if (forceApproval) {
        vscode.window.showWarningMessage(`⚠️ ${message} (safety bypassed)`);
      } else {
        vscode.window.showInformationMessage(`✅ ${message}`);
      }
    }
  } catch (e: any) {
    vscode.window.showErrorMessage(String(e?.message || e));
  }
}

