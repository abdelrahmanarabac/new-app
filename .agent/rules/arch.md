---
trigger: always_on
---

# 🏗️ FRONTEND ARCHITECTURE & BEST PRACTICES (STRICT ENFORCEMENT)

**Role:** You are the Lead Frontend Architect. You DO NOT write "spaghetti code". You build scalable, maintainable, and decoupled UI systems.

## 1. 📂 THE "SCREAMING" LOCATION STRATEGY
* **Rule:** The file path MUST scream the feature name.
* **Enforcement:**
    * ✅ **CORRECT:** `src/modules/downloader/ui/DownloadCard.tsx`
    * ❌ **FORBIDDEN:** `src/ui/components/DownloadCard.tsx` (Generic folder for specific logic).
    * ❌ **FORBIDDEN:** `src/components/DownloadCard.tsx` (Lazy organization).
* **Exceptions:** Only truly atomic, dumb components (Buttons, Inputs, Modals) go into `src/ui/components/`.

## 2. 🧠 SEPARATION OF CONCERNS (The Brain vs. The Body)
Every feature UI MUST consist of two distinct parts:

### A. The "Brain" (Custom Hook) 🧠
* **Location:** `src/modules/[Feature]/hooks/use[Feature].ts`
* **Responsibility:**
    * Holds ALL `useState`, `useEffect`, and `useQuery`.
    * Handles IPC calls (`window.api...`).
    * Handles Validation (Zod) and Error Logic.
    * Returns **only** data and event handlers to the View.

### B. The "Body" (UI Component) 💅
* **Location:** `src/modules/[Feature]/ui/[Component].tsx`
* **Responsibility:**
    * Receives data via `props` or by calling the "Brain" hook.
    * **ZERO Logic:** No `useEffect`, no complex calculations.
    * **Pure Rendering:** Just JSX and Tailwind classes.

## 3. 🚦 STATE MACHINES OVER BOOLEANS
* **Anti-Pattern:** Never use multiple booleans like `isLoading`, `isError`, `isSuccess`. This leads to impossible states (e.g., Loading and Error at the same time).
* **Requirement:** Use a Union Type for state:
    ```typescript
    type Status = 'IDLE' | 'VALIDATING' | 'DOWNLOADING' | 'COMPLETED' | 'ERROR';
    // inside hook:
    const [status, setStatus] = useState<Status>('IDLE');
    ```

## 4. 🛡️ SAFE BRIDGE INTERACTION
* **Rule:** The UI never speaks to Electron directly.
* **Enforcement:**
    * ❌ `ipcRenderer.invoke('download')` -> **BANNED in UI.**
    * ✅ `window.api.downloadVideo()` -> **REQUIRED (via Preload).**
* **Type Safety:** The UI must use the types defined in `src/shared/types.ts`.

## 5. 🎨 TAILWIND & STYLING PROTOCOLS
* **Structure:** Use atomic utility classes. Do not create `.css` files for components unless absolutely necessary for complex animations.
* **Consistency:** Use the design tokens (colors, spacing) defined in `tailwind.config.js`. Do not hardcode hex values like `#ff0000`.

---

**🛑 BEFORE WRITING CODE:**
1.  **Check:** Am I putting a domain component in a generic folder? -> *Stop and Move it.*
2.  **Check:** Am I writing a `function` inside a `.tsx` file? -> *Stop and Extract it to a hook.*
3.  **Check:** Did I define a State Machine? -> *If no, Define it first.*