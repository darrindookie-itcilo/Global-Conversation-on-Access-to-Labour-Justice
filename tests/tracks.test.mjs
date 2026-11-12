import {build} from 'esbuild';import assert from 'node:assert/strict';
await build({entryPoints:['app/track-state.ts'],bundle:true,platform:'node',format:'esm',outfile:'.sites-runtime/tracks.mjs'});
const {newTracks,changeTracks,propose,participantTracks}=await import('../.sites-runtime/tracks.mjs');
const ids=Array.from({length:41},(_,i)=>'p'+String(i).padStart(2,'0'));
let state=newTracks();const apply=(op,body={},host=true,p='')=>changeTracks(state,{op,day:1,...body},host,p,ids,100);
apply('roster-all');assert.equal(state.days[1].roster.length,41);apply('roster',{id:ids[0],include:true});assert.equal(state.days[1].roster.length,41);
assert.throws(()=>apply('proposal',{seed:'x',volunteers:true}),/preferences/);
for(let i=0;i<41;i++)apply('preference',{preference:i<32?'A':i<38?'B':'E'},false,ids[i]);assert.throws(()=>apply('preference',{preference:'A'},false,'unknown'));
assert.throws(()=>apply('proposal',{seed:'test'},false),/Facilitator/);assert.throws(()=>apply('proposal',{seed:'test'}),/volunteer/);
const initial=structuredClone(state.days[1]);const p=propose(initial,1,'test');assert.deepEqual(p,propose(initial,1,'test'));assert.notDeepEqual(p.order,propose(initial,1,'other').order);
apply('proposal',{seed:'test',volunteers:true});assert.equal(Object.values(state.days[1].draft).filter(t=>t==='A').length,21);assert.equal(Object.values(state.days[1].draft).filter(t=>t==='B').length,20);for(const id of ids.slice(32,38))assert.equal(state.days[1].draft[id],'B');
assert.throws(()=>apply('preference',{preference:'B'},false,ids[0]),/closed/);assert.throws(()=>apply('proposal',{seed:'reroll',volunteers:true}),/already/);
assert.equal(participantTracks(state,ids[0])[1].assignment,'');assert(!JSON.stringify(participantTracks(state,ids[0])).includes('p01'));
apply('confirm');assert(['A','B'].includes(participantTracks(state,ids[0])[1].assignment));assert.equal(participantTracks(state,ids[0])[2].enrolled,false);assert.throws(()=>apply('move',{id:ids[0],track:'B',reason:'change'}),/proposal/);
apply('reopen',{reason:'Volunteers requested a new review'});assert.equal(participantTracks(state,ids[0])[1].assignment,'');apply('proposal',{seed:'again',volunteers:true});for(const id of ids)apply('move',{id,track:'A',reason:'Test exception'});assert.throws(()=>apply('confirm'),/exception/);apply('confirm',{reason:'Facilitator-approved test exception'});assert.equal(state.days[1].exception,'Facilitator-approved test exception');
// Independent daily allocations preserve morning/afternoon continuity through the day key.
changeTracks(state,{op:'copy-roster',day:2},true,'',ids);assert.equal(state.days[2].roster.length,41);assert.equal(state.days[2].phase,'collecting');assert.equal(state.days[1].phase,'confirmed');
for(const n of [2,3,20,40,41,100])for(const a of [0,Math.floor(n/2),n]){const d={roster:Array.from({length:n},(_,i)=>''+i),preferences:{}};d.roster.forEach((id,i)=>d.preferences[id]=i<a?'A':'B');const x=propose(d,1,'seed');assert.equal(Object.keys(x.result).length,n);assert(Math.abs(Object.values(x.result).filter(t=>t==='A').length-Object.values(x.result).filter(t=>t==='B').length)<=1);}
console.log('PASS: 40/41 and extreme-demand balance, preference priority, reproducible draw, roster uniqueness, missing preferences, participant isolation, closed preferences, confirmation, exception reasons and independent days.');
