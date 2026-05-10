import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { ChevronRight, Globe, Monitor, Pencil, RotateCw, Trash2 } from "lucide-react-native";
import type { HostConnection, HostProfile } from "@/types/host-connection";
import {
  getHostRuntimeStore,
  isHostRuntimeConnected,
  useHostRuntimeClient,
  useHostRuntimeIsConnected,
  useHostRuntimeSnapshot,
  useHostMutations,
  useHosts,
} from "@/runtime/host-runtime";
import { useSessionStore } from "@/stores/session-store";
import { formatConnectionStatus, getConnectionStatusTone } from "@/utils/daemons";
import { confirmDialog } from "@/utils/confirm-dialog";
import { settingsStyles } from "@/styles/settings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdaptiveModalSheet } from "@/components/adaptive-modal-sheet";
import { useDaemonConfig } from "@/hooks/use-daemon-config";
import { useIsLocalDaemon } from "@/hooks/use-is-local-daemon";
import { SettingsSection } from "@/screens/settings/settings-section";
import { useTranslation } from "@/i18n";
import type { Translation } from "@/i18n/translations/en";
import { ProvidersSection } from "@/screens/settings/providers-section";
import { PairDeviceModal } from "@/desktop/components/pair-device-modal";
import { LocalDaemonSection } from "@/desktop/components/desktop-updates-section";

function formatHostConnectionLabel(connection: HostConnection, t: Translation): string {
  if (connection.type === "relay") {
    return `${t.host.relay} (${connection.relayEndpoint})`;
  }
  if (connection.type === "directSocket" || connection.type === "directPipe") {
    return `${t.host.local} (${connection.path})`;
  }
  return `${t.host.tcp} (${connection.endpoint})`;
}

function formatActiveConnectionBadge(
  activeConnection: { type: HostConnection["type"]; display: string } | null,
  theme: ReturnType<typeof useUnistyles>["theme"],
  t: Translation,
): { icon: React.ReactNode; text: string } | null {
  if (!activeConnection) return null;
  if (activeConnection.type === "relay") {
    return {
      icon: <Globe size={theme.iconSize.sm} color={theme.colors.foregroundMuted} />,
      text: t.host.relay,
    };
  }
  if (activeConnection.type === "directSocket" || activeConnection.type === "directPipe") {
    return {
      icon: <Monitor size={theme.iconSize.sm} color={theme.colors.foregroundMuted} />,
      text: t.host.local,
    };
  }
  return {
    icon: <Monitor size={theme.iconSize.sm} color={theme.colors.foregroundMuted} />,
    text: activeConnection.display,
  };
}

function formatDaemonVersionBadge(version: string | null): string | null {
  const trimmed = version?.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("v") ? trimmed : `v${trimmed}`;
}

export interface HostPageProps {
  serverId: string;
  onHostRemoved?: () => void;
}

