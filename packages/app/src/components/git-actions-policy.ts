import type { ReactElement } from "react";

import type { ActionStatus } from "@/components/ui/dropdown-menu";
import type { Translation } from "@/i18n/translations/en";

export type GitActionId =
  | "commit"
  | "pull"
  | "push"
  | "pull-and-push"
  | "pr"
  | "merge-branch"
  | "merge-from-base"
  | "archive-worktree";

export interface GitAction {
  id: GitActionId;
  label: string;
  pendingLabel: string;
  successLabel: string;
  disabled: boolean;
  status: ActionStatus;
  unavailableMessage?: string;
  icon?: ReactElement;
  handler: () => void;
}

export interface GitActions {
  primary: GitAction | null;
  secondary: GitAction[];
  menu: GitAction[];
}

interface GitActionRuntimeState {
  disabled: boolean;
  status: ActionStatus;
  icon?: ReactElement;
  handler: () => void;
}

export interface BuildGitActionsInput {
  isGit: boolean;
  githubFeaturesEnabled: boolean;
  hasPullRequest: boolean;
  pullRequestUrl: string | null;
  hasRemote: boolean;
  isPaseoOwnedWorktree: boolean;
  isOnBaseBranch: boolean;
  hasUncommittedChanges: boolean;
  baseRefAvailable: boolean;
  baseRefLabel: string;
  aheadCount: number;
  behindBaseCount: number;
  aheadOfOrigin: number;
  behindOfOrigin: number;
  shouldPromoteArchive: boolean;
  shipDefault: "merge" | "pr";
  runtime: Record<GitActionId, GitActionRuntimeState>;
  t: Translation;
}

const REMOTE_ACTION_IDS: GitActionId[] = ["pull", "push", "pull-and-push"];
const FEATURE_ACTION_IDS: GitActionId[] = ["merge-from-base", "merge-branch", "pr"];

