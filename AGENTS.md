# Agent Guidelines & Skills Index

Questo documento definisce le linee guida operative per gli agenti AI che collaborano su **agentic-coding-lab**.

---

## 1. Architettura delle Skill

Il repository include le **Engineering & Productivity Skills** (originate da `mattpocock/skills`) versionate direttamente nel repository:

- Cartella sorgente principale: `skills/`
- Directory per agenti: `.agents/skills/`, `.github/skills/`, `.claude/skills/`
- Tracciamento versioni: `skills-lock.json`

### Skill Principali Disponibili

#### Ingegneria del Software

- **`tdd`** (`skills/tdd/SKILL.md`): Sviluppo guidato dai test con ciclo red-green-refactor a fette verticali.
- **`codebase-design`** (`skills/codebase-design/SKILL.md`): Principi di progettazione per moduli profondi e interfacce pulite.
- **`diagnosing-bugs`** (`skills/diagnosing-bugs/SKILL.md`): Loop di diagnosi e debugging disciplinato.
- **`code-review`** (`skills/code-review/SKILL.md`): Revisione del codice su due assi (Standards & Spec).
- **`resolving-merge-conflicts`** (`skills/resolving-merge-conflicts/SKILL.md`): Risoluzione metodica dei conflitti git.
- **`improve-codebase-architecture`** (`skills/improve-codebase-architecture/SKILL.md`): Scansione e miglioramento dell'architettura.

#### Allineamento e Produttività

- **`grill-with-docs`** (`skills/grill-with-docs/SKILL.md`): Intervista per chiarire piani e generare documentazione di dominio/ADR.
- **`domain-modeling`** (`skills/domain-modeling/SKILL.md`): Definizione e mantenimento del vocabolario di dominio (`CONTEXT.md`).
- **`to-spec`** / **`to-tickets`** (`skills/to-spec/SKILL.md`, `skills/to-tickets/SKILL.md`): Decomposizione di specifiche in task eseguibili.
- **`writing-for-agents`** (`skills/writing-for-agents/SKILL.md`): Linee guida per la scrittura di documentazione orientata agli agenti.

---

## 2. Regole di Esecuzione per gli Agenti

1. **Branching Strategy**: Seguire sempre **GitHub Flow** descritto in `CONTRIBUTING.md`. Non committare direttamente su `main`.
2. **Consultazione delle Skill**: Prima di implementare funzionalità complesse o refactoring, consultare i file `SKILL.md` pertinenti.
3. **Verifica Locale**: Eseguire `npm test` o i linter prima di considerare completato un task.
