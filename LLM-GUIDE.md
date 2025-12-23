# 🤖 LLM (Language Models) - Guide Complet

## 📌 Vue d'Ensemble

**LLM** = **Language Learning Model** (Modèles de Langage)

Ce projet utilise une **architecture modulaire d'accès à plusieurs modèles d'IA**:
- 🔵 **Claude 3.5 Sonnet** (Anthropic) - Pour la planification
- 🟠 **DeepSeek** - Pour la génération de code
- ✅ Extensible pour ajouter d'autres fournisseurs

**Localisation:** `project/lib/modules/llm/`

---

## 🏗️ Architecture LLM

```
┌────────────────────────────────────────────┐
│        Application Next.js                  │
├────────────────────────────────────────────┤
│  PromptAgent  │  CodeAgent  │  ChatbotPanel│
└────────────────────────────────────────────┘
                  ↓
        ┌─────────────────────┐
        │   LLMManager        │
        │  (Singleton)        │
        └─────────────────────┘
                  ↓
    ┌─────────────┬──────────────┐
    ↓             ↓              ↓
┌─────────┐ ┌──────────┐ ┌──────────────┐
│Anthropic│ │ DeepSeek │ │Other Provider│
│Provider │ │ Provider │ │(extensible) │
└─────────┘ └──────────┘ └──────────────┘
    ↓             ↓              ↓
┌─────────┐ ┌──────────┐ ┌──────────────┐
│Claude   │ │DeepSeek  │ │Future Models │
│Models   │ │Models    │ │(GPT, etc)    │
└─────────┘ └──────────┘ └──────────────┘
```

---

## 📂 Structure des Fichiers

```
lib/modules/llm/
├── types.ts                    # Types TypeScript
├── manager.ts                  # 🎯 Gestionnaire central (Singleton)
├── base-provider.ts            # Classe abstraite pour les fournisseurs
├── anthropic-provider.ts       # Fournisseur Anthropic (Claude)
└── providers/
    ├── anthropic.ts            # Implémentation Anthropic
    └── deepseek.ts             # Implémentation DeepSeek
```

---

## 🎯 Composant Central: LLMManager

### Qu'est-ce que LLMManager?

**LLMManager** est un **gestionnaire centralisé** qui :
- 🔑 Gère toutes les clés API
- 📦 Enregistre les fournisseurs (Anthropic, DeepSeek, etc.)
- 🔄 Route les requêtes vers le bon fournisseur
- 📋 Maintient une liste de tous les modèles disponibles
- 🎛️ Crée des instances de modèles

### Pattern: Singleton

```typescript
// Toujours une seule instance dans toute l'application
const manager = LLMManager.getInstance();
```

**Avantage:** Pas de duplication, gestion centralisée

### API Principale

```typescript
// 1. Récupérer le gestionnaire (Singleton)
const manager = LLMManager.getInstance();

// 2. Enregistrer un fournisseur
manager.registerProvider(new CustomProvider());

// 3. Obtenir tous les modèles
const models = manager.getModelList();
// Résultat: [
//   { name: 'claude-3-5-sonnet', label: 'Claude 3.5', provider: 'Anthropic' },
//   { name: 'deepseek-chat', label: 'DeepSeek Chat', provider: 'DeepSeek' }
// ]

// 4. Appeler un modèle
const response = await manager.callModel(
  'Anthropic',              // Fournisseur
  'claude-3-5-sonnet-latest', // Modèle
  'Bonjour, qui es-tu?',   // Prompt
  'Tu es un assistant IA'  // Système (optionnel)
);
```

### Code Détaillé

