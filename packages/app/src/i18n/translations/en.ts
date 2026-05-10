export interface Translation {
  combobox: {
    searchPlaceholder: string;
    noOptionsMatch: string;
    use: string;
  };
  autocomplete: {
    noResultsFound: string;
    error: string;
  };
  fileExplorer: {
    sortName: string;
    sortModified: string;
    sortSize: string;
    refreshingFiles: string;
    refreshFiles: string;
  };
  settings: {
    general: string;
    shortcuts: string;
    integrations: string;
    permissions: string;
    diagnostics: string;
    about: string;
    projects: string;
    back: string;
    addHost: string;
    local: string;
    loading: string;
  };
  theme: {
    light: string;
    dark: string;
    auto: string;
    zinc: string;
    midnight: string;
    claude: string;
    ghostty: string;
  };
  sendBehavior: {
    interrupt: string;
    queue: string;
  };
  serviceUrlBehavior: {
    ask: string;
    "in-app": string;
    external: string;
  };
  generalSettings: {
    title: string;
    theme: string;
    defaultSend: string;
    defaultSendHint: string;
    serviceUrls: string;
    serviceUrlsHint: string;
    language: string;
  };
  language: {
    en: string;
    zhCN: string;
  };
  aboutSettings: {
    title: string;
    version: string;
    releaseChannel: string;
    releaseChannelStable: string;
    releaseChannelBeta: string;
    releaseChannelHint: string;
    appUpdates: string;
    check: string;
    checking: string;
    update: string;
    installing: string;
    updateTo: string;
    readyToInstall: string;
    installDesktopUpdate: string;
    installDesktopUpdateMessage: string;
    cancel: string;
    error: string;
    unableToOpenDialog: string;
    checkingForAppUpdates: string;
    installingAppUpdate: string;
    appIsUpToDate: string;
    updateReadySoon: string;
    updateReadyToInstall: string;
    updateInstalledRestartRequired: string;
    failedToUpdateApp: string;
    updateStatusNotChecked: string;
  };
  diagnosticsSettings: {
    title: string;
    testAudio: string;
    playTest: string;
    playing: string;
    playbackFailed: string;
  };
  common: {
    cancel: string;
    save: string;
    saving: string;
    delete: string;
    remove: string;
    loading: string;
    error: string;
    retry: string;
    back: string;
    close: string;
    confirm: string;
    edit: string;
    create: string;
    copy: string;
    paste: string;
    search: string;
    done: string;
    ok: string;
    unknown: string;
    continue: string;
    next: string;
    previous: string;
    add: string;
    update: string;
    rename: string;
    clear: string;
    reset: string;
    submit: string;
    send: string;
    disconnect: string;
    connect: string;
    open: string;
    stop: string;
    start: string;
    show: string;
    hide: string;
    expand: string;
    collapse: string;
    more: string;
    all: string;
    none: string;
    select: string;
    deselect: string;
    enabled: string;
    disabled: string;
    active: string;
    inactive: string;
    copied: string;
    leaveAComment: string;
    enterUrl: string;
    other: string;
    archive: string;
    restore: string;
    later: string;
    stashAndSwitch: string;
    externalBrowser: string;
    pauseAndStop: string;
    github: string;
  };
  status: {
    running: string;
    idle: string;
    starting: string;
    online: string;
    offline: string;
    busy: string;
    stopped: string;
    ready: string;
    waiting: string;
    connected: string;
    disconnected: string;
    pending: string;
    completed: string;
    failed: string;
    success: string;
    warning: string;
    info: string;
  };
  emptyState: {
    noProjects: string;
    noSessions: string;
    noAgents: string;
    noHosts: string;
    noWorkspaces: string;
    noScripts: string;
    noResults: string;
  };
  splash: {
    somethingWentWrong: string;
    localServerFailed: string;
    loadingDaemonLogs: string;
    noDaemonLogs: string;
    copyLogs: string;
    openGithubIssue: string;
    docs: string;
    retry: string;
    unableToLoadLogs: string;
  };
  pairScan: {
    scanQR: string;
    notAvailableOnWeb: string;
    notAvailableOnWebHint: string;
    backToSettings: string;
    cameraPermission: string;
    cameraPermissionHint: string;
    grantPermission: string;
    pairing: string;
    unableToPair: string;
    pastePairingLinkHint: string;
    pairingLinkLabel: string;
    pastePairingLinkPlaceholder: string;
    linkMustIncludeOffer: string;
    invalidPairingLink: string;
    pairingFailed: string;
    pair: string;
  };
  projects: {
    noProjects: string;
    couldntLoadProjects: string;
    editProject: string;
    whatShallWeBuild: string;
    addProjectHint: string;
    addProject: string;
    pairDevice: string;
  };
  welcome: Record<string, string>;
  sessions: Record<string, string>;
  host: {
    advanced: string;
    connecting: string;
    connectionFailedAlert: string;
    connectionFailedTitle: string;
    connectionRefused: string;
    connectionTimedOut: string;
    enterAddress: string;
    hostLabel: string;
    hostNotFound: string;
    hostRequired: string;
    hostUnreachable: string;
    invalidConnection: string;
    noAdditionalDetails: string;
    optional: string;
    password: string;
    portLabel: string;
    portRange: string;
    tlsError: string;
    unableToConnect: string;
    useSsl: string;
    incorrectPassword: string;
    passwordRequired: string;
    hidePassword: string;
    showPassword: string;
    hideAdvanced: string;
    showAdvanced: string;
    connectionUri: string;
    relay: string;
    local: string;
    connections: string;
    removeConnection: string;
    removeConnectionConfirm: string;
    operations: string;
    restartDaemon: string;
    restartDaemonHint: string;
    restarting: string;
    pairDevices: string;
    pairADevice: string;
    pairDeviceHint: string;
    injectPaseoTools: string;
    injectPaseoToolsHint: string;
    dangerZone: string;
    removeHostTitle: string;
    removeHostHint: string;
    removeHostConfirm: string;
    labelRequired: string;
    labelRequiredHint: string;
    unableToSaveHost: string;
    unableToRemoveConnection: string;
    unavailable: string;
    unavailableHint: string;
    offlineRestartHint: string;
    restartConfirmTitle: string;
    restartConfirmMessage: string;
    restartFailed: string;
    unableToReconnect: string;
    didNotComeBackOnline: string;
    unableToOpenRestartDialog: string;
    timeout: string;
    editLabel: string;
    renameHost: string;
    hostOffline: string;
    unableToRemoveHost: string;
    tcp: string;
    failedToLoadPairingOffer: string;
    relayNotEnabled: string;
    pairingOfferUnavailable: string;
    loadingPairingOffer: string;
    scanQrOrCopyLink: string;
    qrCodeUnavailable: string;
  };
  modal: Record<string, string>;
  agent: Record<string, string>;
  agentGrouping: {
    recent: string;
    yesterday: string;
    thisWeek: string;
    thisMonth: string;
    older: string;
  };
  prPane: {
    draft: string;
    merged: string;
    closed: string;
    open: string;
    commented: string;
    approved: string;
    reviewed: string;
  };
  confirmDialog: {
    confirm: string;
    cancel: string;
  };
  desktopUpdates: {
    whatsNew: string;
    retry: string;
    downloadAppleSiliconBuild: string;
    rosettaWarning: string;
    rosettaWarningHint: string;
    upgradeWarning: string;
  };

  gitActions: {
    commit: string;
    committing: string;
    committed: string;
    failedToCommit: string;
    pull: string;
    pulling: string;
    pulled: string;
    failedToPull: string;
    push: string;
    pushing: string;
    pushed: string;
    failedToPush: string;
    pullAndPush: string;
    pullingAndPushing: string;
    pulledAndPushed: string;
    failedToPullAndPush: string;
    merge: string;
    merging: string;
    merged: string;
    failedToMerge: string;
    update: string;
    updating: string;
    updated: string;
    failedToMergeFromBase: string;
    archiveWorktree: string;
    archiving: string;
    archived: string;
    failedToArchiveWorktree: string;
    archiveUnavailable: string;
    viewPR: string;
    viewPRUnavailable: string;
    createPR: string;
    creatingPR: string;
    prCreated: string;
    failedToCreatePR: string;
    mergeInto: string;
    updateFrom: string;
    notAGitRepository: string;
    unknown: string;
    base: string;
    baseRefUnavailable: string;
    worktreePathUnavailable: string;
    pullUnavailableNoRemote: string;
    pullUnavailableLocalChanges: string;
    pullUnavailableUpToDate: string;
    pushUnavailableNoRemote: string;
    pushUnavailableBehind: string;
    pushUnavailableNothingToSend: string;
    pullAndPushUnavailableNoRemote: string;
    pullAndPushUnavailableLocalChanges: string;
    pullAndPushUnavailableInSync: string;
    createPRUnavailableNoGitHub: string;
    createPRUnavailableNoCommits: string;
    mergeUnavailableNoBaseBranch: string;
    mergeUnavailableLocalChanges: string;
    mergeUnavailableNothingToMerge: string;
    updateUnavailableNoBaseBranch: string;
    updateUnavailableLocalChanges: string;
    updateUnavailableUpToDate: string;
  };
  shortcuts: {
    pressShortcut: string;
    rebind: string;
    resetAll: string;
    desktopOnly: string;
    sectionNavigation: string;
    sectionTabsPanes: string;
    sectionProjects: string;
    sectionPanels: string;
    sectionAgentInput: string;
    openProject: string;
    newWorktree: string;
    archiveWorktree: string;
    newTab: string;
    closeCurrentTab: string;
    jumpToWorkspace: string;
    jumpToTab: string;
    previousWorkspace: string;
    nextWorkspace: string;
    previousTab: string;
    nextTab: string;
    splitPaneRight: string;
    splitPaneDown: string;
    focusPaneLeft: string;
    focusPaneRight: string;
    focusPaneUp: string;
    focusPaneDown: string;
    moveTabLeft: string;
    moveTabRight: string;
    moveTabUp: string;
    moveTabDown: string;
    closePane: string;
    newTerminal: string;
    toggleCommandCenter: string;
    showKeyboardShortcuts: string;
    toggleLeftSidebar: string;
    toggleRightSidebar: string;
    toggleBothSidebars: string;
    toggleSettings: string;
    toggleFocusMode: string;
    cycleTheme: string;
    focusMessageInput: string;
    toggleVoiceMode: string;
    startStopDictation: string;
    interruptAgent: string;
    sendMessage: string;
    queueMessage: string;
    muteUnmuteVoice: string;
  };
  keyboardShortcutKeys: {
    navigation: string;
    projects: string;
    panels: string;
  };
  commandCenter: {
    settings: string;
  };
  sidebarCallout: {
    dismiss: string;
  };
  menuHeader: {
    toggleSidebar: string;
  };
  backHeader: {
    back: string;
  };
  addHostModal: {
    localhost: string;
    connectionUriPlaceholder: string;
  };
  pairLinkModal: {
    pairLinkInput: string;
    placeholder: string;
  };
  modelSelector: {
    searchModels: string;
    selectModel: string;
  };
  providerModal: {
    searchProviders: string;
  };
  gitDiffPane: {
    diffMode: string;
  };
  questionFormCard: {
    dismissedByUser: string;
  };
  agentStatusBar: {
    unknown: string;
  };
  desktopPermissions: {
    notAllowed: string;
    notFound: string;
  };
  toast: {
    copied: string;
    copiedWithLabel: string;
    stashedChangesRestored: string;
    failedToStashChanges: string;
    failedToSwitchBranch: string;
    failedToSelectImage: string;
  };
  integrations: {
    title: string;
    cliDocs: string;
    skillsDocs: string;
    commandLine: string;
    commandLineHint: string;
    installed: string;
    installing: string;
    orchestrationSkills: string;
    orchestrationSkillsHint: string;
  };
  permissions: {
    title: string;
    refresh: string;
    refreshing: string;
    notifications: string;
    test: string;
    microphone: string;
    granted: string;
    requesting: string;
    request: string;
  };
  providers: {
    title: string;
    connectToSee: string;
    loading: string;
    addProvider: string;
    refreshingProviders: string;
    refreshProviders: string;
    disabled: string;
    loadingStatus: string;
    error: string;
    available: string;
    notInstalled: string;
    modelSingular: string;
    modelPlural: string;
    unableToUpdate: string;
    customModels: string;
    diagnostic: string;
    searchModels: string;
    modelId: string;
    addModel: string;
    adding: string;
    failedToSaveModel: string;
    failedToDeleteModel: string;
    failedToFetchDiagnostic: string;
    failedToRefreshProvider: string;
    unknownError: string;
    runningDiagnostic: string;
    noDiagnosticAvailable: string;
    loadingModels: string;
    noModelsDetected: string;
    noModelsMatchSearch: string;
    models: string;
    updated: string;
  };
  daemon: {
    title: string;
    daemonLogs: string;
    logPathUnavailable: string;
    daemonStatus: string;
    manageBuiltInDaemon: string;
    keepDaemonRunning: string;
    viewStatus: string;
    versionMismatch: string;
    copied: string;
    statusCopied: string;
    logPathCopied: string;
    unableToCopyLogPath: string;
    loading: string;
    status: string;
    onlyBuiltInShown: string;
    manageBuiltInDaemonHint: string;
    keepDaemonRunningHint: string;
    logFile: string;
    openLogs: string;
    fullStatus: string;
    fullStatusHint: string;
    advancedSettings: string;
  };
  gitDiff: {
    new: string;
    deleted: string;
    binaryFile: string;
    diffTooLarge: string;
    unifiedDiff: string;
    sideBySideDiff: string;
    hideWhitespace: string;
    scrollLongLines: string;
    wrapLongLines: string;
    collapseAllFiles: string;
    expandAllFiles: string;
    notAGitRepository: string;
    unknown: string;
    noVisibleChangesAfterHidingWhitespace: string;
    noUncommittedChanges: string;
    noChangesVs: string;
    checkingRepository: string;
    uncommitted: string;
    committed: string;
  };
  workspace: {
    size: string;
    modified: string;
    copyPath: string;
    download: string;
    workspaceUnavailable: string;
    back: string;
    retry: string;
    loadingFiles: string;
    noFiles: string;
    backToProjects: string;
    chooseWhereToStart: string;
    commandRequired: string;
    configChangedDescription: string;
    configChangedOnDisk: string;
    nameRequired: string;
    newScript: string;
    newWorkspace: string;
    noEditableTarget: string;
    noMatchingRefs: string;
    parseErrorDescription: string;
    parseErrorTitle: string;
    projectNotFoundDescriptionMulti: string;
    projectNotFoundDescriptionSingle: string;
    projectNotFoundTitle: string;
    projectSaved: string;
    loadErrorTitle: string;
    hostDidNotRespond: string;
    reloadToTryAgain: string;
    removeScriptTitle: string;
    removeThisScript: string;
    runAsService: string;
    runAsServiceHint: string;
    saveErrorDescription: string;
    saveErrorTitle: string;
    scriptCommand: string;
    scriptName: string;
    scripts: string;
    searchBranchesAndPRs: string;
    switchBranch: string;
    filterBranches: string;
    noBranchesFound: string;
    searching: string;
    startFrom: string;
    untitledScript: string;
    worktreeSetup: string;
    worktreeTeardown: string;
    newAgent: string;
    setup: string;
    terminal: string;
    browser: string;
    agent: string;
    workspaceSetup: string;
    setupCompleted: string;
    setupFailed: string;
    settingUpWorkspace: string;
    waitingForSetupOutput: string;
    noSetupCommandsRan: string;
    noOutput: string;
    loadingAgentTitle: string;
    workspace: string;
    initialPromptRequired: string;
    noAvailableProviders: string;
    modelDefaultsLoading: string;
    noModelAvailable: string;
    workspaceDirectoryNotFound: string;
    daemonClientNotAvailable: string;
    unableToCloseTerminal: string;
    draftTabTargetInvalid: string;
    workspacePathNotAvailable: string;
    preparingWorkspace: string;
    agentIdCopied: string;
    copyFailed: string;
    resumeIdNotAvailable: string;
    resumeCommandNotAvailable: string;
    reloadedAgent: string;
    failedToReloadAgent: string;
    workspacePathCopied: string;
    branchNameNotAvailable: string;
    branchNameCopied: string;
    failedToOpenWorkspace: string;
    closeTerminal: string;
    closeTerminalMessage: string;
    archiveRunningAgent: string;
    archiveRunningAgentMessage: string;
    closeTabsToLeft: string;
    closeTabsToRight: string;
    closeOtherTabs: string;
    newAgentTab: string;
    preparingTerminalTab: string;
    newTerminalTab: string;
    preparingTerminal: string;
    newBrowserTab: string;
    splitPaneRight: string;
    splitPaneDown: string;
    switchTab: string;
    searchTabs: string;
    workspaceActions: string;
    closeExplorer: string;
    openExplorer: string;
    toggleExplorer: string;
    openMenuFor: string;
    copyWorkspacePath: string;
    copyBranchName: string;
    showSetup: string;
    workspaceExecutionDirectoryNotFound: string;
    workspaceExecutionDirectoryMissing: string;
    noTabsAvailable: string;
    noTabsInPane: string;
    resumeCommandCopied: string;
    chooseEditor: string;
    checks: string;
    checksFailed: string;
    checksPassed: string;
    checksRunning: string;
    workspaceScripts: string;
    view: string;
    run: string;
    connecting: string;
    changes: string;
    files: string;
    defaultBranch: string;
    createWorkspace: string;
    failedToCreateWorktree: string;
    failedToOpenProject: string;
    noWorkspaceSetupPending: string;
    workspaceSetupComposerStateRequired: string;
    workspaceDraftComposerStateRequired: string;
    loadingWorkspace: string;
    hostStatus: string;
    manageHost: string;
    workspaceNotFound: string;
    typeDirectoryPath: string;
    openingProject: string;
    startTypingPath: string;
    copyResumeCommand: string;
    copyAgentId: string;
    closeTabsAbove: string;
    closeToTheLeft: string;
    closeTabsBelow: string;
    closeToTheRight: string;
    closeOtherTabsLabel: string;
    reloadAgent: string;
    reloadAgentTooltip: string;
    creating: string;
    hideFromSidebar: string;
    removeProject: string;
    openProjectSettings: string;
    projectActions: string;
  };
  composer: {
    desktopPlaceholder: string;
    mobilePlaceholder: string;
    interrupt: string;
    voiceMode: string;
    attachIssueOrPR: string;
    searchIssuesAndPRs: string;
    addIssueOrPR: string;
    queue: string;
    send: string;
    dictation: string;
    muteVoiceMode: string;
    unmuteVoiceMode: string;
  };
  archivedAgent: { archived: string; unarchive: string };
  attachmentLightbox: { couldNotLoadImage: string; dismissImage: string; closeImage: string };
  browserPane: {
    desktopOnly: string;
    openInElectron: string;
    browserSession: string;
    back: string;
    forward: string;
    browserUrl: string;
    openDevTools: string;
    failedToLoadPage: string;
    stopLoading: string;
    refresh: string;
  };
  dictation: {
    startVoiceDictation: string;
    cancelDictation: string;
    retryDictation: string;
    insertTranscription: string;
    insertTranscriptionAndSend: string;
    failed: string;
    failedTapRetry: string;
  };
  fileDropZone: { dropImagesHere: string };
  message: {
    imageUnavailable: string;
    spoke: string;
    details: string;
    noTasksYet: string;
    copyMessage: string;
    openFile: string;
    addAttachment: string;
    tasks: string;
    plan: string;
    copyTurn: string;
  };
  quittingOverlay: { quitting: string; stoppingDaemon: string };
  realtimeVoice: {
    unmuteRealtimeVoice: string;
    muteRealtimeVoice: string;
    stopRealtimeVoice: string;
  };
  terminalPane: {
    hostNotConnected: string;
    ctrl: string;
    shift: string;
    alt: string;
    esc: string;
    tab: string;
    enter: string;
    backspace: string;
    terminal: string;
  };
  toolCallDetails: {
    error: string;
    noAdditionalDetailsAvailable: string;
    input: string;
    output: string;
    subAgentActivity: string;
  };
  contextWindow: { contextWindow: string; used: string };
  menuBackdrop: { menuBackdrop: string };
  addProviderModal: {
    noProvidersFound: string;
    installInstructions: string;
    installed: string;
    unableToInstallProvider: string;
  };
  addHostMethodModal: { directConnection: string; scanQrCode: string; pastePairingLink: string };
  agentStreamView: {
    startChattingWithAgent: string;
    scrollToBottom: string;
    plan: string;
    permissionRequired: string;
    deny: string;
    implement: string;
    accept: string;
    howWouldYouLikeToProceed: string;
  };
  gitActionsSplitButton: { moreOptions: string; moreActions: string };
  combinedModelSelector: {
    favorites: string;
    noModelsMatchYourSearch: string;
    loadingModelSelector: string;
  };
  agentPanel: {
    agentNotFound: string;
    failedToLoadAgent: string;
    archivingAgent: string;
    pleaseWaitWhileWeArchive: string;
    reconnectingTo: string;
    agent: string;
  };
  filePanel: { loadingFile: string; noPreviewAvailable: string; binaryPreviewUnavailable: string };
  setupPanel: { workspaceSetupLog: string };
  newWorkspaceScreen: {
    composerStateRequired: string;
    selectAModel: string;
    hostIsNotConnected: string;
  };
  projectSettingsScreen: {
    addScript: string;
    worktreeSetupCommands: string;
    worktreeTeardownCommands: string;
    saveProjectConfig: string;
    openScriptMenu: string;
    scriptName: string;
    scriptCommand: string;
    runAsAService: string;
    backToProjects: string;
    npmInstall: string;
    dockerComposeDown: string;
    dev: string;
    npmRunDev: string;
  };
  reviewSurface: {
    editReviewComment: string;
    deleteReviewComment: string;
    reviewComment: string;
    cancelReviewComment: string;
    saveReviewComment: string;
  };
  sidebarWorkspaceList: {
    workspacePathNotAvailable: string;
    failedToHideWorkspace: string;
    failedToRemoveSomeWorkspaces: string;
    creating: string;
    newWorkspace: string;
    addProjectToGetStarted: string;
    archive: string;
    hide: string;
    remove: string;
    cancel: string;
  };
  desktopMenu: {
    edit: string;
    view: string;
    zoomIn: string;
    zoomOut: string;
    actualSize: string;
    reload: string;
    forceReload: string;
    window: string;
    copy: string;
    paste: string;
    selectAll: string;
  };
  desktopDialogs: { confirm: string; ok: string };
  desktopMain: { inspectElement: string; notFound: string };
}