export function HostPage({ serverId, onHostRemoved }: HostPageProps) {
  const { t } = useTranslation();
  const daemons = useHosts();
  const host = daemons.find((entry) => entry.serverId === serverId) ?? null;
  const { theme } = useUnistyles();
  const snapshot = useHostRuntimeSnapshot(serverId);
  const isLocalDaemon = useIsLocalDaemon(serverId);

  const daemonVersion = useSessionStore(
    (state) => state.sessions[serverId]?.serverInfo?.version ?? null,
  );

  const connectionStatus = snapshot?.connectionStatus ?? "connecting";
  const activeConnection = snapshot?.activeConnection ?? null;
  const lastError = snapshot?.lastError ?? null;
  const statusLabel = formatConnectionStatus(connectionStatus);
  const statusTone = getConnectionStatusTone(connectionStatus);
  let statusColor: string;
  if (statusTone === "success") {
    statusColor = theme.colors.palette.green[400];
  } else if (statusTone === "warning") {
    statusColor = theme.colors.palette.amber[500];
  } else if (statusTone === "error") {
    statusColor = theme.colors.destructive;
  } else {
    statusColor = theme.colors.foregroundMuted;
  }
  let statusPillBg: string;
  if (statusTone === "success") {
    statusPillBg = "rgba(74, 222, 128, 0.1)";
  } else if (statusTone === "warning") {
    statusPillBg = "rgba(245, 158, 11, 0.1)";
  } else if (statusTone === "error") {
    statusPillBg = "rgba(248, 113, 113, 0.1)";
  } else {
    statusPillBg = "rgba(161, 161, 170, 0.1)";
  }
  const connectionBadge = formatActiveConnectionBadge(activeConnection, theme, t);
  const versionBadgeText = formatDaemonVersionBadge(daemonVersion);
  const connectionError =
    typeof lastError === "string" && lastError.trim().length > 0 ? lastError.trim() : null;

  const statusPillStyle = useMemo(
    () => [styles.statusPill, { backgroundColor: statusPillBg }],
    [statusPillBg],
  );
  const statusDotStyle = useMemo(
    () => [styles.statusDot, { backgroundColor: statusColor }],
    [statusColor],
  );
  const statusTextStyle = useMemo(() => [styles.statusText, { color: statusColor }], [statusColor]);

  if (!host) {
    return (
      <View testID={`settings-host-page-${serverId}`}>
        <View style={EMPTY_CARD_STYLE}>
          <Text style={styles.emptyText}>{t.host.hostNotFound}</Text>
        </View>
      </View>
    );
  }

  return (
    <View testID={`settings-host-page-${serverId}`}>
      <View style={styles.identityBadges} testID="host-page-identity">
        <View style={statusPillStyle}>
          <View style={statusDotStyle} />
          <Text style={statusTextStyle}>{statusLabel}</Text>
        </View>
        {connectionBadge ? (
          <View style={styles.badgePill}>
            {connectionBadge.icon}
            <Text style={styles.badgeText} numberOfLines={1}>
              {connectionBadge.text}
            </Text>
          </View>
        ) : null}
        {versionBadgeText ? (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {versionBadgeText}
            </Text>
          </View>
        ) : null}
      </View>
      {connectionError ? <Text style={styles.errorText}>{connectionError}</Text> : null}

      <ConnectionsSection host={host} t={t} />

      <DaemonSection host={host} isLocalDaemon={isLocalDaemon} t={t} />

      <ProvidersSection serverId={serverId} />

      <RemoveHostSection host={host} onRemoved={onHostRemoved} t={t} />
    </View>
  );
}

export function HostRenameButton({ host }: { host: HostProfile }) {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const { renameHost } = useHostMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(host.label ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setDraftLabel(host.label ?? "");
  }, [host.serverId, host.label]);

  useEffect(() => {
    if (isEditing) {
      const timeout = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    const nextLabel = draftLabel.trim();
    if (!nextLabel) {
      Alert.alert(t.host.labelRequired, t.host.labelRequiredHint);
      return;
    }
    if (isSaving) return;
    if (nextLabel === host.label.trim()) {
      setIsEditing(false);
      return;
    }
    try {
      setIsSaving(true);
      await renameHost(host.serverId, nextLabel);
      setIsEditing(false);
    } catch (error) {
      console.error("[HostPage] Failed to rename host", error);
      Alert.alert(t.common.error, t.host.unableToSaveHost);
    } finally {
      setIsSaving(false);
    }
  }, [draftLabel, host.label, host.serverId, isSaving, renameHost, t]);

  const handleCancel = useCallback(() => {
    if (isSaving) return;
    setDraftLabel(host.label ?? "");
    setIsEditing(false);
  }, [host.label, isSaving]);

  const handleStartEdit = useCallback(() => {
    setDraftLabel(host.label ?? "");
    setIsEditing(true);
  }, [host.label]);

  const handleSavePress = useCallback(() => {
    void handleSave();
  }, [handleSave]);

  return (
    <>
      <Pressable
        onPress={handleStartEdit}
        hitSlop={8}
        style={styles.identityEditButton}
        accessibilityRole="button"
        accessibilityLabel={t.host.editLabel}
        testID="host-page-label-edit-button"
      >
        <Pencil size={theme.iconSize.sm} color={theme.colors.foregroundMuted} />
      </Pressable>

      <AdaptiveModalSheet
        visible={isEditing}
        onClose={handleCancel}
        title={t.host.renameHost}
        testID="host-page-rename-modal"
      >
        <View style={styles.renameBody}>
          <TextInput
            ref={inputRef}
            value={draftLabel}
            onChangeText={setDraftLabel}
            placeholder={t.host.hostLabel}
            placeholderTextColor={theme.colors.foregroundMuted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSaving}
            onSubmitEditing={handleSavePress}
            style={styles.renameInput}
            testID="host-page-label-input"
          />
          <View style={styles.renameActions}>
            <Button
              variant="secondary"
              size="sm"
              style={FLEX_1_STYLE}
              onPress={handleCancel}
              disabled={isSaving}
            >
              {t.common.cancel}
            </Button>
            <Button
              size="sm"
              style={FLEX_1_STYLE}
              onPress={handleSavePress}
              disabled={isSaving}
              testID="host-page-label-save"
            >
              {isSaving ? t.common.saving : t.common.save}
            </Button>
          </View>
        </View>
      </AdaptiveModalSheet>
    </>
  );
}

