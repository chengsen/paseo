import { Text, View } from "react-native";
import { FileText } from "lucide-react-native";
import invariant from "tiny-invariant";
import { FilePane } from "@/components/file-pane";
import { usePaneContext } from "@/panels/pane-context";
import type { PanelRegistration } from "@/panels/panel-registry";
import { useWorkspaceExecutionAuthority } from "@/stores/session-store-hooks";
import { useTranslation } from "@/i18n";

const CENTERED_PADDED_STYLE = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
} as const;

function useFilePanelDescriptor(target: { kind: "file"; path: string }) {
  const fileName = target.path.split("/").findLast(Boolean) ?? target.path;
  return {
    label: fileName,
    subtitle: target.path,
    titleState: "ready" as const,
    icon: FileText,
    statusBucket: null,
  };
}

function FilePanel() {
  const { t } = useTranslation();
  const { serverId, workspaceId, target } = usePaneContext();
  const workspaceAuthority = useWorkspaceExecutionAuthority(serverId, workspaceId);
  const workspaceDirectory = workspaceAuthority?.ok
    ? workspaceAuthority.authority.workspaceDirectory
    : null;
  invariant(target.kind === "file", "FilePanel requires file target");
  if (!workspaceDirectory) {
    return (
      <View style={CENTERED_PADDED_STYLE}>
        <Text>{t.workspace.workspaceExecutionDirectoryNotFound}</Text>
      </View>
    );
  }
  return <FilePane serverId={serverId} workspaceRoot={workspaceDirectory} filePath={target.path} />;
}

export const filePanelRegistration: PanelRegistration<"file"> = {
  kind: "file",
  component: FilePanel,
  useDescriptor: useFilePanelDescriptor,
};