```typescript
export class LLMManager {
  // Instance unique (Singleton)
  private static _instance: LLMManager;
  
  // Map des fournisseurs
  private _providers: Map<string, BaseProvider> = new Map();
  
  // Liste consolidée des modèles
  private _modelList: ModelInfo[] = [];

  /**
   * Récupère l'instance unique
   */
  static getInstance(): LLMManager {
    if (!LLMManager._instance) {
      LLMManager._instance = new LLMManager();
    }
    return LLMManager._instance;
  }

  /**
   * Initialise les fournisseurs par défaut
   */
  private _registerProviders() {
    this.registerProvider(new AnthropicProvider());
    this.registerProvider(new DeepseekProvider());
  }

  /**
   * Enregistre un fournisseur
   */
  registerProvider(provider: BaseProvider) {
    if (this._providers.has(provider.name)) {
      console.warn(`${provider.name} already registered`);
      return;
    }
    this._providers.set(provider.name, provider);
    this._modelList = [...this._modelList, ...provider.staticModels];
  }

  /**
   * Appelle un modèle
   */
  async callModel(
    providerName: string,
    modelName: string,
    prompt: string,
    system?: string
  ): Promise<string> {
    const modelInstance = await this.getModelInstance(providerName, modelName);
    return await modelInstance.generate(prompt, system);
  }
}
```

---

## 📦 Fournisseurs: Anthropic vs DeepSeek

### 1️⃣ Anthropic Provider (Claude)

**Fichier:** `anthropic-provider.ts`

#### Modèles Disponibles

```typescript
staticModels = [
  {
    name: 'claude-3-5-sonnet-latest',
    label: 'Claude 3.5 Sonnet (latest)',
    provider: 'Anthropic',
    maxTokenAllowed: 8000,
  },
  {
    name: 'claude-3-5-haiku-latest',
    label: 'Claude 3.5 Haiku (latest)',
    provider: 'Anthropic',
    maxTokenAllowed: 8000,
  },
  // ... autres modèles
]
```

#### Configuration

```typescript
config = {
  apiTokenKey: 'CLAUDE_API_KEY',  // Variable d'environnement
};

getApiKeyLink = 'https://console.anthropic.com/settings/keys';
```

#### Appel API

```typescript
async generate(prompt: string, system?: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 2048,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  return data.content[0].text;  // Réponse générale
}
```

#### Utilisation dans le Projet

```typescript
// PromptAgent utilise Claude pour la planification
const plan = await manager.callModel(
  'Anthropic',
  'claude-3-5-sonnet-latest',
  "Je veux une app e-commerce",
  "Tu es un architecte logiciel expert..."
);
```

---

### 2️⃣ DeepSeek Provider

**Fichier:** `providers/deepseek.ts`

#### Modèles Disponibles

```typescript
staticModels: ModelInfo[] = [
  {
    name: 'deepseek-chat',
    label: 'DeepSeek Chat',
    provider: 'DeepSeek',
    maxTokenAllowed: 8000,
  },
  {
    name: 'deepseek-coder',
    label: 'DeepSeek Coder',
    provider: 'DeepSeek',
    maxTokenAllowed: 8000,
  },
];
```

#### Configuration

```typescript
config = {
  apiTokenKey: 'DEEPSEEK_API_KEY',  // Variable d'environnement
};

getApiKeyLink = 'https://platform.deepseek.com/console/api-keys';
```

#### Appel API

```typescript
async generateText({
  prompt,
  model = 'deepseek-chat',
  apiKey,
  system
}: {
  prompt: string;
  model?: string;
  apiKey: string;
  system?: string;
}): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;  // Réponse générée
}
```

#### Utilisation dans le Projet

```typescript
// CodeAgent utilise DeepSeek pour la génération de code
const code = await manager.callModel(
  'DeepSeek',
  'deepseek-coder',
  "Génère un composant React Button avec Tailwind CSS",
  "Tu es un expert en React..."
);
```

---

## 🔑 Clés API et Variables d'Environnement

### Configuration

**Fichier:** `.env.local` (à créer)

```bash
# Anthropic (Claude)
CLAUDE_API_KEY=sk-ant-v0-xxxxxxxxxxxxx

# DeepSeek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxx
```

### Comment obtenir les clés

#### 1. Claude (Anthropic)
1. Aller à: https://console.anthropic.com/settings/keys
2. Créer une nouvelle clé
3. Copier la clé
4. Ajouter à `.env.local`: `CLAUDE_API_KEY=sk-ant-...`

#### 2. DeepSeek
1. Aller à: https://platform.deepseek.com/console/api-keys
2. Créer une nouvelle clé
3. Copier la clé
4. Ajouter à `.env.local`: `DEEPSEEK_API_KEY=sk-...`

---

