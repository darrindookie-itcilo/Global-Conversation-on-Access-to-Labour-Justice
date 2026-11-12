import './api.test.mjs';import {build} from 'esbuild';import assert from 'node:assert/strict';
await build({entryPoints:['app/api/games/route.ts'],bundle:true,platform:'node',format:'esm',outfile:'.sites-runtime/games-api.mjs',plugins:[{name:'env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__TEST_ENV;',loader:'js'}));}}]});
const {POST,GET}=await import('../.sites-runtime/games-api.mjs');const {POST:auth,GET:iceGet}=await import('../.sites-runtime/api-test.mjs');
const login=await auth(new Request('https://test.local/api',{method:'POST',body:JSON.stringify({action:'login',email:'test@example.org',password:'test-only-password'})}));const cookie=login.headers.get('Set-Cookie').split(';')[0];
async function call(b,host=false,status=200){const r=await POST(new Request('https://test.local/api/games',{method:'POST',headers:host?{Cookie:cookie}:{},body:JSON.stringify(b)}));const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d}
async function read(q,host=false,status=200){const r=await GET(new Request('https://test.local/api/games?'+new URLSearchParams(q),{headers:host?{Cookie:cookie}:{}}));const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d}
await read({list:1},false,401);await call({op:'create',kind:'missing'},false,401);
const {code}=await call({op:'create',kind:'missing'},true);const spare=await call({op:'create',kind:'digital'},true);
const joins=await Promise.all(['A','B','C'].map(name=>call({op:'join',code,name})));assert.equal(Object.keys((await read({code})).state.teams).length,3);
await call({op:'join',code,name:'a'},false,409);await call({op:'submit',code,...joins[0],token:'bad',text:'forged'},false,401);
await Promise.all(joins.map((t,i)=>call({op:'submit',...t,text:'Private response '+i})));
let d=await read({code});assert(!JSON.stringify(d).includes('Private response'));assert(!JSON.stringify(d).includes('token'));
d=await read({code,...joins[0]});assert.equal(d.state.teams[joins[0].id].text,'Private response 0');assert(!d.state.teams[joins[1].id].text);
d=await read({code},true);assert.equal(d.state.teams[joins[2].id].text,'Private response 2');
await call({op:'score',code,version:d.version,team:joins[0].id,points:10},false,401);
await call({op:'score',code,version:d.version,team:joins[0].id,points:10,feedback:'Evidence supported'},true);
await call({op:'stage',code,version:d.version,stage:'paused'},true,409);
d=await read({code},true);await call({op:'stage',code,version:d.version,stage:'paused'},true);
await call({op:'submit',...joins[1],text:'late'},false,400);
d=await read({code},true);await call({op:'reveal',code,version:d.version,revealed:true},true);assert.equal((await read({code})).state.teams[joins[1].id].text,'Private response 1');
d=await read({code},true);await call({op:'stage',code,version:d.version,stage:'open'},true);await call({op:'submit',...joins[0],text:'Revised response'});assert.equal((await read({code})).state.teams[joins[0].id].points,0);
await call({op:'delete',code},false,401);await call({op:'delete',code},true);await read({code},false,404);await call({op:'submit',...joins[1],text:'after deletion'},false,404);await read({code:spare.code});
const board=await call({op:'create',kind:'routes'},true);d=await read({code:board.code},true);await call({op:'board',code:board.code,version:d.version,board:{teams:[{name:'Board A',pos:7,points:2}],prompt:{story:'Case',answer:1,why:'Hidden explanation'},revealed:false}},true);d=await read({code:board.code});assert.equal(d.state.board.teams[0].pos,7);assert(!('answer' in d.state.board.prompt));assert(!('why' in d.state.board.prompt));
// A platform room is listed alongside the other games; deletion is protected and isolated.
await globalThis.__TEST_ENV.DB.prepare('INSERT INTO platform_rooms(code,state,created) VALUES(?,?,?)').bind('TEST',JSON.stringify({game:1,teams:{},votes:{}}),Date.now()).run();
const list=await read({list:1},true);assert(list.rooms.some(r=>r.code==='TEST'&&r.type==='platform'));await call({op:'delete',type:'platform',code:'TEST'},false,401);await call({op:'delete',type:'platform',code:'TEST'},true);assert(!(await read({list:1},true)).rooms.some(r=>r.code==='TEST'));await read({code:spare.code});
async function ice(action,body={},host=false){const r=await auth(new Request('https://test.local/api',{method:'POST',headers:host?{Cookie:cookie}:{},body:JSON.stringify({action,...body})}));return {status:r.status,...await r.json()}}
const iceRoom=await ice('create',{},true);const person=await ice('join',{code:iceRoom.code,name:'Leaving'});const other=await ice('join',{code:iceRoom.code,name:'Staying'});await ice('contribute',{...person,published:true,question:'My shared question'});
await ice('leave',{...person,token:'forged'});let ir=await (await iceGet(new Request('https://test.local/api?action=room&code='+iceRoom.code))).json();assert.equal(ir.members.length,2);
await ice('leave',person);ir=await (await iceGet(new Request('https://test.local/api?action=room&code='+iceRoom.code))).json();assert.equal(ir.members.length,1);assert.equal(ir.members[0].id,other.id);assert.equal((await ice('contribute',person)).status,401);
assert.equal((await ice('delete-room',{code:iceRoom.code})).status,401);await ice('delete-room',{code:iceRoom.code},true);assert.equal((await iceGet(new Request('https://test.local/api?action=room&code='+iceRoom.code))).status,404);assert.equal((await ice('contribute',other)).status,401);
console.log('PASS: live-game roster concurrency, submissions/privacy, host scoring, pause/reopen, stale controls, board sync/redaction, unified platform listing, room deletion isolation, icebreaker authenticated exit and cascade deletion.');
