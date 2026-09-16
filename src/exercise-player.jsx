import React,{useEffect,useRef,useState} from 'react';
import {Play,Pause,RotateCcw,Move3d,Info} from 'lucide-react';
import {getFigure,sampleMotion,cycleAmount,STATIC_IDS,MOTION_GUIDES} from './exercise-motion.js';
import {createExerciseScene} from './exercise-scene.js';

// Miniaturas vectoriales volumétricas: cero contextos WebGL en las listas.
export function ExerciseThumbnail({exercise,frame,size=120,muted=false,amount}) {
  const fig=getFigure(exercise);
  const m=fig?sampleMotion(exercise,amount??frame??fig.thumb):null;
  if(!m)return <span className="e-demo-missing" style={{width:size}}>Sin demostración</span>;
  const project=p=>[(p[0]*.66+p[2]*.75)*100,-p[1]*100+(p[2]*.15-p[0]*.16)*100];
  const points=[...(m.props||[]).flatMap(p=>[[-1,-1],[-1,1],[1,-1],[1,1]].map(([x,z])=>[p.center[0]+x*p.size[0]/2,p.center[1]-Math.sin(p.angle||0)*z*p.size[2]/2,p.center[2]+z*Math.cos(p.angle||0)*p.size[2]/2])),m.hip,m.shoulder,m.head,...m.arms.flatMap(a=>Object.values(a)),...m.legs.flatMap(a=>Object.values(a))].map(project);
  const minX=Math.min(...points.map(p=>p[0]))-20,maxX=Math.max(...points.map(p=>p[0]))+20;
  const minY=Math.min(...points.map(p=>p[1]))-18,maxY=Math.max(...points.map(p=>p[1]))+12;
  const line=(a,b,width,color,key)=>{const p=project(a),q=project(b);return <line key={key} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={color} strokeWidth={width} strokeLinecap="round"/>;};
  const skin=muted?'#8c96a0':'#c8b7a4',shirt=muted?'#4a606b':'#4b98af',pants='#344555';
  const equipment=()=>{
    const center=m.equipCenter||(m.singleCentered?m.arms[0].hand.map((v,i)=>(v+m.arms[1].hand[i])/2):m.arms[m.weightHand||0].hand);
    const kind=m.pose.equip;
    if(!kind)return null;
    if(kind==='bar')return <g>{line([-.65,center[1],center[2]],[.65,center[1],center[2]],3,'#adbdc8')}{[-1,1].map(side=>{const p=project([side*.53,center[1],center[2]]);return <ellipse key={side} cx={p[0]} cy={p[1]} rx={7} ry={12} fill="#273a4b" stroke="#39bde9" strokeWidth={2}/>;})}</g>;
    if(kind==='kb'){const p=project(center);return <g transform={`translate(${p})`}><ellipse cx={0} cy={2} rx={4} ry={5} fill="none" stroke="#adbdc8" strokeWidth={2}/><circle cx={0} cy={10} r={8} fill="#39bde9"/></g>;}
    if(kind==='plate'){const p=project(center);return <circle cx={p[0]} cy={p[1]} r={10} fill="#273a4b" stroke="#39bde9" strokeWidth={2}/>;}
    return (exercise.loadMode==='pair'?m.arms.map(a=>a.hand):[center]).map((a,i)=>{const p=project(a);return <g key={i} transform={`translate(${p})`}><rect x={-9} y={-2} width={18} height={4} rx={2} fill="#adbdc8"/><rect x={-11} y={-6} width={5} height={12} rx={2} fill="#39bde9"/><rect x={6} y={-6} width={5} height={12} rx={2} fill="#39bde9"/></g>;});
  };
  return <svg className="e-ex-thumb" viewBox={`${minX} ${minY} ${maxX-minX} ${maxY-minY}`} width={size} height={size*.85} role="img" aria-label={`${exercise.name}: vista del movimiento`}>
    {(m.props||[]).map(prop=>{const corners=[[-1,-1],[-1,1],[1,1],[1,-1]].map(([x,z])=>project([prop.center[0]+x*prop.size[0]/2,prop.center[1]-Math.sin(prop.angle||0)*z*prop.size[2]/2,prop.center[2]+z*Math.cos(prop.angle||0)*prop.size[2]/2]).join(','));return <polygon key={prop.name} points={corners.join(' ')} fill="#334a60" stroke="#728797" strokeWidth={1}/>;})}
    {m.legs.map((l,i)=><g key={i} opacity={i?.8:1}>{line(l.hip,l.knee,14,pants)}{line(l.knee,l.ankle,10,pants)}{line(l.ankle,l.toe,9,'#dce3e9')}</g>)}
    {line(m.hip,m.shoulder,29,shirt)}
    {line(m.shoulder,m.head,8,skin)}
    <ellipse cx={project(m.head)[0]} cy={project(m.head)[1]} rx={8} ry={11} fill={skin}/>
    {m.arms.map((a,i)=><g key={i} opacity={i?.8:1}>{line(a.shoulder,a.elbow,10,shirt)}{line(a.elbow,a.hand,7,skin)}</g>)}
    {equipment()}
  </svg>;
}

