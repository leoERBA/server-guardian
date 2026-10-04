// Run from the project root. Never prints enrollment tokens or agent credentials.
// Default: negative/read-only tests. --consume-token: consumes one real test token.
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const endpoint = 'http://localhost:3000/api/agent/enroll';
const consumeToken = process.argv.includes('--consume-token');
let passed = 0;

function check(condition, label) {
  assert.ok(condition, label);
  passed += 1;
  console.log(`PASSOU: ${label}`);
}

async function post(body) {
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
    redirect: 'error',
  });
}

function databaseResult(result, label) {
  if (result.error) {
    throw new Error(`${label}: falha de consulta (codigo ${result.error.code || 'indisponivel'}).`);
  }
  return result.data;
}

try {
  let response = await post({});
  check(response.status === 401, 'token ausente retorna HTTP 401');
  check(response.headers.get('cache-control') === 'no-store', 'resposta usa no-store');

  response = await post('{');
  check(response.status === 400, 'JSON malformado retorna HTTP 400');

  response = await post({ token: `sg_enroll_${randomBytes(32).toString('base64url')}` });
  check(response.status === 401, 'token inexistente retorna HTTP 401 pela nova rota');

  if (consumeToken) {
    const rawToken = process.env.SG_ENROLLMENT_TOKEN?.trim();
    if (!rawToken || !/^sg_enroll_[A-Za-z0-9_-]{43}$/.test(rawToken)) {
      throw new Error('Copie um token temporario novo pelo Install Agent antes do teste positivo.');
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error('Configuracao Supabase ausente no ambiente.');

    const admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const hash = createHash('sha256').update(rawToken).digest('hex');
    const enrollment = databaseResult(await admin
      .from('agent_enrollment_tokens')
      .select('server_id,expires_at')
      .eq('token_hash', hash)
      .maybeSingle(), 'Leitura do token');

    if (!enrollment || !Number.isFinite(Date.parse(enrollment.expires_at)) ||
        Date.parse(enrollment.expires_at) <= Date.now()) {
      throw new Error('O token nao existe ou venceu. Gere outro no servidor de teste.');
    }

    console.log('Executando enrollment: a credencial do servidor de teste sera substituida.');
    response = await post({ token: rawToken });
    check(response.status === 200, 'enrollment valido retorna HTTP 200');
    check(response.headers.get('cache-control') === 'no-store', 'sucesso usa no-store');
    const body = await response.json();
    check(typeof body.agentToken === 'string' && /^sg_agent_[A-Za-z0-9_-]{43}$/.test(body.agentToken),
      'credencial recebida no formato esperado, sem exibir o valor');
    check(body.serverId === enrollment.server_id, 'serverId corresponde ao token');

    const expectedHash = createHash('sha256').update(body.agentToken).digest('hex');
    const remaining = databaseResult(await admin
      .from('agent_enrollment_tokens').select('id').eq('token_hash', hash), 'Consumo do token');
    check(Array.isArray(remaining) && remaining.length === 0, 'token consumido no banco');

    const credentials = databaseResult(await admin
      .from('agent_credentials').select('token_hash,revoked_at')
      .eq('server_id', body.serverId), 'Persistencia da credencial');
    check(Array.isArray(credentials) && credentials.length === 1 &&
      credentials[0].token_hash === expectedHash && credentials[0].revoked_at === null,
    'uma credencial ativa com o hash correto');

    response = await post({ token: rawToken });
    check(response.status === 401, 'reutilizacao do token retorna HTTP 401');
    const afterReplay = databaseResult(await admin
      .from('agent_credentials').select('token_hash,revoked_at')
      .eq('server_id', body.serverId).single(), 'Credencial depois do replay');
    check(afterReplay.token_hash === expectedHash && afterReplay.revoked_at === null,
      'replay preserva a credencial ativa');
  }

  console.log(`RESULTADO: ${passed} verificacoes passaram.`);
  if (!consumeToken) {
    console.log('Nenhum token real foi consumido. O teste positivo ainda nao foi executado.');
  }
} catch (error) {
  // Only our own short diagnostics are printed; no response bodies or credentials.
  if (error instanceof assert.AssertionError) {
    console.error(`FALHOU: ${error.message}`);
  } else if (error instanceof Error &&
      /^(Copie|Configuracao|O token|Leitura|Consumo|Persistencia|Credencial)/.test(error.message)) {
    console.error(`FALHOU: ${error.message}`);
  } else {
    console.error('FALHOU: conexao, timeout ou resposta inesperada. Confira se o app usa localhost:3000.');
  }
  console.error('Pare e envie somente esta saida. Se uma requisicao perdeu a resposta, o token pode ter sido consumido.');
  process.exitCode = 1;
} finally {
  delete process.env.SG_ENROLLMENT_TOKEN;
}
