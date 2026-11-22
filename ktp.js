(function(){
"use strict";
const $=id=>document.getElementById(id);
const KEY="tarih-ustaz-ktp-topics-v2",MAX=3500;
const ru=()=>document.documentElement.lang==="ru";
const msg=(kk,rus)=>ru()?rus:kk;
const val=x=>String(x==null?"":x).replace(/\u00a0/g," ").trim();
const clean=x=>val(x).toLowerCase().replace(/\s+/g," ").replace(/[«»"“”.,;:(){}\[\]–—-]/g,"").trim();
let entries=[],filteredEntries=[],loading=null;
const pat={
 title:[/сабақ.*тақырып/,/тақырыптар?/,/сабақ.*атауы/,/тема.*урок/,/название.*тем/,/тематика урок/],
 goal:[/оқу мақсат/,/оқыту мақсат/,/цели обуч/,/цель обуч/,/цели урок/,/цель урок/],
 grade:[/сынып/,/класс/],subject:[/пән/,/предмет/],quarter:[/тоқсан/,/четверт/],order:[/^№$/, /^рет/, /^п\/п$/, /^номер/]
};
function matchField(kind,s){const n=clean(s);return n&&(pat[kind]||[]).some(r=>r.test(n))}
function detectGrade(){const vals=Array.from(arguments).map(val);for(const s of vals){let m=s.match(/(?:^|[^\d])(1[01]|[5-9])\s*(?:[-–_]\s*)?(?:сынып|класс|grade)/i);if(m)return m[1];m=s.match(/^(1[01]|[5-9])$/);if(m)return m[1]}return null}
function detectSubject(){const s=clean(Array.from(arguments).join(" "));if(/дүниежүзі|дүниежузі|дүние жүзі|всемирн|world history/.test(s))return"world";if(/қазақстан тарих|казахстан тарих|история казахстан/.test(s))return"kaz";return null}
function findHeader(rows){
 let best=null;
 for(let i=0;i<Math.min(40,rows.length);i++){
  const cols={},one=rows[i]||[],two=rows[i+1]||[];
  for(let k=0;k<Math.min(65,one.length);k++)for(const field of Object.keys(pat))if(cols[field]===undefined&&matchField(field,one[k]))cols[field]=k;
  let other=false;
  for(let k=0;k<Math.min(65,two.length);k++)for(const field of Object.keys(pat))if(cols[field]===undefined&&matchField(field,two[k])){cols[field]=k;other=true}
  if(cols.title===undefined)continue;
  if(cols.title===cols.goal)delete cols.goal;
  const score=6+(cols.goal!==undefined?6:0)+(cols.grade!==undefined?1:0)+(cols.subject!==undefined?1:0);
  if(!best||score>best.score)best={columns:cols,from:i+1+(other?1:0),score};
  if(score>=13)break;
 }
 return best;
}
function parseRows(rows,file,sheet){
 const header=findHeader(rows);if(!header)return[];
 const c=header.columns;
 const get=(row,key)=>c[key]===undefined?"":val(row[c[key]]);
 const baseGrade=detectGrade(sheet,file),baseSubject=detectSubject(sheet,file);
 let quarter="",result=[];
 for(let i=header.from;i<rows.length;i++){
  const row=Array.isArray(rows[i])?rows[i]:[],title=get(row,"title"),goal=get(row,"goal");
  if(!title||title.length>320)continue;
  if(matchField("title",title)&&title.length<50)continue;
  if(/^(№|тема|тақырып|[ivx]+\s*(тоқсан|четверть))$/i.test(title))continue;
  quarter=get(row,"quarter")||quarter;
  result.push({title:title.slice(0,220),goal:goal.slice(0,700),grade:detectGrade(get(row,"grade"))||baseGrade,subject:detectSubject(get(row,"subject"))||baseSubject,source:val(file),sheet:val(sheet),order:get(row,"order").slice(0,30),quarter:quarter.slice(0,70),row:i+1});
  if(result.length>=MAX)break;
 }
 return result;
}
function parseCSV(content){
 const input=String(content||"").replace(/^\uFEFF/,"");
 const counts={"\t":0,";":0,",":0};let quote=false;
 for(const c of input.slice(0,5000)){if(c==='"')quote=!quote;else if(!quote&&Object.prototype.hasOwnProperty.call(counts,c))counts[c]++}
 const delimiter=Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0];
 let rows=[],row=[],cell="",inside=false;
 for(let i=0;i<input.length;i++){
  const c=input[i];
  if(c==='"'){if(inside&&input[i+1]==='"'){cell+='"';i++}else inside=!inside}
  else if(!inside&&c===delimiter){row.push(cell);cell=""}
  else if(!inside&&(c==="\r"||c==="\n")){row.push(cell);cell="";if(row.some(x=>x.trim()))rows.push(row);row=[];if(c==="\r"&&input[i+1]==="\n")i++}
  else cell+=c;
 }
 row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
 return rows;
}
function library(){
 if(window.XLSX)return Promise.resolve(window.XLSX);
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const s=document.createElement("script");
  s.src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
  s.onload=()=>window.XLSX?resolve(window.XLSX):reject(new Error("Excel parser unavailable"));
  s.onerror=()=>reject(new Error(msg("Excel оқу кітапханасы жүктелмеді.","Не удалось загрузить библиотеку Excel.")));
  document.head.append(s);
 }).catch(e=>{loading=null;throw e});
 return loading;
}
async function readFile(file){
 const ext=(file.name.split(".").pop()||"").toLowerCase();
 if(!["xlsx","xls","csv","tsv"].includes(ext))throw new Error(msg("Тек XLSX, XLS, CSV.","Только XLSX, XLS, CSV."));
 if(file.size>12*1024*1024)throw new Error(msg("Файл 12 МБ-тан үлкен.","Файл превышает 12 МБ."));
 const buffer=await file.arrayBuffer();
 if(ext==="csv"||ext==="tsv"){
  let decoded=new TextDecoder("utf-8").decode(buffer);
  if(decoded.includes("\uFFFD")){try{decoded=new TextDecoder("windows-1251").decode(buffer)}catch{}}
  return parseRows(parseCSV(decoded),file.name,"");
 }
 const XLSX=await library();
 const book=XLSX.read(buffer,{type:"array",raw:false});
 let found=[];
 for(const name of book.SheetNames.slice(0,35)){
  const rows=XLSX.utils.sheet_to_json(book.Sheets[name],{header:1,defval:"",raw:false,blankrows:false});
  found.push(...parseRows(rows,file.name,name));
  if(found.length>=MAX)break;
 }
 return found.slice(0,MAX);
}
function saved(){try{const arr=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(arr)?arr.filter(x=>x&&x.title).slice(0,MAX):[]}catch{return[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(entries));return true}catch{return false}}
function notify(text){$("ktpStatus").textContent=text}
function refresh(){
 const box=$("ktpTopicSelect"),search=clean($("ktpSearch").value),grade=$("gradeInput").value,subject=$("subjectInput").value;
 filteredEntries=entries.filter(x=>(!x.grade||x.grade===grade)&&(!x.subject||x.subject===subject)&&(!search||clean(x.title+" "+x.goal).includes(search))).slice(0,700);
 box.textContent="";
 const placeholder=document.createElement("option");placeholder.value="";
 placeholder.textContent=entries.length?msg("КТЖ бойынша сабақ таңдаңыз","Выберите тему из КТП"):msg("КТЖ файлын жүктеңіз","Загрузите файл КТП");box.append(placeholder);
 filteredEntries.forEach((item,i)=>{
  const o=document.createElement("option");o.value=String(i);
  o.textContent=(item.order?item.order+" · ":"")+item.title+(item.goal?" — "+item.goal.slice(0,44):"");
  box.append(o);
 });
 box.disabled=!filteredEntries.length;box.value="";
 if(entries.length)notify(msg("КТЖ: "+entries.length+" тақырып. Сүзгіден "+filteredEntries.length+" сабақ өтті.","КТП: "+entries.length+" тем. Подходят "+filteredEntries.length+" уроков."));
}
function select(){
 const v=$("ktpTopicSelect").value;if(v==="")return;
 const item=filteredEntries[Number(v)];if(!item)return;
 $("topicInput").value=item.title;
 $("goalInput").value=item.goal||"";
 $("factsInput").value=""; // never reuse unrelated historical claims
 for(const id of ["topicInput","goalInput","factsInput"])$(id).dispatchEvent(new Event("input",{bubbles:true}));
 notify(msg("Тақырып пен оқу мақсаты КТЖ-дан алынды.","Тема и цель обучения взяты из КТП."));
}
async function upload(files){
 if(!files||!files.length)return;
 $("ktpFileInput").disabled=true;notify(msg("КТЖ өңделуде...","Обработка КТП..."));
 let count=0,errors=[];
 for(const file of Array.from(files).slice(0,12)){
  try{
   const data=await readFile(file);
   if(!data.length){errors.push(file.name+": "+msg("«Тақырып» бағаны табылмады","Не найден столбец «Тема»"));continue}
   entries=entries.filter(x=>x.source!==file.name);
   const uniq=new Map();
   [...entries,...data].forEach(x=>uniq.set([x.source,x.sheet,x.row,x.title].join("|"),x));
   entries=[...uniq.values()].slice(0,MAX);
   count+=data.length;
  }catch(err){errors.push(file.name+": "+err.message)}
 }
 $("ktpFileInput").disabled=false;$("ktpFileInput").value="";
 const savedOK=save();refresh();
 notify((count?msg(count+" сабақ жүктелді.","Загружено уроков: "+count)+ (savedOK?"":" "+msg("Жадыға сақталмады.","Не сохранено в браузере.")):"")+ (errors.length?" "+errors.slice(0,2).join(" · "):""));
}
function init(){
 entries=saved();
 $("ktpFileInput").addEventListener("change",e=>upload(e.target.files));
 $("ktpSearch").addEventListener("input",refresh);
 $("ktpTopicSelect").addEventListener("change",select);
 ["gradeInput","subjectInput"].forEach(id=>$(id).addEventListener("change",refresh));
 $("ktpClear").addEventListener("click",()=>{entries=[];try{localStorage.removeItem(KEY)}catch{}$("ktpSearch").value="";refresh();notify(msg("КТЖ тазаланды.","КТП очищено."))});
 document.querySelectorAll("[data-lang]").forEach(el=>el.addEventListener("click",()=>setTimeout(refresh,0)));
 refresh();
}
window.TarihKTP={parseCSV,parseRows,findHeader,refresh};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();