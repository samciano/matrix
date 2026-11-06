const UI={sel:null,hover:null,cv:document.getElementById("map"),
 init(){const c=this.cv;this.cx=c.getContext("2d");
  const pos=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};
  const hit=p=>Sim.agents.find(a=>Math.hypot(a.x-p.x,a.y-p.y)<9);
  c.onmousemove=e=>{this.hover=hit(pos(e));this.mp=pos(e)};c.onmouseleave=()=>this.hover=null;
  c.onclick=e=>{this.sel=hit(pos(e))||null;this.sheet()}},
 draw(){const x=this.cx;x.clearRect(0,0,960,600);x.font="11px system-ui";x.textAlign="center";
  for(const p of WORLD.places){x.strokeStyle="#222";x.beginPath();x.arc(p.x,p.y,45,0,7);x.stroke();x.fillStyle="#444";x.fillText(p.n,p.x,p.y+60)}
  for(const l of Sim.links){x.globalAlpha=l.ttl/40;x.strokeStyle=l.col;x.beginPath();x.moveTo(l.a.x,l.a.y);x.lineTo(l.b.x,l.b.y);x.stroke()}x.globalAlpha=1;
  for(const a of Sim.agents){x.fillStyle="#fff";x.beginPath();x.arc(a.x,a.y,3,0,7);x.fill();
   if(a===this.sel){x.strokeStyle="#fff";x.beginPath();x.arc(a.x,a.y,9,0,7);x.stroke()}}
  if(this.hover){const a=this.hover;x.fillStyle="#fff";x.fillText(`${a.name} (${a.mbti}) · ${a.act}`,a.x,a.y-12)}
  document.getElementById("clock").textContent=Sim.clock()+" · comida "+Math.round(Sim.food)},
 bar(n,v,inv){return`<div class="bar"><span>${n}</span><div><i style="width:${v}%"></i></div>${Math.round(v)}</div>`},
 sheet(){const a=this.sel,el=document.getElementById("sheet");if(!a){el.textContent="Clique em um ponto para ver a ficha do habitante.";return}
  const rels=Object.entries(a.rel).map(([id,r])=>[Sim.agents[id],r]).filter(x=>x[0]&&x[1].familiaridade>0).sort((p,q)=>q[1].afinidade-p[1].afinidade);
  const s=a.s;el.innerHTML=`<h3>${a.name}, ${a.age} anos · ${a.mbti}</h3><div>Fazendo: <b>${a.act}</b>${a.tgt&&a.act==="socializar"?" → "+a.tgt.name:""}<br>Objetivo: ${a.goal}</div>
  ${["fome","energia","humor","estresse","solidao","satisfacao"].map(k=>this.bar(k,s[k])).join("")}
  <h3>Relacionamentos</h3>${rels.slice(0,6).map(([b,r])=>`<div>${b.name}: afin ${Math.round(r.afinidade)} · conf ${Math.round(r.confianca)} · fam ${Math.round(r.familiaridade)} · atr ${Math.round(r.atracao)} · ress ${Math.round(r.ressentimento)} · conf. ${Math.round(r.conflito)}</div>`).join("")||"<div class=m>Ainda sem vínculos.</div>"}
  <h3>Memórias</h3>${a.mem.slice(0,6).map(m=>`<div class="${m.val>0?"pos":"neg"}">${m.txt}</div>`).join("")||"<div class=m>Nenhuma.</div>"}
  <details><summary>Traços permanentes (${TRAITS.length})</summary><div class="tr">${TRAITS.map(k=>`${k.replace(/_/g," ")}: ${a.t[k]}<br>`).join("")}</div></details>`},
 renderLog(){document.getElementById("log").innerHTML=Sim.log.slice(0,40).map(l=>`<div>${l}</div>`).join("")}};
