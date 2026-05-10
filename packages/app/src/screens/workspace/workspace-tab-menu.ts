import type { WorkspaceTabDescriptor } from "@/screens/workspace/workspace-tabs-types";
import { encodeFilePathForPathSegment } from "@/utils/host-routes";
import type { Translation } from "@/i18n/translations/en";

export type WorkspaceTabMenuSurface = "desktop" | "mobile";

export type WorkspaceTabMenuEntry =
  | {
      kind: "item";
      key: string;
      label: string;
      icon?: "copy" | "rotate-cw" | "arrow-left-to-line" | "arrow-right-to-line" | "copy-x" | "x";
      hint?: string;
      tooltip?: string;
      disabled?: boolean;
      destructive?: boolean;
      testID: string;
      onSelect: () => void;
    }
  | {
      kind: "separator";
      key: string;
    };

interface BuildWorkspaceTabMenuEntriesInput {
  surface: WorkspaceTabMenuSurface;
  tab: WorkspaceTabDescriptor;
  index: number;
  tabCount: number;
  menuTestIDBase: string;
  t: Translation;
  onCopyResumeCommand: (agentId: string) => Promise<void> | void;
  onCopyAgentId: (agentId: string) => Promise<void> | void;
  onReloadAgent: (agentId: string) => Promise<void> | void;
  onCloseTab: (tabId: string) => Promise<void> | void;
  onCloseTabsBefore: (tabId: string) => Promise<void> | void;
  onCloseTabsAfter: (tabId: string) => Promise<void> | void;
  onCloseOtherTabs: (tabId: string) => Promise<void> | void;
}

interface BuildWorkspaceDesktopTabActionsInput {
  tab: WorkspaceTabDescriptor;
  index: number;
  tabCount: number;
  t: Translation;
  onCopyResumeCommand: (agentId: string) => Promise<void> | void;
  onCopyAgentId: (agentId: string) => Promise<void> | void;
  onReloadAgent: (agentId: string) => Promise<void> | void;
  onCloseTab: (tabId: string) => Promise<void> | void;
  onCloseTabsToLeft: (tabId: string) => Promise<void> | void;
  onCloseTabsToRight: (tabId: string) => Promise<void> | void;
  onCloseOtherTabs: (tabId: string) => Promise<void> | void;
}

export interface WorkspaceDesktopTabActions {
  contextMenuTestId: string;
  menuEntries: WorkspaceTabMenuEntry[];
  closeButtonTestId: string;
}

function buildCloseBeforeLabel(surface: WorkspaceTabMenuSurface, t: Translation): string {
  return surface === "mobile" ? t.workspace.closeTabsAbove : t.workspace.closeToTheLeft;
}

function buildCloseAfterLabel(surface: WorkspaceTabMenuSurface, t: Translation): string {
  return surface === "mobile" ? t.workspace.closeTabsBelow : t.workspace.closeToTheRight;
}

function buildCloseBeforeTestIDSuffix(surface: WorkspaceTabMenuSurface): string {
  return surface === "mobile" ? "close-above" : "close-left";
}

function buildCloseAfterTestIDSuffix(surface: WorkspaceTabMenuSurface): string {
  return surface === "mobile" ? "close-below" : "close-right";
}

function getCloseButtonTestId(tab: WorkspaceTabDescriptor): string {
  if (tab.target.kind === "agent") {
    return `workspace-agent-close-${tab.target.agentId}`;
  }
  if (tab.target.kind === "terminal") {
    return `workspace-terminal-close-${tab.target.terminalId}`;
  }
  if (tab.target.kind === "draft") {
    return `workspace-draft-close-${tab.target.draftId}`;
  }
  if (tab.target.kind === "browser") {
    return `workspace-browser-close-${tab.target.browserId}`;
  }
  if (tab.target.kind === "setup") {
    return `workspace-setup-close-${encodeFilePathForPathSegment(tab.target.workspaceId)}`;
  }
  return `workspace-file-close-${encodeFilePathForPathSegment(tab.target.path)}`;
}

