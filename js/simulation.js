/* Núcleo da simulação: estados, relações, memória e decisões por utilidade. */
class VillageSimulation {
  constructor(size=30) {
    this.day=1; this.hour=8; this.minute=0; this.season="Primavera"; this.tickCount=0;
    this.residents=[]; this.relations={}; this.events=[]; this.dailyEvents=0; this.nextId=1;
    this.running=false; this.generatePopulation(size);
    this.addEvent("A vila foi fundada. Os habitantes começam suas rotinas.", "system");
  }
  rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}
  pick(a){return a[Math.floor(Math.random()*a.length)]}
  clamp(v,min=0,max=100){return Math.max(min,Math.min(max,v))}
  generatePopulation(size){
    this.residents=[];this.relations={};this.nextId=1;
    const used=new Set();
    for(let i=0;i<size;i++){
      let name;
      do{name=this.pick(DATA.firstNames)+" "+this.pick(DATA.surnames)}while(used.has(name));
      used.add(name);
      const mbti=this.pick(DATA.mbti), age=this.rand(18,60);
      const traits={};
      DATA.traits.forEach(([key])=>traits[key]=this.rand(25,75));
      for(const letter of mbti) {
        const effects=DATA.mbtiEffects[letter];
        Object.entries(effects).forEach(([k,v])=>traits[k]=this.clamp(traits[k]+v));
      }
      const r={id:this.nextId++,name,age,sex:Math.random()<.5?"F":"M",mbti,traits,
        state:{hunger:this.rand(15,55),energy:this.rand(45,95),mood:this.rand(45,80),stress:this.rand(5,35),social:this.rand(20,75),health:this.rand(85,100),romance:this.rand(0,35)},
        action:"idle",location:"Praça",partner:null,memories:[],goals:[],bornDay:1,
        map:{x:0.08+Math.random()*0.84,y:0.10+Math.random()*0.78},visualAction:null};
      this.residents.push(r);
      r.goals=this.makeGoals(r);
    }
    for(let i=0;i<this.residents.length;i++)for(let j=i+1;j<this.residents.length;j++){
      const a=this.residents[i],b=this.residents[j],key=this.pairKey(a.id,b.id);
      const familiarity=this.rand(0,20);
      this.relations[key]={a:a.id,b:b.id,affinity:this.rand(-8,12),trust:this.rand(5,25),familiarity,romance:0,conflict:0,interactions:0};
    }
  }
  makeGoals(r){
    const goals=[];
    if(r.traits.ambicao>60)goals.push("Construir uma posição de prestígio");
    if(r.traits.necessidade_vinculo>60)goals.push("Formar vínculos próximos");
    if(r.traits.curiosidade>65)goals.push("Conhecer melhor a vila");
    if(r.traits.autonomia>65)goals.push("Preservar independência");
    if(r.traits.generosidade>65)goals.push("Ajudar outros habitantes");
    if(!goals.length)goals.push(this.pick(["Manter uma rotina estável","Conhecer pessoas novas","Desenvolver habilidades pessoais"]));
    return goals.slice(0,2);
  }
  pairKey(a,b){return a<b?`${a}-${b}`:`${b}-${a}`}
  getRelation(a,b){return this.relations[this.pairKey(a.id,b.id)]}
  addMemory(r,text,type="event"){
    r.memories.unshift({day:this.day,time:this.timeString(),text,type});
    r.memories=r.memories.slice(0,12);
  }
  addEvent(text,type="social"){
    this.events.unshift({day:this.day,time:this.timeString(),text,type});
    this.events=this.events.slice(0,100);this.dailyEvents++;
  }
  timeString(){return `${String(this.hour).padStart(2,"0")}:${String(this.minute).padStart(2,"0")}`}
  advanceHour(){
    this.hour++;this.tickCount++;
    if(this.hour>=24){this.hour=0;this.day++;this.dailyEvents=0;if(this.day%8===0)this.season=["Primavera","Verão","Outono","Inverno"][(Math.floor((this.day-1)/8))%4];}
    this.residents.forEach(r=>this.updateResident(r));
    if(this.tickCount%4===0)this.runSocialOpportunities();
    if(this.tickCount%24===0)this.dailyMaintenance();
  }
  updateResident(r){
    const s=r.state,t=r.traits;
    s.hunger=this.clamp(s.hunger+this.rand(3,7));
    s.energy=this.clamp(s.energy+(r.action==="sleep"?this.rand(12,19):-(this.rand(4,8))));
    s.social=this.clamp(s.social-(t.necessidade_vinculo>65?5:3));
    s.stress=this.clamp(s.stress+(s.hunger>75?4:0)+(s.energy<20?4:0)-(s.mood>70?2:0));
    s.mood=this.clamp(s.mood+(s.health<40?-4:0)+(s.stress>75?-3:0)+(s.hunger<25?2:0));
    if(s.hunger>95)s.health=this.clamp(s.health-3);
    if(s.energy<5)s.health=this.clamp(s.health-2);
    const action=this.chooseAction(r);
    this.performAction(r,action);
  }
  chooseAction(r){
    const s=r.state,t=r.traits;
    const scores={
      eat:s.hunger*1.15+(s.health<50?10:0),
      sleep:(100-s.energy)*1.05+(this.hour>=22||this.hour<6?30:0),
      socialize:(100-s.social)*.72+t.sociabilidade*.20+t.empatia*.10+(s.mood-50)*.10,
      work:35+t.ambicao*.22+t.disciplina*.18+(this.hour>=8&&this.hour<=17?18:0)-s.energy*.22,
      explore:20+t.curiosidade*.30+t.abertura_experiencias*.18+(this.hour>=9&&this.hour<=18?12:0),
      avoid:t.reserva*.30+(s.stress*.35)+(s.social>65?-15:0)
    };
    if(s.hunger>82)scores.eat+=35;
    if(s.energy<18)scores.sleep+=40;
    if(s.social<18)scores.socialize+=25;
    if(s.stress>70)scores.avoid+=22;
    return Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
  }
  performAction(r,action){
    r.action=action;
    r.visualAction={type:action,until:this.tickCount+1};
    const s=r.state;
    if(action==="eat"){s.hunger=this.clamp(s.hunger-this.rand(28,42));s.mood=this.clamp(s.mood+2);r.location="Refeitório";}
    else if(action==="sleep"){s.energy=this.clamp(s.energy+this.rand(10,16));s.stress=this.clamp(s.stress-3);r.location="Casa";}
    else if(action==="work"){s.energy=this.clamp(s.energy-3);s.mood=this.clamp(s.mood+(r.traits.ambicao>60?2:-1));r.location="Oficina";}
    else if(action==="explore"){s.energy=this.clamp(s.energy-2);s.mood=this.clamp(s.mood+(r.traits.curiosidade>60?3:1));r.location="Arredores";}
    else if(action==="avoid"){s.stress=this.clamp(s.stress-2);r.location="Casa";}
    else {r.location="Praça";}
  }
  runSocialOpportunities(){
    const available=this.residents.filter(r=>r.action==="socialize"||r.action==="explore"||r.action==="work");
    if(available.length<2)return;
    const a=this.pick(available), candidates=available.filter(x=>x.id!==a.id);
    if(!candidates.length)return;
    const b=this.pick(candidates), rel=this.getRelation(a,b);
    if(!rel)return;
    const compatibility=this.compatibility(a,b);
    const hostility=(a.traits.agressividade+b.traits.agressividade)/2;
    const friendlyScore=(a.traits.empatia+b.traits.empatia)/2+(a.traits.cooperatividade+b.traits.cooperatividade)/2+compatibility;
    const hostile=Math.random()<(hostility>68&&rel.affinity<0?.32:.08);
    rel.interactions++;rel.familiarity=this.clamp(rel.familiarity+4);
    if(hostile){
      const impact=this.rand(5,12);rel.affinity=this.clamp(rel.affinity-impact,-100,100);rel.trust=this.clamp(rel.trust-impact,-100,100);rel.conflict=this.clamp(rel.conflict+impact);
      a.state.stress=this.clamp(a.state.stress+5);b.state.stress=this.clamp(b.state.stress+5);
      this.addMemory(a,`Teve um conflito com ${b.name}.`,"negative");this.addMemory(b,`Teve um conflito com ${a.name}.`,"negative");
      this.addEvent(`${a.name} e ${b.name} tiveram uma interação hostil.`,"negative");
      this.lastMapEvent={type:"conflict",a:a.id,b:b.id,at:this.tickCount,until:this.tickCount+3};
    }else{
      const impact=this.rand(2,6)+Math.max(0,friendlyScore/35);
      rel.affinity=this.clamp(rel.affinity+impact,-100,100);rel.trust=this.clamp(rel.trust+impact*.65,-100,100);rel.conflict=this.clamp(rel.conflict-2);
      a.state.social=this.clamp(a.state.social+this.rand(8,15));b.state.social=this.clamp(b.state.social+this.rand(8,15));
      a.state.mood=this.clamp(a.state.mood+2);b.state.mood=this.clamp(b.state.mood+2);
      this.addMemory(a,`Conversou socialmente com ${b.name}.`,"positive");this.addMemory(b,`Interagiu com ${a.name}.`,"positive");
      this.lastMapEvent={type:"social",a:a.id,b:b.id,at:this.tickCount,until:this.tickCount+3};
      if(rel.interactions===1||rel.interactions%5===0)this.addEvent(`${a.name} e ${b.name} tiveram uma interação amigável.`,"positive");
    }
  }
  compatibility(a,b){
    const dimensions=["sociabilidade","curiosidade","empatia","planejamento","assertividade"];
    return dimensions.reduce((sum,k)=>sum+100-Math.abs(a.traits[k]-b.traits[k]),0)/dimensions.length/10;
  }
  dailyMaintenance(){
    this.residents.forEach(r=>{
      if(r.age<60&&r.age>=18&&r.state.health>70&&r.partner===null&&r.traits.necessidade_vinculo>75&&r.traits.romantismo>75){
        const candidates=this.residents.filter(x=>x.id!==r.id&&x.partner===null&&x.age>=18&&x.age<60&&x.sex!==r.sex&&this.getRelation(r,x)?.affinity>55);
        if(candidates.length&&Math.random()<.025){
          const p=this.pick(candidates),rel=this.getRelation(r,p);
          r.partner=p.id;p.partner=r.id;rel.romance=this.clamp(rel.romance+20);
          this.addEvent(`${r.name} e ${p.name} iniciaram um relacionamento.`,"positive");
          this.addMemory(r,`Iniciou um relacionamento com ${p.name}.`);this.addMemory(p,`Iniciou um relacionamento com ${r.name}.`);
        }
      }
      if(r.age<60&&r.age>=18&&r.partner!==null&&Math.random()<.006&&this.residents.length<80){
        const partner=this.residents.find(x=>x.id===r.partner);
        if(partner&&r.sex==="F"){
          const child={id:this.nextId++,name:this.pick(DATA.firstNames)+" "+r.name.split(" ").slice(-1)[0],age:0,sex:Math.random()<.5?"F":"M",mbti:this.pick(DATA.mbti),traits:{...r.traits},state:{hunger:20,energy:80,mood:70,stress:5,social:10,health:100,romance:0},action:"idle",location:"Casa",partner:null,memories:[],goals:["Crescer e desenvolver vínculos"],bornDay:this.day,map:{x:0.08+Math.random()*0.84,y:0.10+Math.random()*0.78},visualAction:null};
          this.residents.push(child);
          this.addEvent(`${r.name} e ${partner.name} tiveram um filho: ${child.name}.`,"positive");
        }
      }
    });
  }
  wellbeing(){if(!this.residents.length)return 0;return Math.round(this.residents.reduce((v,r)=>v+(r.state.mood+r.state.health+(100-r.state.stress))/3,0)/this.residents.length)}
  positiveRelations(){return Object.values(this.relations).filter(r=>r.affinity>20).length}
  residentById(id){return this.residents.find(r=>r.id===id)}
}
