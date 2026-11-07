import {test} from 'node:test';
import assert from 'node:assert/strict';
import {groupTransitions,routeTransition,routeClearance,zoomCamera,fitCamera} from '../dist/editor-geometry.js';
const states=[{id:'q1',x:200,y:270},{id:'q2',x:490,y:270},{id:'q3',x:780,y:270}];
test('Groups parallel transitions without merging opposite directions or losing indexes',()=>{
 const edges=[{from:'q1',to:'q2',read:'a'},{from:'q1',to:'q2',read:'b'},{from:'q2',to:'q1',read:'a'},{from:'q1',to:'q1',read:''}];
 const groups=groupTransitions(edges);assert.equal(groups.length,3);assert.deepEqual(groups[0].indexes,[0,1]);assert.deepEqual(groups[1].indexes,[2]);assert.deepEqual(groups[2].indexes,[3]);
 assert.equal(groupTransitions([{from:'a|b',to:'c'},{from:'a',to:'b|c'}]).length,2);
});
test('q3 → q1 curves around q2 with visible clearance',()=>{
 for(const pair of[['q3','q1'],['q1','q3']]){
  const route=routeTransition(states,{from:pair[0],to:pair[1]},false,['0, 1']);assert.ok(routeClearance(route.points,states[1])>=55,JSON.stringify(route));
  const labelDistance=Math.hypot(Math.max(Math.abs(states[1].x-route.label.x)-route.labelWidth/2,0),Math.max(Math.abs(states[1].y-route.label.y)-route.labelHeight/2,0));assert.ok(labelDistance>=47);
 }
});
test('Routing also avoids vertically aligned and displaced obstacles',()=>{
 for(const [a,b,obstacle] of[[{id:'a',x:0,y:0},{id:'b',x:0,y:600},{id:'o',x:0,y:300}],[{id:'a',x:0,y:0},{id:'b',x:600,y:600},{id:'o',x:300,y:300}],[{id:'a',x:0,y:0},{id:'b',x:600,y:0},{id:'o',x:320,y:10}]]){
  const route=routeTransition([a,b,obstacle],{from:'a',to:'b'},false,['a']);assert.ok(routeClearance(route.points,obstacle)>=55);
 }
});
test('Opposite directions use separate curves',()=>{const a=routeTransition(states,{from:'q1',to:'q2'},true,['0']),b=routeTransition(states,{from:'q2',to:'q1'},true,['1']);assert.ok(a.points[48].y>270);assert.ok(b.points[48].y<270)});
test('Loops choose a free side and group multiple labels',()=>{const a={id:'a',x:200,y:200},obstacle={id:'o',x:200,y:90};const r=routeTransition([a,obstacle],{from:'a',to:'a'},false,['a, b, ε']);assert.ok(routeClearance(r.points,obstacle)>=55);assert.equal(r.labelHeight,20)});
test('Zoom preserves the world point under the pointer, with bounds',()=>{const v={x:-100,y:50,w:980,h:560},anchor={x:250,y:310},z=zoomCamera(v,2,anchor);assert.equal(z.w,490);assert.equal((anchor.x-v.x)/v.w,(anchor.x-z.x)/z.w);assert.equal((anchor.y-v.y)/v.h,(anchor.y-z.y)/z.h);assert.equal(zoomCamera(v,100).w,245);assert.equal(zoomCamera(v,.001).w,4900)});
test('Fit includes long return curves, labels, and initial arrows',()=>{const route=routeTransition(states,{from:'q3',to:'q1'},false,['0, 1']);const v=fitCamera(states,[route]);for(const p of [...route.points,...states]){assert.ok(p.x>=v.x&&p.x<=v.x+v.w);assert.ok(p.y>=v.y&&p.y<=v.y+v.h)}assert.ok(v.x<=100);assert.ok(Math.abs(v.w/v.h-980/560)<1e-9)});
