import './api.test.mjs';import {build} from 'esbuild';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const db=globalThis.__TEST_ENV.DB,hash=s=>createHash('sha256').update(s).digest('hex');
await db.prepare('INSERT INTO admin_sessions VALUES(?,?)').bind(hash('tracks-host'),Date.now()+60000).run();
for(const id of ['track-a','track-b','track-c']){await db.prepare('INSERT INTO notebook_accounts VALUES(?,?,?,?,?,?,?)').bind(id,id,id,'test-salt','test-hash',0,Date.now()).run();await db.prepare('INSERT INTO notebook_sessions VALUES(?,?,?)').bind(hash(id+'-session'),id,Date.now()+60000).run();}
await build({entryPoints:['app/api/tracks/route.ts'],bundle:true,platform:'node',format:'esm',outfile:'.sites-runtime/tracks-api.mjs',plugins:[{name:'env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__TEST_ENV;',loader:'js'}));}}]});
const {GET,POST}=await import('../.sites-runtime/tracks-api.mjs');const host='lj_admin=tracks-host';
async function get(cookie='',admin=false,status=200){const r=await GET(new Request('https://test.local/api/tracks'+(admin?'?admin=1':''),{headers:{Cookie:cookie}}));assert.equal(r.status,status);return r.json()}
async function post(body,cookie='',status=200){const r=await POST(new Request('https://test.local/api/tracks',{method:'POST',headers:{Cookie:cookie,Origin:'https://test.local'},body:JSON.stringify(body)}));const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d;}
await get('',false,401);await get('lj_notebook=track-a-session',true,401);await post({op:'confirm',day:1},'lj_notebook=track-a-session',401);
let d=await get(host,true);for(const id of ['track-a','track-b','track-c']){await post({op:'roster',day:1,id,include:true,version:d.version},host);d=await get(host,true);}
await post({op:'roster',day:1,id:'track-a',include:false,version:d.version-1},host,409);
const initialVersion=d.version;await Promise.all(['track-a','track-b','track-c'].map(id=>post({op:'preference',day:1,preference:'A',id:'track-b',version:initialVersion},'lj_notebook='+id+'-session')));
d=await get(host,true);assert.equal(Object.keys(d.state.days[1].preferences).length,3);const own=await get('lj_notebook=track-a-session');assert(!JSON.stringify(own).includes('track-b'));assert(!own.state);assert(!own.days[1].assignment);
await post({op:'proposal',day:1,volunteers:true,version:d.version},host);d=await get(host,true);assert.equal(d.state.days[1].phase,'review');await post({op:'preference',day:1,preference:'B',version:0},'lj_notebook=track-a-session',400);
await post({op:'confirm',day:1,version:d.version},host);assert(['A','B'].includes((await get('lj_notebook=track-a-session')).days[1].assignment));assert.equal((await get('lj_notebook=track-a-session')).days[2].assignment,'');
const cross=await POST(new Request('https://test.local/api/tracks',{method:'POST',headers:{Cookie:host,Origin:'https://other.local'},body:JSON.stringify({op:'reopen',day:1})}));assert.equal(cross.status,403);
console.log('PASS: track endpoint authentication, participant privacy, server-derived identity, simultaneous preferences, stale-host conflict rejection, confirmed cross-device state and origin protection.');
