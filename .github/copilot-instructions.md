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
3. **Glossario di Dominio**: Rispetta la terminologia definita in `CONTEXT.md`.
4. **Validazione**: Esegui `npm test` per verificare la struttura del repository, markdown e YAML.
5. **Merge Strategy**: Adotta e promuovi sempre **Squash and Merge** per l'integrazione delle Pull Request su `main`.
6. **Risoluzione Issue**: Quando prendi in carico issue contrassegnate con `ready-for-agent`, crea il branch `agent/issue-<numero>`, implementa la soluzione e apri una Pull Request collegata con `Closes #<numero>`.