export function buildGitActions(input: BuildGitActionsInput): GitActions {
  if (!input.isGit) {
    return { primary: null, secondary: [], menu: [] };
  }

  const allActions = new Map<GitActionId, GitAction>();

  allActions.set("commit", {
    id: "commit",
    label: input.t.gitActions.commit,
    pendingLabel: input.t.gitActions.committing,
    successLabel: input.t.gitActions.committed,
    disabled: input.runtime.commit.disabled,
    status: input.runtime.commit.status,
    icon: input.runtime.commit.icon,
    handler: input.runtime.commit.handler,
  });

  allActions.set("pull", {
    id: "pull",
    label: input.t.gitActions.pull,
    pendingLabel: input.t.gitActions.pulling,
    successLabel: input.t.gitActions.pulled,
    disabled: input.runtime.pull.disabled,
    status: input.runtime.pull.status,
    unavailableMessage: input.runtime.pull.disabled ? undefined : getPullUnavailableMessage(input),
    icon: input.runtime.pull.icon,
    handler: input.runtime.pull.handler,
  });

  allActions.set("push", {
    id: "push",
    label: input.t.gitActions.push,
    pendingLabel: input.t.gitActions.pushing,
    successLabel: input.t.gitActions.pushed,
    disabled: input.runtime.push.disabled,
    status: input.runtime.push.status,
    unavailableMessage: input.runtime.push.disabled ? undefined : getPushUnavailableMessage(input),
    icon: input.runtime.push.icon,
    handler: input.runtime.push.handler,
  });

  allActions.set("pull-and-push", {
    id: "pull-and-push",
    label: input.t.gitActions.pullAndPush,
    pendingLabel: input.t.gitActions.pullingAndPushing,
    successLabel: input.t.gitActions.pulledAndPushed,
    disabled: input.runtime["pull-and-push"].disabled,
    status: input.runtime["pull-and-push"].status,
    unavailableMessage: input.runtime["pull-and-push"].disabled
      ? undefined
      : getPullAndPushUnavailableMessage(input),
    icon: input.runtime["pull-and-push"].icon,
    handler: input.runtime["pull-and-push"].handler,
  });

  allActions.set("pr", buildPrAction(input));

  allActions.set("merge-branch", {
    id: "merge-branch",
    label: input.t.gitActions.mergeInto.replace("{baseRefLabel}", input.baseRefLabel),
    pendingLabel: input.t.gitActions.merging,
    successLabel: input.t.gitActions.merged,
    disabled: input.runtime["merge-branch"].disabled,
    status: input.runtime["merge-branch"].status,
    unavailableMessage: input.runtime["merge-branch"].disabled
      ? undefined
      : getMergeBranchUnavailableMessage(input),
    icon: input.runtime["merge-branch"].icon,
    handler: input.runtime["merge-branch"].handler,
  });

  allActions.set("merge-from-base", {
    id: "merge-from-base",
    label: input.t.gitActions.updateFrom.replace("{baseRefLabel}", input.baseRefLabel),
    pendingLabel: input.t.gitActions.updating,
    successLabel: input.t.gitActions.updated,
    disabled: input.runtime["merge-from-base"].disabled,
    status: input.runtime["merge-from-base"].status,
    unavailableMessage: input.runtime["merge-from-base"].disabled
      ? undefined
      : getMergeFromBaseUnavailableMessage(input),
    icon: input.runtime["merge-from-base"].icon,
    handler: input.runtime["merge-from-base"].handler,
  });

  allActions.set("archive-worktree", {
    id: "archive-worktree",
    label: input.t.gitActions.archiveWorktree,
    pendingLabel: input.t.gitActions.archiving,
    successLabel: input.t.gitActions.archived,
    disabled: input.runtime["archive-worktree"].disabled,
    status: input.runtime["archive-worktree"].status,
    unavailableMessage:
      input.runtime["archive-worktree"].disabled || input.isPaseoOwnedWorktree
        ? undefined
        : input.t.gitActions.archiveUnavailable,
    icon: input.runtime["archive-worktree"].icon,
    handler: input.runtime["archive-worktree"].handler,
  });

  const primaryActionId = getPrimaryActionId(input);
  const primary = primaryActionId ? (allActions.get(primaryActionId) ?? null) : null;

  const secondaryIds = [...REMOTE_ACTION_IDS];
  if (!input.isOnBaseBranch) {
    secondaryIds.push(...FEATURE_ACTION_IDS);
  }
  if (input.isPaseoOwnedWorktree) {
    secondaryIds.push("archive-worktree");
  }

  return {
    primary,
    secondary: secondaryIds.map((id) => allActions.get(id)!),
    menu: [],
  };
}

function getPrimaryActionId(input: BuildGitActionsInput): GitActionId | null {
  if (input.shouldPromoteArchive && input.isPaseoOwnedWorktree) {
    return "archive-worktree";
  }
  if (input.hasUncommittedChanges) {
    return "commit";
  }
  if (canPull(input)) {
    return "pull";
  }
  if (canPush(input)) {
    return "push";
  }
  if (!input.isOnBaseBranch && canMergeFromBase(input)) {
    return "merge-from-base";
  }
  if (input.githubFeaturesEnabled && input.hasPullRequest && input.pullRequestUrl) {
    return "pr";
  }
  if (!input.isOnBaseBranch && input.aheadCount > 0) {
    return input.shipDefault === "merge" ? "merge-branch" : "pr";
  }
  return null;
}