export function ExercisePlayer({exercise}) {
  const fig=getFigure(exercise), id=fig?(getFigure({id:exercise.id})?exercise.id:exercise.figureOf):null;
  const guide=MOTION_GUIDES[id];
  const isStatic=STATIC_IDS.has(id);
  const host=useRef(null),scene=useRef(null),progressRef=useRef(0),playingRef=useRef(false);
  const [progress,setProgress]=useState(0),[playing,updatePlaying]=useState(false),[speed,setSpeed]=useState(.75),[view,setView]=useState('three'),[error,setError]=useState(false);
  const setPlaying=next=>{const value=typeof next==='function'?next(playingRef.current):next;playingRef.current=value;updatePlaying(value);};
  const [reduced,setReduced]=useState(()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false);
  const [visible,setVisible]=useState(true);
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{setReduced(media.matches);if(media.matches)setPlaying(false);};
    media.addEventListener('change',change);return ()=>media.removeEventListener('change',change);
  },[]);
  useEffect(()=>{
    const handler=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',handler);
    const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting&&!document.hidden));
    if(host.current)observer.observe(host.current);
    return ()=>{document.removeEventListener('visibilitychange',handler);observer.disconnect();};
  },[id]);
  useEffect(()=>{
    progressRef.current=0;setProgress(0);setPlaying(false);setView('three');setError(false);
    if(!fig||!host.current)return;
    let instance;
    const fail=e=>{e.preventDefault();setError(true);setPlaying(false);};
    try{instance=createExerciseScene(host.current,exercise);scene.current=instance;host.current.querySelector('canvas')?.addEventListener('webglcontextlost',fail);}
    catch{setError(true);host.current.replaceChildren();}
    return ()=>{const canvas=host.current?.querySelector('canvas');canvas?.removeEventListener('webglcontextlost',fail);instance?.dispose();scene.current=null;};
  },[id,exercise.loadMode]);
  useEffect(()=>{
    if(!playing||!visible||isStatic||reduced)return;
    let raf,previous;
    const tick=time=>{
      if(!playingRef.current)return;
      if(previous!=null){const delta=Math.min(time-previous,80);progressRef.current=(progressRef.current+delta*speed/6400)%1;setProgress(progressRef.current);scene.current?.draw(cycleAmount(progressRef.current));}
      previous=time;raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(raf);
  },[playing,speed,visible,isStatic,reduced]);
  const seek=p=>{setPlaying(false);progressRef.current=p;setProgress(p);scene.current?.draw(cycleAmount(p));};
  const phase=isStatic?0:progress<.12?0:progress<.46?1:progress<.58?2:3;
  const labels=isStatic?['Postura','Apoyos','Respiración']:['Preparación','Movimiento','Final del recorrido','Regreso'];
  const [staticStep,setStaticStep]=useState(0);
  const cue=isStatic?guide?.[staticStep+1]:guide?.[phase===0?1:phase===3?3:2];
  if(!fig)return <div className="e-demo-missing"><Info size={22}/><b>Este ejercicio no tiene demostración todavía.</b><p>La técnica escrita está disponible debajo.</p></div>;
  return <div className="e-demo" data-exercise={id}>
    <div className="e-demo-stage">
      <div className="e-demo-heading"><span><i/>ESTUDIO DE MOVIMIENTO</span><b>{isStatic?'Postura estática':'Demostración 3D'}</b></div>
      <div className="e-demo-canvas" ref={host} role="img" aria-label={`Modelo tridimensional de ${exercise.name}`}/>
      {error&&<div className="e-demo-fallback"><ExerciseThumbnail exercise={exercise} amount={cycleAmount(progress)} size={260}/><span>Vista alternativa · 3D no disponible en este dispositivo</span></div>}
      <div className="e-demo-camera" aria-label="Ángulo de cámara">{[['three','3/4'],['front','Frente'],['side','Perfil']].map(([key,label])=><button key={key} type="button" disabled={error} aria-pressed={view===key} onClick={()=>{setView(key);scene.current?.view(key);}}>{label}</button>)}</div>
      {!error&&<span className="e-demo-drag"><Move3d size={14}/>Arrastra para girar la vista</span>}
    </div>
    <div className="e-demo-controls">
      {!isStatic&&<>
        <div className="e-demo-transport">
          <button type="button" className="e-demo-play" disabled={reduced} aria-label={playing?'Pausar demostración':'Reproducir demostración'} onClick={()=>setPlaying(p=>!p)}>{playing?<Pause size={19}/>:<Play size={19}/>}<span>{playing?'Pausar':'Reproducir'}</span></button>
          <button type="button" aria-label="Reiniciar demostración" onClick={()=>seek(0)}><RotateCcw size={18}/></button>
          <label>Velocidad<select aria-label="Velocidad de demostración" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.5}>0,5×</option><option value={.75}>0,75×</option><option value={1}>1×</option></select></label>
        </div>
        <input className="e-demo-scrub" type="range" min="0" max="1000" step="1" value={Math.round(progress*1000)} aria-label="Posición del movimiento" aria-valuetext={labels[phase]} onChange={e=>seek(Number(e.target.value)/1000)}/>
        {reduced&&<p className="e-demo-help">Movimiento reducido activo. Puedes explorar las posiciones con la barra o las fases.</p>}
      </>}
      <div className="e-demo-phases">{labels.map((label,i)=><button key={label} type="button" aria-current={(isStatic?staticStep:phase)===i?'step':undefined} onClick={()=>isStatic?setStaticStep(i):seek([0,.29,.5,.79][i])}><span>{String(i+1).padStart(2,'0')}</span>{label}</button>)}</div>
      <div className="e-demo-cue" aria-live={playing?'off':'polite'}><span className="e-demo-cue-index">{String((isStatic?staticStep:phase)+1).padStart(2,'0')}</span><div><h3>{guide?.[0]||exercise.name}</h3><p>{cue}</p></div></div>
      <p className="e-demo-help">Ilustración del movimiento, no una evaluación de tu técnica. El recorrido debe ser cómodo; detente si aparece dolor.</p>
    </div>
  </div>;
}
