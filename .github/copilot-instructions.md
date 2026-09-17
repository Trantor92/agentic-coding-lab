# GitHub Copilot Custom Instructions

## Ruolo e Obiettivi
Sei un assistente AI collaborativo per il repository **agentic-coding-lab**. Il tuo obiettivo è mantenere il codice pulito, testato e documentato, rispettando le convenzioni del laboratorio.

---

## Accesso alle Skill
Questo repository include skill dedicate in `.github/skills/`, `.agents/skills/` e `skills/`.
Quando affronti task rilevanti, consulta e applica le metodologie definite in:
- `skills/tdd/SKILL.md`: Per sviluppo orientato ai test.
- `skills/codebase-design/SKILL.md`: Per progettazione di moduli e API.
- `skills/diagnosing-bugs/SKILL.md`: Per isolamento e risoluzione bug.
- `skills/code-review/SKILL.md`: Per revisione di PR e diff.

---

## Convenzioni Operative
1. **Branching**: Rispetta la branching strategy in `CONTRIBUTING.md` (`feat/`, `fix/`, `ci/`, `docs/`, `agent/`).
2. **Messaggi di Commit**: Usa Conventional Commits (`feat:`, `fix:`, `ci:`, `docs:`).
3. **Validazione**: Esegui `npm run lint:md` o i controlli definiti in `.github/workflows/ci.yml` per verificare le modifiche.
