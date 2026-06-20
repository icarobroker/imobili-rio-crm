# Deploy no Vercel - Imobiliário CRM

Este projeto foi originalmente criado com **Lovable + TanStack Start** para **Cloudflare Workers**, mas foi adaptado para funcionar com **Vercel**.

## Alterações Realizadas

### 1. **vercel.json**
Arquivo de configuração do Vercel que define:
- Build command: `npm run build`
- Output directory: `dist/client` (arquivos estáticos)
- Runtime: Node.js 20.x
- Rewrite de todas as rotas para a função serverless

### 2. **api/server.js**
Função serverless que:
- Importa o handler do servidor compilado (`dist/server/server.js`)
- Converte requisições Node.js para Web API Requests
- Processa a requisição através do TanStack Start
- Retorna a resposta ao cliente

### 3. **.vercelignore**
Arquivo que otimiza o deploy excluindo arquivos desnecessários.

### 4. **.gitignore**
Atualizado para incluir `.vercel` e remover referências ao Cloudflare Wrangler.

## Como Fazer Deploy no Vercel

### Opção 1: Via CLI do Vercel (Recomendado)

```bash
# 1. Instale a CLI do Vercel (se não tiver)
npm i -g vercel

# 2. Faça login
vercel login

# 3. Deploy
vercel

# 4. Para produção
vercel --prod
```

### Opção 2: Via GitHub (Recomendado para CI/CD)

1. Faça push do código para o GitHub:
```bash
git add .
git commit -m "feat: adapt project for Vercel deployment"
git push origin main
```

2. No painel do Vercel (https://vercel.com):
   - Clique em "Add New..." → "Project"
   - Selecione o repositório `imobili-rio-crm`
   - Vercel detectará automaticamente a configuração
   - Clique em "Deploy"

3. Configure as variáveis de ambiente no Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (opcional, apenas para server-side)

### Opção 3: Via Vercel Dashboard

1. Acesse https://vercel.com/dashboard
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Vercel detectará automaticamente:
   - Build Command: `npm run build`
   - Output Directory: `dist/client`
5. Configure as variáveis de ambiente
6. Clique em "Deploy"

## Variáveis de Ambiente

Adicione estas variáveis no painel do Vercel (Project Settings → Environment Variables):

| Variável | Valor | Escopo |
|----------|-------|--------|
| `VITE_SUPABASE_URL` | URL do seu projeto Supabase | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública do Supabase | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (opcional) | Production |

**Onde encontrar essas chaves:**
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em Settings → API
4. Copie `Project URL` e `anon public key`

## Testando Localmente

```bash
# 1. Instale as dependências
npm install

# 2. Build do projeto
npm run build

# 3. Teste a função serverless localmente (requer Vercel CLI)
vercel dev

# 4. Acesse http://localhost:3000
```

## Troubleshooting

### Build falha com erro de TypeScript
```bash
npm run build -- --mode development
```

### Erro 500 no Vercel
1. Verifique os logs: `vercel logs <project-name>`
2. Certifique-se de que as variáveis de ambiente estão configuradas
3. Verifique se o Supabase está acessível

### Função serverless timeout
Se a função serverless está demorando muito:
1. Verifique a conexão com o Supabase
2. Aumente o timeout em `vercel.json` (máximo 30s para plano gratuito)

### Rotas não funcionam
Verifique se o `vercel.json` tem o rewrite correto:
```json
"rewrites": [
  {
    "source": "/(.*)",
    "destination": "/api/server.js"
  }
]
```

## Diferenças entre Lovable/Cloudflare e Vercel

| Aspecto | Lovable/Cloudflare | Vercel |
|--------|-------------------|--------|
| **Runtime** | Cloudflare Workers | Node.js 20.x |
| **Função Serverless** | Integrada (wrangler.jsonc) | Arquivo em `api/` |
| **Variáveis de Ambiente** | .dev.vars | Project Settings |
| **Build Output** | Otimizado para Workers | Otimizado para Node.js |
| **Domínio** | *.lovable.app | *.vercel.app |

## Próximos Passos

1. ✅ Fazer push para GitHub
2. ✅ Conectar repositório no Vercel
3. ✅ Configurar variáveis de ambiente
4. ✅ Fazer deploy
5. ✅ Testar a aplicação

## Suporte

Se encontrar problemas:
- Verifique os logs do Vercel: `vercel logs <project-name>`
- Consulte a documentação: https://vercel.com/docs
- Abra uma issue no GitHub

---

**Nota:** Este projeto ainda pode ser editado no Lovable e publicado em `corretor-key-hub.lovable.app`. O Vercel é apenas uma alternativa de hosting adicional.

---
*Última atualização: Forçando trigger de build após correção do vercel.json.*
