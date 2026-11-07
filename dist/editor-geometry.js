// Rendering geometry is independent from automaton semantics.
export function groupTransitions(edges) {
  const groups = new Map();
  edges.forEach((edge, index) => {
    const key = JSON.stringify([edge.from, edge.to]);
    if (!groups.has(key)) groups.set(key, { from: edge.from, to: edge.to, indexes: [] });
    groups.get(key).indexes.push(index);
  });
  return [...groups.values()];
}
const distanceToSegment = (p, a, b) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy || 1)));
  return Math.hypot(p.x-a.x-t*dx, p.y-a.y-t*dy);
};
export function routeClearance(points, state) {
  let min = Infinity;
  for (let i=1; i<points.length; i++) min = Math.min(min, distanceToSegment(state, points[i-1], points[i]));
  return min;
}
export function routeTransition(states, group, reverse=false, lines=['']) {
  const a = states.find(s=>s.id===group.from), b = states.find(s=>s.id===group.to);
  const labelWidth = Math.max(30, ...lines.map(s=>[...s].length*8.2));
  const labelHeight = lines.length*20;
  const obstacles = states.filter(s=>s!==a && s!==b);
  if (a===b) {
    // Try all four sides; loops also avoid nearby states and labels.
    let best;
    for (const angle of [-Math.PI/2, Math.PI/2, 0, Math.PI]) {
      const ux=Math.cos(angle), uy=Math.sin(angle), vx=-uy, vy=ux;
      const p = (u,v)=>({x:a.x+ux*u+vx*v,y:a.y+uy*u+vy*v});
      const start=p(25,-25), c1=p(150,-85), c2=p(150,85), end=p(25,25);
      const points=Array.from({length:65},(_,i)=>{const t=i/64,k=1-t;return{x:k*k*k*start.x+3*k*k*t*c1.x+3*k*t*t*c2.x+t*t*t*end.x,y:k*k*k*start.y+3*k*k*t*c1.y+3*k*t*t*c2.y+t*t*t*end.y}});
      const label=p(142+labelHeight/2,0);
      const score=obstacles.reduce((sum,s)=>sum+Math.max(0,58-routeClearance(points,s))*1000+labelCollision(label,s,labelWidth,labelHeight),0);
      const candidate={d:`M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`,points,label,labelWidth,labelHeight,score};
      if(!best||score<best.score)best=candidate;
    }
    return best;
  }
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  const offsets=reverse?[85,145,230,340,500,750,1100,1600,2400]:[0,100,-100,180,-180,280,-280,430,-430,650,-650,1000,-1000,1600,-1600,2400,-2400];
  let best;
  for (const offset of offsets) {
    const control={x:(a.x+b.x)/2+nx*offset,y:(a.y+b.y)/2+ny*offset};
    const start=clip(a,control,36),end=clip(b,control,40);
    const points=Array.from({length:97},(_,i)=>{const t=i/96,k=1-t;return{x:k*k*start.x+2*k*t*control.x+t*t*end.x,y:k*k*start.y+2*k*t*control.y+t*t*end.y}});
    const mid=points[48],label={x:mid.x,y:mid.y-14-labelHeight/2};
    let score=Math.abs(offset)*.02;
    for(const s of obstacles)score+=Math.max(0,56-routeClearance(points,s))*10000;
    for(const s of states)score+=labelCollision(label,s,labelWidth,labelHeight);
    const candidate={d:`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,points,label,labelWidth,labelHeight,score};
    if(!best||score<best.score)best=candidate;
    if(score<60)break;
  }
  return best;
}
function clip(a,b,r){const len=Math.hypot(b.x-a.x,b.y-a.y)||1;return{x:a.x+(b.x-a.x)*r/len,y:a.y+(b.y-a.y)*r/len}}
function labelCollision(label,state,w,h){const dx=Math.max(Math.abs(state.x-label.x)-w/2,0),dy=Math.max(Math.abs(state.y-label.y)-h/2,0);return Math.max(0,48-Math.hypot(dx,dy))*1000}
export function zoomCamera(view, factor, anchor={x:view.x+view.w/2,y:view.y+view.h/2}) {
  const w=Math.max(245,Math.min(4900,view.w/factor)),ratio=w/view.w;
  return {x:anchor.x-(anchor.x-view.x)*ratio,y:anchor.y-(anchor.y-view.y)*ratio,w,h:view.h*ratio};
}
export function fitCamera(states,routes=[],aspect=980/560) {
  if(!states.length)return{x:0,y:0,w:980,h:980/aspect};
  const points=states.flatMap(s=>[{x:s.x-100,y:s.y-55},{x:s.x+65,y:s.y+55}]);
  routes.forEach(r=>{points.push(...r.points,{x:r.label.x-r.labelWidth/2,y:r.label.y-r.labelHeight/2},{x:r.label.x+r.labelWidth/2,y:r.label.y+r.labelHeight/2})});
  const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y)),bottom=Math.max(...points.map(p=>p.y));
  let w=Math.max(400,right-left+130),h=Math.max(260,bottom-top+180);if(w/h<aspect)w=h*aspect;else h=w/aspect;
  return{x:(left+right-w)/2,y:(top+bottom-h)/2,w,h};
}
