/* Renderização da interface e mapa superior interativo. */
class VillageUI {
  constructor(sim){
    this.sim=sim;this.selectedId=null;
    this.list=document.getElementById("residentList");
    this.detail=document.getElementById("residentDetail");this.log=document.getElementById("eventLog");
    this.canvas=document.getElementById("villageMap");this.ctx=this.canvas.getContext("2d");
    this.viewport=document.getElementById("mapViewport");this.tooltip=document.getElementById("mapTooltip");
    this.hoveredId=null;this.animationFrame=null;this.resizeObserver=new ResizeObserver(()=>this.resizeCanvas());
    this.resizeObserver.observe(this.viewport);
    this.canvas.addEventListener("mousemove",e=>this.onMapMove(e));
    this.canvas.addEventListener("mouseleave",()=>{this.hoveredId=null;this.tooltip.style.display="none";this.drawMap()});
    this.canvas.addEventListener("click",e=>{const r=this.hitTest(e);if(r)this.select(r.id)});
    this.resizeCanvas();
  }
  initials(name){return name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}
  status(r){
    if(r.state.health<35||r.state.stress>85)return ["Crítico","#ff625e"];
    if(r.state.stress>60||r.state.mood<35)return ["Tensão","#e6b45e"];
    return ["Estável","#f4f4f0"];
  }
  render(){
    const s=this.sim;
    document.getElementById("dateLabel").textContent=`Dia ${s.day} · ${s.season}`;
    document.getElementById("timeLabel").textContent=s.timeString();
    document.getElementById("populationCount").textContent=s.residents.length;
    document.getElementById("wellbeingStat").textContent=s.wellbeing()+"%";
    document.getElementById("relationStat").textContent=s.positiveRelations();
    document.getElementById("eventStat").textContent=s.dailyEvents;
    this.drawMap();this.renderList();this.renderLog();
    if(this.selectedId!==null)this.renderDetail(this.selectedId);
    this.renderMapActivity();
  }
  resizeCanvas(){
    if(!this.canvas||!this.viewport)return;
    const rect=this.viewport.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
    this.canvas.width=Math.max(1,Math.floor(rect.width*dpr));
    this.canvas.height=Math.max(1,Math.floor(rect.height*dpr));
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.drawMap();
  }
  point(r){
    const w=this.viewport.clientWidth,h=this.viewport.clientHeight;
    return {x:r.map.x*w,y:r.map.y*h};
  }
  drawMap(){
    if(!this.ctx||!this.viewport)return;
    const ctx=this.ctx,w=this.viewport.clientWidth,h=this.viewport.clientHeight;
    if(!w||!h)return;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle="#050606";ctx.fillRect(0,0,w,h);

    // Subtle coordinate grid and understated landmarks make the top-down space legible.
    ctx.strokeStyle="rgba(255,255,255,.045)";ctx.lineWidth=1;
    for(let x=24;x<w;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
    for(let y=24;y<h;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.strokeStyle="rgba(255,255,255,.11)";ctx.setLineDash([3,7]);
    ctx.strokeRect(15,15,w-30,h-30);ctx.setLineDash([]);

    // A few location markers, purely visual zones.
    const zones=[
      {x:.19,y:.24,label:"MORADIAS",r:43},{x:.77,y:.24,label:"OFICINAS",r:43},
      {x:.49,y:.72,label:"PRAÇA",r:54},{x:.82,y:.76,label:"REFEITÓRIO",r:39}
    ];
    zones.forEach(z=>{
      const x=w*z.x,y=h*z.y;
      ctx.beginPath();ctx.arc(x,y,z.r,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,.018)";ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.10)";ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle="rgba(255,255,255,.25)";ctx.font="9px 'DM Mono', monospace";ctx.textAlign="center";ctx.fillText(z.label,x,y+z.r+13);
    });

    // Interaction beams remain visible briefly after a social event.
    const event=this.sim.lastMapEvent;
    if(event&&event.until>=this.sim.tickCount){
      const a=this.sim.residentById(event.a),b=this.sim.residentById(event.b);
      if(a&&b){
        const p=this.point(a),q=this.point(b),age=this.sim.tickCount-event.at;
        const alpha=Math.max(.15,1-age/4);
        ctx.save();ctx.globalAlpha=alpha;ctx.lineWidth=event.type==="conflict"?2.5:2;
        ctx.strokeStyle=event.type==="conflict"?"#ff625e":"#66e5d1";
        ctx.setLineDash(event.type==="conflict"?[4,4]:[]);
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.setLineDash([]);
        const mx=(p.x+q.x)/2,my=(p.y+q.y)/2;
        ctx.beginPath();ctx.arc(mx,my,8+age*2,0,Math.PI*2);ctx.stroke();
        ctx.restore();
      }
    }

    // Residents are rendered as small white points; hover and selection add a halo.
    this.sim.residents.forEach(r=>{
      const p=this.point(r),isHover=r.id===this.hoveredId,isSelected=r.id===this.selectedId;
      const marker=r.visualAction&&r.visualAction.until>=this.sim.tickCount?r.visualAction.type:null;
      if(isHover||isSelected){
        ctx.beginPath();ctx.arc(p.x,p.y,13,0,Math.PI*2);
        ctx.strokeStyle=isSelected?"#8be6d0":"rgba(255,255,255,.65)";ctx.lineWidth=1.2;ctx.stroke();
      }
      ctx.beginPath();ctx.arc(p.x,p.y,isHover||isSelected?4.8:3.4,0,Math.PI*2);
      ctx.fillStyle="#f5f5f0";ctx.shadowColor="rgba(255,255,255,.6)";ctx.shadowBlur=isHover?12:4;ctx.fill();ctx.shadowBlur=0;

      if(marker){
        const glyph={eat:"●",sleep:"z",socialize:"↔",work:"⌁",explore:"＋",avoid:"·",argue:"!"}[marker]||"·";
        const color={eat:"#e6b45e",sleep:"#a9a4ed",socialize:"#66e5d1",work:"#f2f2ee",explore:"#9bd27b",avoid:"#9ca3a0",argue:"#ff625e"}[marker]||"#fff";
        ctx.font="bold 12px 'DM Sans'";ctx.textAlign="center";ctx.fillStyle=color;ctx.fillText(glyph,p.x,p.y-10);
      }
      if(isHover||isSelected){
        ctx.font="10px 'DM Sans'";ctx.textAlign="center";ctx.fillStyle="#fff";
        ctx.fillText(r.name,p.x,p.y+22);
      }
    });
  }
  hitTest(e){
    const rect=this.canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
    let best=null,bestD=14;
    this.sim.residents.forEach(r=>{const p=this.point(r),d=Math.hypot(p.x-x,p.y-y);if(d<bestD){best=r;bestD=d}});
    return best;
  }
  onMapMove(e){
    const r=this.hitTest(e);this.hoveredId=r?r.id:null;
    if(r){
      const rect=this.viewport.getBoundingClientRect();
      this.tooltip.innerHTML="";
      const name=document.createElement("strong");name.textContent=r.name;
      const sub=document.createElement("span");sub.textContent=`${r.mbti} · ${r.age} anos · ${this.sim.actionLabel(r.action)}`;
      this.tooltip.append(name,sub);this.tooltip.style.display="block";
      const x=e.clientX-rect.left,y=e.clientY-rect.top;
      this.tooltip.style.left=Math.min(rect.width-190,Math.max(8,x+15))+"px";
      this.tooltip.style.top=Math.max(8,y-48)+"px";
      this.canvas.style.cursor="pointer";
    }else{this.tooltip.style.display="none";this.canvas.style.cursor="crosshair"}
    this.drawMap();
  }
  renderMapActivity(){
    const event=this.sim.lastMapEvent;
    const label=document.getElementById("mapActivity");
    if(event&&event.until>=this.sim.tickCount){
      const a=this.sim.residentById(event.a),b=this.sim.residentById(event.b);
      label.textContent=a&&b?(event.type==="conflict"?`Conflito: ${a.name} × ${b.name}`:`Interação: ${a.name} ↔ ${b.name}`):"Atividade recente";
    }else{
      const active=this.sim.residents.filter(r=>r.action!=="idle").length;
      label.textContent=`${active} habitantes em atividade`;
    }
  }
  renderList(){
    const q=document.getElementById("residentSearch").value.toLowerCase();this.list.innerHTML="";
    this.sim.residents.filter(r=>r.name.toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name)).forEach(r=>{
      const el=document.createElement("div");el.className="resident-row"+(r.id===this.selectedId?" active":"");
      el.innerHTML=`<div class="avatar">${this.initials(r.name)}</div><div class="resident-main"><strong></strong><span></span></div><div class="resident-age"></div>`;
      el.querySelector("strong").textContent=r.name;el.querySelector("span").textContent=`${r.mbti} · ${this.sim.actionLabel(r.action)}`;
      el.querySelector(".resident-age").textContent=`${r.age}a`;
      el.addEventListener("click",()=>this.select(r.id));this.list.append(el);
    });
  }
  select(id){this.selectedId=id;this.render();this.renderDetail(id)}
  meter(label,value){
    return `<div class="meter"><span>${label}</span><div class="meter-track"><div class="meter-fill" style="width:${Math.round(value)}%"></div></div><b>${Math.round(value)}</b></div>`;
  }
  renderDetail(id){
    const r=this.sim.residentById(id);if(!r)return;
    const relations=Object.values(this.sim.relations).filter(x=>x.a===id||x.b===id).sort((a,b)=>b.affinity-a.affinity).slice(0,4);
    const traitNames={sociabilidade:"Sociabilidade",assertividade:"Assertividade",curiosidade:"Curiosidade",empatia:"Empatia",impulsividade:"Impulsividade",estabilidade_emocional:"Estabilidade emocional",ambicao:"Ambição",planejamento:"Planejamento",agressividade:"Agressividade",romantismo:"Romantismo"};
    this.detail.innerHTML="";
    const top=document.createElement("div");top.className="detail-top";top.innerHTML=`<div class="avatar">${this.initials(r.name)}</div><div><div class="detail-name"></div><div class="detail-sub"></div></div>`;
    top.querySelector(".detail-name").textContent=r.name;top.querySelector(".detail-sub").textContent=`${r.age} anos · ${r.sex==="F"?"Feminino":"Masculino"} · ${r.location}`;
    this.detail.append(top);
    const tags=document.createElement("div");tags.innerHTML=`<span class="tag">${r.mbti}</span><span class="tag">${this.sim.actionLabel(r.action)}</span>`;this.detail.append(tags);
    const needs=document.createElement("div");needs.className="detail-section";needs.innerHTML="<h3>ESTADO ATUAL</h3>"+this.meter("Fome",r.state.hunger)+this.meter("Energia",r.state.energy)+this.meter("Humor",r.state.mood)+this.meter("Estresse",r.state.stress)+this.meter("Social",r.state.social)+this.meter("Saúde",r.state.health);this.detail.append(needs);
    const trait=document.createElement("div");trait.className="detail-section";trait.innerHTML="<h3>TRAÇOS PERMANENTES</h3><div class='trait-grid'></div>";
    Object.entries(traitNames).forEach(([key,label])=>{const el=document.createElement("div");el.className="trait";el.innerHTML="<span></span><b></b>";el.querySelector("span").textContent=label;el.querySelector("b").textContent=r.traits[key];trait.querySelector(".trait-grid").append(el)});
    const all=document.createElement("div");all.className="detail-sub";all.style.marginTop="7px";all.textContent=`40 traços individuais gerados na criação do habitante.`;trait.append(all);this.detail.append(trait);
    const goals=document.createElement("div");goals.className="detail-section";goals.innerHTML="<h3>OBJETIVOS</h3>";r.goals.forEach(g=>{const p=document.createElement("div");p.className="relation-row";p.textContent=g;goals.append(p)});this.detail.append(goals);
    const relBox=document.createElement("div");relBox.className="detail-section";relBox.innerHTML="<h3>RELAÇÕES MAIS RELEVANTES</h3>";
    relations.forEach(rel=>{const other=this.sim.residentById(rel.a===id?rel.b:rel.a);if(!other)return;const row=document.createElement("div");row.className="relation-row";const left=document.createElement("span");left.textContent=other.name;const right=document.createElement("b");right.textContent=`Afinidade ${Math.round(rel.affinity)}`;row.append(left,right);relBox.append(row)});if(!relations.length)relBox.append(document.createTextNode("Nenhuma relação registrada."));this.detail.append(relBox);
    const mem=document.createElement("div");mem.className="detail-section";mem.innerHTML="<h3>MEMÓRIAS RECENTES</h3>";
    r.memories.slice(0,4).forEach(m=>{const row=document.createElement("div");row.className="memory-row";row.textContent=`Dia ${m.day}, ${m.time} — ${m.text}`;mem.append(row)});if(!r.memories.length)mem.append(document.createTextNode("Ainda não há memórias relevantes."));this.detail.append(mem);
  }
  renderLog(){
    this.log.innerHTML="";
    if(!this.sim.events.length){this.log.innerHTML="<div class='log-empty'>Nenhum acontecimento registrado.</div>";return}
    this.sim.events.slice(0,25).forEach(e=>{const row=document.createElement("div");row.className="log-entry";const time=document.createElement("div");time.className="log-time";time.textContent=`D${e.day} ${e.time}`;const txt=document.createElement("div");txt.textContent=e.text;row.append(time,txt);this.log.append(row)});
  }
}
VillageSimulation.prototype.actionLabel=function(a){return DATA.actions[a]||"Em atividade"};
