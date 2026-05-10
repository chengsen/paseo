import { useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { getIsElectronRuntime } from "@/constants/layout";
import { AdaptiveModalSheet } from "@/components/adaptive-modal-sheet";
import { Shortcut } from "@/components/ui/shortcut";
import { useKeyboardShortcutsStore } from "@/stores/keyboard-shortcuts-store";
import { getShortcutOs } from "@/utils/shortcut-platform";
import { buildKeyboardShortcutHelpSections } from "@/keyboard/keyboard-shortcuts";
import { useTranslation } from "@/i18n";
import type { ShortcutSectionId } from "@/keyboard/keyboard-shortcuts";

const SNAP_POINTS: string[] = ["70%", "92%"];

export function KeyboardShortcutsDialog() {
  const { t } = useTranslation();
  const open = useKeyboardShortcutsStore((s) => s.shortcutsDialogOpen);
  const setOpen = useKeyboardShortcutsStore((s) => s.setShortcutsDialogOpen);

  const isMac = getShortcutOs() === "mac";
  const isDesktopApp = getIsElectronRuntime();
  const sectionTitles = useMemo<Record<ShortcutSectionId, string>>(
    () => ({
      navigation: t.shortcuts.sectionNavigation,
      "tabs-panes": t.shortcuts.sectionTabsPanes,
      projects: t.shortcuts.sectionProjects,
      panels: t.shortcuts.sectionPanels,
      "agent-input": t.shortcuts.sectionAgentInput,
    }),
    [t],
  );
  const sections = useMemo(
    () =>
      buildKeyboardShortcutHelpSections(
        { isMac, isDesktop: isDesktopApp },
        undefined,
        sectionTitles,
      ),
    [isDesktopApp, isMac, sectionTitles],
  );

  const rowLabelMap = useMemo<Record<string, string>>(
    () => ({
      "new-agent": t.shortcuts.openProject,
      "new-worktree": t.shortcuts.newWorktree,
      "archive-worktree": t.shortcuts.archiveWorktree,
      "workspace-tab-new": t.shortcuts.newTab,
      "workspace-tab-close-current": t.shortcuts.closeCurrentTab,
      "workspace-jump-index": t.shortcuts.jumpToWorkspace,
      "workspace-tab-jump-index": t.shortcuts.jumpToTab,
      "workspace-prev": t.shortcuts.previousWorkspace,
      "workspace-next": t.shortcuts.nextWorkspace,
      "workspace-tab-prev": t.shortcuts.previousTab,
      "workspace-tab-next": t.shortcuts.nextTab,
      "workspace-pane-split-right": t.shortcuts.splitPaneRight,
      "workspace-pane-split-down": t.shortcuts.splitPaneDown,
      "workspace-pane-focus-left": t.shortcuts.focusPaneLeft,
      "workspace-pane-focus-right": t.shortcuts.focusPaneRight,
      "workspace-pane-focus-up": t.shortcuts.focusPaneUp,
      "workspace-pane-focus-down": t.shortcuts.focusPaneDown,
      "workspace-pane-move-tab-left": t.shortcuts.moveTabLeft,
      "workspace-pane-move-tab-right": t.shortcuts.moveTabRight,
      "workspace-pane-move-tab-up": t.shortcuts.moveTabUp,
      "workspace-pane-move-tab-down": t.shortcuts.moveTabDown,
      "workspace-pane-close": t.shortcuts.closePane,
      "workspace-terminal-new": t.shortcuts.newTerminal,
      "toggle-command-center": t.shortcuts.toggleCommandCenter,
      "show-shortcuts": t.shortcuts.showKeyboardShortcuts,
      "toggle-left-sidebar": t.shortcuts.toggleLeftSidebar,
      "toggle-right-sidebar": t.shortcuts.toggleRightSidebar,
      "toggle-both-sidebars": t.shortcuts.toggleBothSidebars,
      "toggle-settings": t.shortcuts.toggleSettings,
      "toggle-focus": t.shortcuts.toggleFocusMode,
      "cycle-theme": t.shortcuts.cycleTheme,
      "focus-message-input": t.shortcuts.focusMessageInput,
      "voice-toggle": t.shortcuts.toggleVoiceMode,
      "dictation-toggle": t.shortcuts.startStopDictation,
      "agent-interrupt": t.shortcuts.interruptAgent,
      "message-input-send": t.shortcuts.sendMessage,
      "message-input-queue": t.shortcuts.queueMessage,
      "voice-mute-toggle": t.shortcuts.muteUnmuteVoice,
    }),
    [t],
  );

  const translatedSections = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        rows: section.rows.map((row) => ({
          ...row,
          label: rowLabelMap[row.id] ?? row.label,
        })),
      })),
    [sections, rowLabelMap],
  );

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  return (
    <AdaptiveModalSheet
      title={t.settings.shortcuts}
      visible={open}
      onClose={handleClose}
      testID="keyboard-shortcuts-dialog"
      snapPoints={SNAP_POINTS}
    >
      <View testID="keyboard-shortcuts-dialog-content" style={styles.content}>
        {translatedSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.rows}>
              {section.rows.map((row) => (
                <View key={row.id} style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    {row.note ? <Text style={styles.rowNote}>{row.note}</Text> : null}
                  </View>
                  <Shortcut keys={row.keys} style={styles.rowShortcut} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </AdaptiveModalSheet>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing[4],
  },
  section: {
    gap: theme.spacing[2],
  },
  sectionTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.foregroundMuted,
  },
  rows: {
    borderWidth: theme.borderWidth[1],
    borderColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: theme.borderWidth[1],
    borderBottomColor: theme.colors.surface2,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.foreground,
  },
  rowNote: {
    marginTop: 2,
    fontSize: theme.fontSize.xs,
    color: theme.colors.foregroundMuted,
  },
  rowShortcut: {
    alignSelf: "flex-start",
  },
}));