## 📋 Différences: Claude vs DeepSeek

| Aspect | Claude 3.5 | DeepSeek |
|--------|-----------|----------|
| **Spécialité** | Planification, analyse | Génération de code |
| **Vitesse** | Moyenne-rapide | Rapide |
| **Coût** | Modéré | Très bon marché |
| **Qualité Code** | Bonne | Excellente |
| **Modèles Dynamiques** | ✅ API pour lister | ❌ Statiques seulement |
| **Max Tokens** | 8000+ | 8000 |

### Quand utiliser?

```typescript
// Planification, architecture → Claude
const plan = await callModel('Anthropic', 'claude-3-5-sonnet-latest', prompt, system);

// Génération de code → DeepSeek
const code = await callModel('DeepSeek', 'deepseek-coder', prompt, system);

// Chat/Questions → Claude
const answer = await callModel('Anthropic', 'claude-3-5-haiku-latest', prompt);
```

---

## 💻 Exemple Complet: Utiliser LLM

### Scénario: Générer un Plan de Projet

```typescript
import { LLMManager } from '@/lib/modules/llm/manager';

async function createProject(userDescription: string) {
  // 1. Obtenir le gestionnaire
  const manager = LLMManager.getInstance();

  // 2. Définir le prompt système
  const systemPrompt = `
    Tu es un architecte logiciel expert.
    Analyse la description et crée un plan détaillé en JSON.
    Inclus: stack, features, architecture, steps, files
  `;

  try {
    // 3. Appeler Claude pour obtenir le plan
    const planText = await manager.callModel(
      'Anthropic',                    // Fournisseur
      'claude-3-5-sonnet-latest',     // Modèle
      `Crée un plan pour: ${userDescription}`,  // Prompt
      systemPrompt                    // Système
    );

    // 4. Parser le JSON
    const plan = JSON.parse(planText);

    // 5. Pour chaque fichier du plan, appeler DeepSeek
    const generatedFiles = [];
    for (const file of plan.files) {
      const code = await manager.callModel(
        'DeepSeek',           // Fournisseur
        'deepseek-coder',     // Modèle
        `Génère le code pour: ${file.description}`,
        'Tu es un expert en code'
      );

      generatedFiles.push({
        path: file.path,
        content: code
      });
    }

    return {
      plan,
      generatedFiles
    };
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
}

// Utilisation
const project = await createProject(
  'Application de chat avec Firebase et React'
);
```

---

## 🏗️ BaseProvider: Créer un Nouveau Fournisseur

### Comment ajouter OpenAI?

```typescript
// lib/modules/llm/providers/openai.ts

import { BaseProvider } from '../base-provider';
import type { ModelInfo } from '../types';

export default class OpenAIProvider extends BaseProvider {
  name = 'OpenAI';
  getApiKeyLink = 'https://platform.openai.com/api-keys';

  config = {
    apiTokenKey: 'OPENAI_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'gpt-4-turbo',
      label: 'GPT-4 Turbo',
      provider: 'OpenAI',
      maxTokenAllowed: 128000,
    },
    {
      name: 'gpt-3.5-turbo',
      label: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      maxTokenAllowed: 4096,
    },
  ];

  async getDynamicModels(): Promise<ModelInfo[]> {
    // Optionnel: récupérer les modèles dynamiquement
    return this.staticModels;
  }

  getModelInstance(options: { model: string; serverEnv?: any; apiKeys?: Record<string, string> }) {
    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys: options.apiKeys,
      serverEnv: options.serverEnv,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'OPENAI_API_KEY',
    });

    return {
      async generate(prompt: string, system?: string) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: options.model,
            max_tokens: 2048,
            messages: [
              ...(system ? [{ role: 'system', content: system }] : []),
              { role: 'user', content: prompt }
            ]
          })
        });

        const data = await response.json();
        return data.choices[0].message.content;
      }
    };
  }
}
```

### Enregistrer le nouveau fournisseur

```typescript
// lib/modules/llm/manager.ts

private _registerProviders() {
  this.registerProvider(new AnthropicProvider());
  this.registerProvider(new DeepseekProvider());
  this.registerProvider(new OpenAIProvider());  // ✅ Ajouter ici
}
```

