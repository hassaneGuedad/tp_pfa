// Custom hooks to reduce Dashboard component cognitive complexity
import { useState, useRef } from 'react';
import { ProjectFile } from '@/types';

export function useDashboardAuth() {
  const [isAuthenticated, isLoading, user] = [true, false, null]; // Placeholder
  return { isAuthenticated, isLoading, user };
}

export function useDashboardState() {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [planValidated, setPlanValidated] = useState(false);

  return {
    currentPrompt, setCurrentPrompt,
    generationStatus, setGenerationStatus,
    progress, setProgress,
    plan, setPlan,
    error, setError,
    planValidated, setPlanValidated,
  };
}

export function useDashboardFiles() {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [editorCode, setEditorCode] = useState<string>('');
  const [fileCode, setFileCode] = useState<string>('');
  const [openTabs, setOpenTabs] = useState<ProjectFile[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  return {
    files, setFiles,
    selectedFile, setSelectedFile,
    editorCode, setEditorCode,
    fileCode, setFileCode,
    openTabs, setOpenTabs,
    activeTab, setActiveTab,
    saveTimeout,
  };
}

export function useDashboardPanels() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isPlansPanelOpen, setIsPlansPanelOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isSupabasePanelOpen, setIsSupabasePanelOpen] = useState(false);
  const [isUMLPanelOpen, setIsUMLPanelOpen] = useState(false);
  const [isAuthorizedEmailsPanelOpen, setIsAuthorizedEmailsPanelOpen] = useState(false);

  return {
    isChatbotOpen, setIsChatbotOpen,
    isPlansPanelOpen, setIsPlansPanelOpen,
    isQuickActionsOpen, setIsQuickActionsOpen,
    isSupabasePanelOpen, setIsSupabasePanelOpen,
    isUMLPanelOpen, setIsUMLPanelOpen,
    isAuthorizedEmailsPanelOpen, setIsAuthorizedEmailsPanelOpen,
  };
}

export function useDashboardModals() {
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [githubRepoName, setGithubRepoName] = useState('');
  const [githubRepoPrivate, setGithubRepoPrivate] = useState(true);
  const [githubToken, setGithubToken] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubResult, setGithubResult] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  const [isNetlifyModalOpen, setIsNetlifyModalOpen] = useState(false);
  const [netlifyToken, setNetlifyToken] = useState('');
  const [netlifyLoading, setNetlifyLoading] = useState(false);
  const [netlifyResult, setNetlifyResult] = useState<string | null>(null);
  const [netlifyError, setNetlifyError] = useState<string | null>(null);

  return {
    isGitHubModalOpen, setIsGitHubModalOpen,
    githubRepoName, setGithubRepoName,
    githubRepoPrivate, setGithubRepoPrivate,
    githubToken, setGithubToken,
    githubLoading, setGithubLoading,
    githubResult, setGithubResult,
    githubError, setGithubError,
    isNetlifyModalOpen, setIsNetlifyModalOpen,
    netlifyToken, setNetlifyToken,
    netlifyLoading, setNetlifyLoading,
    netlifyResult, setNetlifyResult,
    netlifyError, setNetlifyError,
  };
}

export function useDashboardUI() {
  const [planDrafts, setPlanDrafts] = useState<any[]>([]);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ file: ProjectFile | null; open: boolean }>({ file: null, open: false });
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  return {
    planDrafts, setPlanDrafts,
    draftToDelete, setDraftToDelete,
    search, setSearch,
    sortDesc, setSortDesc,
    page, setPage,
    previewError, setPreviewError,
    deleteConfirm, setDeleteConfirm,
    currentPlanId, setCurrentPlanId,
    showFullPrompt, setShowFullPrompt,
    chatHistory, setChatHistory,
  };
}
