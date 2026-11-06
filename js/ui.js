/* Renderização da interface. */
class VillageUI {
  constructor(sim){
    this.sim=sim;this.selectedId=null;
    this.grid=document.getElementById("villageGrid");this.list=document.getElementById("residentList");
    this.detail=document.getElementById("residentDetail");this.log=document.getElementById("eventLog");
  }
  initials(name){return name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}
  status(r){
    if(r.state.health<35||r.state.stress>85)return ["Crítico","red"];
    if(r.state.stress>60||r.state.mood<35)return ["Tensão","amber"];
    return ["Estável","green"];
  }
  render(){
    const s=this.sim;
    document.getElementById("dateLabel").textContent=`Dia ${s.day} · ${s.season}`;
    document.getElementById("timeLabel").textContent=s.timeString();
    document.getElementById("populationCount").textContent=s.residents.length;
    document.getElementById("wellbeingStat").textContent=s.wellbeing()+"%";
    document.getElementById("relationStat").textContent=s.positiveRelations();
    document.getElementById("eventStat").textContent=s.dailyEvents;
    this.renderGrid();this.renderList();this.renderLog();
    if(this.selectedId!==null)this.renderDetail(this.selectedId);
  }
  renderGrid(){
    this.grid.innerHTML="";
    this.sim.residents.forEach(r=>{
      const [status,color]=this.status(r),el=document.createElement("button");
      el.className="villager-tile"+(r.id===this.selectedId?" selected":"");
      el.innerHTML=`<div class="avatar">${this.initials(r.name)}</div><div class="villager-name"></div><div class="villager-state"><i class="mood-indicator ${color}"></i></div>`;
      el.querySelector(".villager-name").textContent=r.name;
      el.querySelector(".villager-state").append(document.createTextNode(status));
      el.addEventListener("click",()=>this.select(r.id));this.grid.append(el);
    });
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
