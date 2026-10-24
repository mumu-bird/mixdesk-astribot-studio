// A local JSON-lines MCP client. Keeps one REA session alive across focused
// native queries, without editing the desktop app's MCP configuration.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const cli = process.env.MIXDESK_REA_CLI;
if (!cli) throw new Error('Set MIXDESK_REA_CLI to the installed REA scripts/rea.mjs');
const child = spawn(process.execPath, [cli, 'mcp'], {
  env: process.env, stdio: ['pipe', 'pipe', 'inherit'],
});
let serial = 0;
const pending = new Map();
const send = (method, params, id) => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...(id === undefined ? {} : { id }), method, params }) + '\n');
function request(method, params = {}) {
  const id = ++serial;
  return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); send(method, params, id); });
}
createInterface({ input: child.stdout }).on('line', line => {
  try {
    const message = JSON.parse(line), callback = pending.get(message.id);
    if (!callback) return;
    pending.delete(message.id);
    if (message.error) callback.reject(new Error(JSON.stringify(message.error)));
    else callback.resolve(message.result);
  } catch (error) { process.stderr.write('REA response: ' + error.message + '\n'); }
});
child.on('exit', (code, signal) => {
  for (const task of pending.values()) task.reject(new Error(`REA exited (${code ?? signal})`));
  pending.clear();
});
const initialized = await request('initialize', {
  protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'mixdesk-local-research', version: '1' },
});
send('notifications/initialized', {});
process.stdout.write(JSON.stringify({ ready: true, server: initialized.serverInfo }) + '\n');
for await (const line of createInterface({ input: process.stdin })) {
  if (!line.trim()) continue;
  try {
    const input = JSON.parse(line);
    if (input.close) { child.stdin.end(); child.kill('SIGTERM'); break; }
    const result = await request(input.method || 'tools/call', input.params || { name: input.name, arguments: input.arguments || {} });
    if (input.save) {
      const path = resolve(input.save);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, JSON.stringify(result, null, 2) + '\n');
      process.stdout.write(JSON.stringify({ saved: path, bytes: Buffer.byteLength(JSON.stringify(result)), isError: result.isError ?? false }) + '\n');
    } else process.stdout.write(JSON.stringify(result) + '\n');
  } catch (error) { process.stdout.write(JSON.stringify({ error: error.message }) + '\n'); }
}
