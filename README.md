# agentic-coding-lab

Un laboratorio pubblico per studiare e sperimentare come strutturare una
repository di codice in cui **agenti AI (agentic coding)** collaborano
attivamente alla sua manutenzione: proponendo modifiche, aprendo pull
request, effettuando code review e mantenendo la documentazione, sotto la
supervisione di chi gestisce il repository.

## Obiettivo

Questo repository nasce pensato per essere configurato ed
evoluto direttamente con l'aiuto di GitHub Copilot (Copilot CLI / Copilot
coding agent), esplorando pattern come:

- istruzioni persistenti per gli agenti (`AGENTS.md`, `.github/copilot-instructions.md`)
- skill ingegneristiche e di produttività integrate e versionate (`skills/`, `.agents/skills/`, `.github/skills/`)
- workflow di collaborazione uomo-agente (issue, PR, code review automatizzata, Squash & Merge)
- convenzioni di progetto pensate per essere comprese e rispettate dagli agenti (`CONTRIBUTING.md`)
- automazioni per risoluzione automatica delle issue con agenti (`.github/workflows/agent-issue-resolver.yml`, `docs/agents/automation.md`)

## Skill Integrate & Riproducibilità

Il repository include le skill ingegneristiche di [mattpocock/skills](https://github.com/mattpocock/skills), gestite tramite il tool standard `skills.sh` e versionate direttamente nel codice sorgente:

- **Autonomia & Zero Config**: chiunque cloni o forki il repository ha le skill immediatamente disponibili per i propri agenti (GitHub Copilot, Claude Code, Cursor, Codex).
- **Tracciamento Versioni**: `skills-lock.json` traccia le versioni installate.
- **Aggiornamento & Sincronizzazione**:

  ```bash
  npm run skills:update  # Aggiorna le skill all'ultima versione
  npm run skills:sync    # Sincronizza le skill tra le cartelle degli agenti
  ```

## Automazioni & Risoluzione Issue

Il repository supporta la presa in carico e la risoluzione automatica delle issue:

- **Etichetta `ready-for-agent`**: applicando questa label a una issue, il workflow `.github/workflows/agent-issue-resolver.yml` assegna automaticamente il task a GitHub Copilot Coding Agent o notifica gli agenti via CLI.
- **Configurazione e Setup**: Consulta la guida dettagliata passo-passo in [`docs/agents/automation.md`](docs/agents/automation.md) per impostare i permessi di Actions, il secret `COPILOT_PAT` e le opzioni di Squash & Merge.

## Stato

🚧 In evoluzione — infrastruttura di base, CI/CD, branching strategy e catalogo skill configurati.

## Licenza

Distribuito con licenza [MIT](LICENSE).
