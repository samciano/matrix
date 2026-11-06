/* Inicialização e controles. */
let simulation=new VillageSimulation(30);
let ui=new VillageUI(simulation);
let timer=null;
function render(){ui.render()}
function start(){
  if(timer){clearInterval(timer);timer=null;document.getElementById("playButton").textContent="Iniciar";return}
  document.getElementById("playButton").textContent="Pausar";
  timer=setInterval(()=>{const speed=Number(document.getElementById("speedSelect").value);for(let i=0;i<speed;i++)simulation.advanceHour();render()},900);
}
document.getElementById("playButton").addEventListener("click",start);
document.getElementById("stepButton").addEventListener("click",()=>{simulation.advanceHour();render()});
document.getElementById("residentSearch").addEventListener("input",()=>ui.renderList());
document.getElementById("clearLogButton").addEventListener("click",()=>{simulation.events=[];render()});
document.getElementById("randomizeButton").addEventListener("click",()=>{
  if(timer){clearInterval(timer);timer=null;document.getElementById("playButton").textContent="Iniciar"}
  simulation=new VillageSimulation(30);ui=new VillageUI(simulation);render();
});
render();