---

## 🔄 Flux Complet: De l'Agent au Modèle

```
User Input
    ↓
"Génère une app"
    ↓
PromptAgent()
    ├─ Construit un prompt système
    ├─ Appelle manager.callModel('Anthropic', 'claude-3-5-sonnet', prompt, system)
    │
    └─ LLMManager.callModel()
        ├─ getModelInstance('Anthropic', 'claude-3-5-sonnet')
        │   └─ Récupère apiKey depuis process.env.CLAUDE_API_KEY
        │
        └─ modelInstance.generate(prompt, system)
            ├─ Construit la requête HTTP
            ├─ Envoie à https://api.anthropic.com/v1/messages
            ├─ Reçoit la réponse JSON
            └─ Retourne data.content[0].text
    ↓
Plan structuré reçu
    ↓
CodeAgent()
    ├─ Pour chaque fichier du plan
    ├─ Appelle manager.callModel('DeepSeek', 'deepseek-coder', prompt, system)
    │
    └─ LLMManager.callModel()
        ├─ getModelInstance('DeepSeek', 'deepseek-coder')
        │   └─ Récupère apiKey depuis process.env.DEEPSEEK_API_KEY
        │
        └─ modelInstance.generate(prompt, system)
            ├─ Construit la requête HTTP
            ├─ Envoie à https://api.deepseek.com/v1/chat/completions
            ├─ Reçoit la réponse JSON
            └─ Retourne data.choices[0].message.content
    ↓
Code généré ✅
```

---

## ⚙️ Types TypeScript

```typescript
// lib/modules/llm/types.ts

export interface ModelInfo {
  name: string;              // 'claude-3-5-sonnet-latest'
  label: string;             // 'Claude 3.5 Sonnet (latest)'
  provider: string;          // 'Anthropic'
  maxTokenAllowed: number;   // 8000
}

export interface ProviderInfo {
  name: string;              // 'Anthropic'
  staticModels: ModelInfo[];
  config: ProviderConfig;
  getApiKeyLink?: string;
  labelForGetApiKey?: string;
}

export interface ProviderConfig {
  apiTokenKey: string;       // 'CLAUDE_API_KEY'
  baseUrlKey?: string;
  baseUrl?: string;
}
```

---

## 🚨 Gestion des Erreurs

```typescript
async function safeCallModel(
  provider: string,
  model: string,
  prompt: string
): Promise<string | null> {
  try {
    const manager = LLMManager.getInstance();
    return await manager.callModel(provider, model, prompt);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('❌ Clé API manquante ou invalide');
      } else if (error.message.includes('401')) {
        console.error('❌ Authentification échouée');
      } else if (error.message.includes('429')) {
        console.error('❌ Trop de requêtes (rate limit)');
      } else {
        console.error('❌ Erreur:', error.message);
      }
    }
    return null;
  }
}
```

---

## 📊 Tableau Récapitulatif

| Élément | Détail |
|--------|--------|
| **Architecture** | Gestionnaire centralisé (Singleton) + Fournisseurs modulaires |
| **Fournisseurs** | Anthropic (Claude), DeepSeek, extensible |
| **Cas d'Utilisation** | Planification, génération de code, chat, analyse |
| **Sécurité** | Clés API dans .env.local (jamais en dur) |
| **Extensibilité** | Ajouter nouveaux fournisseurs via BaseProvider |
| **Pattern** | Singleton + Abstract Factory + Strategy |

---

## 🎯 Points Clés

✅ **À FAIRE:**
- Utiliser LLMManager.getInstance() pour accéder au gestionnaire
- Configurer les clés API dans .env.local
- Utiliser Claude pour la planification/analyse
- Utiliser DeepSeek pour la génération de code
- Gérer les erreurs d'authentification

❌ **À ÉVITER:**
- Ne pas mettre les clés API en dur dans le code
- Ne pas créer plusieurs instances de LLMManager
- Ne pas oublier les messages système (system prompt)
- Ne pas ignorer les limites de tokens

---

## 🔗 Ressources

- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [DeepSeek API Docs](https://api-docs.deepseek.com/)
- [Pattern Singleton](https://refactoring.guru/design-patterns/singleton)

