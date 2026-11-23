(function(){
"use strict";
const $=id=>document.getElementById(id);
const KEY="tarih-ustaz-ktp-drafts-v1";
const state={key:null,rows:[],request:0};
const ru=()=>document.documentElement.lang==="ru";
const msg=(kk,russian)=>ru()?russian:kk;
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const context=()=>({lang:ru()?"ru":"kk",subject:$("subjectInput").value,grade:$("gradeInput").value,source:$("ktpSource").value});
const contextKey=c=>[c.lang,c.subject,c.grade,c.source].join(":");
const notice=s=>{$("ktpBuilderStatus").textContent=s};
function quarter(value){
 const raw=String(value||"").trim().toUpperCase();
 const number=raw.match(/[1-4]/);if(number)return number[0];
 const roman=raw.replace(/І/g,"I").replace(/Ү/g,"V").replace(/Х/g,"X").match(/\b(IV|III|II|I)\b/);
 return roman?String({I:1,II:2,III:3,IV:4}[roman[0]]):"";
}
function readDraft(key){
 try{const data=JSON.parse(localStorage.getItem(KEY)||"{}");return Array.isArray(data[key])?data[key]:null}catch{return null}
}
function saveDraft(){
 if(!state.key)return true;
 try{
  const data=JSON.parse(localStorage.getItem(KEY)||"{}");
  data[state.key]=state.rows;
  localStorage.setItem(KEY,JSON.stringify(data));
  return true;
 }catch{
  notice(msg("Өзгерістерді браузерде сақтау мүмкін болмады.","Не удалось сохранить изменения в браузере."));
  return false;
 }
}
function normalize(row,c){
 return {quarter:quarter(row.quarter),
  section:String(row.section||"").slice(0,180),title:String(row.title||"").slice(0,300),
  goal:String(row.goal||"").slice(0,1500),grade:c.grade,subject:c.subject};
}
function show(){
 const key=contextKey(context());
 if(key===state.key)return;
 state.key=key;state.rows=(readDraft(key)||[]).map(row=>normalize(row,context()));
 render();
 if(!state.rows.length)notice(msg("Пән мен сыныпты таңдап, «КТЖ құрастыру» басыңыз.","Выберите предмет и класс, затем нажмите «Составить КТП»."));
}
function input(value,field,index,tag="input"){
 const el=document.createElement(tag);
 if(tag==="input")el.type="text";
 el.value=value;el.dataset.field=field;el.dataset.index=index;
 el.maxLength=field==="goal"?1500:field==="title"?300:180;
 el.setAttribute("aria-label",msg(({section:"Бөлім",title:"Тақырып",goal:"Оқу мақсаты"})[field],
  ({section:"Раздел",title:"Тема",goal:"Цель обучения"})[field]));
 return el;
}
function render(){
 const body=$("ktpBuilderRows"),quarter=$("ktpQuarter").value;
 body.replaceChildren();
 $("ktpAdd").disabled=!state.key;
 $("ktpBuilderExport").hidden=!state.rows.length;
 const visible=state.rows.map((row,index)=>({row,index})).filter(({row})=>!quarter||row.quarter===quarter);
 for(const {row,index} of visible){
  const tr=document.createElement("tr"),num=document.createElement("td");num.textContent=String(index+1);
  const group=document.createElement("td"),q=document.createElement("select");
  q.dataset.index=index;q.dataset.field="quarter";q.setAttribute("aria-label",msg("Тоқсан","Четверть"));
  for(const value of ["","1","2","3","4"]){const opt=document.createElement("option");opt.value=value;opt.textContent=value||"—";q.append(opt)}
  q.value=row.quarter;group.append(q,input(row.section,"section",index));
  const title=document.createElement("td");title.append(input(row.title,"title",index,"textarea"));
  const goal=document.createElement("td");goal.append(input(row.goal,"goal",index,"textarea"));
  const actions=document.createElement("td"),toInfo=document.createElement("button"),remove=document.createElement("button");
  toInfo.type=remove.type="button";toInfo.className="ktp-to-info";remove.className="ktp-remove";
  toInfo.textContent=msg("Инфографика →","Инфографика →");remove.textContent=msg("Жою","Удалить");
  toInfo.addEventListener("click",()=>{
   if(!row.title.trim()){title.querySelector("textarea").focus();return}
   window.TarihWorkshop.useLesson(row,"info");
  });
  remove.addEventListener("click",()=>{
   state.rows.splice(index,1);const saved=saveDraft();render();
   if(!saved)notice(msg("Өзгерістер сақталмады.","Изменения не сохранились."));
  });
  actions.append(toInfo,remove);tr.append(num,group,title,goal,actions);body.append(tr);
 }
 if(state.rows.length)notice(msg(`Жоспарда ${state.rows.length} сабақ · көрсетілді: ${visible.length}.`,
  `В плане ${state.rows.length} уроков · показано: ${visible.length}.`));
 else if(state.key)notice(msg("Жоспар бос. Каталогтан құрастырыңыз немесе сабақ қосыңыз.",
  "План пуст. Соберите его из каталога или добавьте урок."));
}
async function build(){
 const c=context(),key=contextKey(c),request=++state.request;
 if(state.rows.length&&!window.confirm(msg("Өңделген КТЖ-ны каталог деректерімен алмастырамыз ба?",
  "Заменить изменённый КТП данными каталога?")))return;
 $("ktpBuild").disabled=true;
 notice(msg("Каталог жүктелуде...","Загружается каталог..."));
 try{
  if(c.source==="catalog")await window.TarihKTP.loadBuiltin(c.lang);
  if(request!==state.request||key!==contextKey(context()))return;
  const selected=window.TarihKTP.getEntries(c.source,c.lang).filter(x=>
   (!x.grade||x.grade===c.grade)&&(!x.subject||x.subject===c.subject));
  if(!selected.length){notice(msg("Осы пән/сынып үшін сабақ жоқ. Өз файлыңызды құралдағы «Өз КТЖ файлым» арқылы жүктеңіз.",
   "Для этого предмета и класса уроков нет. Загрузите свой файл в инструменте через «Мой файл КТП»."));return}
  state.key=key;state.rows=selected.map(x=>normalize(x,c));
  $("ktpQuarter").value="";render();saveDraft();
 }catch(e){console.error(e);notice(msg("КТЖ құрастыру мүмкін болмады.","Не удалось составить КТП."))}
 finally{$("ktpBuild").disabled=false}
}
function add(){
 const c=context();state.rows.push(normalize({quarter:$("ktpQuarter").value},c));
 const saved=saveDraft();render();
 if(!saved)notice(msg("Өзгерістер сақталмады.","Изменения не сохранились."));
 const last=$("ktpBuilderRows").lastElementChild;
 last?.querySelector("textarea[data-field=title]")?.focus();
}
function valid(){
 if(!state.rows.length){notice(msg("Алдымен КТЖ құрастырыңыз.","Сначала составьте КТП."));return false}
 if(state.rows.some(row=>!row.title.trim())){
  notice(msg("Барлық сабақтардың тақырыбын толтырыңыз.","Заполните темы всех уроков."));return false;
 }
 return true;
}
function download(content,mime,name){
 const url=URL.createObjectURL(new Blob([content],{type:mime}));
 const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),3500);
 notice(msg("Файл жүктелді.","Файл скачан."));
}
function csvCell(value){
 let s=String(value??"");
 // Spreadsheet applications can execute formulas imported from CSV.
 if(/^[\s\uFEFF]*[=+\-@]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
function exportCSV(){
 if(!valid())return;
 const header=ru()?["№","Класс","Предмет","Четверть","Раздел","Тема","Цель обучения"]:
  ["№","Сынып","Пән","Тоқсан","Бөлім","Тақырып","Оқу мақсаты"];
 const subject=$("subjectInput").selectedOptions[0].textContent;
 const lines=[header,...state.rows.map((row,i)=>[i+1,row.grade,subject,row.quarter,row.section,row.title,row.goal])];
 download("\uFEFF"+lines.map(row=>row.map(csvCell).join(";")).join("\r\n"),"text/csv;charset=utf-8","Tarih_Ustaz_KTP_2026-2027.csv");
}
function printable(){
 const c=context(),subject=$("subjectInput").selectedOptions[0].textContent;
 const headers=ru()?["№","Четверть","Раздел","Тема урока","Цель обучения"]:
  ["№","Тоқсан","Бөлім","Сабақ тақырыбы","Оқу мақсаты"];
 const title=ru()?"КТП 2026–2027":"КТЖ 2026–2027";
 const rows=state.rows.map((row,i)=>"<tr>"+[i+1,row.quarter,row.section,row.title,row.goal].map(x=>"<td>"+esc(x)+"</td>").join("")+"</tr>").join("");
 return '<!doctype html><html lang="'+c.lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{font:13px/1.45 system-ui,sans-serif;color:#17394a;margin:30px}h1{font-size:24px;margin:0 0 6px}p{margin:0 0 20px}table{border-collapse:collapse;width:100%;table-layout:fixed}th,td{border:1px solid #abc3c2;padding:8px;vertical-align:top;overflow-wrap:anywhere}th{background:#e8f3f0;text-align:left}th:nth-child(1){width:4%}th:nth-child(2){width:10%}th:nth-child(3){width:20%}th:nth-child(4){width:32%}thead{display:table-header-group}tr{break-inside:avoid}@media print{@page{size:A4 landscape;margin:12mm}body{margin:0;font-size:10px}th,td{padding:5px}th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><h1>'+title+'</h1><p>'+esc(subject)+' · '+esc(c.grade)+' '+msg("сынып","класс")+'</p><table><thead><tr>'+headers.map(x=>"<th>"+esc(x)+"</th>").join("")+'</tr></thead><tbody>'+rows+'</tbody></table></body></html>';
}
function printPDF(){
 if(!valid())return;
 const frame=document.createElement("iframe");frame.style.cssText="position:fixed;left:-10000px;top:-10000px;width:1000px;height:700px;border:0";
 document.body.append(frame);
 frame.onload=()=>setTimeout(()=>{
  try{frame.contentWindow.focus();frame.contentWindow.print();notice(msg("Басып шығару терезесінде PDF сақтауды таңдаңыз.",
   "В окне печати выберите «Сохранить как PDF»."))}
  catch(e){console.error(e);notice(msg("Басып шығару мүмкін болмады.","Не удалось открыть печать."))}
 },300);
 frame.srcdoc=printable();setTimeout(()=>frame.remove(),35000);
}
function init(){
 $("ktpBuild").addEventListener("click",build);
 $("ktpAdd").addEventListener("click",add);
 $("ktpQuarter").addEventListener("change",render);
 $("ktpSource").addEventListener("change",show);
 for(const id of ["subjectInput","gradeInput"])$(id).addEventListener("change",()=>{
  if(!$("ktpWorkspace").hidden)show();
 });
 document.querySelectorAll("[data-lang]").forEach(el=>el.addEventListener("click",()=>setTimeout(()=>{
  if(!$("ktpWorkspace").hidden){state.key=null;show()}
 },0)));
 window.addEventListener("tarih:ktp-imported",e=>{
  if($("ktpWorkspace").hidden)return;
  if(e.detail.count){$("ktpSource").value="import";show()}
  notice(e.detail.cleared?msg("Жүктелген файл өшірілді; бұрын сақталған жоспар өзгермейді.",
   "Загруженный файл удалён; сохранённый план не изменился."):
   e.detail.count?msg(`${e.detail.count} сабақ жүктелді. «КТЖ құрастыру» басыңыз.`,
    `Загружено уроков: ${e.detail.count}. Нажмите «Составить КТП».`):
   e.detail.errors.join(" · "));
 });
 $("ktpBuilderRows").addEventListener("input",e=>{
  const field=e.target.dataset.field,index=Number(e.target.dataset.index);
  if(!field||!state.rows[index])return;
  state.rows[index][field]=e.target.value;
  saveDraft();
 });
 $("ktpBuilderRows").addEventListener("change",e=>{
  if(e.target.dataset.field==="quarter")render();
 });
 $("ktpCsv").addEventListener("click",exportCSV);
 $("ktpHtml").addEventListener("click",()=>{if(valid())download(printable(),"text/html;charset=utf-8","Tarih_Ustaz_KTP_2026-2027.html")});
 $("ktpPdf").addEventListener("click",printPDF);
}
window.TarihKTPBuilder={show};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
