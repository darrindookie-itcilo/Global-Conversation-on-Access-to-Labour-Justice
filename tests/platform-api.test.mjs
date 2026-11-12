import './api.test.mjs';import {build} from 'esbuild';import assert from 'node:assert/strict';
await build({entryPoints:['app/api/platform/route.ts'],bundle:true,platform:'node',format:'esm',outfile:'.sites-runtime/platform-api.mjs',plugins:[{name:'env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__TEST_ENV;',loader:'js'}));}}]});
const {POST,GET}=await import('../.sites-runtime/platform-api.mjs');const {POST:auth}=await import('../.sites-runtime/api-test.mjs');
const login=await auth(new Request('https://test.local/api',{method:'POST',body:JSON.stringify({action:'login',email:'test@example.org',password:'test-only-password'})}));const cookie=login.headers.get('Set-Cookie').split(';')[0];
async function call(body,host=false,status=200){const r=await POST(new Request('https://test.local/api/platform',{method:'POST',headers:host?{Cookie:cookie}:{},body:JSON.stringify(body)}));const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));return data;}
await call({op:'create'},false,401);const room=await call({op:'create'},true);const code=room.code;assert.equal(code.length,4);
const joined=await Promise.all(['Alpha','Beta','Gamma'].map(name=>call({op:'join',code,name})));const settled=await (await GET(new Request('https://test.local/api/platform?code='+code))).json();assert.equal(Object.keys(settled.state.teams).length,3);
await call({op:'open',code},true);
await Promise.all(joined.map((j,i)=>call({op:'answer',code,id:j.id,token:j.token,choice:'A',reason:'Reason '+i})));
let result=await GET(new Request('https://test.local/api/platform?code='+code));let d=await result.json();assert.equal(Object.values(d.state.teams).filter(t=>t.answers[0]).length,3);assert(!JSON.stringify(d).includes(joined[0].token));assert(!JSON.stringify(d).includes('choice'));
await call({op:'reveal',code},false,401);await call({op:'reveal',code},true);result=await GET(new Request('https://test.local/api/platform?code='+code));d=await result.json();assert(Object.values(d.state.teams).every(t=>t.rounds[0]>=10));
await call({op:'answer',code,id:joined[0].id,token:'bad',choice:'A',reason:'Forgery'},false,401);
console.log('PASS: endpoint authorization, three simultaneous joins/submissions, optimistic concurrency, server scoring, token redaction and forged identity rejection.');
// A facilitator cookie must not turn an authenticated team action into a host control.
const mixed=await call({op:'create'},true);const mt=await call({op:'join',code:mixed.code,name:'Mixed-session team'});
await call({op:'open',code:mixed.code},true);
await call({op:'answer',code:mixed.code,id:mt.id,token:'forged',choice:'A',reason:'Forged'},true,401);
await call({op:'answer',code:mixed.code,id:mt.id,token:mt.token,choice:'A',reason:'Supported response'},true);
await call({op:'close',code:mixed.code},true);
let mixedState=await (await GET(new Request('https://test.local/api/platform?code='+mixed.code))).json();assert(mixedState.state.closedAt>=mixedState.state.openedAt);
const second=await call({op:'create',game:2},true);const st=await call({op:'join',code:second.code,name:'Mixed-session sprint'});
await call({op:'round',code:second.code,round:'r1'},true);await call({op:'open',code:second.code},true);
await call({op:'buzz',code:second.code,id:st.id,token:st.token,choice:'Art. 13'},true);
await call({op:'round',code:second.code,round:'r3'},true);
const row={op:'row',code:second.code,id:st.id,token:st.token,gap:'Missing procedure',article:'Art. 13',action:'Introduce a review procedure',colour:'GREEN',rowId:'repeat-proof'};
await Promise.all([call(row,true),call(row,true),call({...row,rowId:'different-id'},true)]);
let rs=await (await GET(new Request('https://test.local/api/platform?code='+second.code))).json();assert.equal(Object.keys(rs.state.rows).length,1);assert.equal(rs.state.teams[st.id].rounds[3],12);assert.equal(rs.state.teams[st.id].rounds[1],10);
await call({op:'row',...row,token:'forged'},true,401);
await call({op:'open',code:second.code},false,401);
console.log('PASS: mixed facilitator/team session answer, buzz and row; forged team tokens rejected even for hosts; concurrent duplicate rows score once; closed timestamp; host control protection retained.');

await call({op:'join',code:mixed.code,game:2,name:'Wrong game'},false,400);