function ConnectionsSection({ host, t }: { host: HostProfile; t: Translation }) {
  const { removeConnection } = useHostMutations();
  const snapshot = useHostRuntimeSnapshot(host.serverId);
  const probeByConnectionId = snapshot?.probeByConnectionId ?? new Map();
  const [pendingRemoveConnection, setPendingRemoveConnection] = useState<{
    connectionId: string;
    title: string;
  } | null>(null);
  const [isRemovingConnection, setIsRemovingConnection] = useState(false);

  const handleRequestRemove = useCallback(
    (connection: HostConnection) => {
      setPendingRemoveConnection({
        connectionId: connection.id,
        title: formatHostConnectionLabel(connection, t),
      });
    },
    [t],
  );

  const handleCloseConfirm = useCallback(() => {
    if (isRemovingConnection) return;
    setPendingRemoveConnection(null);
  }, [isRemovingConnection]);

  const handleCancelConfirm = useCallback(() => {
    setPendingRemoveConnection(null);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (!pendingRemoveConnection) return;
    const { connectionId } = pendingRemoveConnection;
    setIsRemovingConnection(true);
    void removeConnection(host.serverId, connectionId)
      .then(() => setPendingRemoveConnection(null))
      .catch((error) => {
        console.error("[HostPage] Failed to remove connection", error);
        Alert.alert(t.common.error, t.host.unableToRemoveConnection);
      })
      .finally(() => setIsRemovingConnection(false));
  }, [pendingRemoveConnection, removeConnection, host.serverId, t]);

  return (
    <SettingsSection title={t.host.connections}>
      <View style={settingsStyles.card} testID="host-page-connections-card">
        {host.connections.map((conn, index) => {
          const probe = probeByConnectionId.get(conn.id);
          return (
            <ConnectionRow
              key={conn.id}
              connection={conn}
              showBorder={index > 0}
              latencyMs={probe?.status === "available" ? probe.latencyMs : undefined}
              latencyLoading={!probe || probe.status === "pending"}
              latencyError={probe?.status === "unavailable"}
              onRemove={handleRequestRemove}
              t={t}
            />
          );
        })}
      </View>

      {pendingRemoveConnection ? (
        <AdaptiveModalSheet
          title={t.host.removeConnection}
          visible
          onClose={handleCloseConfirm}
          testID="remove-connection-confirm-modal"
        >
          <Text style={styles.confirmText}>
            {t.host.removeConnectionConfirm.replace("{title}", pendingRemoveConnection.title)}
          </Text>
          <View style={styles.confirmActions}>
            <Button
              variant="secondary"
              size="sm"
              style={FLEX_1_STYLE}
              onPress={handleCancelConfirm}
              disabled={isRemovingConnection}
            >
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              style={FLEX_1_STYLE}
              onPress={handleConfirmRemove}
              disabled={isRemovingConnection}
              testID="remove-connection-confirm"
            >
              {t.common.remove}
            </Button>
          </View>
        </AdaptiveModalSheet>
      ) : null}
    </SettingsSection>
  );
}

