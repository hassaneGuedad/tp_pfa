import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Send, Trash2, Download as DownloadIcon, X, Lightbulb } from 'lucide-react';
import {
  findFileByName,
  handleSearchCommand,
  formatSearchResults,
  handleExplainFile,
  handleCodeModification,
  isSearchCommand,
  isExplainCommand,
  extractFilenameFromExplain,
  extractQueryFromSearch,
  addUserMessage,
  addAssistantMessage,
  updateLastMessage,
} from '@/lib/chatbot-helpers';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotPanelProps {
  selectedFile: any;
  fileCode: string;
  onCodeUpdate: (code: string) => void;
  onClose: () => void;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  files?: { name: string; content: string }[];
}

export function ChatbotPanel({ selectedFile, fileCode, onCodeUpdate, onClose, chatHistory, setChatHistory, files }: ChatbotPanelProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    const chatDiv = document.getElementById('chatbot-messages');
    if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    const msg = input.trim();

    try {
      if (isSearchCommand(msg)) {
        const query = extractQueryFromSearch(msg);
        const result = await handleSearchCommand(query, files, selectedFile, fileCode);
        if (result.error) {
          setError(result.error);
          return;
        }
        addUserMessage(setChatHistory, msg);
        addAssistantMessage(setChatHistory, 'Recherche en cours...');
        const formatted = formatSearchResults(result.results || []);
        updateLastMessage(setChatHistory, formatted);
      } else if (isExplainCommand(msg)) {
        const filename = extractFilenameFromExplain(msg);
        if (!filename) {
          setError('Format invalide pour la commande explain.');
          return;
        }
        const fileToExplain = findFileByName(filename, files, selectedFile, fileCode);
        addUserMessage(setChatHistory, msg);
        addAssistantMessage(setChatHistory, `Analyse du fichier ${filename} en cours...`);
        if (!fileToExplain) {
          updateLastMessage(setChatHistory, `Fichier ${filename} introuvable dans le projet.`);
          return;
        }
        const result = await handleExplainFile(fileToExplain);
        const explanation = result.explanation || result.error || `Impossible d'obtenir une explication pour ${filename}.`;
        updateLastMessage(setChatHistory, explanation);
      } else {
        if (!selectedFile) {
          setError('Veuillez sélectionner un fichier à modifier.');
          return;
        }
        addUserMessage(setChatHistory, msg);
        const result = await handleCodeModification(fileCode, msg, selectedFile.name);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.modifiedCode) {
          addAssistantMessage(setChatHistory, result.modifiedCode);
          setPendingCode(result.modifiedCode);
        } else {
          setError('Aucune modification reçue.');
        }
      }
    } finally {
      setInput('');
      setPendingCode(null);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    chatHistory.forEach((msg, i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(msg.role === 'user' ? 'Utilisateur :' : 'Assistant :', 10, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(msg.content, 180);
      (lines as string[]).forEach((line: string) => {
        doc.text(line, 15, y);
        y += 6;
      });
      y += 4;
      if (y > 270 && i < chatHistory.length - 1) {
        doc.addPage();
        y = 10;
      }
    });
    doc.save('chatbot_historique.pdf');
  };

  return (
    <div className="fixed right-0 top-0 w-full max-w-md h-full bg-white/80 backdrop-blur-md shadow-2xl flex flex-col z-50 border-l border-gray-200 animate-slide-in">
      {/* Notification astuce */}
      {showTip && (
        <div className="relative border-b px-4 py-2 text-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
                <Lightbulb className="h-4 w-4" />
              </span>
              <span>
                <b>Astuce :</b> Demandez au chatbot d'expliquer un fichier ou de corriger du code, ex. <code>Explique moi le code de fichier App.tsx</code> ou <code>Corrige les erreurs dans ce code</code>.
              </span>
            </span>
            <button onClick={() => setShowTip(false)} className="ml-4 inline-flex items-center justify-center h-6 w-6 rounded-full text-blue-600 hover:text-red-500" aria-label="Fermer">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 ring-1 ring-blue-200">
            <img src="/img/cap_logo_chatbot.png" alt="Logo Chatbot Capgemini" className="w-7 h-7" />
          </span>
          <div>
            <h3 className="font-extrabold text-base tracking-tight">Chatbot Code Assistant</h3>
            <p className="text-xs text-gray-500">Explique, corrige et modifie votre code</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChatHistory([])}
            className="inline-flex items-center gap-1 text-gray-600 hover:text-red-600 text-xs border border-gray-200 rounded-md px-2 py-1"
            title="Vider l'historique"
          >
            <Trash2 className="h-3.5 w-3.5" /> Vider
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs border border-blue-200 rounded-md px-2 py-1"
            title="Exporter l'historique en PDF"
          >
            <DownloadIcon className="h-3.5 w-3.5" /> PDF
          </button>
          <button onClick={onClose} className="inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:text-red-500" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div id="chatbot-messages" className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-3">
          {chatHistory.map((msg, i) => (
            <li key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <ChatbotMessageMarkdown content={msg.content} />
                ) : (
                  <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                )}
              </div>
            </li>
          ))}

          {loading && (
            <li className="flex justify-start">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-2xl rounded-bl-sm p-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>L'assistant écrit...</span>
              </div>
            </li>
          )}

          {error && <li className="text-red-600 text-xs">{error}</li>}

          {/* Validation des changements */}
          {pendingCode && (() => {
            const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user');
            const isExplain = lastUserMsg && /(?:explique moi le code|explain file)/i.test(lastUserMsg.content);
            const isSearch = lastUserMsg && /\/search/i.test(lastUserMsg.content);
            if (isExplain || isSearch) return null;
            return (
              <li>
                <div className="border rounded-lg bg-white shadow-sm">
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <span className="text-sm font-semibold">Changements proposés</span>
                    <div className="text-xs text-gray-500">Vérifiez puis validez</div>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 rounded m-3 p-3 text-xs overflow-x-auto max-h-60">{pendingCode}</pre>
                  <div className="flex gap-2 px-3 pb-3">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      onClick={() => {
                        onCodeUpdate(pendingCode);
                        setPendingCode(null);
                      }}
                    >
                      Valider
                    </button>
                    <button
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                      onClick={() => setPendingCode(null)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </li>
            );
          })()}
        </ul>
      </div>
      <div className="p-4 border-t bg-white/60 backdrop-blur">
        <div className="flex items-end gap-2">
          <textarea
            className="flex-1 border rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Posez votre question, demandez une correction, utilisez /search <mot-clé> ou 'Explique moi le code de fichier <nom>'"
            disabled={loading}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow ${
              loading || !input.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Envoyer
          </button>
        </div>
        <div className="text-[11px] text-gray-500 mt-1">Entrée pour envoyer • Shift+Entrée pour nouvelle ligne</div>
      </div>
    </div>
  );
}

function ChatbotMessageMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1] : 'javascript';
          return !inline ? (
            <pre className={`language-${lang} bg-gray-900 text-gray-100 rounded-lg p-3 my-2 text-xs text-left overflow-x-auto`} style={{maxWidth: 380}}>
              <code dangerouslySetInnerHTML={{ __html: Prism.highlight(String(children), Prism.languages[lang] || Prism.languages.javascript, lang) }} />
            </pre>
          ) : (
            <code className={className} {...props}>{children}</code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default ChatbotPanel;