export function buildWorkspaceTabMenuEntries(
  input: BuildWorkspaceTabMenuEntriesInput,
): WorkspaceTabMenuEntry[] {
  const {
    surface,
    tab,
    index,
    tabCount,
    menuTestIDBase,
    t,
    onCopyResumeCommand,
    onCopyAgentId,
    onReloadAgent,
    onCloseTab,
    onCloseTabsBefore,
    onCloseTabsAfter,
    onCloseOtherTabs,
  } = input;
  const isFirstTab = index === 0;
  const isLastTab = index === tabCount - 1;
  const isOnlyTab = tabCount <= 1;
  const entries: WorkspaceTabMenuEntry[] = [];

  if (tab.target.kind === "agent") {
    const { agentId } = tab.target;
    entries.push({
      kind: "item",
      key: "copy-resume-command",
      label: t.workspace.copyResumeCommand,
      icon: "copy",
      testID: `${menuTestIDBase}-copy-resume-command`,
      onSelect: () => {
        void onCopyResumeCommand(agentId);
      },
    });
    entries.push({
      kind: "item",
      key: "copy-agent-id",
      label: t.workspace.copyAgentId,
      icon: "copy",
      hint: agentId.slice(0, 7),
      testID: `${menuTestIDBase}-copy-agent-id`,
      onSelect: () => {
        void onCopyAgentId(agentId);
      },
    });
    entries.push({
      kind: "separator",
      key: "copy-separator",
    });
  }

  entries.push({
    kind: "item",
    key: "close-before",
    label: buildCloseBeforeLabel(surface, t),
    icon: "arrow-left-to-line",
    disabled: isFirstTab,
    testID: `${menuTestIDBase}-${buildCloseBeforeTestIDSuffix(surface)}`,
    onSelect: () => {
      void onCloseTabsBefore(tab.tabId);
    },
  });
  entries.push({
    kind: "item",
    key: "close-after",
    label: buildCloseAfterLabel(surface, t),
    icon: "arrow-right-to-line",
    disabled: isLastTab,
    testID: `${menuTestIDBase}-${buildCloseAfterTestIDSuffix(surface)}`,
    onSelect: () => {
      void onCloseTabsAfter(tab.tabId);
    },
  });
  entries.push({
    kind: "item",
    key: "close-others",
    label: t.workspace.closeOtherTabsLabel,
    icon: "copy-x",
    disabled: isOnlyTab,
    testID: `${menuTestIDBase}-close-others`,
    onSelect: () => {
      void onCloseOtherTabs(tab.tabId);
    },
  });
  if (tab.target.kind === "agent") {
    const { agentId } = tab.target;
    entries.push({
      kind: "item",
      key: "reload-agent",
      label: t.workspace.reloadAgent,
      icon: "rotate-cw",
      tooltip: t.workspace.reloadAgentTooltip,
      testID: `${menuTestIDBase}-reload-agent`,
      onSelect: () => {
        void onReloadAgent(agentId);
      },
    });
  }
  entries.push({
    kind: "item",
    key: "close",
    label: t.common.close,
    icon: "x",
    testID: `${menuTestIDBase}-close`,
    onSelect: () => {
      void onCloseTab(tab.tabId);
    },
  });

  return entries;
}

export function buildWorkspaceDesktopTabActions(
  input: BuildWorkspaceDesktopTabActionsInput,
): WorkspaceDesktopTabActions {
  const contextMenuTestId = `workspace-tab-context-${input.tab.key}`;
  return {
    contextMenuTestId,
    menuEntries: buildWorkspaceTabMenuEntries({
      surface: "desktop",
      tab: input.tab,
      index: input.index,
      tabCount: input.tabCount,
      menuTestIDBase: contextMenuTestId,
      t: input.t,
      onCopyResumeCommand: input.onCopyResumeCommand,
      onCopyAgentId: input.onCopyAgentId,
      onReloadAgent: input.onReloadAgent,
      onCloseTab: input.onCloseTab,
      onCloseTabsBefore: input.onCloseTabsToLeft,
      onCloseTabsAfter: input.onCloseTabsToRight,
      onCloseOtherTabs: input.onCloseOtherTabs,
    }),
    closeButtonTestId: getCloseButtonTestId(input.tab),
  };
}
