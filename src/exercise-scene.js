// Escena 3D propia. Se crea solo al abrir una ficha, nunca para cada miniatura.
import * as T from 'three';
import { sampleMotion, getFigure } from './exercise-motion.js';
const V=p=>new T.Vector3(...p);
export function createExerciseScene(container, exercise) {
  const renderer=new T.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.setClearColor(0x000000,0);
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(34,1,.01,40);
  scene.add(new T.HemisphereLight(0xe0efff,0x252336,2.3));
  const key=new T.DirectionalLight(0xffffff,3.4);key.position.set(3,5,4);scene.add(key);
  const rim=new T.DirectionalLight(0x4ad7ff,2.8);rim.position.set(-3,3,-3);scene.add(rim);
  const fill=new T.DirectionalLight(0xabb1ec,1.4);fill.position.set(2,2,-3);scene.add(fill);
  const materials={
    shirt:new T.MeshStandardMaterial({color:0x438ca7,roughness:.7}),
    pants:new T.MeshStandardMaterial({color:0x293644,roughness:.9}),
    skin:new T.MeshStandardMaterial({color:0xc8b7a4,roughness:.82}),
    sole:new T.MeshStandardMaterial({color:0xe2e5e4,roughness:.8}),
    shoe:new T.MeshStandardMaterial({color:0x414e5e,roughness:.8}),
    metal:new T.MeshStandardMaterial({color:0x9aafbb,metalness:.75,roughness:.3}),
    weight:new T.MeshStandardMaterial({color:0x273a4b,metalness:.25,roughness:.6}),
    accent:new T.MeshStandardMaterial({color:0x30baeb,metalness:.25,roughness:.35}),
    pad:new T.MeshStandardMaterial({color:0x25303f,roughness:.92}),
    floor:new T.MeshStandardMaterial({color:0x152333,transparent:true,opacity:.6,roughness:1}),
  };
  const sphere=new T.SphereGeometry(1,20,14);
  const cylinder=new T.CylinderGeometry(1,1,1,16);
  const box=new T.BoxGeometry(1,1,1);
  const torus=new T.TorusGeometry(.06,.013,10,20);
  const model=new T.Group();scene.add(model);
  const parts=new Map();
  const mesh=(name,geo,mat)=>{
    if(!parts.has(name)){const m=new T.Mesh(geo,materials[mat]);model.add(m);parts.set(name,m);}
    const m=parts.get(name);m.visible=true;return m;
  };
  const oval=(name,point,radii,mat)=>{const m=mesh(name,sphere,mat);m.position.copy(V(point));m.scale.set(...radii);return m;};
  const segment=(name,a,b,radius,mat,depth=radius)=>{
    const m=mesh(name,cylinder,mat), av=V(a),bv=V(b),v=bv.clone().sub(av);
    m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());m.scale.set(radius,v.length(),depth);return m;
  };
  const block=(name,point,scale,mat)=>{const m=mesh(name,box,mat);m.position.copy(V(point));m.scale.set(...scale);return m;};
  const torsoGeo=new T.LatheGeometry([
    new T.Vector2(.11,0),new T.Vector2(.15,.05),new T.Vector2(.145,.18),
    new T.Vector2(.19,.38),new T.Vector2(.21,.47),new T.Vector2(.16,.55),
  ],28);
  const torso=mesh('torso',torsoGeo,'shirt');
  let last=0,azimuth=1.0,elevation=.32;
  // Encuadre común a todo el recorrido: la cámara no bombea al mover los brazos.
  const bounds=new T.Box3();
  for(let j=0;j<=20;j++){
    const m=sampleMotion(exercise,j/20);
    [m.hip,m.shoulder,m.head,...m.arms.flatMap(a=>Object.values(a)),...m.legs.flatMap(a=>Object.values(a))].forEach(p=>bounds.expandByPoint(V(p)));
  }
  bounds.expandByScalar(.22);
  const center=bounds.getCenter(new T.Vector3()),extent=bounds.getSize(new T.Vector3());
  const floorY=-.025;
  const stage=new T.Mesh(new T.CylinderGeometry(1.5,1.5,.025,64),materials.floor);stage.position.set(0,floorY,0);scene.add(stage);
  const grid=new T.GridHelper(3,12,0x3f5f75,0x263d50);grid.position.y=floorY+.014;grid.material.transparent=true;grid.material.opacity=.25;scene.add(grid);
  function setCamera() {
    const vfov=camera.fov*Math.PI/180;
    const distance=Math.max(extent.y,extent.x/camera.aspect,extent.z/camera.aspect)*.68/Math.tan(vfov/2)+.8;
    camera.position.set(center.x+Math.sin(azimuth)*Math.cos(elevation)*distance,center.y+Math.sin(elevation)*distance,center.z+Math.cos(azimuth)*Math.cos(elevation)*distance);
    camera.lookAt(center);camera.updateProjectionMatrix();
  }
  function dumbbell(name,p,vertical=false,rotation=0) {
    const g=new T.Vector3(vertical?0:.12,vertical?.12:0,0);
    if(rotation)g.applyAxisAngle(new T.Vector3(0,1,0),rotation);
    const a=V(p).sub(g).toArray(),b=V(p).add(g).toArray();
    segment(name+'grip',a,b,.022,'metal');
    [a,b].forEach((v,i)=>{const m=oval(name+'plate'+i,v,vertical?[.07,.035,.07]:[.035,.075,.075],'weight');if(rotation)m.rotation.y=rotation;});
  }
  function draw(amount) {
    last=amount;parts.forEach(p=>p.visible=false);
    const m=sampleMotion(exercise,amount), pose=m.pose;
    const axis=V(m.shoulder).sub(V(m.hip)).normalize();
    torso.visible=true;torso.position.copy(V(m.hip));torso.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),axis);torso.scale.set(1,V(m.shoulder).distanceTo(V(m.hip))/.55,.64);
    if(m.roll)torso.quaternion.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),m.roll));
    oval('pelvis',m.hip,[.17,.115,.12],'pants').quaternion.copy(torso.quaternion);
    segment('neck',m.shoulder,m.head,.055,'skin');
    const head=oval('head',m.head,[.092,.123,.096],'skin');head.quaternion.copy(torso.quaternion);
    const face=V(m.head).add(new T.Vector3(0,.01,.08).applyQuaternion(torso.quaternion));
    oval('nose',face.toArray(),[.019,.025,.032],'skin').quaternion.copy(torso.quaternion);
    m.legs.forEach((l,i)=>{
      segment('thigh'+i,l.hip,l.knee,.087,'pants');oval('knee'+i,l.knee,[.077,.077,.077],'pants');
      segment('calf'+i,l.knee,l.ankle,.057,'pants');
      const mid=V(l.ankle).lerp(V(l.toe),.5);mid.y-=.018;
      const footRotation=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),V(l.toe).sub(V(l.ankle)).normalize());
      oval('shoe'+i,mid.toArray(),[.071,.049,.115],'shoe').quaternion.copy(footRotation);
      oval('sole'+i,[mid.x,mid.y-.028,mid.z],[.073,.016,.12],'sole');
    });
    m.arms.forEach((a,i)=>{
      oval('shoulder'+i,a.shoulder,[.10,.11,.10],'shirt');
      segment('sleeve'+i,a.shoulder,V(a.shoulder).lerp(V(a.elbow),.42).toArray(),.072,'shirt');
      segment('upperArm'+i,V(a.shoulder).lerp(V(a.elbow),.4).toArray(),a.elbow,.05,'skin');
      oval('elbow'+i,a.elbow,[.052,.052,.052],'skin');
      segment('forearm'+i,a.elbow,a.hand,.043,'skin');
      oval('hand'+i,a.hand,[.039,.061,.043],'skin');
    });
    for(const prop of m.props||[]){
      const obj=block(prop.name,prop.center,prop.size,'pad');obj.rotation.x=prop.angle||0;
      if(prop.name.startsWith('bench')){
        for(const [i,z] of [-.32,.32].entries()){
          const center=[prop.center[0],prop.center[1]-.06,prop.center[2]+z*prop.size[2]];
          segment(prop.name+'leg'+i,center,[center[0],.02,center[2]],.027,'metal');
          segment(prop.name+'foot'+i,[center[0]-.29,.025,center[2]],[center[0]+.29,.025,center[2]],.025,'metal');
        }
      }
    }
    const bench=pose.bench;
    if(bench){
      const seatW=bench.type==='incline'||bench.type==='decline'?bench.w*.45:bench.w;
      const by=(132-bench.y)*.014-.04, z=(bench.x+seatW/2-100)*.014;
      block('benchSeat',[0,by,z],[.45,.10,seatW*.014],'pad');
      for(const [i,end] of [bench.x+8,bench.x+seatW-8].entries()){
        const bz=(end-100)*.014;
        segment('benchLeg'+i,[0,by-.05,bz],[0,floorY+.03,bz],.035,'metal');
        segment('benchFoot'+i,[-.31,floorY+.035,bz],[.31,floorY+.035,bz],.028,'metal');
      }
      if(seatW!==bench.w){
        const length=(bench.w-seatW)*.014,ang=(bench.type==='incline'?38:-18)*Math.PI/180;
        const hinge=(bench.x+seatW-100)*.014;
        const back=block('benchBack',[0,by+Math.sin(ang)*length/2,hinge+Math.cos(ang)*length/2],[.45,.1,length],'pad');back.rotation.x=-ang;
      }
    }
    if(pose.wall){block('wall',[0,.7,(pose.wall-100)*.014-.14],[1,1.5,.05],'pad');}
    const id=m.id, kind=pose.equip;
    let point=m.equipCenter||m.arms[m.weightHand||0].hand;
    if(pose.equipAt==='hip')point=m.hip;
    if(pose.equipAt==='shoulder')point=V(m.shoulder).add(new T.Vector3(0,.035,-.03)).toArray();
    if(kind==='bar'){
      const p=[0,point[1],point[2]];
      segment('bar',[-.65,p[1],p[2]],[.65,p[1],p[2]],.019,'metal');
      for(const sign of [-1,1]){
        segment('barPlate'+sign,[sign*.53-.025,p[1],p[2]],[sign*.53+.025,p[1],p[2]],.15,'weight');
        segment('collar'+sign,[sign*.60-.012,p[1],p[2]],[sign*.60+.012,p[1],p[2]],.04,'accent');
      }
    } else if(kind==='db'||kind==='db1'){
      const paired=exercise.loadMode==='pair';
      (paired?m.arms:[m.singleCentered?{hand:V(m.arms[0].hand).lerp(V(m.arms[1].hand),.5).toArray()}:m.arms[m.weightHand||0]]).forEach((a,i)=>dumbbell('db'+i,a.hand,id==='curl_martillo'||id==='extension_triceps_mancuerna',id==='press_arnold'?amount*Math.PI*.7:0));
    } else if(kind==='kb'){
      const p=['swing_kb','sentadilla_goblet','sentadilla_banco'].includes(id)?[0,point[1],point[2]]:point;
      oval('kb',[p[0],p[1]-.10,p[2]],[.095,.10,.095],'weight');
      const handle=mesh('kbHandle',torus,'accent');handle.position.set(p[0],p[1]-.015,p[2]);
    } else if(kind==='plate'){
      const p=m.equipCenter||V(m.arms[0].hand).lerp(V(m.arms[1].hand),.5).toArray();segment('disc',[p[0],p[1],p[2]-.025],[p[0],p[1],p[2]+.025],.13,'weight');
    }
    renderer.render(scene,camera);
  }
  function resize(){const r=container.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height));camera.aspect=Math.max(1,r.width)/Math.max(1,r.height);setCamera();draw(last);}
  const observer=new ResizeObserver(resize);observer.observe(container);
  let dragging=null;
  const down=e=>{dragging=[e.clientX,e.clientY];renderer.domElement.setPointerCapture(e.pointerId);};
  const move=e=>{if(!dragging)return;azimuth-=(e.clientX-dragging[0])*.012;elevation=Math.max(-.12,Math.min(.9,elevation+(e.clientY-dragging[1])*.008));dragging=[e.clientX,e.clientY];setCamera();draw(last);};
  const up=()=>dragging=null;
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);
  resize();
  return {draw,view(name){azimuth=name==='front'?0:name==='side'?Math.PI/2:1;elevation=name==='front'?.12:.32;setCamera();draw(last);},dispose(){observer.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',up);const geos=new Set([sphere,cylinder,box,torus,torsoGeo]);scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);});geos.forEach(g=>g.dispose());Object.values(materials).forEach(m=>m.dispose());grid.material.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}
