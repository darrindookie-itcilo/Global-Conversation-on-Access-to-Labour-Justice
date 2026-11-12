import './api.test.mjs';import {build} from 'esbuild';import assert from 'node:assert/strict';
await build({entryPoints:['app/action-plan-model.ts'],bundle:true,platform:'node',format:'esm',outfile:'.sites-runtime/action-plan-model.mjs'});
const {actionFields,actionKey,parseAction,actionText}=await import('../.sites-runtime/action-plan-model.mjs');
const plan={breakpoint:'Access',change:'Introduce an accessible form',agreement:'Registry lead',deadline:'4 December 2026',evidence:'Approved form and usage record'};
assert.deepEqual(parseAction(JSON.stringify(plan)),plan);assert.equal(actionFields.length,5);assert.equal(parseAction('old free text').change,'');assert(actionText(plan).includes('By when\n4 December 2026'));
const {POST,GET}=await import('../.sites-runtime/api-test.mjs');const headers={'oai-authenticated-user-id':'action-plan-test-owner'};
for(const [key,text] of [['action-plan','Earlier commitment preserved'],[actionKey,JSON.stringify(plan)]]){const r=await POST(new Request('https://test.local/api',{method:'POST',headers,body:JSON.stringify({action:'note',key,text})}));assert.equal(r.status,200);}
const data=await (await GET(new Request('https://test.local/api?action=notes',{headers}))).json();const notes=data.notes.map(n=>JSON.parse(n.body));assert.equal(notes.find(n=>n.key==='action-plan').text,'Earlier commitment preserved');assert.deepEqual(parseAction(notes.find(n=>n.key===actionKey).text),plan);const other=await (await GET(new Request('https://test.local/api?action=notes',{headers:{'oai-authenticated-user-id':'another-owner'}}))).json();assert.equal(other.notes.length,0);
console.log('PASS: five-field action plan serialization/export, private persistence, legacy note preservation and account isolation.');
