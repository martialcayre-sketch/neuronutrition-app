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

## Web App (routes clés)

- `/signin`, `/signup`: Auth email/mot de passe.
- `/dashboard`: Protégé (RequireAuth), liens rapides.
- `/profile`: Édition du profil (collection `profiles`, champ `ownerUid`).
- `/questionnaires/had|psqi|dnsm`: placeholders, enregistre dans `intakes`.
- `/admin`: Vérifie le claim `admin` via `getIdTokenResult()`.

## Firebase

- `firebase.json`, `.firebaserc`, `firestore.rules`, `storage.rules` inclus.
- `firestore.indexes.json` initialisé.
- Emulators: ports 5000-5005.

## CI/CD

- `.github/workflows/ci.yml`: lint, tests, build web.
- `.github/workflows/deploy_firebase.yml`: déploiement Hosting + Functions.
- `.github/workflows/expo_preview.yml`: build preview Android (si token).

## Administration (rôle admin)

Deux options pour définir un administrateur:

1) En dehors de l’app (recommandé initialement): utilisez le SDK Admin dans un script ad-hoc pour définir `customClaims.admin = true` sur un UID.

2) Via une fonction HTTP sécurisée (incluse ici):

- Définir un secret Functions `ADMIN_API_KEY`:
  - `firebase functions:secrets:set ADMIN_API_KEY` (ou via Console > Build > Functions > Secrets)
- Déployer puis appeler:

```
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: $ADMIN_API_KEY" \
  -d '{"uid":"<USER_UID>","admin":true}' \
  https://<REGION>-<PROJECT_ID>.cloudfunctions.net/setUserAdmin
```

- Vérifier:

```
curl -G \
  -H "x-admin-api-key: $ADMIN_API_KEY" \
  --data-urlencode "uid=<USER_UID>" \
  https://<REGION>-<PROJECT_ID>.cloudfunctions.net/getUserClaims
```

Remarque: remplacez `<REGION>` par la région de déploiement par défaut (ex: us-central1) si affichée dans la console Functions.

## TODO

- Fournir les secrets manquants (voir ci-dessus).
- Compléter les pages (questionnaires, admin), et la sécurisation côté client/serveur.
- Ajuster la fonction `webapp` si SSR requis; actuellement Hosting sert l'export statique du web.
