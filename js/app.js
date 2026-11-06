let playing=true,frame=0;const speed=()=>+document.getElementById("speed").value;
Sim.init();UI.init();
document.getElementById("play").onclick=e=>{playing=!playing;e.target.textContent=playing?"Pausar":"Retomar"};
document.getElementById("save").onclick=()=>{Sim.save();Sim.pushLog("Simulação salva.")};
document.getElementById("load").onclick=()=>{if(Sim.load()){UI.sel=null;UI.sheet()}};
document.getElementById("new").onclick=()=>{Sim.init();UI.sel=null;UI.sheet()};
(function loop(){if(playing)for(let i=0;i<speed();i++)Sim.step();
 UI.draw();if(++frame%15===0){UI.renderLog();if(UI.sel)UI.sheet()}requestAnimationFrame(loop)})();