export const en: Translation = {
  combobox: {
    searchPlaceholder: "Search...",
    noOptionsMatch: "No options match your search.",
    use: "Use",
  },
  autocomplete: {
    noResultsFound: "No results found",
    error: "Error: {errorMessage}",
  },
  fileExplorer: {
    sortName: "Name",
    sortModified: "Modified",
    sortSize: "Size",
    refreshingFiles: "Refreshing files",
    refreshFiles: "Refresh files",
  },
  settings: {
    general: "General",
    shortcuts: "Shortcuts",
    integrations: "Integrations",
    permissions: "Permissions",
    diagnostics: "Diagnostics",
    about: "About",
    projects: "Projects",
    back: "Back",
    addHost: "Add host",
    local: "Local",
    loading: "Loading settings...",
  },
  theme: {
    light: "Light",
    dark: "Dark",
    auto: "System",
    zinc: "Zinc",
    midnight: "Midnight",
    claude: "Claude",
    ghostty: "Ghostty",
  },
  sendBehavior: {
    interrupt: "Interrupt",
    queue: "Queue",
  },
  serviceUrlBehavior: {
    ask: "Ask",
    "in-app": "In Paseo",
    external: "External browser",
  },
  generalSettings: {
    title: "General",
    theme: "Theme",
    defaultSend: "Default send",
    defaultSendHint: "What happens when you press Enter while the agent is running",
    serviceUrls: "Service URLs",
    serviceUrlsHint: "Where to open URLs from running scripts",
    language: "Language",
  },
  language: {
    en: "English",
    zhCN: "简体中文",
  },
  aboutSettings: {
    title: "About",
    version: "Version",
    releaseChannel: "Release channel",
    releaseChannelStable: "Stable",
    releaseChannelBeta: "Beta",
    releaseChannelHint: "Switch to Beta to get updates sooner and help shape them",
    appUpdates: "App updates",
    check: "Check",
    checking: "Checking...",
    update: "Update",
    installing: "Installing...",
    updateTo: "Update to",
    readyToInstall: "Ready to install: ",
    installDesktopUpdate: "Install desktop update",
    installDesktopUpdateMessage: "This updates Paseo on this computer",
    cancel: "Cancel",
    error: "Error",
    unableToOpenDialog: "Unable to open the update confirmation dialog.",
    checkingForAppUpdates: "Checking for app updates...",
    installingAppUpdate: "Installing app update...",
    appIsUpToDate: "App is up to date.",
    updateReadySoon: "We'll let you know when the update is ready.",
    updateReadyToInstall: "An app update is ready to install.",
    updateInstalledRestartRequired: "App update installed. Restart required.",
    failedToUpdateApp: "Failed to update app.",
    updateStatusNotChecked: "Update status has not been checked yet.",
  },
  diagnosticsSettings: {
    title: "Diagnostics",
    testAudio: "Test audio",
    playTest: "Play test",
    playing: "Playing...",
    playbackFailed: "Playback failed: {message}",
  },
  common: {
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    delete: "Delete",
    remove: "Remove",
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    back: "Back",
    close: "Close",
    confirm: "Confirm",
    edit: "Edit",
    create: "Create",
    copy: "Copy",
    paste: "Paste",
    search: "Search",
    done: "Done",
    ok: "OK",
    unknown: "Unknown",
    continue: "Continue",
    next: "Next",
    previous: "Previous",
    add: "Add",
    update: "Update",
    rename: "Rename",
    clear: "Clear",
    reset: "Reset",
    submit: "Submit",
    send: "Send",
    disconnect: "Disconnect",
    connect: "Connect",
    open: "Open",
    stop: "Stop",
    start: "Start",
    show: "Show",
    hide: "Hide",
    expand: "Expand",
    collapse: "Collapse",
    more: "More",
    all: "All",
    none: "None",
    select: "Select",
    deselect: "Deselect",
    enabled: "Enabled",
    disabled: "Disabled",
    active: "Active",
    inactive: "Inactive",
    copied: "Copied",
    leaveAComment: "Leave a comment",
    enterUrl: "Enter URL",
    other: "Other",
  },
  status: {
    running: "Running",
    idle: "Idle",
    starting: "Starting",
    online: "Online",
    offline: "Offline",
    busy: "Busy",
    stopped: "Stopped",
    ready: "Ready",
    waiting: "Waiting",
    connected: "Connected",
    disconnected: "Disconnected",
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    success: "Success",
    warning: "Warning",
    info: "Info",
  },
  emptyState: {
    noProjects: "No projects yet",
    noSessions: "No sessions yet",
    noAgents: "No agents yet",
    noHosts: "No hosts yet",
    noWorkspaces: "No workspaces yet",
    noScripts: "No scripts yet",
    noResults: "No results",
  },
  splash: {
    somethingWentWrong: "Something went wrong",
    localServerFailed:
      "The local server failed to start. If this keeps happening, please report the issue on GitHub and include the logs below.",
    loadingDaemonLogs: "Loading daemon logs...",
    noDaemonLogs: "No daemon logs available.",
    copyLogs: "Copy logs",
    openGithubIssue: "Open GitHub issue",
    docs: "Docs",
    retry: "Retry",
    unableToLoadLogs: "Unable to load daemon logs",
  },
  pairScan: {
    scanQR: "Scan QR",
    notAvailableOnWeb: "Not available on web",
    notAvailableOnWebHint:
      'QR scanning isn\'t supported in the web build. Use "Paste link" instead.',
    backToSettings: "Back to Settings",
    cameraPermission: "Camera permission",
    cameraPermissionHint: "Allow camera access to scan the pairing QR code from your daemon.",
    grantPermission: "Grant permission",
    pairing: "Pairing…",
    unableToPair: "Unable to pair host",
    pastePairingLinkHint: "Paste the pairing link from your server.",
    pairingLinkLabel: "Pairing link",
    pastePairingLinkPlaceholder: "Paste a pairing link",
    linkMustIncludeOffer: "Link must include #offer=...",
    invalidPairingLink: "Invalid pairing link",
    pairingFailed: "Pairing failed",
    pair: "Pair",
  },
  projects: {
    noProjects: "No projects yet",
    couldntLoadProjects: "Couldn't load projects from host",
    editProject: "Edit",
    whatShallWeBuild: "What shall we build today?",
    addProjectHint: "Add a project folder to start running agents on your codebase",
    addProject: "Add a project",
    pairDevice: "Pair device",
  },
  welcome: {
    welcomeToPaseo: "Welcome to Paseo",
    connectComputer: "Connect your computer to get started",
    directConnection: "Direct connection",
    pastePairingLink: "Paste pairing link",
    scanQrCode: "Scan QR code",
    settings: "Settings",
  },
  sessions: {
    title: "Sessions",
    loadMore: "Load more",
  },
  host: {
    advanced: "Advanced",
    connecting: "Connecting...",
    connectionFailedAlert: "Connection failed",
    connectionFailedTitle: "Could not connect to {endpoint}",
    connectionRefused: "Connection refused",
    connectionTimedOut: "Connection timed out",
    enterAddress: "Enter address",
    hostLabel: "Host",
    hostNotFound: "Host not found",
    hostRequired: "Host is required",
    hostUnreachable: "Host unreachable",
    invalidConnection: "Invalid connection",
    noAdditionalDetails: "no additional details",
    optional: "Optional",
    password: "Password",
    portLabel: "Port",
    portRange: "Port must be between 1 and 65535",
    tlsError: "TLS error",
    unableToConnect: "Unable to connect",
    useSsl: "Use SSL",
    incorrectPassword: "Incorrect password",
    passwordRequired: "Password required",
    hidePassword: "Hide password",
    showPassword: "Show password",
    hideAdvanced: "Hide advanced",
    showAdvanced: "Show advanced",
    connectionUri: "Connection URI",
    relay: "Relay",
    local: "Local",
    connections: "Connections",
    removeConnection: "Remove connection",
    removeConnectionConfirm: "Remove {title}? This cannot be undone.",
    operations: "Operations",
    restartDaemon: "Restart daemon",
    restartDaemonHint: "Restarts the daemon process. The app will reconnect automatically",
    restarting: "Restarting...",
    pairDevices: "Pair devices",
    pairADevice: "Pair a device",
    pairDeviceHint: "Scan a QR code or copy a link to connect your phone to this host",
    injectPaseoTools: "Inject Paseo tools",
    injectPaseoToolsHint: "Automatically inject Paseo MCP tools into new agents",
    dangerZone: "Danger zone",
    removeHostTitle: "Remove host",
    removeHostHint: "Removes this host and its saved connections from this device",
    removeHostConfirm: "Remove {label}? This will delete its saved connections.",
    labelRequired: "Label required",
    labelRequiredHint: "Enter a label for this host.",
    unableToSaveHost: "Unable to save host",
    unableToRemoveConnection: "Unable to remove connection",
    unavailable: "Host unavailable",
    unavailableHint: "This host is not connected. Wait for it to come online before restarting.",
    offlineRestartHint:
      "This host is offline. Paseo reconnects automatically—wait until it's back online before restarting.",
    restartConfirmTitle: "Restart {label}",
    restartConfirmMessage:
      "This will restart the daemon. Agents running on it will keep going; the app will reconnect automatically.",
    restartFailed:
      "Failed to send the restart request. Paseo reconnects automatically—try again once the host shows as online.",
    unableToReconnect: "Unable to reconnect",
    didNotComeBackOnline: "{label} did not come back online. Please verify it restarted.",
    unableToOpenRestartDialog: "Unable to open the restart confirmation dialog.",
    timeout: "Timeout",
    editLabel: "Edit label",
    renameHost: "Rename host",
    hostOffline: "Host offline",
    unableToRemoveHost: "Unable to remove host",
    tcp: "TCP",
    failedToLoadPairingOffer: "Failed to load pairing offer.",
    relayNotEnabled: "Relay is not enabled. Enable relay to pair a device.",
    pairingOfferUnavailable: "Pairing offer unavailable.",
    loadingPairingOffer: "Loading pairing offer…",
    scanQrOrCopyLink: "Scan this QR code with Paseo on your phone, or copy the link below.",
    qrCodeUnavailable: "QR code unavailable.",
  },
  modal: {
    addConnection: "Add connection",
    agents: "Agents",
    directConnection: "Direct connection",
    encryptedRelayConnection: "Encrypted relay connection.",
    localNetworkOrVpn: "Local network or VPN.",
    noMatches: "No matches",
    pastePairingLink: "Paste pairing link",
    scanQrCode: "Scan QR code",
    typeCommandOrSearch: "Type a command or search agents...",
    actions: "Actions",
  },
  agent: {
    agentPreferences: "Agent preferences",
    archive: "Archive",
    archiveRunningWarning: "This agent is still running. Archive it anyway?",
    archived: "Archived",
    attention: "Attention",
    changeModel: "Change model",
    changePermissionMode: "Change permission mode",
    closed: "Closed",
    default: "Default",
    hostOffline: "Host offline",
    loadingModels: "Loading models...",
    newAgent: "New agent",
    newSession: "New session",
    off: "Off",
    older: "Older",
    on: "On",
    pending: "Pending",
    preferences: "Preferences",
    provider: "Provider",
    selectAgentMode: "Select agent mode",
    selectAgentModeWithValue: "Select agent mode ({value})",
    selectAgentProvider: "Select agent provider",
    selectModel: "Select model",
    selectThinkingOption: "Select thinking option",
    selectThinkingOptionWithValue: "Select thinking option ({value})",
    thinkingMode: "Thinking mode",
    thisMonth: "This month",
    thisWeek: "This week",
    today: "Today",
    yesterday: "Yesterday",
    proposedPlan: "Proposed plan",
  },
  workspace: {
    size: "Size",
    modified: "Modified",
    copyPath: "Copy path",
    download: "Download",
    workspaceUnavailable: "Workspace is unavailable",
    back: "Back",
    retry: "Retry",
    loadingFiles: "Loading files…",
    noFiles: "No files",
    backToProjects: "Back to projects",
    chooseWhereToStart: "Choose where to start from",
    commandRequired: "Command is required",
    configChangedDescription: "Reload to fetch the latest paseo.json before saving.",
    configChangedOnDisk: "Config changed on disk",
    nameRequired: "Name is required",
    newScript: "New script",
    newWorkspace: "New workspace",
    noEditableTarget: "We don't have an editable copy of this project on any connected host.",
    noMatchingRefs: "No matching refs.",
    parseErrorDescription: "Fix the file on disk, then reload.",
    parseErrorTitle: "paseo.json couldn't be parsed",
    projectNotFoundDescriptionMulti: "Switch to another host above, or reload.",
    projectNotFoundDescriptionSingle: "The selected host has no record of this project.",
    projectNotFoundTitle: "This host doesn't have this project",
    projectSaved: "Project saved",
    loadErrorTitle: "Couldn't load paseo.json",
    hostDidNotRespond: "The host didn't respond.",
    reloadToTryAgain: "Reload to try again.",
    removeScriptTitle: "Remove script?",
    removeThisScript: "Remove this script?",
    runAsService: "Run as a service",
    runAsServiceHint: "Paseo supervises the process and assigns a port via $PASEO_PORT",
    saveErrorDescription: "Try again, or reload the latest version from disk.",
    saveErrorTitle: "Couldn't save paseo.json",
    scriptCommand: "Command",
    scriptName: "Name",
    scripts: "Scripts",
    searchBranchesAndPRs: "Search branches and PRs",
    switchBranch: "Switch branch",
    filterBranches: "Filter branches...",
    noBranchesFound: "No branches found.",
    searching: "Searching...",
    startFrom: "Start from",
    untitledScript: "Untitled script",
    worktreeSetup: "Worktree setup",
    worktreeTeardown: "Worktree teardown",
    newAgent: "New Agent",
    setup: "Setup",
    terminal: "Terminal",
    browser: "Browser",
    agent: "Agent",
    workspaceSetup: "Workspace setup",
    setupCompleted: "Setup completed",
    setupFailed: "Setup failed",
    settingUpWorkspace: "Setting up workspace...",
    waitingForSetupOutput: "Waiting for setup output",
    noSetupCommandsRan: "No setup commands ran for this workspace.",
    noOutput: "No output",
    loadingAgentTitle: "Loading agent title",
    workspace: "Workspace",
    initialPromptRequired: "Initial prompt is required",
    noAvailableProviders: "No available providers on the selected host",
    modelDefaultsLoading: "Model defaults are still loading",
    noModelAvailable: "No model is available for the selected provider",
    workspaceDirectoryNotFound: "Workspace directory not found",
    daemonClientNotAvailable: "Daemon client not available",
    unableToCloseTerminal: "Unable to close terminal",
    draftTabTargetInvalid: "Draft tab target must be valid",
    workspacePathNotAvailable: "Workspace path is not available yet",
    preparingWorkspace: "Preparing workspace, opening terminal when ready...",
    agentIdCopied: "Agent ID",
    copyFailed: "Copy failed",
    resumeIdNotAvailable: "Resume ID not available",
    resumeCommandNotAvailable: "Resume command not available",
    reloadedAgent: "Reloaded agent",
    failedToReloadAgent: "Failed to reload agent",
    workspacePathCopied: "Workspace path",
    branchNameNotAvailable: "Branch name not available",
    branchNameCopied: "Branch name",
    failedToOpenWorkspace: "Failed to open workspace",
    closeTerminal: "Close terminal?",
    closeTerminalMessage: "Any running process in this terminal will be stopped immediately.",
    archiveRunningAgent: "Archive running agent?",
    archiveRunningAgentMessage:
      "This agent is still running. Archiving it will stop the agent and close the tab.",
    closeTabsToLeft: "Close tabs to the left?",
    closeTabsToRight: "Close tabs to the right?",
    closeOtherTabs: "Close other tabs?",
    newAgentTab: "New agent tab",
    preparingTerminalTab: "Preparing terminal tab",
    newTerminalTab: "New terminal tab",
    preparingTerminal: "Preparing terminal...",
    newBrowserTab: "New browser tab",
    splitPaneRight: "Split pane right",
    splitPaneDown: "Split pane down",
    switchTab: "Switch tab",
    searchTabs: "Search tabs",
    workspaceActions: "Workspace actions",
    closeExplorer: "Close explorer",
    openExplorer: "Open explorer",
    toggleExplorer: "Toggle explorer",
    openMenuFor: "Open menu for",
    copyWorkspacePath: "Copy workspace path",
    copyBranchName: "Copy branch name",
    showSetup: "Show setup",
    workspaceExecutionDirectoryNotFound: "Workspace execution directory not found.",
    workspaceExecutionDirectoryMissing:
      "Workspace execution directory is missing. Reload workspace data before opening tabs.",
    noTabsAvailable: "No tabs are available yet. Use New tab to create an agent or terminal.",
    noTabsInPane: "No tabs in this pane.",
    resumeCommandCopied: "Resume command",
    chooseEditor: "Choose editor",
    checks: "Checks",
    checksFailed: "{count} failed",
    checksPassed: "{count} passed",
    checksRunning: "{count} running",
    workspaceScripts: "Workspace scripts",
    view: "View",
    run: "Run",
    connecting: "Connecting",
    changes: "Changes",
    files: "Files",
    defaultBranch: "main",
    createWorkspace: "Create workspace",
    failedToCreateWorktree: "Failed to create worktree",
    failedToOpenProject: "Failed to open project",
    noWorkspaceSetupPending: "No workspace setup is pending",
    workspaceSetupComposerStateRequired: "Workspace setup composer state is required",
    workspaceDraftComposerStateRequired: "Workspace draft composer state is required",
    loadingWorkspace: "Loading workspace",
    hostStatus: "Host status: {status}",
    manageHost: "Manage host",
    workspaceNotFound: "Workspace not found",

    typeDirectoryPath: "Type a directory path...",
    openingProject: "Opening project...",
    startTypingPath: "Start typing a path",
    copyResumeCommand: "Copy resume command",
    copyAgentId: "Copy agent id",
    closeTabsAbove: "Close tabs above",
    closeToTheLeft: "Close to the left",
    closeTabsBelow: "Close tabs below",
    closeToTheRight: "Close to the right",
    closeOtherTabsLabel: "Close other tabs",
    reloadAgent: "Reload agent",
    reloadAgentTooltip: "Reload agent to update skills, MCPs or login status.",
  },
  shortcuts: {
    pressShortcut: "Press shortcut...",
    rebind: "Rebind",
    resetAll: "Reset all",
    desktopOnly: "Keyboard shortcuts are only available on desktop",
    sectionNavigation: "Navigation",
    sectionTabsPanes: "Tabs & Panes",
    sectionProjects: "Projects",
    sectionPanels: "Panels",
    sectionAgentInput: "Agent Input",
    openProject: "Open project",
    newWorktree: "New worktree",
    archiveWorktree: "Archive worktree",
    newTab: "New tab",
    closeCurrentTab: "Close current tab",
    jumpToWorkspace: "Jump to workspace",
    jumpToTab: "Jump to tab",
    previousWorkspace: "Previous workspace",
    nextWorkspace: "Next workspace",
    previousTab: "Previous tab",
    nextTab: "Next tab",
    splitPaneRight: "Split pane right",
    splitPaneDown: "Split pane down",
    focusPaneLeft: "Focus pane left",
    focusPaneRight: "Focus pane right",
    focusPaneUp: "Focus pane up",
    focusPaneDown: "Focus pane down",
    moveTabLeft: "Move tab left",
    moveTabRight: "Move tab right",
    moveTabUp: "Move tab up",
    moveTabDown: "Move tab down",
    closePane: "Close pane",
    newTerminal: "New terminal",
    toggleCommandCenter: "Toggle command center",
    showKeyboardShortcuts: "Show keyboard shortcuts",
    toggleLeftSidebar: "Toggle left sidebar",
    toggleRightSidebar: "Toggle right sidebar",
    toggleBothSidebars: "Toggle both sidebars",
    toggleSettings: "Toggle settings",
    toggleFocusMode: "Toggle focus mode",
    cycleTheme: "Cycle theme",
    focusMessageInput: "Focus message input",
    toggleVoiceMode: "Toggle voice mode",
    startStopDictation: "Start/stop dictation",
    interruptAgent: "Interrupt agent",
    sendMessage: "Send message",
    queueMessage: "Queue message",
    muteUnmuteVoice: "Mute/unmute voice mode",
  },
  integrations: {
    title: "Integrations",
    cliDocs: "CLI docs",
    skillsDocs: "Skills docs",
    commandLine: "Command line",
    commandLineHint: "Control and script agents from your terminal",
    installed: "Installed",
    installing: "Installing...",
    orchestrationSkills: "Orchestration skills",
    orchestrationSkillsHint: "Teach your agents to orchestrate through the CLI",
  },
  permissions: {
    title: "Permissions",
    refresh: "Refresh",
    refreshing: "Refreshing...",
    notifications: "Notifications",
    test: "Test",
    microphone: "Microphone",
    granted: "Granted",
    requesting: "Requesting...",
    request: "Request",
  },
  providers: {
    title: "Providers",
    connectToSee: "Connect to this host to see providers",
    loading: "Loading...",
    addProvider: "Add provider",
    refreshingProviders: "Refreshing providers",
    refreshProviders: "Refresh providers",
    disabled: "Disabled",
    loadingStatus: "Loading",
    error: "Error",
    available: "Available",
    notInstalled: "Not installed",
    modelSingular: "1 model",
    modelPlural: "{count} models",
    unableToUpdate: "Unable to update provider",
    customModels: "Custom models",
    diagnostic: "Diagnostic",
    searchModels: "Search models",
    modelId: "Model ID",
    addModel: "Add model",
    adding: "Adding…",
    failedToSaveModel: "Failed to save model",
    failedToDeleteModel: "Failed to delete model",
    failedToFetchDiagnostic: "Failed to fetch diagnostic",
    failedToRefreshProvider: "Failed to refresh provider",
    unknownError: "Unknown error",
    runningDiagnostic: "Running diagnostic…",
    noDiagnosticAvailable: "No diagnostic available",
    loadingModels: "Loading models…",
    noModelsDetected: "No models detected",
    noModelsMatchSearch: "No models match your search",
    models: "Models",
    updated: "Updated",
  },
  gitActions: {
    commit: "Commit",
    committing: "Committing...",
    committed: "Committed",
    failedToCommit: "Failed to commit",
    pull: "Pull",
    pulling: "Pulling...",
    pulled: "Pulled",
    failedToPull: "Failed to pull",
    push: "Push",
    pushing: "Pushing...",
    pushed: "Pushed",
    failedToPush: "Failed to push",
    pullAndPush: "Pull and push",
    pullingAndPushing: "Pulling and pushing...",
    pulledAndPushed: "Pulled and pushed",
    failedToPullAndPush: "Failed to pull and push",
    merge: "Merge",
    merging: "Merging...",
    merged: "Merged",
    failedToMerge: "Failed to merge",
    update: "Update",
    updating: "Updating...",
    updated: "Updated",
    failedToMergeFromBase: "Failed to merge from base",
    archiveWorktree: "Archive worktree",
    archiving: "Archiving...",
    archived: "Archived",
    failedToArchiveWorktree: "Failed to archive worktree",
    archiveUnavailable:
      "Archive isn't available here because this workspace was not created as a Paseo worktree",
    viewPR: "View PR",
    viewPRUnavailable: "View PR isn't available right now because GitHub isn't connected",
    createPR: "Create PR",
    creatingPR: "Creating PR...",
    prCreated: "PR Created",
    failedToCreatePR: "Failed to create PR",
    mergeInto: "Merge into {baseRefLabel}",
    updateFrom: "Update from {baseRefLabel}",
    notAGitRepository: "Not a git repository",
    unknown: "Unknown",
    base: "base",
    baseRefUnavailable: "Base ref unavailable",
    worktreePathUnavailable: "Worktree path unavailable",
    pullUnavailableNoRemote:
      "Pull isn't available here because this branch is not connected to a remote yet",
    pullUnavailableLocalChanges:
      "Pull isn't available while you have local changes so commit or stash them first",
    pullUnavailableUpToDate: "Pull isn't available because this branch is already up to date",
    pushUnavailableNoRemote:
      "Push isn't available here because this branch is not connected to a remote yet",
    pushUnavailableBehind:
      "Push isn't available yet because there are newer changes to bring in first",
    pushUnavailableNothingToSend: "Push isn't available because there is nothing new to send",
    pullAndPushUnavailableNoRemote:
      "Pull and push isn't available here because this branch is not connected to a remote yet",
    pullAndPushUnavailableLocalChanges:
      "Pull and push isn't available while you have local changes so commit or stash them first",
    pullAndPushUnavailableInSync:
      "Pull and push isn't available because this branch is already in sync",
    createPRUnavailableNoGitHub:
      "Create PR isn't available right now because GitHub isn't connected",
    createPRUnavailableNoCommits:
      "Create PR isn't available because this branch doesn't have any new commits yet",
    mergeUnavailableNoBaseBranch:
      "Merge isn't available because we couldn't determine the base branch",
    mergeUnavailableLocalChanges:
      "Merge isn't available while you have local changes so commit or stash them first",
    mergeUnavailableNothingToMerge:
      "Merge isn't available because this branch doesn't have anything new to merge yet",
    updateUnavailableNoBaseBranch:
      "Update isn't available because we couldn't determine the base branch",
    updateUnavailableLocalChanges:
      "Update isn't available while you have local changes so commit or stash them first",
    updateUnavailableUpToDate:
      "Update isn't available because this branch is already up to date with {baseRefLabel}",
  },
  gitDiff: {
    new: "New",
    deleted: "Deleted",
    binaryFile: "Binary file",
    diffTooLarge: "Diff too large to display",
    unifiedDiff: "Unified diff",
    sideBySideDiff: "Side-by-side diff",
    hideWhitespace: "Hide whitespace",
    scrollLongLines: "Scroll long lines",
    wrapLongLines: "Wrap long lines",
    collapseAllFiles: "Collapse all files",
    expandAllFiles: "Expand all files",
    notAGitRepository: "Not a git repository",
    unknown: "Unknown",
    noVisibleChangesAfterHidingWhitespace: "No visible changes after hiding whitespace",
    noUncommittedChanges: "No uncommitted changes",
    noChangesVs: "No changes vs {baseRefLabel}",
    checkingRepository: "Checking repository...",
    uncommitted: "Uncommitted",
    committed: "Committed",
  },
  composer: {
    desktopPlaceholder: "Message the agent, tag @files, or use /commands and /skills",
    mobilePlaceholder: "Message, @files, /commands",
  },
  daemon: {
    title: "Daemon",
    daemonLogs: "Daemon logs",
    logPathUnavailable: "Log path unavailable",
    daemonStatus: "Daemon status",
    manageBuiltInDaemon: "Manage built-in daemon",
    keepDaemonRunning: "Keep daemon running after quit",
    viewStatus: "View status",
    versionMismatch:
      "App and daemon versions don't match. Update both to the same version for the best experience.",
    copied: "Copied",
    statusCopied: "Status copied to clipboard.",
    logPathCopied: "Log path copied.",
    unableToCopyLogPath: "Unable to copy log path.",
    loading: "Loading...",
    status: "Status",
    onlyBuiltInShown: "Only the built-in desktop daemon is shown here",
    manageBuiltInDaemonHint: "Let Paseo start and stop the built-in daemon",
    keepDaemonRunningHint: "Daemon keeps running when you quit Paseo",
    logFile: "Log file",
    openLogs: "Open logs",
    fullStatus: "Full status",
    fullStatusHint: "Runs `paseo daemon status` and shows the output",
    advancedSettings: "Advanced settings",
  },
  archivedAgent: { archived: "This agent is archived", unarchive: "Unarchive" },
  attachmentLightbox: {
    couldNotLoadImage: "Couldn't load image",
    dismissImage: "Dismiss image",
    closeImage: "Close image",
  },
  browserPane: {
    desktopOnly: "Browser is desktop-only",
    openInElectron: "Open this workspace in Electron to use the built-in browser.",
    browserSession: "Browser session {browserId}",
    back: "Back",
    forward: "Forward",
    browserUrl: "Browser URL",
    openDevTools: "Open browser dev tools",
    failedToLoadPage: "Failed to load page",
  },
  dictation: {
    startVoiceDictation: "Start voice dictation",
    cancelDictation: "Cancel dictation",
    retryDictation: "Retry dictation",
    insertTranscription: "Insert transcription",
    insertTranscriptionAndSend: "Insert transcription and send",
    failed: "Dictation failed: {errorText}",
    failedTapRetry: "Dictation failed. Tap retry.",
  },
  fileDropZone: { dropImagesHere: "Drop images here" },
  message: {
    imageUnavailable: "Image unavailable",
    spoke: "Spoke",
    details: "Details",
    noTasksYet: "No tasks yet.",
    copyMessage: "Copy message",
    openFile: "Open file",
    addAttachment: "Add attachment",
  },
  quittingOverlay: { quitting: "Quitting Paseo…", stoppingDaemon: "Stopping the local daemon." },
  realtimeVoice: {
    unmuteRealtimeVoice: "Unmute realtime voice",
    muteRealtimeVoice: "Mute realtime voice",
    stopRealtimeVoice: "Stop realtime voice and interrupt turn",
  },
  terminalPane: {
    hostNotConnected: "Host is not connected",
    ctrl: "Ctrl",
    shift: "Shift",
    alt: "Alt",
    esc: "Esc",
    tab: "Tab",
    enter: "Enter",
    backspace: "Backspace",
  },
  toolCallDetails: {
    error: "Error",
    noAdditionalDetailsAvailable: "No additional details available",
    input: "Input",
    output: "Output",
    subAgentActivity: "Sub-agent activity",
  },
  contextWindow: {
    contextWindow: "Context window",
    used: "Context window {roundedPercentage}% used",
  },
  menuBackdrop: { menuBackdrop: "Menu backdrop" },
  addProviderModal: {
    noProvidersFound: "No providers found",
    installInstructions: "Install instructions",
    installed: "Installed",
    unableToInstallProvider: "Unable to install provider",
  },
  addHostMethodModal: {
    directConnection: "Direct connection",
    scanQrCode: "Scan QR code",
    pastePairingLink: "Paste pairing link",
  },
  agentStreamView: {
    startChattingWithAgent: "Start chatting with this agent...",
    scrollToBottom: "Scroll to bottom",
  },
  gitActionsSplitButton: { moreOptions: "More options", moreActions: "More actions" },
  combinedModelSelector: {
    favorites: "Favorites",
    noModelsMatchYourSearch: "No models match your search",
    loadingModelSelector: "Loading model selector…",
  },
  agentPanel: {
    agentNotFound: "Agent not found",
    failedToLoadAgent: "Failed to load agent",
    archivingAgent: "Archiving agent...",
    pleaseWaitWhileWeArchive: "Please wait while we archive this agent.",
    reconnectingTo: "Reconnecting to {serverLabel}...",
  },
  filePanel: {
    loadingFile: "Loading file…",
    noPreviewAvailable: "No preview available",
    binaryPreviewUnavailable: "Binary preview unavailable",
  },
  setupPanel: { workspaceSetupLog: "Workspace setup log" },
  newWorkspaceScreen: {
    composerStateRequired: "Composer state is required",
    selectAModel: "Select a model",
    hostIsNotConnected: "Host is not connected",
  },
  projectSettingsScreen: {
    addScript: "Add script",
    worktreeSetupCommands: "Worktree setup commands",
    worktreeTeardownCommands: "Worktree teardown commands",
    saveProjectConfig: "Save project config",
    openScriptMenu: "Open script menu",
    scriptName: "Script name",
    scriptCommand: "Script command",
    runAsAService: "Run as a service",
    backToProjects: "Back to projects",
    npmInstall: "npm install",
    dockerComposeDown: "docker compose down",
    dev: "dev",
    npmRunDev: "npm run dev",
  },
  reviewSurface: {
    editReviewComment: "Edit review comment",
    deleteReviewComment: "Delete review comment",
    reviewComment: "Review comment",
    cancelReviewComment: "Cancel review comment",
    saveReviewComment: "Save review comment",
  },
  sidebarWorkspaceList: {
    workspacePathNotAvailable: "Workspace path not available",
    failedToHideWorkspace: "Failed to hide workspace",
    failedToRemoveSomeWorkspaces: "Failed to remove some workspaces",
  },
  desktopMenu: {
    edit: "Edit",
    view: "View",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    actualSize: "Actual Size",
    reload: "Reload",
    forceReload: "Force Reload",
    window: "Window",
    copy: "Copy",
    paste: "Paste",
    selectAll: "Select All",
  },
  desktopDialogs: { confirm: "Confirm", ok: "OK" },
  desktopMain: { inspectElement: "Inspect Element", notFound: "Not found" },
};
