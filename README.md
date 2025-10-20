# neuronutrition-app

Monorepo (web + mobile + functions) avec Next.js, Expo, Firebase, Dev Container et CI/CD GitHub.

## Démarrage rapide

- Ouvrir dans VS Code et le Dev Container, ou exécuter localement Node LTS.
- Installer PNPM et Firebase CLI (auto dans le devcontainer).

### Commandes clés

```
# 1) Reset sécurisé (dry-run) puis réel
bash scripts/clean_and_bootstrap.sh
NUKE=YES bash scripts/clean_and_bootstrap.sh

# 2) Ouvrir en dev-container
code .
# (Reopen in Container)

# 3) Login Firebase local (si pas de token)
bash scripts/dev_login.sh

# 4) Lancer emulators + web
pnpm dev
firebase emulators:start

# 5) Mobile Android (Expo)
cd apps/mobile && pnpm i && npx expo start
```

## Environnement & Secrets

Ne pas commiter de credentials. Renseigner les variables:

- FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID
- (mobile) EXPO_PUBLIC_FIREBASE_* équivalentes si nécessaire

CI GitHub (Settings > Secrets and variables > Actions):

- FIREBASE_PROJECT_ID
- FIREBASE_TOKEN ou FIREBASE_SERVICE_ACCOUNT (JSON base64)
- EXPO_TOKEN (optionnel pour build Android preview)

## Structure

- apps/web: Next.js (App Router, TS, Tailwind)
- apps/mobile: Expo (React Native)
- functions: Firebase Functions (Node 20)
- .devcontainer: Container de dev VS Code

## Firebase

- `firebase.json`, `.firebaserc`, `firestore.rules`, `storage.rules` inclus.
- Emulators: ports 5000-5005.

## CI/CD

- `.github/workflows/ci.yml`: lint, tests, build web.
- `.github/workflows/deploy_firebase.yml`: déploiement Hosting + Functions.
- `.github/workflows/expo_preview.yml`: build preview Android (si token).

## TODO

- Fournir les secrets manquants (voir ci-dessus).
- Compléter les pages (questionnaires, admin), et la sécurisation côté client/serveur.
- Ajuster la fonction `webapp` si SSR requis; actuellement Hosting sert l'export statique du web.

