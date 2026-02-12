Proteção de Branch: main
========================

Objetivo
- Garantir qualidade e segurança no fluxo de mudanças.

Configuração no GitHub
- Vá em Settings → Branches → Branch protection rules → Add rule.
- Preencha:
  - Branch name pattern: main
  - Require a pull request before merging
  - Require status checks to pass before merging
    - Marque “CI” (workflow .github/workflows/ci.yml)
  - Require linear history
  - Include administrators (opcional)
  - Desmarcar “Allow force pushes” e “Allow deletions”

Dicas
- Combine com Code Owners para revisão obrigatória.
- Use rótulos em PRs para identificar mudanças (feature, fix, chore).