function ConnectionRow({
  connection,
  showBorder,
  latencyMs,
  latencyLoading,
  latencyError,
  onRemove,
  t,
}: {
  connection: HostConnection;
  showBorder: boolean;
  latencyMs: number | null | undefined;
  latencyLoading: boolean;
  latencyError: boolean;
  onRemove: (connection: HostConnection) => void;
  t: Translation;
}) {
  const { theme } = useUnistyles();
  const title = formatHostConnectionLabel(connection, t);

  const latencyText = (() => {
    if (latencyLoading) return "...";
    if (latencyError) return t.host.timeout;
    if (latencyMs != null) return `${latencyMs}ms`;
    return "\u2014";
  })();
  const latencyColor = latencyError ? theme.colors.palette.red[300] : theme.colors.foregroundMuted;

  const handlePressRemove = useCallback(() => {
    onRemove(connection);
  }, [onRemove, connection]);

  const rowStyle = useMemo(
    () => [settingsStyles.row, showBorder && settingsStyles.rowBorder],
    [showBorder],
  );
  const latencyTextStyle = useMemo(
    () => [styles.connectionLatency, { color: latencyColor }],
    [latencyColor],
  );
  const destructiveTextStyle = useMemo(
    () => ({ color: theme.colors.destructive }),
    [theme.colors.destructive],
  );

  return (
    <View style={rowStyle}>
      <View style={settingsStyles.rowContent}>
        <Text style={settingsStyles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={latencyTextStyle}>{latencyText}</Text>
      <Button
        variant="ghost"
        size="sm"
        textStyle={destructiveTextStyle}
        onPress={handlePressRemove}
      >
        {t.common.remove}
      </Button>
    </View>
  );
}

function DaemonSection({
  host,
  isLocalDaemon,
  t,
}: {
  host: HostProfile;
  isLocalDaemon: boolean;
  t: Translation;
}) {
  return (
    <>
      <SettingsSection title={t.host.operations}>
        <RestartDaemonCard host={host} t={t} />
        <InjectPaseoToolsCard serverId={host.serverId} t={t} />
      </SettingsSection>
      {isLocalDaemon ? (
        <SettingsSection title={t.host.pairDevices}>
          <PairDeviceRow t={t} />
        </SettingsSection>
      ) : null}
      {isLocalDaemon ? <LocalDaemonSection /> : null}
    </>
  );
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

function RestartDaemonCard({ host, t }: { host: HostProfile; t: Translation }) {
  const { theme } = useUnistyles();
  const daemonClient = useHostRuntimeClient(host.serverId);
  const isConnected = useHostRuntimeIsConnected(host.serverId);
  const runtime = getHostRuntimeStore();
  const [isRestarting, setIsRestarting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isHostConnected = useCallback(
    () => isHostRuntimeConnected(runtime.getSnapshot(host.serverId)),
    [host.serverId, runtime],
  );

  const waitForCondition = useCallback(
    async (predicate: () => boolean, timeoutMs: number, intervalMs = 250) => {
      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        if (!isMountedRef.current) return false;
        if (predicate()) return true;
        await delay(intervalMs);
      }
      return predicate();
    },
    [],
  );

  const waitForDaemonRestart = useCallback(async () => {
    const disconnectTimeoutMs = 7000;
    const reconnectTimeoutMs = 30000;
    if (isHostConnected()) {
      await waitForCondition(() => !isHostConnected(), disconnectTimeoutMs);
    }
    const reconnected = await waitForCondition(() => isHostConnected(), reconnectTimeoutMs);
    if (isMountedRef.current) {
      setIsRestarting(false);
      if (!reconnected) {
        Alert.alert(
          t.host.unableToReconnect,
          t.host.didNotComeBackOnline.replace("{label}", host.label),
        );
      }
    }
  }, [host.label, isHostConnected, t, waitForCondition]);

  const handleRestart = useCallback(() => {
    if (!daemonClient) {
      Alert.alert(t.host.unavailable, t.host.unavailableHint);
      return;
    }
    if (!isHostConnected()) {
      Alert.alert(t.host.hostOffline, t.host.offlineRestartHint);
      return;
    }

    void confirmDialog({
      title: t.host.restartConfirmTitle.replace("{label}", host.label),
      message: t.host.restartConfirmMessage,
      confirmLabel: t.host.restartDaemon,
      cancelLabel: t.common.cancel,
      destructive: true,
    })
      .then((confirmed) => {
        if (!confirmed) return;
        setIsRestarting(true);
        void daemonClient
          .restartServer(`settings_daemon_restart_${host.serverId}`)
          .catch((error) => {
            console.error(`[HostPage] Failed to restart daemon ${host.label}`, error);
            if (!isMountedRef.current) return;
            setIsRestarting(false);
            Alert.alert(t.common.error, t.host.restartFailed);
          });
        void waitForDaemonRestart();
        return;
      })
      .catch((error) => {
        console.error(`[HostPage] Failed to open restart confirmation for ${host.label}`, error);
        Alert.alert(t.common.error, t.host.unableToOpenRestartDialog);
      });
  }, [daemonClient, host.label, host.serverId, isHostConnected, t, waitForDaemonRestart]);

  const restartIcon = useMemo(
    () => <RotateCw size={theme.iconSize.sm} color={theme.colors.foreground} />,
    [theme.iconSize.sm, theme.colors.foreground],
  );

  return (
    <View style={settingsStyles.card} testID="host-page-restart-card">
      <View style={settingsStyles.row}>
        <View style={settingsStyles.rowContent}>
          <Text style={settingsStyles.rowTitle}>{t.host.restartDaemon}</Text>
          <Text style={settingsStyles.rowHint}>{t.host.restartDaemonHint}</Text>
        </View>
        <Button
          variant="outline"
          size="sm"
          leftIcon={restartIcon}
          onPress={handleRestart}
          disabled={isRestarting || !daemonClient || !isConnected}
          testID="host-page-restart-button"
        >
          {isRestarting ? t.host.restarting : t.host.restartDaemon}
        </Button>
      </View>
    </View>
  );
}

function InjectPaseoToolsCard({ serverId, t }: { serverId: string; t: Translation }) {
  const isConnected = useHostRuntimeIsConnected(serverId);
  const { config, patchConfig } = useDaemonConfig(serverId);

  const handleValueChange = useCallback(
    (next: boolean) => {
      void patchConfig({
        mcp: {
          injectIntoAgents: next,
        },
      });
    },
    [patchConfig],
  );

  if (!isConnected) return null;

  return (
    <View style={settingsStyles.card} testID="host-page-inject-mcp-card">
      <View style={settingsStyles.row}>
        <View style={settingsStyles.rowContent}>
          <Text style={settingsStyles.rowTitle}>{t.host.injectPaseoTools}</Text>
          <Text style={settingsStyles.rowHint}>{t.host.injectPaseoToolsHint}</Text>
        </View>
        <Switch
          value={config?.mcp.injectIntoAgents !== false}
          onValueChange={handleValueChange}
          accessibilityLabel={t.host.injectPaseoTools}
        />
      </View>
    </View>
  );
}

function PairDeviceRow({ t }: { t: Translation }) {
  const { theme } = useUnistyles();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = useCallback(() => setIsModalOpen(true), []);
  const handleClose = useCallback(() => setIsModalOpen(false), []);

  return (
    <View style={settingsStyles.card}>
      <Pressable
        style={settingsStyles.row}
        onPress={handleOpen}
        accessibilityRole="button"
        testID="host-page-pair-device-row"
      >
        <View style={settingsStyles.rowContent}>
          <Text style={settingsStyles.rowTitle}>{t.host.pairADevice}</Text>
          <Text style={settingsStyles.rowHint}>{t.host.pairDeviceHint}</Text>
        </View>
        <ChevronRight size={theme.iconSize.sm} color={theme.colors.foregroundMuted} />
      </Pressable>

      <PairDeviceModal
        visible={isModalOpen}
        onClose={handleClose}
        testID="host-page-pair-device-card"
      />
    </View>
  );
}

function RemoveHostSection({
  host,
  onRemoved,
  t,
}: {
  host: HostProfile;
  onRemoved?: () => void;
  t: Translation;
}) {
  const { theme } = useUnistyles();
  const { removeHost } = useHostMutations();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const destructiveTextStyle = useMemo(
    () => ({ color: theme.colors.destructive }),
    [theme.colors.destructive],
  );

  const handleOpenConfirm = useCallback(() => setIsConfirming(true), []);
  const handleCloseConfirm = useCallback(() => {
    if (isRemoving) return;
    setIsConfirming(false);
  }, [isRemoving]);
  const handleCancel = useCallback(() => setIsConfirming(false), []);
  const handleConfirmRemove = useCallback(() => {
    setIsRemoving(true);
    void removeHost(host.serverId)
      .then(() => {
        setIsConfirming(false);
        onRemoved?.();
        return;
      })
      .catch((error) => {
        console.error("[HostPage] Failed to remove host", error);
        Alert.alert(t.common.error, t.host.unableToRemoveHost);
      })
      .finally(() => setIsRemoving(false));
  }, [host.serverId, onRemoved, removeHost, t]);

  const removeIcon = useMemo(
    () => <Trash2 size={theme.iconSize.sm} color={theme.colors.destructive} />,
    [theme.iconSize.sm, theme.colors.destructive],
  );

  return (
    <SettingsSection title={t.host.dangerZone} testID="host-page-remove-host-card">
      <View style={settingsStyles.card}>
        <View style={settingsStyles.row}>
          <View style={settingsStyles.rowContent}>
            <Text style={settingsStyles.rowTitle}>{t.host.removeHostTitle}</Text>
            <Text style={settingsStyles.rowHint}>{t.host.removeHostHint}</Text>
          </View>
          <Button
            variant="outline"
            size="sm"
            leftIcon={removeIcon}
            textStyle={destructiveTextStyle}
            onPress={handleOpenConfirm}
            testID="host-page-remove-host-button"
          >
            {t.common.remove}
          </Button>
        </View>
      </View>

      {isConfirming ? (
        <AdaptiveModalSheet
          title={t.host.removeHostTitle}
          visible
          onClose={handleCloseConfirm}
          testID="remove-host-confirm-modal"
        >
          <Text style={styles.confirmText}>
            {t.host.removeHostConfirm.replace("{label}", host.label)}
          </Text>
          <View style={styles.confirmActions}>
            <Button
              variant="secondary"
              size="sm"
              style={FLEX_1_STYLE}
              onPress={handleCancel}
              disabled={isRemoving}
            >
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              style={FLEX_1_STYLE}
              onPress={handleConfirmRemove}
              disabled={isRemoving}
              testID="remove-host-confirm"
            >
              {t.common.remove}
            </Button>
          </View>
        </AdaptiveModalSheet>
      ) : null}
    </SettingsSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  identityEditButton: {
    padding: theme.spacing[1],
    borderRadius: theme.borderRadius.md,
  },
  identityBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
    flexWrap: "wrap",
    marginBottom: theme.spacing[6],
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.normal,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface3,
    maxWidth: 200,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.foregroundMuted,
    flexShrink: 1,
  },
  errorText: {
    color: theme.colors.palette.red[300],
    fontSize: theme.fontSize.xs,
    marginBottom: theme.spacing[2],
  },
  connectionLatency: {
    fontSize: theme.fontSize.sm,
    marginRight: theme.spacing[2],
  },
  confirmText: {
    color: theme.colors.foregroundMuted,
    fontSize: theme.fontSize.sm,
  },
  confirmActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginTop: theme.spacing[4],
  },
  emptyCard: {
    padding: theme.spacing[4],
    alignItems: "center",
  },
  emptyText: {
    color: theme.colors.foregroundMuted,
    fontSize: theme.fontSize.sm,
  },
  renameBody: {
    gap: theme.spacing[3],
    paddingBottom: theme.spacing[2],
  },
  renameInput: {
    backgroundColor: theme.colors.surface0,
    color: theme.colors.foreground,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.fontSize.base,
  },
  renameActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
}));

const FLEX_1_STYLE = { flex: 1 };
const EMPTY_CARD_STYLE = [settingsStyles.card, styles.emptyCard];
