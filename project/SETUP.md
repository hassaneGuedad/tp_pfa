# Configuration de l'environnement

## Variables d'environnement requises

Créez un fichier `.env.local` dans le dossier `project/` avec les variables suivantes :

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Anthropic Claude API Key (OBLIGATOIRE)
CLAUDE_API_KEY=your_claude_api_key_here

# Netlify Configuration (optionnel)
NETLIFY_ACCESS_TOKEN=your_netlify_token_here
```

## Obtention de la clé API Claude

1. Allez sur [console.anthropic.com](https://console.anthropic.com)
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys"
4. Créez une nouvelle clé API
5. Copiez la clé et remplacez `your_claude_api_key_here` dans `.env.local`

## Redémarrage du serveur

Après avoir créé le fichier `.env.local`, redémarrez le serveur de développement :

```bash
npm run dev
```

## Vérification

Pour vérifier que tout fonctionne :

1. Ouvrez l'application dans le navigateur
2. Essayez de générer un plan avec un prompt
3. Vérifiez que les erreurs 500 ont disparu de la console 