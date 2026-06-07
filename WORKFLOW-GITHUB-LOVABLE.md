# Workflow Híbrido: GitHub + Lovable Publish

> Este projeto usa o fluxo **Caminho C** — versionamento via GitHub, hospedagem via Lovable.

---

## Por que este caminho?

- ✅ **Preview e Publish do Lovable continuam funcionando** normalmente
- ✅ **Código versionado no GitHub** com histórico de commits
- ✅ **Deploy automático** a cada "Publish" no Lovable
- ✅ **Pode editar localmente** ou no Lovable — sync bidirecional
- ✅ **Banco Supabase funciona em qualquer host** — não muda nada

---

## Passo 1: Conectar ao GitHub (ação única)

1. No editor do Lovable, clique no **menu Plus (+)** no canto inferior esquerdo do chat
2. Selecione **GitHub → Connect project**
3. Autorize o **Lovable GitHub App** na sua conta GitHub
4. Escolha a conta/organização onde o repositório será criado
5. Clique em **Create Repository** — o Lovable cria o repo e faz push do código atual

> ⚠️ **Importante:** Não crie o repositório manualmente no GitHub. Deixe o Lovable criar para garantir a configuração correta do sync bidirecional.

---

## Passo 2: Fluxo de trabalho diário

### Editando no Lovable

1. Faça alterações no editor do Lovable
2. O Lovable **commita automaticamente** no GitHub (branch principal)
3. Para publicar, clique em **Publish** — o site fica disponível em:
   - `https://corretor-key-hub.lovable.app`

### Editando localmente / via GitHub

1. Clone o repositório: `git clone <url-do-repo-github>`
2. Faça alterações no seu IDE favorito
3. Commit e push: `git push origin main`
4. O Lovable **recebe as alterações automaticamente** em até alguns segundos
5. Verifique o preview no Lovable para confirmar

---

## Passo 3: Publicar (deploy)

Sempre use o botão **Publish** no Lovable:

- **Desktop:** canto superior direito do editor
- **Mobile:** canto inferior direito no modo Preview

Isso gera o build otimizado para Cloudflare Workers e publica em:
`https://corretor-key-hub.lovable.app`

> Não tente fazer deploy na Vercel com este código — o build target é Cloudflare Workers.

---

## Passo 4: Domínio customizado (opcional)

1. Publique o projeto pelo menos uma vez
2. Vá em **Project Settings → Domains**
3. Adicione seu domínio próprio
4. Siga as instruções de DNS

---

## Estrutura do projeto (para referência)

```
src/
  routes/           # Rotas do TanStack Start (file-based routing)
  components/       # Componentes reutilizáveis
  lib/              # Server functions (createServerFn)
  hooks/            # Custom React hooks
  integrations/     # Supabase, Lovable, etc.
  styles.css        # Design tokens Tailwind
public/             # Assets estáticos
vite.config.ts      # Configuração de build (Cloudflare Workers)
wrangler.jsonc      # Configuração do Worker
```

---

## Variáveis de ambiente

Estas já estão configuradas automaticamente pelo Lovable Cloud:

| Variável | Escopo | Uso |
|----------|--------|-----|
| `VITE_SUPABASE_URL` | Cliente + Servidor | URL do backend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Cliente + Servidor | Chave pública Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor apenas | Operações administrativas |
| `LOVABLE_API_KEY` | Servidor apenas | Recursos de IA do Lovable |

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Sync GitHub não aparece | Verifique se autorizou o Lovable GitHub App com acesso ao repo |
| Alterações locais não aparecem no Lovable | Aguarde 10-30 segundos; verifique a aba Code Editor |
| Build falha no Lovable | Verifique se não há erros de TypeScript (`bun run build` localmente) |
| Preview quebra após push | Verifique console do navegador; pode ser divergência de estado localStorage |
