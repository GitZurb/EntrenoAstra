import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EXERCISE_FIGURES, MOTION_GUIDES, STATIC_IDS, sampleMotion, cycleAmount } from '../src/exercise-motion.js';

const source=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const ids=[...source.matchAll(/\bEX\("([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,61,'Cobertura del catálogo de ejercicios');
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
for(const id of ids){
 assert(EXERCISE_FIGURES[id],`Falta modelo: ${id}`);
 assert.equal(MOTION_GUIDES[id]?.length,4,`Falta explicación: ${id}`);
 let previous=null;
 for(let frame=0;frame<=100;frame++){
  const motion=sampleMotion({id},frame/100);
  assert.equal(motion.arms.length,2);assert.equal(motion.legs.length,2);
  const points=[motion.hip,motion.shoulder,motion.head,...motion.arms.flatMap(a=>Object.values(a)),...motion.legs.flatMap(l=>Object.values(l))];
  for(const p of points)assert(p.length===3&&p.every(Number.isFinite),`Coordenadas inválidas: ${id}`);
  if(previous)for(let i=0;i<points.length;i++)assert(distance(points[i],previous[i])<.14,`Salto de articulación: ${id}`);
  for(const arm of motion.arms){
   assert(Math.abs(distance(arm.shoulder,arm.elbow)-.36)<.065,`Brazo deformado: ${id}`);
   assert(Math.abs(distance(arm.elbow,arm.hand)-.336)<.065,`Antebrazo deformado: ${id}`);
  }
  for(const leg of motion.legs){
   assert(Math.abs(distance(leg.hip,leg.knee)-.476)<.065,`Muslo deformado: ${id}`);
   assert(Math.abs(distance(leg.knee,leg.ankle)-.448)<.065,`Pierna deformada: ${id}`);
  }
  previous=points;
 }
 if(STATIC_IDS.has(id))assert.deepEqual(sampleMotion({id},0),sampleMotion({id},1),`Isométrico animado: ${id}`);
}
for(const id of ['sentadilla_goblet','sentadilla_trasera','peso_muerto_rumano','rdl_mancuernas']){
 const start=sampleMotion({id},0);
 for(const t of [.25,.5,.75,1])sampleMotion({id},t).legs.forEach((l,i)=>{
  assert.deepEqual(l.ankle,start.legs[i].ankle,`Pie deslizante: ${id}`);
  assert.deepEqual(l.toe,start.legs[i].toe,`Punta deslizante: ${id}`);
 });
}
assert.equal(sampleMotion({id:'personalizado-sin-modelo'}),null);
assert.deepEqual(sampleMotion({id:'personalizado',figureOf:'curl_barra'},.5),sampleMotion({id:'curl_barra'},.5));
assert.equal(cycleAmount(0),0);assert.equal(cycleAmount(1),0);assert.equal(cycleAmount(.5),1);
console.log('61 ejercicios: cobertura, continuidad, proporciones, apoyos e isométricos correctos.');
