// Cinemática en metros: apoyos fijos, dos segmentos por extremidad y material
// vinculado a las manos. El plano sagital es Y/Z; X separa los dos lados.
const vadd=(a,b)=>a.map((x,i)=>x+b[i]), vsub=(a,b)=>a.map((x,i)=>x-b[i]);
const mul=(a,k)=>a.map(x=>x*k), dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
const len=a=>Math.hypot(...a), unit=a=>mul(a,1/(len(a)||1));
const lerp=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
function joint(a,b,hint,l1,l2){
 const ab=vsub(b,a),d=Math.max(.0001,len(ab)),n=unit(ab),h=vsub(hint,a);
 let perpendicular=vsub(h,mul(n,dot(h,n)));if(len(perpendicular)<.0001)perpendicular=[0,0,1];
 const u=Math.max(-l1,Math.min(l1,(l1*l1-l2*l2+d*d)/(2*d)));
 return vadd(vadd(a,mul(n,u)),mul(unit(perpendicular),Math.sqrt(Math.max(0,l1*l1-u*u))));
}
const sides=[1,-1];
const is=(id,list)=>list.split(' ').includes(id);
export function motion3D(id,t,exercise){
 const m={id,hip:[0,.99,0],shoulder:[0,1.55,0],head:[0,1.73,0],arms:[],legs:[],props:[],floor:0,pose:{equip:null}};
 const torso=(hip,lean=0)=>{m.hip=hip;m.shoulder=vadd(hip,[0,.56*Math.cos(lean),.56*Math.sin(lean)]);m.head=vadd(m.shoulder,[0,.18*Math.cos(lean),.18*Math.sin(lean)]);};
 const arm=(i,hand,hint)=>{const s=sides[i],shoulder=vadd(m.shoulder,[s*.22,0,0]);m.arms[i]={shoulder,elbow:joint(shoulder,hand,hint,.36,.336),hand};};
 const leg=(i,ankle,hint,toe)=>{const s=sides[i],hip=vadd(m.hip,[s*.13,0,0]);m.legs[i]={hip,knee:joint(hip,ankle,hint,.476,.448),ankle,toe:toe||vadd(ankle,[0,-.01,.15])};};
 const planted=()=>sides.forEach((s,i)=>leg(i,[s*.16,.08,.06],[s*.16,.55,.6]));
 const hanging=()=>sides.forEach((s,i)=>arm(i,vadd(m.shoulder,[s*.28,-.685,.025]),vadd(m.shoulder,[s*.28,-.34,.06])));
 const material=(kind,at)=>{m.pose.equip=kind;if(at)m.equipCenter=at;};
 const bench=(center=[0,.44,-.35],length=.9,width=.47,angle=0)=>{m.props.push({name:'bench'+m.props.length,center,size:[width,.10,length],angle});};
 const seated=(lean=0)=>{torso([0,.58,0],lean);sides.forEach((s,i)=>leg(i,[s*.22,.08,.53],[s*.23,.54,.45]));bench([0,.44,-.12],.52);};
 torso(m.hip);planted();hanging();
 let covered=true;
 if(is(id,'press_banca press_inclinado press_declinado press_mancuernas press_inclinado_mancuernas press_suelo press_cerrado aperturas pullover press_frances')){
  const incline=id.includes('inclinado')?Math.PI/6:id==='press_declinado'?-Math.PI/12:0;
  const floor=id==='press_suelo',h=floor?.16:.62;
  torso([0,h,0],-Math.PI/2+incline);
  sides.forEach((s,i)=>leg(i,[s*.23,.08,.48],[s*.23,.49,.37]));
  if(!floor){bench([0,.49,.05],.34);bench([0,.49+Math.sin(incline)*.4,-.42],.9,.47,incline);}
  const shoulders=m.shoulder;
  if(id==='aperturas'){
   sides.forEach((s,i)=>{const theta=(1-t)*1.25;arm(i,[s*(.22+.61*Math.sin(theta)),shoulders[1]+.61*Math.cos(theta),shoulders[2]],[s*.56,shoulders[1]+.22,shoulders[2]+.10]);});
  }else if(id==='pullover'){
   const theta=t*1.35; sides.forEach((s,i)=>arm(i,[s*.07,shoulders[1]+.61*Math.cos(theta),shoulders[2]-.61*Math.sin(theta)],[s*.20,shoulders[1]+.30,shoulders[2]-.14]));
  }else if(id==='press_frances'){
   sides.forEach((s,i)=>{const shoulder=vadd(shoulders,[s*.22,0,0]),elbow=vadd(shoulder,[0,.35,0]);m.arms[i]={shoulder,elbow,hand:vadd(elbow,[0,.33*Math.sin(t*Math.PI/2),-.33*Math.cos(t*Math.PI/2)])};});
  }else{
   sides.forEach((s,i)=>{const grip=id==='press_cerrado'?.22:.34;arm(i,[s*(grip+(.24-grip)*t),shoulders[1]+.18+.50*t,shoulders[2]+.08*(1-t)],[s*.52,shoulders[1]-.015,shoulders[2]+.12]);});
  }
  if(id==='pullover')m.singleCentered=true;
  material(is(id,'press_banca press_inclinado press_declinado press_suelo press_cerrado press_frances')?'bar':'db1');
 }else if(is(id,'sentadilla_frontal sentadilla_trasera sentadilla_goblet sentadilla_banco sentadilla_mancuernas sentadilla_pared')){
  const wall=id==='sentadilla_pared',depth=wall?1:t;
  torso([0,.99-.37*depth,-.26*depth],wall?0:.08+.35*depth);planted();
  if(id==='sentadilla_banco')bench([0,.49,-.41],.5);
  if(wall){m.props.push({name:'wall',center:[0,.78,-.40],size:[1.1,1.56,.07]});hanging();}
  else if(id==='sentadilla_mancuernas'){hanging();material('db1');}
  else if(id==='sentadilla_goblet'||id==='sentadilla_banco'){
   const p=vadd(m.shoulder,[0,-.17,.19]);sides.forEach((s,i)=>arm(i,vadd(p,[s*.07,0,0]),vadd(m.shoulder,[s*.28,-.36,.08])));material('kb',p);
  }else{
   const front=id==='sentadilla_frontal',p=vadd(m.shoulder,[0,-.035,front?.10:-.07]);
   sides.forEach((s,i)=>arm(i,vadd(p,[s*.39,0,0]),vadd(m.shoulder,[s*.37,-.22,front?.32:-.16])));material('bar',p);
  }
 }else if(is(id,'zancadas zancada_inversa_barra sentadilla_bulgara')){
  const bulgarian=id==='sentadilla_bulgara',inverse=id==='zancada_inversa_barra';
  torso([0,.99-.31*t,bulgarian?0:inverse?-.12*t:.22*t],.10+.12*t);
  leg(0,[.16,.08,bulgarian?.37:inverse?.06:.06+.52*t],[.16,.55,.8]);
  leg(1,[-.16,bulgarian?.48:.08,bulgarian?-.61:inverse?-.06-.54*t:-.06],[-.16,.38,.18]);
  if(bulgarian)bench([0,.39,-.67],.42,.65);
  if(inverse){const p=vadd(m.shoulder,[0,-.035,-.07]);sides.forEach((s,i)=>arm(i,vadd(p,[s*.39,0,0]),vadd(m.shoulder,[s*.38,-.23,-.13])));material('bar',p);}
  else{hanging();material('db1');}
 }else if(is(id,'peso_muerto peso_muerto_rumano rdl_mancuernas buenos_dias pm_una_pierna swing_kb')){
  const bend=id==='peso_muerto'||id==='swing_kb'?1-t:t;
  torso([0,.99-(id==='peso_muerto'?.27:.08)*bend,-.27*bend],bend*1.06);planted();
  if(id==='pm_una_pierna'){leg(1,[-.14,.08+.79*t,-.75*t],[-.14,.46+.25*t,-.43*t]);m.weightHand=1;}
  if(id==='buenos_dias'){const p=vadd(m.shoulder,[0,-.035,-.07]);sides.forEach((s,i)=>arm(i,vadd(p,[s*.39,0,0]),vadd(m.shoulder,[s*.38,-.23,-.13])));material('bar',p);}
  else if(id==='swing_kb'){
   const p=[0,m.shoulder[1]-.65*(1-t),m.shoulder[2]-.12*(1-t)+.64*t];
   sides.forEach((s,i)=>arm(i,vadd(p,[s*.045,0,0]),vadd(m.shoulder,[s*.16,-.32,.18])));material('kb',p);
  }else{
   sides.forEach((s,i)=>arm(i,[s*.27,m.shoulder[1]-.68,.12],vadd(m.shoulder,[s*.28,-.33,0])));material(id==='peso_muerto'||id==='peso_muerto_rumano'?'bar':'db1');
  }
 }else if(is(id,'remo_barra remo_mancuerna remo_apoyado remo_kettlebell patada_triceps pajaros')){
  torso([0,.95,-.23],1.08);planted();
  if(id==='remo_mancuerna'){
   torso([.12,1.00,-.30],1.42);bench([-.20,.59,.13],1.1);
   leg(0,[.28,.08,-.25],[.28,.55,.25]);
   leg(1,[-.16,.72,-.388],[-.16,.72,.06]);
   // Rodilla y mano no atraviesan el cojín.
   m.legs[1].knee=[-.16,.72,.06];
   arm(1,[-.20,.68,.52],[-.20,.82,.40]);
  }
  if(id==='remo_apoyado'||id==='pajaros'){
   torso([0,.76,-.21],1.02);planted();bench([0,.57,-.11],1.1,.44,-.50);
  }
  sides.forEach((s,i)=>{
   if(id==='remo_mancuerna'&&i===1)return;
   if(id==='patada_triceps'){
    const shoulder=vadd(m.shoulder,[s*.22,0,0]),elbow=vadd(shoulder,[0,-.06,-.35]);
    m.arms[i]={shoulder,elbow,hand:vadd(elbow,[0,-.335*Math.cos(t*Math.PI/2),-.335*Math.sin(t*Math.PI/2)])};
   }else if(id==='pajaros'){
    arm(i,vadd(m.shoulder,[s*(.23+.64*Math.sin(t*Math.PI/2)),-.64*Math.cos(t*Math.PI/2),0]),vadd(m.shoulder,[s*.5,-.18,-.08]));
   }else{
    arm(i,vadd(m.shoulder,[s*.27,-.68+.39*t,.01-.23*t]),vadd(m.shoulder,[s*.34,-.1,-.33]));
   }
  });
  if(id==='remo_kettlebell')arm(1,[-.18,.74,.17],[-.26,.96,.22]);
  material(id==='remo_barra'?'bar':id==='remo_kettlebell'?'kb':'db1');
 }else if(is(id,'press_militar press_hombro_mancuernas press_arnold')){
  if(id!=='press_militar'){seated();bench([0,.87,-.18],.72,.45,Math.PI/2);}
  sides.forEach((s,i)=>arm(i,vadd(m.shoulder,[s*(.32-.09*t),.02+.66*t,(id==='press_arnold'?.24:.08)*(1-t)]),vadd(m.shoulder,[s*(id==='press_arnold'?.25+.22*t:.46),-.27,.08])));
  material(id==='press_militar'?'bar':'db1');
 }else if(is(id,'curl_barra curl_alterno curl_martillo curl_inclinado curl_concentrado')){
  if(id==='curl_inclinado'){seated(-.34);bench([0,.79,-.24],.72,.45,1.23);}
  if(id==='curl_concentrado')seated(.84);
  sides.forEach((s,i)=>{
   const k=id==='curl_alterno'&&i===1?1-t:t;
   const shoulder=vadd(m.shoulder,[s*.22,0,0]);
   const elbow=id==='curl_concentrado'&&i===0?[.18,.61,.36]:vadd(shoulder,[s*.025,-.355,.025]);
   const hand=vadd(elbow,[0,-.335*Math.cos(k*2.45),.335*Math.sin(k*2.45)]);
   m.arms[i]={shoulder,elbow,hand};
  });
  if(id==='curl_concentrado')arm(1,[-.21,.58,.33],[-.27,.8,.12]);
  material(id==='curl_barra'?'bar':'db1');
 }else if(id==='extension_triceps_mancuerna'){
  seated();sides.forEach((s,i)=>{const shoulder=vadd(m.shoulder,[s*.22,0,0]),elbow=vadd(shoulder,[s*-.11,.34,0]);m.arms[i]={shoulder,elbow,hand:vadd(elbow,[s*-.08,.326*Math.cos((1-t)*2.55),-.326*Math.sin((1-t)*2.55)])};});material('db1');m.singleCentered=true;
 }else if(id==='elevaciones_laterales'||id==='elevaciones_frontales_disco'){
  sides.forEach((s,i)=>{const theta=t*Math.PI/2,lateral=id==='elevaciones_laterales';arm(i,vadd(m.shoulder,[lateral?s*(.22+.67*Math.sin(theta)):s*.08,-.67*Math.cos(theta),lateral?.045:.67*Math.sin(theta)]),vadd(m.shoulder,[lateral?s*.46:s*.18,-.32,.16]));});material(id==='elevaciones_laterales'?'db1':'plate');
 }else if(id==='remo_menton'){
  sides.forEach((s,i)=>arm(i,vadd(m.shoulder,[s*.32,-.68+.46*t,.10]),vadd(m.shoulder,[s*.55,-.05,.02])));material('bar');
 }else if(id==='encogimientos'){
  m.shoulder[1]+=.055*t;hanging();material('bar');
 }else if(is(id,'gemelo_pie gemelo_una_pierna')){
  torso([0,.99+.095*t,0]);sides.forEach((s,i)=>leg(i,[s*.16,.08+.095*t,.06],[s*.16,.55,.15],[s*.16,.07,.21]));
  if(id==='gemelo_una_pierna'){leg(1,[-.14,.42,-.2],[-.14,.55,.03]);m.props.push({name:'support',center:[-.48,.50,.20],size:[.05,1,.05]});arm(1,[-.48,1.05,.20],[-.35,1.18,.14]);arm(0,vadd(m.shoulder,[.28,-.685,.025]),vadd(m.shoulder,[.28,-.34,.05]));}
  else hanging();material('db1');
 }else if(id==='step_up'){
  torso([0,1.0+.38*t,.08+.36*t],.06);
  leg(0,[.15,.46,.45],[.15,.62,.6]);leg(1,[-.15,.08+.38*t,.02+.29*t],[-.15,.55,.31]);
  bench([0,.37,.47],.55,.70);hanging();material('db1');
 }else if(is(id,'hip_thrust puente_gluteo_una_pierna')){
  const raised=id==='hip_thrust',shoulderY=raised?.58:.16,hipY=raised?.29+.29*t:.19+.25*t;
  m.hip=[0,hipY,0];m.shoulder=[0,shoulderY,-Math.sqrt(.56**2-(shoulderY-hipY)**2)];m.head=vadd(m.shoulder,[0,.03,-.18]);
  sides.forEach((s,i)=>leg(i,[s*.18,.08,.59],[s*.18,.64,.38]));
  if(raised){bench([0,.44,-.67],.45,.8);const p=vadd(m.hip,[0,.13,0]);sides.forEach((s,i)=>arm(i,vadd(p,[s*.3,0,0]),vadd(m.shoulder,[s*.30,-.05,.27])));material('bar',p);}
  else{leg(1,[-.13,.47,.75],[-.13,.48,.39]);sides.forEach((s,i)=>arm(i,[s*.31,.07,-.02],[s*.27,.07,-.33]));}
 }else if(is(id,'flexiones flexiones_declinadas plancha')){
  const plank=id==='plancha',elevated=id==='flexiones_declinadas';
  const sy=plank?.43:.27+.37*t,ay=elevated?.47:.08;
  m.shoulder=[0,sy,-.60];m.hip=[0,sy+(ay-sy)*.37,-.04];m.head=[0,sy+.015,-.78];m.roll=Math.PI;
  sides.forEach((s,i)=>{
   const hip=vadd(m.hip,[s*.13,0,0]),ankle=[s*.16,ay,.86];m.legs[i]={hip,knee:lerp(hip,ankle,.52),ankle,toe:[s*.16,ay-.015,.99]};
   if(plank)m.arms[i]={shoulder:[s*.22,sy,-.60],elbow:[s*.23,.08,-.60],hand:[s*.23,.08,-.92]};
   else arm(i,[s*.29,.08,-.63],[s*.49,.19,-.37]);
  });
  if(elevated)bench([0,.37,.97],.4,.8);
 }else if(id==='plancha_lateral'){
  m.hip=[0,.38,0];m.shoulder=[0,.50,-.55];m.head=[0,.53,-.73];m.roll=Math.PI/2;
  sides.forEach((s,i)=>{const hip=[0,.38+s*.13,0],ankle=[0,.08+(i===0?.13:0),.84];m.legs[i]={hip,knee:lerp(hip,ankle,.52),ankle,toe:vadd(ankle,[.12,0,.07])};});
  m.arms=[{shoulder:[0,.72,-.55],elbow:[0,1.07,-.55],hand:[0,1.40,-.55]},{shoulder:[0,.28,-.55],elbow:[0,.08,-.30],hand:[.32,.08,-.30]}];
 }else if(id==='fondos_banco'){
  torso([0,.44+.16*t,.12],-.08);sides.forEach((s,i)=>{leg(i,[s*.20,.08,.73],[s*.20,.45,.47]);arm(i,[s*.27,.54,-.23],[s*.32,.70,-.30]);});bench([0,.45,-.41],.48,.8);
 }else if(id==='curl_nordico'){
  const theta=.8*t,hip=[0,.08+.476*Math.cos(theta),.476*Math.sin(theta)];torso(hip,theta);
  sides.forEach((s,i)=>{m.legs[i]={hip:vadd(hip,[s*.13,0,0]),knee:[s*.14,.08,0],ankle:[s*.14,.08,-.44],toe:[s*.14,.08,-.58]};arm(i,vadd(m.shoulder,[s*.22,-.32,.42]),vadd(m.shoulder,[s*.23,-.30,.13]));});
  m.props.push({name:'ankleSupport',center:[0,.20,-.43],size:[.58,.13,.14]});
 }else if(id==='superman'){
  torso([0,.73,-.15],Math.PI/2+.40*(1-t));
  sides.forEach((s,i)=>{leg(i,[s*.18,.08,-.87],[s*.17,.48,-.52]);arm(i,vadd(m.shoulder,[s*.08,.10,-.04]),vadd(m.shoulder,[s*.30,-.20,-.18]));});bench([0,.60,-.40],.8);m.roll=Math.PI;
 }else if(is(id,'elevacion_piernas_banco crunch_declinado dead_bug')){
  const ground=id==='dead_bug',crunch=id==='crunch_declinado';
  torso([0,ground?.16:.64,0],-Math.PI/2+(crunch?.40*t:0));
  if(!ground)bench([0,.50,-.27],1.2);
  sides.forEach((s,i)=>{
   const hip=vadd(m.hip,[s*.13,0,0]);
   if(ground){const k=i===0?0:t,knee=vadd(hip,[0,.476*Math.cos(k*1.3),.476*Math.sin(k*1.3)]),ankle=vadd(knee,[0,-.448*Math.sin(k*.18),.448*Math.cos(k*.18)]);m.legs[i]={hip,knee,ankle,toe:vadd(ankle,[0,.02,.13])};}
   else if(crunch)leg(i,[s*.18,.38,.66],[s*.18,.52,.4]);
   else{const theta=t*1.25,knee=vadd(hip,[0,.476*Math.sin(theta),.476*Math.cos(theta)]),ankle=vadd(knee,[0,.448*Math.sin(theta),.448*Math.cos(theta)]);m.legs[i]={hip,knee,ankle,toe:vadd(ankle,[0,.04,.10])};}
   if(ground){const k=i===0?t:0;arm(i,vadd(m.shoulder,[s*.22,.67*Math.cos(k*1.30),-.67*Math.sin(k*1.30)]),vadd(m.shoulder,[s*.24,.32,-.14]));}
   else if(crunch)arm(i,vadd(m.shoulder,[s*.05,.13,.05]),vadd(m.shoulder,[s*.25,-.04,.16]));
   else arm(i,vadd(m.hip,[s*.27,.04,-.17]),vadd(m.shoulder,[s*.28,-.03,.19]));
  });
 }else if(id==='russian_twist'){
  torso([0,.20,0],-.40);sides.forEach((s,i)=>leg(i,[s*.15,.12,.63],[s*.17,.40,.3]));
  sides.forEach((s,i)=>arm(i,vadd(m.shoulder,[s*.07,-.15,.57]),vadd(m.shoulder,[s*.27,-.30,.21])));
  const theta=(t-.5)*1.1,pivot=m.hip;
  const rotate=p=>{const d=vsub(p,pivot);return vadd(pivot,[d[0]*Math.cos(theta)+d[2]*Math.sin(theta),d[1],-d[0]*Math.sin(theta)+d[2]*Math.cos(theta)]);};
  m.shoulder=rotate(m.shoulder);m.head=rotate(m.head);m.arms=m.arms.map(a=>Object.fromEntries(Object.entries(a).map(([k,p])=>[k,rotate(p)])));material('plate',lerp(m.arms[0].hand,m.arms[1].hand,.5));
 }else if(id==='paseo_granjero'){
  const stride=(t-.5)*.42;
  sides.forEach((s,i)=>leg(i,[s*.16,.08+Math.max(0,s*Math.sin(t*Math.PI*2))*.055,s*stride],[s*.16,.52,s*stride+.12]));hanging();material('db1');
 }else covered=false;
 if(!covered)throw new Error('Movimiento sin definir: '+id);
 return m;
}
