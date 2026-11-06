const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v)),R=Math.random,pick=a=>a[Math.floor(R()*a.length)],gauss=()=>(R()+R()+R())/3*100;
const Sim={agents:[],t:0,food:100,log:[],links:[],
 place(k){return WORLD.places.find(p=>p.k===k)},
 make(id,name){const m=pick(MBTI),t={};TRAITS.forEach(k=>t[k]=gauss());
  for(const l of m)if(BIAS[l])for(const k in BIAS[l])t[k]+=BIAS[l][k];TRAITS.forEach(k=>t[k]=Math.round(clamp(t[k])));
  const g=GOALS.map(([n,k])=>[n,t[k]+R()*40]).sort((a,b)=>b[1]-a[1])[0][0];
  return{id,name,age:18+Math.floor(R()*50),mbti:m,t,goal:g,x:R()*WORLD.w,y:R()*WORLD.h,home:{x:380+R()*200,y:480+R()*90},
   s:{fome:R()*50,energia:60+R()*40,humor:50+(t.otimismo-t.pessimismo)/4,estresse:R()*30,solidao:R()*40,satisfacao:50},
   act:"descansar",timer:0,tgt:null,cd:0,rel:{},mem:[],work:0}},
 init(n=14){this.agents=[];this.t=0;this.food=100;this.log=[];const ns=[...NAMES].sort(()=>R()-.5);for(let i=0;i<n;i++)this.agents.push(this.make(i,ns[i]));
  this.agents.forEach(a=>this.pushLog(a.name+" chegou à comunidade."))},
 pushLog(x){this.log.unshift(`[${this.clock()}] ${x}`);this.log.length=Math.min(this.log.length,80)},
 clock(){const m=this.t%1440;return`Dia ${Math.floor(this.t/1440)+1} ${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`},
 hour(){return Math.floor(this.t%1440/60)},
 rel(a,b){return a.rel[b.id]||(a.rel[b.id]={afinidade:50,confianca:a.t.confianca_inicial*.6,familiaridade:0,respeito:50,atracao:R()*45*a.t.romantismo/60,ressentimento:0,conflito:0})},
 memScore(a,b){return a.mem.filter(m=>m.w===b.id).reduce((s,m)=>s+m.val*m.int,0)},
 remember(a,b,txt,val,int){a.mem.unshift({txt,w:b.id,val,int,t:this.t});if(a.mem.length>30)a.mem.pop()},
 pickPartner(a){let best=null,bs=-1e9;for(const b of this.agents){if(b===a)continue;const r=this.rel(a,b),d=Math.hypot(a.x-b.x,a.y-b.y);
  const sc=r.afinidade*.5+r.familiaridade*.3+r.confianca*.2-r.ressentimento*.6-r.conflito*.4+this.memScore(a,b)*20-d*.05+R()*25;if(sc>bs){bs=sc;best=b}}return best},
 utilities(a){const t=a.t,s=a.s,n=x=>x/100,h=this.hour(),day=h>=7&&h<19,o={},g=a.goal;
  o.comer=this.food>0?n(s.fome)**1.5*1.5:0;
  o.dormir=n(100-s.energia)**1.5*1.3+(h>=22||h<6?.4:0);
  o.trabalhar=day?n(t.ambicao)*.3+n(t.disciplina)*.2+(g[0]=="A"?.15:0)-n(s.estresse)*.2-n(100-s.energia)*.2:-1;
  o.socializar=n(s.solidao)*.5+n(t.sociabilidade)*.35-n(t.timidez)*.2+n(s.humor)*.1-n(t.ansiedade)*n(s.estresse)*.3+(g[0]=="F"||g[0]=="E"?.15:0)-(h<6?.5:0);
  o.descansar=n(s.estresse)*.5+n(100-s.energia)*.3;
  o.explorar=n(t.curiosidade)*.3+n(t.abertura)*.15-n(t.aversao_risco)*.15+(g[0]=="C"?.15:0)-n(100-s.energia)*.2;
  let worst=0;this.agents.forEach(b=>{if(b!==a)worst=Math.max(worst,this.rel(a,b).conflito+this.rel(a,b).ressentimento)});
  o.evitar=n(s.estresse)*.3+n(t.ansiedade)*.15+n(worst)*.4-.15;
  for(const k in o)o[k]+=R()*.12;return o},
 choose(a){const u=this.utilities(a);let best=a.act,bv=-9;for(const k in u)if(u[k]>bv){bv=u[k];best=k}
  if(best!==a.act){a.act=best;a.tgt=null}a.timer=30+R()*60;
  if(best==="socializar")a.tgt=this.pickPartner(a);
  if(best==="explorar")a.dest={x:R()*WORLD.w,y:R()*WORLD.h};
  if(best==="evitar"){let w=null,v=-1;this.agents.forEach(b=>{if(b!==a){const r=this.rel(a,b),x=r.conflito+r.ressentimento;if(x>v){v=x;w=b}}});a.dest=w?{x:clamp(a.x*2-w.x,0,WORLD.w),y:clamp(a.y*2-w.y,0,WORLD.h)}:{x:R()*WORLD.w,y:R()*WORLD.h}}},
 dest(a){const k={comer:"food",trabalhar:"work",dormir:"home"}[a.act];
  if(a.act==="dormir")return a.home;if(k)return this.place(k);if(a.act==="socializar"&&a.tgt)return a.tgt;
  if(a.act==="explorar"||a.act==="evitar")return a.dest;return null},
 interact(a,b){const r=this.rel(a,b),q=this.rel(b,a),ta=a.t,tb=b.t;let kind="amigavel";
  if(r.atracao>45&&R()<.25&&a.age>=18&&b.age>=18)kind="romance";
  else if(R()<ta.agressividade/100*.2+r.conflito/300+r.ressentimento/400)kind="provocar";
  const sc=((q.afinidade-50)/100+q.confianca/300+(tb.tolerancia-50)/150-q.ressentimento/200+(b.s.humor-50)/200-tb.irritabilidade*.003+(R()-.5)*.4);
  let ok,col,txt;
  if(kind==="amigavel"){ok=sc>-.05;col="#6c6";txt=ok?`${a.name} conversou amistosamente com ${b.name}.`:`${b.name} reagiu com frieza a ${a.name}.`}
  else if(kind==="provocar"){ok=sc>.25;col="#e55";txt=ok?`${b.name} levou a provocação de ${a.name} na brincadeira.`:`${a.name} provocou ${b.name}, que se ofendeu.`}
  else{ok=q.atracao/100+q.afinidade/200+sc>.55;col="#e8a";txt=ok?`${a.name} demonstrou interesse e ${b.name} correspondeu.`:`${a.name} demonstrou interesse e ${b.name} recusou.`}
  const sa=1+ta.sensibilidade/200,sb=1+tb.sensibilidade/200;
  r.familiaridade=clamp(r.familiaridade+2);q.familiaridade=clamp(q.familiaridade+2);
  if(kind==="amigavel"){const d=ok?3:-2;r.afinidade=clamp(r.afinidade+d);q.afinidade=clamp(q.afinidade+d*sb);if(ok){r.confianca=clamp(r.confianca+1.5);q.confianca=clamp(q.confianca+1.5);a.s.solidao=clamp(a.s.solidao-12);b.s.solidao=clamp(b.s.solidao-12);a.s.humor=clamp(a.s.humor+3);b.s.humor=clamp(b.s.humor+3)}else{r.ressentimento=clamp(r.ressentimento+1);a.s.humor=clamp(a.s.humor-2*sa)}}
  else if(kind==="provocar"){if(ok){q.afinidade=clamp(q.afinidade+1);r.afinidade=clamp(r.afinidade+1)}else{q.afinidade=clamp(q.afinidade-6*sb);q.ressentimento=clamp(q.ressentimento+8*sb);q.conflito=clamp(q.conflito+10*sb);r.conflito=clamp(r.conflito+5);b.s.humor=clamp(b.s.humor-6*sb);b.s.estresse=clamp(b.s.estresse+8*sb);a.s.estresse=clamp(a.s.estresse+2)}}
  else{if(ok){r.atracao=clamp(r.atracao+6);q.atracao=clamp(q.atracao+8);r.afinidade=clamp(r.afinidade+4);q.afinidade=clamp(q.afinidade+4);a.s.humor=clamp(a.s.humor+8);b.s.humor=clamp(b.s.humor+6)}else{r.atracao=clamp(r.atracao-3);a.s.humor=clamp(a.s.humor-8*sa);a.s.estresse=clamp(a.s.estresse+5)}}
  const bad=kind==="provocar"&&!ok||kind!=="provocar"&&!ok,v=bad?-1:1;
  this.remember(a,b,txt,v,.4+R()*.3);this.remember(b,a,txt,v,.4+R()*.3);this.pushLog(txt);this.links.push({a,b,col,ttl:40});a.cd=60;b.cd=30},
 step(){this.t++;const rec=this.t%120===0;
  for(const a of this.agents){const s=a.s,t=a.t;
   s.fome=clamp(s.fome+.07);s.energia=clamp(s.energia-.04);s.solidao=clamp(s.solidao+.03*(t.sociabilidade/50)*(1-t.independencia/200));
   s.estresse=clamp(s.estresse-.01*(t.resiliencia/50)+(s.fome>80?.04:0));
   s.humor=clamp(s.humor+((50+(t.otimismo-t.pessimismo)/4-s.humor)*.002)-(s.fome>80?.04:0)-(s.solidao>80?.02:0));
   s.satisfacao=clamp(s.satisfacao+((s.humor*.5+(100-s.solidao)*.2+(100-s.fome)*.15+(100-s.estresse)*.15)-s.satisfacao)*.01);
   if(a.cd>0)a.cd--;a.timer--;
   if(a.timer<=0||(s.fome>92&&a.act!=="comer"&&this.food>0)||(s.energia<8&&a.act!=="dormir"))this.choose(a);
   const d=this.dest(a);
   if(d){const dx=d.x-a.x,dy=d.y-a.y,dist=Math.hypot(dx,dy),sp=a.act==="explorar"?1:1.4;
    if(dist>12){a.x+=dx/dist*sp;a.y+=dy/dist*sp}
    else{const at=a.act;
     if(at==="comer"){if(this.food>0){s.fome=clamp(s.fome-3);this.food-=.05;if(s.fome<10)a.timer=0}else a.timer=0}
     else if(at==="dormir"){s.energia=clamp(s.energia+.9);if(s.energia>95&&this.hour()>=6)a.timer=0}
     else if(at==="trabalhar"){s.energia=clamp(s.energia-.08);s.estresse=clamp(s.estresse+.02);s.satisfacao=clamp(s.satisfacao+.03);this.food+=.012}
     else if(at==="socializar"&&a.tgt&&a.cd===0&&a.tgt.cd<30&&["socializar","descansar","explorar"].includes(a.tgt.act)||at==="socializar"&&a.tgt&&a.cd===0&&a.tgt.cd<30){this.interact(a,a.tgt);a.timer=Math.min(a.timer,25)}
     else if(at==="explorar"||at==="evitar"){a.timer=Math.min(a.timer,5)}}}
   if(a.act==="descansar"){s.energia=clamp(s.energia+.3);s.estresse=clamp(s.estresse-.12)}
   if(rec)for(const m of a.mem)m.int*=m.int>.7?.995:.97;
   if(rec)a.mem=a.mem.filter(m=>m.int>.05)}
  this.food=Math.min(this.food+.02,150);
  this.links=this.links.filter(l=>--l.ttl>0)},
 save(){localStorage.setItem("matrix",JSON.stringify({agents:this.agents,t:this.t,food:this.food,log:this.log}))},
 load(){const d=JSON.parse(localStorage.getItem("matrix")||"null");if(!d)return false;
  Object.assign(this,{agents:d.agents,t:d.t,food:d.food,log:d.log,links:[]});
  this.agents.forEach(a=>a.tgt=null);return true}};
