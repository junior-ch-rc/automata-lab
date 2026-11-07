import {test} from 'node:test';
import assert from 'node:assert/strict';
import {simulate} from '../dist/engine.js';
import {stateHighlights} from '../dist/editor-simulation.js';
const machine = (accepting='q4') => ({type:'fa',states:['q1','q2','q3','q4'].map((id,i)=>({id,name:id,x:i*150,y:200,initial:i===0,final:id===accepting})),edges:[{from:'q1',to:'q2',read:'1'},{from:'q2',to:'q3',read:'0'},{from:'q3',to:'q4',read:'1'}]});
test('1011 rejects and marks the last reachable accepting state red when no transition exists',()=>{
 const r=simulate(machine(),'1011');assert.equal(r.accepted,false);assert.deepEqual(r.trace.at(-1).active,[]);
 assert.deepEqual(stateHighlights(r,r.trace.length-1),{ids:['q4'],rejected:true});
 assert.deepEqual(stateHighlights(r,3),{ids:['q4'],rejected:false});
});
test('Rejection after passing accepting q3 does not leave q3 green',()=>{
 const r=simulate(machine('q3'),'1011');assert.deepEqual(stateHighlights(r,r.trace.length-1),{ids:['q4'],rejected:true});
 const accepted=simulate(machine('q3'),'10');assert.deepEqual(stateHighlights(accepted,2),{ids:['q3'],rejected:false});
});
test('Extra symbols after failure preserve the last reachable state; invalid first symbol marks start red',()=>{
 const r=simulate(machine(),'101111');assert.deepEqual(stateHighlights(r,6),{ids:['q4'],rejected:true});
 const invalid=simulate(machine(),'x');assert.deepEqual(stateHighlights(invalid,1),{ids:['q1'],rejected:true});
});
test('Acceptance, rejection in a nonfinal state, reset and inconclusive results stay distinct',()=>{
 const accepted=simulate(machine(),'101');assert.deepEqual(stateHighlights(accepted,3),{ids:['q4'],rejected:false});
 const rejected=simulate(machine(),'10');assert.deepEqual(stateHighlights(rejected,2),{ids:['q3'],rejected:true});
 assert.deepEqual(stateHighlights(null,0),{ids:[],rejected:false});
 assert.deepEqual(stateHighlights({accepted:null,trace:[{active:['q1']}]},0),{ids:['q1'],rejected:false});
});
