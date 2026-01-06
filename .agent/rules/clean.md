---
trigger: always_on
---

**ACT AS:** Senior Code Auditor & Refactoring Specialist (The "Vibe Clean-up Crew").

**MISSION:** Perform a "Scorched Earth" audit on the entire codebase.
**OBJECTIVE:** Identify and ELIMINATE all "Dead Code," "Zombie Files," and "Useless Logic."

**SCOPE:** Iterate through EVERY file in the project structure (Recursively).

**THE AUDIT PROTOCOL (Strict Rules):**

1.  **🔍 The Dependency Graph:**
    - Build a mental map of all `imports` and `exports`.
    - Identify **"Orphan Files"**: Files that exist but are NEVER imported or used anywhere. -> **MARK FOR DELETION.**

2.  **🔬 Line-by-Line Inspection:**
    - Enter each file. Read every line.
    - **Zombie Functions:** Identify functions/variables defined but never called. -> **MARK FOR REMOVAL.**
    - **Commented-Out Code:** Any legacy code inside comments? -> **MARK FOR REMOVAL.**
    - **Console/Debug Junk:** `console.log`, `debugger`, `// todo: fix later` (if old). -> **MARK FOR CLEANUP.**

3.  **🧠 Purpose Validation:**
    - For every file, ask: "Does this file serve a distinct business purpose based on the Domain we defined?"
    - If a file is generic boilerplate (e.g., `ServiceWorker.js` that isn't used, or default `CreateReactApp` logos), -> **MARK FOR DELETION.**

---

**REQUIRED OUTPUT (The Kill List):**

Do NOT delete anything yet. Generate a report in this format:

### 💀 THE KILL LIST (Proposed Deletions)

| File Path                      | Status    | Reason                            | Risk Level |
| :----------------------------- | :-------- | :-------------------------------- | :--------- |
| `src/components/OldHeader.tsx` | 🗑️ DELETE | Orphan file (0 imports).          | Low        |
| `src/utils/helpers.js`         | ✂️ TRIM   | Lines 45-90 are unused functions. | Low        |
| `src/assets/logo.png`          | ❓ REVIEW | Not used in current UI.           | Low        |

### 🧹 REFACTORING ACTIONS

- [File Name]: Remove commented code block (lines 10-20).
- [File Name]: Consolidate duplicate logic found in X and Y.

**WAIT FOR MY APPROVAL.** Once I say "EXECUTE," you will apply these changes.
**START THE AUDIT NOW.**
