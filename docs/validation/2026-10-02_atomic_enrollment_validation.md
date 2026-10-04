# Validação em ambiente isolado — 02/10/2026

## Evidência e alcance

SQL e rota foram preparados a partir do código atual enviado pelo usuário, do schema e grants documentados no MASTER e das políticas exportadas em CSV. Foram lidos os guias locais de Route Handlers e NextResponse exigidos pelo AGENTS.md. O repositório remoto e o computador do usuário não foram modificados pelo assistente.

**15 cenários passaram no PostgreSQL nativo 17.10**, com múltiplas conexões reais, registros fictícios e schema equivalente ao documentado. Não houve conexão ao Supabase do usuário. O banco de laboratório usou uma implementação mínima de `auth.uid()` e papéis correspondentes para testar as regras; isso não reproduz o gateway nem o Supabase Auth completo.

**22 testes unitários da rota passaram no Node 24.19.0**, executando o TypeScript após remoção de tipos. NextResponse e o cliente RPC foram substituídos por mocks; a criptografia foi real. Não foi executado build completo do Next.js nem integração com PostgREST/Supabase.

O script de verificação entregue teve a sintaxe conferida; seus testes no ambiente do usuário ainda precisam ser executados.

## PostgreSQL

| Cenário | Resultado observado |
|---|---|
| Instalação e grants existentes | Função criada; 35 entradas de privilégios de tabelas permaneceram iguais |
| Execução da função | `service_role` autorizado; `anon` e `authenticated` negados |
| Sucesso | UUID correto, hash exato persistido e token removido |
| Reutilização | Retorno NULL; credencial preservada |
| Token expirado | Rejeitado e removido |
| Token com `used_at` preenchido | Rejeitado e removido |
| Dono do token diferente do dono do servidor | Rejeitado sem mutação |
| Falha forçada no UPSERT | Violação UNIQUE 23505; exclusão do token revertida e credencial anterior preservada; nova tentativa funcionou |
| Duas conexões, mesmo token | Um sucesso e uma rejeição |
| Dois tokens, mesmo servidor | Duas conclusões sucessivas; somente uma credencial final, preservando a regra anterior |
| Vencimento durante espera por bloqueio | Espera observada; token rejeitado após obter bloqueio |
| `server_id` alterado durante espera | Rejeição sem gravar credencial no servidor novo; token preservado |
| Hashes malformados/nulos | Rejeitados |
| Expiração infinita | Rejeitada e removida |
| Política RLS corrigida | Atualização autenticada para servidor de outro dono rejeitada com 42501 |

## Rota

Testados JSON inválido, nove tipos de entrada inválida, remoção de espaços, limite de comprimento, retorno NULL, cinco retornos RPC inesperados, erro SQL, exceção de rede, sucesso e geração de credenciais distintas. Verificados HTTP 400/401/500/200, `Cache-Control: no-store`, envio exclusivo dos dois hashes à RPC, correspondência do hash da credencial e ausência dos segredos inseridos nos mocks em logs/respostas de erro.

## Integridade dos arquivos testados

- SQL `2026-10-02_atomic_agent_enrollment.sql`: SHA-256 `b389c20f487a6acc2b3064905e3170ebebc79b36f97d53e708f3950226afa26d`.
- `app/api/agent/enroll/route.ts`: SHA-256 `2c7baeb30f25b86159b50f4affe117162de0956cfa8265cce17f55d7107adf20`.

Os resultados estruturados originais acompanham este relatório em JSON. Eles incluem caminhos do laboratório e dados fictícios de testes; não contêm chaves do projeto.

## Estado da entrega

- Implementação e testes isolados: preparados e aprovados no alcance descrito.
- Aplicação do pacote no projeto do usuário: não confirmada.
- Build Next.js, gateway PostgREST, conexão real com a nova Secret Key e enrollment E2E com a rota nova: pendentes.
- Isolamento integral, limites de requisições, recuperação de resposta perdida e regras alternativas para reenrollment: fora da validação concluída.

## Referências técnicas

- [Funções e privilégios no Supabase](https://supabase.com/docs/guides/database/functions).
- [CREATE FUNCTION e SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html).
- [Bloqueios explícitos no PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html).
- [Transações no PostgREST](https://docs.postgrest.org/en/stable/references/transactions.html).

O SQL usa uma função VOLATILE, chamada por POST RPC. Um erro SQL deve abortar a transação; nenhuma captura interna converte erro de gravação em sucesso ou token inválido.
