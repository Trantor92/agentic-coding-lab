# Linee Guida di Contribuzione e Branching Strategy

Benvenuto in **agentic-coding-lab**. Questo documento descrive le regole di collaborazione e la branching strategy adottata sia per sviluppatori umani che per agenti AI.

---

## 1. Branching Strategy: GitHub Flow

Adottiamo **GitHub Flow**, un modello leggero basato su rami a vita breve (short-lived feature branches) e Pull Request continue verso il ramo principale `main`.

### Ramo Principale (`main`)

- `main` è il ramo sorgente di verità: deve rimanere sempre stabile, funzionante e con CI verde.
- Nessun commit diretto su `main`: tutte le modifiche passano obbligatoriamente tramite Pull Request.

### Convenzioni di Naming dei Branch

Tutti i rami devono seguire la convenzione di prefisso:

| Prefisso | Scopo | Esempio |
| --- | --- | --- |
| `feat/` | Nuova funzionalità o modulo | `feat/agent-instructions` |
| `fix/` | Correzione di un bug o malfunzionamento | `fix/ci-action-trigger` |
| `ci/` | Modifiche a pipeline di CI/CD e automazioni | `ci/add-markdown-linter` |
| `docs/` | Modifiche alla documentazione | `docs/update-architecture` |
| `refactor/` | Refactoring del codice senza modifiche funzionali | `refactor/clean-templates` |
| `agent/` | Modifiche generate o gestite autonomamente da agenti | `agent/setup-instructions` |

---

## 2. Ciclo di Vita delle Modifiche (Workflow)

1. **Creazione del Branch**: Creare un branch a partire dall'ultimo `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b <prefisso>/<nome-descrittivo>
   ```

2. **Sviluppo e Test Locale**:
   - Effettuare modifiche atomiche e focalizzate.
   - Verificare che la sintassi di file Markdown, YAML e codice sorgente sia corretta prima di fare commit.

3. **Convenzioni dei Commit**:
   - Usare messaggi di commit chiari, preferibilmente in formato Conventional Commits:
     - `feat: ...`, `fix: ...`, `docs: ...`, `ci: ...`, `refactor: ...`

4. **Apertura Pull Request**:
   - Aprire una PR verso `main` compilando il template standard (`.github/PULL_REQUEST_TEMPLATE.md`).
   - Assicurarsi che tutti i check di CI siano verdi.

5. **Review e Merge**:
   - Eseguire review (umana o tramite subagente di code-review).
   - Eseguire il merge tramite **Squash and Merge** per mantenere una cronologia lineare e pulita su `main`.
   - Eliminare il branch dopo il merge.

---

## 3. Gestione delle Skill per Agenti

Le skill del repository sono collocate in `skills/` e distribuite in `.agents/skills/`, `.github/skills/` e `.claude/skills/`.

- Per aggiornare le skill: `npm run skills:update`
- Per sincronizzare le cartelle degli agenti: `npm run skills:sync`
- Per verificare la formattazione dei file Markdown: `npm run lint:md`
