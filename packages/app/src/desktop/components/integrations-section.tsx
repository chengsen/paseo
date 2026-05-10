import { useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { ArrowUpRight, Terminal, Blocks, Check } from "lucide-react-native";
import { settingsStyles } from "@/styles/settings";
import { SettingsSection } from "@/screens/settings/settings-section";
import { Button } from "@/components/ui/button";
import { openExternalUrl } from "@/utils/open-external-url";
import { shouldUseDesktopDaemon } from "@/desktop/daemon/desktop-daemon";
import { useCliInstall, useSkillsInstall } from "@/desktop/hooks/use-install-status";
import { useTranslation } from "@/i18n";

const CLI_DOCS_URL = "https://paseo.sh/docs/cli";
const SKILLS_DOCS_URL = "https://paseo.sh/docs/skills";
const ROW_WITH_BORDER_STYLE = [settingsStyles.row, settingsStyles.rowBorder];

export function IntegrationsSection() {
  const { t } = useTranslation();
  const { theme } = useUnistyles();
  const showSection = shouldUseDesktopDaemon();
  const {
    status: cliStatus,
    isInstalling: isInstallingCli,
    install: installCli,
    refresh: refreshCliStatus,
  } = useCliInstall();
  const {
    status: skillsStatus,
    isInstalling: isInstallingSkills,
    install: installSkills,
    refresh: refreshSkillsStatus,
  } = useSkillsInstall();

  useFocusEffect(
    useCallback(() => {
      if (!showSection) return undefined;
      refreshCliStatus();
      refreshSkillsStatus();
      return undefined;
    }, [refreshCliStatus, refreshSkillsStatus, showSection]),
  );

  const handleInstallCli = useCallback(() => {
    if (isInstallingCli) return;
    installCli();
  }, [installCli, isInstallingCli]);

  const handleInstallSkills = useCallback(() => {
    if (isInstallingSkills) return;
    installSkills();
  }, [installSkills, isInstallingSkills]);

  const handleOpenCliDocs = useCallback(() => {
    void openExternalUrl(CLI_DOCS_URL);
  }, []);

  const handleOpenSkillsDocs = useCallback(() => {
    void openExternalUrl(SKILLS_DOCS_URL);
  }, []);

  const arrowIcon = useMemo(
    () => <ArrowUpRight size={theme.iconSize.sm} color={theme.colors.foregroundMuted} />,
    [theme.iconSize.sm, theme.colors.foregroundMuted],
  );

  const trailing = useMemo(
    () => (
      <View style={styles.headerLinks}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={arrowIcon}
          textStyle={settingsStyles.sectionHeaderLinkText}
          style={settingsStyles.sectionHeaderLink}
          onPress={handleOpenCliDocs}
          accessibilityLabel={t.integrations.cliDocs}
        >
          {t.integrations.cliDocs}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={arrowIcon}
          textStyle={settingsStyles.sectionHeaderLinkText}
          style={settingsStyles.sectionHeaderLink}
          onPress={handleOpenSkillsDocs}
          accessibilityLabel={t.integrations.skillsDocs}
        >
          {t.integrations.skillsDocs}
        </Button>
      </View>
    ),
    [arrowIcon, handleOpenCliDocs, handleOpenSkillsDocs, t],
  );

  if (!showSection) {
    return null;
  }

  return (
    <SettingsSection title={t.integrations.title} trailing={trailing}>
      <View style={settingsStyles.card}>
        <View style={settingsStyles.row}>
          <View style={settingsStyles.rowContent}>
            <View style={styles.rowTitleRow}>
              <Terminal size={theme.iconSize.md} color={theme.colors.foreground} />
              <Text style={settingsStyles.rowTitle}>{t.integrations.commandLine}</Text>
            </View>
            <Text style={settingsStyles.rowHint}>{t.integrations.commandLineHint}</Text>
          </View>
          {cliStatus?.installed ? (
            <View style={styles.installedLabel}>
              <Check size={14} color={theme.colors.foregroundMuted} />
              <Text style={styles.mutedText}>{t.integrations.installed}</Text>
            </View>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onPress={handleInstallCli}
              disabled={isInstallingCli}
            >
              {isInstallingCli ? t.integrations.installing : t.common.add}
            </Button>
          )}
        </View>
        <View style={ROW_WITH_BORDER_STYLE}>
          <View style={settingsStyles.rowContent}>
            <View style={styles.rowTitleRow}>
              <Blocks size={theme.iconSize.md} color={theme.colors.foreground} />
              <Text style={settingsStyles.rowTitle}>{t.integrations.orchestrationSkills}</Text>
            </View>
            <Text style={settingsStyles.rowHint}>{t.integrations.orchestrationSkillsHint}</Text>
          </View>
          {skillsStatus?.installed ? (
            <View style={styles.installedLabel}>
              <Check size={14} color={theme.colors.foregroundMuted} />
              <Text style={styles.mutedText}>{t.integrations.installed}</Text>
            </View>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onPress={handleInstallSkills}
              disabled={isInstallingSkills}
            >
              {isInstallingSkills ? t.integrations.installing : t.common.add}
            </Button>
          )}
        </View>
      </View>
    </SettingsSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  headerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[0],
  },
  rowTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  installedLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mutedText: {
    color: theme.colors.foregroundMuted,
    fontSize: theme.fontSize.sm,
  },
}));
