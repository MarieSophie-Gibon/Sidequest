# SideQuest

Fiche de personnage pour D&D 5e et Pathfinder 1e.

## Installer l'application

SideQuest s'installe comme une application : elle s'ouvre dans sa propre fenêtre, sans onglets ni barre d'adresse, avec son icône sur l'écran d'accueil ou dans le menu Démarrer.

### Version desktop

L'installation fonctionne avec **Chrome** et **Edge**. Firefox ne permet pas d'installer un site comme application : utilisez Chrome ou Edge uniquement pour SideQuest.

- **Chrome** : menu **⋮** → **Caster, enregistrer et partager** → **Installer la page en tant qu'application…**
  (ou l'icône d'installation à droite de la barre d'adresse). Si seul **Créer un raccourci…** est proposé, choisissez-le et cochez **Ouvrir dans une fenêtre**.
- **Edge** : menu **⋯** → **Applications** → **Installer ce site en tant qu'application**.

La fenêtre de l'application prend automatiquement le format d'un téléphone (430 × 900). Si vous la redimensionnez, la nouvelle taille est conservée.

**Sans installation**, un raccourci Windows donne le même résultat. Créez un raccourci avec comme emplacement :

```
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=https://ADRESSE-DE-SIDEQUEST --window-size=430,932
```

### Version mobile

- **iPhone / iPad (Safari)** : ouvrir SideQuest, toucher **Partager** puis **Sur l'écran d'accueil**.
- **Android (Chrome)** : ouvrir SideQuest, menu **⋮** puis **Installer l'application** (ou **Ajouter à l'écran d'accueil**).

L'application s'ouvre en plein écran, comme une application native.

## Développement

```bash
npm install
npm run dev        # serveur local sur http://localhost:5173
npm test           # tests (règles Pathfinder, artisanat…)
npm run db:new nom # nouvelle migration Supabase
npm run db:push    # applique les migrations sur la base distante
```

## Template Vite (React + TypeScript)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
