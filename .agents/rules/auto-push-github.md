# Regra: Envio Automático para GitHub (Deploy Vercel)

Sempre que o agente fizer alterações no projeto e concluir a tarefa solicitada pelo usuário:
1. Fazer `git add .` das alterações relevantes.
2. Criar um commit descritivo com `git commit -m "..."`.
3. Fazer `git push` para o repositório remoto (ex: `origin master` ou a branch ativa).
4. O objetivo é acionar o deploy automático na Vercel a cada alteração implementada.
