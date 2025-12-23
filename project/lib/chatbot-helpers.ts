// Helper functions to reduce cognitive complexity in ChatbotPanel
// Extracted to maintain code organization and reduce cyclomatic complexity

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FileRef {
  name: string;
  content: string;
}

// Normalize and find file by name with case-insensitive matching
export function findFileByName(
  filename: string,
  files?: FileRef[],
  selectedFile?: any,
  fileCode?: string
): FileRef | null {
  const userInput = filename.replace(/\\/g, '/').replace(/^\.\/?/, '').toLowerCase();

  if (files?.length) {
    const matches = files.filter(f => {
      const norm = f.name.replace(/\\/g, '/').replace(/^\.\/?/, '').toLowerCase();
      return norm === userInput || norm.endsWith('/' + userInput) || norm.endsWith(userInput);
    });
    if (matches.length > 0) {
      return matches.reduce((a, b) => (a.name.length <= b.name.length ? a : b));
    }
  }

  if (selectedFile && fileCode) {
    const selectedNorm = selectedFile.name.replace(/\\/g, '/').replace(/^\.\/?/, '').toLowerCase();
    if (selectedNorm.endsWith(userInput) || selectedNorm === userInput) {
      return { name: selectedFile.name, content: fileCode };
    }
  }

  return null;
}

// Handle /search command
export async function handleSearchCommand(
  query: string,
  files?: FileRef[],
  selectedFile?: any,
  fileCode?: string
): Promise<{ error?: string; results?: any[] }> {
  if (!query) {
    return { error: 'Veuillez préciser un mot-clé à rechercher.' };
  }

  try {
    const filesToSend = files || (selectedFile ? [{ name: selectedFile.name, content: fileCode }] : undefined);
    const res = await fetch('/api/code-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, files: filesToSend }),
    });
    const data = await res.json();
    return { results: data.results || [] };
  } catch (e) {
    return { error: 'Erreur lors de la recherche.' };
  }
}

// Format search results for display
export function formatSearchResults(results: any[]): string {
  if (!results?.length) return 'Aucun résultat trouvé.';
  return results
    .map(r => `Fichier : ${r.file} (ligne ${r.startLine})\n\n\`\`\`javascript\n${r.snippet}\n\`\`\`\n`)
    .join('\n\n');
}

// Handle file explanation
export async function handleExplainFile(fileToExplain: FileRef): Promise<{ explanation?: string; error?: string }> {
  try {
    const res = await fetch('/api/explain-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: fileToExplain.name,
        content: fileToExplain.content,
        useCloud: true,
      }),
    });
    const data = await res.json();
    return { explanation: data.explanation };
  } catch (e) {
    return { error: `Erreur lors de l'explication du fichier ${fileToExplain.name}.` };
  }
}

// Handle code modification request
export async function handleCodeModification(
  fileCode: string,
  instruction: string,
  selectedFileName: string
): Promise<{ modifiedCode?: string; error?: string }> {
  try {
    const res = await fetch('/api/chatbot-modify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: fileCode,
        instruction,
        filename: selectedFileName,
      }),
    });
    const data = await res.json();
    return { modifiedCode: data.modifiedCode };
  } catch (e) {
    return { error: 'Erreur lors de la communication avec le chatbot.' };
  }
}

// Check if message is a search command
export function isSearchCommand(msg: string): boolean {
  return msg.trim().toLowerCase().startsWith('/search');
}

// Check if message is an explain file request
export function isExplainCommand(msg: string): boolean {
  return /(?:explique moi le code de fichier|explain file)\s+([\w.-]+)/i.test(msg);
}

// Extract filename from explain command
export function extractFilenameFromExplain(msg: string): string | null {
  const match = msg.match(/(?:explique moi le code de fichier|explain file)\s+([\w.-]+)/i);
  return match?.[1] || null;
}

// Extract query from search command
export function extractQueryFromSearch(msg: string): string {
  return msg.replace(/^\/search/i, '').trim();
}

// Update chat history safely
export function addUserMessage(setChatHistory: any, content: string): void {
  setChatHistory((prev: ChatMessage[]) => [...prev, { role: 'user', content }]);
}

export function addAssistantMessage(setChatHistory: any, content: string): void {
  setChatHistory((prev: ChatMessage[]) => [...prev, { role: 'assistant', content }]);
}

export function updateLastMessage(setChatHistory: any, content: string): void {
  setChatHistory((prev: ChatMessage[]) => [...prev.slice(0, -1), { role: 'assistant', content }]);
}