function buildPrAction(input: BuildGitActionsInput): GitAction {
  if (input.hasPullRequest && input.pullRequestUrl) {
    return {
      id: "pr",
      label: input.t.gitActions.viewPR,
      pendingLabel: input.t.gitActions.viewPR,
      successLabel: input.t.gitActions.viewPR,
      disabled: input.runtime.pr.disabled,
      status: input.runtime.pr.status,
      unavailableMessage:
        input.runtime.pr.disabled || input.githubFeaturesEnabled
          ? undefined
          : input.t.gitActions.viewPRUnavailable,
      icon: input.runtime.pr.icon,
      handler: input.runtime.pr.handler,
    };
  }

  return {
    id: "pr",
    label: input.t.gitActions.createPR,
    pendingLabel: input.t.gitActions.creatingPR,
    successLabel: input.t.gitActions.prCreated,
    disabled: input.runtime.pr.disabled,
    status: input.runtime.pr.status,
    unavailableMessage: input.runtime.pr.disabled
      ? undefined
      : getCreatePrUnavailableMessage(input),
    icon: input.runtime.pr.icon,
    handler: input.runtime.pr.handler,
  };
}

function canPull(input: BuildGitActionsInput): boolean {
  return input.hasRemote && !input.hasUncommittedChanges && input.behindOfOrigin > 0;
}

function canPush(input: BuildGitActionsInput): boolean {
  return input.hasRemote && input.aheadOfOrigin > 0 && input.behindOfOrigin === 0;
}

function canMergeFromBase(input: BuildGitActionsInput): boolean {
  return (
    !input.isOnBaseBranch &&
    input.baseRefAvailable &&
    !input.hasUncommittedChanges &&
    input.behindBaseCount > 0
  );
}

function getPullUnavailableMessage(input: BuildGitActionsInput): string | undefined {
  if (!input.hasRemote) {
    return input.t.gitActions.pullUnavailableNoRemote;
  }
  if (input.hasUncommittedChanges) {
    return input.t.gitActions.pullUnavailableLocalChanges;
  }
  if (input.behindOfOrigin === 0) {
    return input.t.gitActions.pullUnavailableUpToDate;
  }
  return undefined;
}

function getPushUnavailableMessage(input: BuildGitActionsInput): string | undefined {
  if (!input.hasRemote) {
    return input.t.gitActions.pushUnavailableNoRemote;
  }
  if (input.behindOfOrigin > 0) {
    return input.t.gitActions.pushUnavailableBehind;
  }
  if (input.aheadOfOrigin === 0) {
    return input.t.gitActions.pushUnavailableNothingToSend;
  }
  return undefined;
}

function getPullAndPushUnavailableMessage(input: BuildGitActionsInput): string | undefined {
  if (!input.hasRemote) {
    return input.t.gitActions.pullAndPushUnavailableNoRemote;
  }
  if (input.hasUncommittedChanges) {
    return input.t.gitActions.pullAndPushUnavailableLocalChanges;
  }
  if (input.behindOfOrigin === 0 && input.aheadOfOrigin === 0) {
    return input.t.gitActions.pullAndPushUnavailableInSync;
  }
  return undefined;
}

function getCreatePrUnavailableMessage(input: BuildGitActionsInput): string | undefined {
  if (!input.githubFeaturesEnabled) {
    return input.t.gitActions.createPRUnavailableNoGitHub;
  }
  if (input.aheadCount === 0) {
    return input.t.gitActions.createPRUnavailableNoCommits;
  }
  return undefined;
}

function getMergeBranchUnavailableMessage(input: BuildGitActionsInput): string | undefined {
  if (!input.baseRefAvailable) {
    return input.t.gitActions.mergeUnavailableNoBaseBranch;
  }
  if (input.hasUncommittedChanges) {
    return input.t.gitActions.mergeUnavailableLocalChanges;
  }
  if (input.aheadCount === 0) {
    return input.t.gitActions.mergeUnavailableNothingToMerge;
  }
  return undefined;
}

function getMergeFromBaseUnavailableMessage(input: BuildGitActionsInput): string | undefined {
  if (!input.baseRefAvailable) {
    return input.t.gitActions.updateUnavailableNoBaseBranch;
  }
  if (input.hasUncommittedChanges) {
    return input.t.gitActions.updateUnavailableLocalChanges;
  }
  if (input.behindBaseCount === 0) {
    return input.t.gitActions.updateUnavailableUpToDate.replace(
      "{baseRefLabel}",
      input.baseRefLabel,
    );
  }
  return undefined;
}
