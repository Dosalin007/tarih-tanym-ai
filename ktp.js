(function(){
"use strict";
const $=id=>document.getElementById(id);
const KEY="tarih-ustaz-ktp-topics-v3",MAX=3500;
const ru=()=>document.documentElement.lang==="ru";
const msg=(kk,rus)=>ru()?rus:kk;
const val=x=>String(x==null?"":x).replace(/\u00a0/g," ").trim();
const clean=x=>val(x).toLowerCase().replace(/\s+/g," ").replace(/[«»"“”.,;:(){}\[\]–—-]/g,"").trim();
let entries=[],filteredEntries=[],loading=null;
const pat={
 title:[/сабақ.*тақырыб/,/сабақ.*тақырып/,/тақырыб/,/тақырыптар?/,/сабақ.*атауы/,/тема.*урок/,/название.*тем/,/тематика урок/],
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

const TABLE_HINTS={
 8:["5","kaz"],9:["5","world"],10:["6","kaz"],11:["6","world"],
 12:["7","kaz"],13:["7","world"],14:["8","kaz"],15:["8","world"],
 16:["9","kaz"],17:["9","world"],19:["9","law"],
 23:["10","kaz"],24:["10","world"],25:["11","kaz"],26:["11","world"],
 30:["10","law"],31:["11","law"],32:["5","constitution"],33:["6","constitution"],34:["7","constitution"],
 35:["8","order"],36:["9","order"],39:["10","order"],40:["11","order"]
};
let mammothLoading=null;
function mammothLibrary(){
 if(window.mammoth)return Promise.resolve(window.mammoth);
 if(mammothLoading)return mammothLoading;
 mammothLoading=new Promise((resolve,reject)=>{
  const el=document.createElement("script");
  el.src="https://cdn.jsdelivr.net/npm/mammoth@1.13.0/mammoth.browser.min.js";
  el.async=true;
  el.onload=()=>window.mammoth?resolve(window.mammoth):reject(new Error("DOCX reader not found"));
  el.onerror=()=>reject(new Error(msg("Word оқу кітапханасы жүктелмеді.","Не удалось загрузить библиотеку Word.")));
  document.head.append(el);
 }).catch(e=>{mammothLoading=null;throw e});
 return mammothLoading;
}
function tableCells(tr){
 return [...tr.children].filter(x=>/^(TD|TH)$/.test(x.tagName)).map(x=>{const paras=[...x.querySelectorAll("p")].map(p=>val(p.textContent)).filter(Boolean);return val(paras.length?paras.join("; "):x.textContent)});
}
function decodeWordTable(table,file,index){
 const hint=TABLE_HINTS[index];
 if(!hint)return[];
 const trs=[...table.querySelectorAll("tr")],first=trs[0]?tableCells(trs[0]):[];
 // All grade-specific sections in the supplied 2026–2027 Word plans have distinct tabular columns.
 // Preserve only lesson rows with a numbered first column to exclude summaries and heading rows.
 const schema=index>=32&&index<=36?{title:1,goal:2,date:index<=34?5:4,section:null}:
              index===39?{title:1,goal:3,date:5,section:2}:
              index===40?{title:1,goal:2,date:4,section:null}:
              index===31?{title:4,goal:5,date:7,section:2}:
              index===19||index===30?{title:3,goal:4,date:6,section:1}:
              index>=23&&index<=26?{title:3,goal:4,date:6,section:1}:
              {title:2,goal:3,date:5,section:1};
 const locale=/темы уроков|тема урока|цели обучения|всемирная|сквозные темы/i.test(first.join(" "))?"ru":"kk";
 let quarter="",items=[];
 for(let ri=1;ri<trs.length;ri++){
  const row=tableCells(trs[ri]);
  if(!row.length)continue;
  const full=row.join(" ");
  const matchQuarter=full.match(/(?:^|\s)([1-4]|[ІIҮVХ]{1,4})\s*[- ]?\s*(?:тоқсан|четверть)/i);
  if(matchQuarter&&row.filter(Boolean).length<=3){quarter=matchQuarter[1];continue}
  const order=val(row[0]).replace(/\s/g,"");
  if(!/^\d{1,3}$/.test(order))continue;
  // Remove merged/shifted rows instead of silently assigning a section title as a lesson.
  if(row.length<=schema.goal)continue;
  const title=val(row[schema.title]),goal=val(row[schema.goal]);
  if(!title||title.length<4||title.length>500||!goal)continue;
  const date=val(row[schema.date]||"").match(/\b\d{1,2}[.\/-]\d{1,2}(?:[.\/-]\d{2,4})?\b/);
  items.push({title:title.slice(0,280),goal:goal.slice(0,1400),
   grade:hint[0],subject:hint[1],locale,source:val(file),sheet:locale==="ru"?"2026-2027 КТП":"2026-2027 КТЖ",
   order,quarter,section:schema.section==null?"":val(row[schema.section]||"").slice(0,260),
   date:date?date[0]:"",row:ri+1});
  if(items.length>=140)break;
 }
 return items;
}
async function parseDOCX(buffer,file){
 const mammoth=await mammothLibrary();
 const converted=await mammoth.convertToHtml({arrayBuffer:buffer},{convertImage:mammoth.images.imgElement(()=>Promise.resolve({src:""}))});
 const dom=new DOMParser().parseFromString(converted.value,"text/html");
 let rows=[],tables=[...dom.querySelectorAll("table")];
 for(let i=0;i<tables.length;i++)rows.push(...decodeWordTable(tables[i],file,i));
 return rows.slice(0,MAX);
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
 if(!["docx","xlsx","xls","csv","tsv"].includes(ext))throw new Error(msg("DOCX, XLSX, XLS немесе CSV жүктеңіз.","Загрузите DOCX, XLSX, XLS или CSV."));
 if(file.size>12*1024*1024)throw new Error(msg("Файл 12 МБ-тан үлкен.","Файл превышает 12 МБ."));
 const buffer=await file.arrayBuffer();
 if(ext==="docx")return parseDOCX(buffer,file.name);
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

const BUILTIN_PREFIX="data/ktp-2026-2027-";
const bundled={kk:null,ru:null},promises={kk:null,ru:null};
let imported=[];
function saved(){
 try{
  const arr=JSON.parse(localStorage.getItem(KEY)||"[]");
  return Array.isArray(arr)?arr.filter(x=>x&&x.title).slice(0,MAX):[];
 }catch{return []}
}
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(imported));return true}
 catch{return false}
}
function notify(text){$("ktpStatus").textContent=text}
function fromBundle(row,i,language){
 if(!row||!row.t||!row.g||!row.s)return null;
 return {
  title:val(row.t),goal:val(row.o),grade:val(row.g),subject:val(row.s),
  date:val(row.d),section:val(row.b),quarter:val(row.q),
  source:"Tarih Ustaz AI • 2026–2027",sheet:"КТЖ / КТП",order:val(row.n),
  locale:language,row:i+1,builtin:true
 };
}
async function loadBuiltin(language){
 if(bundled[language])return bundled[language];
 if(promises[language])return promises[language];
 notify(msg("2026–2027 КТЖ тақырыптары жүктелуде...","Загрузка тем КТП за 2026–2027 год..."));
 promises[language]=(async()=>{
  const url=BUILTIN_PREFIX+language+".json?v=20261123catalog2";
  const response=await fetch(url,{cache:"default"});
  if(!response.ok)throw Error("HTTP "+response.status);
  const rows=await response.json();
  if(!Array.isArray(rows)||rows.length<800)throw Error("Incomplete built-in curriculum");
  bundled[language]=rows.map((x,i)=>fromBundle(x,i,language)).filter(Boolean);
  refresh();
  return bundled[language];
 })().catch(error=>{
  console.error("Cannot load KTP catalogue:",error);
  notify(msg("Дайын КТЖ базасы ашылмады. Интернетті тексеріңіз немесе өз Word файлыңызды жүктеңіз.",
             "Готовый каталог КТП недоступен. Проверьте интернет или загрузите свой файл Word."));
  return [];
 }).finally(()=>{promises[language]=null});
 return promises[language];
}
function availableEntries(){
 const l=ru()?"ru":"kk";
 const custom=imported.filter(x=>!x.locale||x.locale===l);
 return [...(bundled[l]||[]),...custom];
}
function refresh(){
 const box=$("ktpTopicSelect"),
       search=clean($("ktpSearch").value),
       grade=$("gradeInput").value,
       subject=$("subjectInput").value,
       language=ru()?"ru":"kk";
 entries=availableEntries();
 filteredEntries=entries.filter(x=>
    (!x.grade||x.grade===grade)&&
    (!x.subject||x.subject===subject)&&
    (!search||clean(x.title+" "+x.goal+" "+x.section).includes(search))
 ).slice(0,900);
 box.textContent="";
 const placeholder=document.createElement("option");
 placeholder.value="";
 placeholder.textContent=filteredEntries.length?
   msg("КТЖ-дағы сабақты таңдаңыз","Выберите урок из КТП"):
   (!bundled[language]&&!imported.length?
    msg("Тақырыптар жүктелуде...","Темы загружаются..."):
    msg("Осы пән/сынып бойынша тақырып жоқ","Тем для этого предмета и класса нет"));
 box.append(placeholder);
 filteredEntries.forEach((item,i)=>{
  const opt=document.createElement("option");
  opt.value=String(i);
  opt.textContent=(item.order?"№"+item.order+" · ":"")+(item.date?item.date+" · ":"")+item.title;
  box.append(opt);
 });
 box.disabled=!filteredEntries.length;
 box.value="";
 if(bundled[language]){
  notify(msg("Дайын КТЖ: "+bundled[language].length+" сабақ. "+grade+"-сынып бойынша "+filteredEntries.length+" тақырып таңдауға болады.",
             "Готовый КТП: "+bundled[language].length+" уроков. Для "+grade+" класса доступно "+filteredEntries.length+" тем."));
 }else if(imported.length){
  notify(msg("Жеке КТЖ-дан "+filteredEntries.length+" тақырып табылды.",
             "Из загруженного КТП найдено тем: "+filteredEntries.length+"."));
 }
}
function select(){
 const idx=$("ktpTopicSelect").value;
 if(idx==="")return;
 const item=filteredEntries[Number(idx)];
 if(!item)return;
 $("topicInput").value=item.title;
 $("goalInput").value=item.goal||"";
 // Do not repeat historical facts from another selected topic.
 $("factsInput").value="";
 for(const id of ["topicInput","goalInput","factsInput"])
  $(id).dispatchEvent(new Event("input",{bubbles:true}));
 window.dispatchEvent(new CustomEvent("tarih:ktp-selected",{detail:item}));
 notify(msg("Тақырып пен оқу мақсаты дайын. Құралды таңдап, «Жасау» басыңыз.",
            "Тема и цель обучения заполнены. Выберите инструмент и нажмите «Создать»."));
}
async function upload(files){
 if(!files||!files.length)return;
 $("ktpFileInput").disabled=true;
 notify(msg("Жеке КТЖ файлы өңделуде...","Обработка вашего файла КТП..."));
 let count=0,errors=[];
 for(const file of Array.from(files).slice(0,12)){
  try{
   const data=await readFile(file);
   if(!data.length){
    errors.push(file.name+": "+msg("«Тақырып» бағаны табылмады","Не найден столбец «Тема»"));
    continue;
   }
   imported=imported.filter(x=>x.source!==file.name);
   const unique=new Map();
   [...imported,...data].forEach(x=>unique.set([x.source,x.sheet,x.row,x.title].join("|"),x));
   imported=[...unique.values()].slice(0,MAX);
   count+=data.length;
  }catch(error){errors.push(file.name+": "+error.message)}
 }
 $("ktpFileInput").disabled=false;
 $("ktpFileInput").value="";
 const savedOK=save();
 refresh();
 notify((count?
  msg(count+" сабақ жеке КТЖ-дан қосылды.","Добавлено уроков из вашего КТП: "+count)+
  (savedOK?"":msg(" (Браузерде сақтау мүмкін болмады.)"," (Не удалось сохранить в браузере.)"))
  :"")+(errors.length?" "+errors.slice(0,2).join(" · "):""));
}
function init(){
 imported=saved();
 $("ktpFileInput").addEventListener("change",e=>upload(e.target.files));
 $("ktpSearch").addEventListener("input",refresh);
 $("ktpTopicSelect").addEventListener("change",select);
 ["gradeInput","subjectInput"].forEach(id=>$(id).addEventListener("change",refresh));
 $("ktpClear").addEventListener("click",()=>{
  imported=[];
  try{localStorage.removeItem(KEY)}catch{}
  $("ktpSearch").value="";
  refresh();
  notify(msg("Жеке жүктелген КТЖ тазаланды. 2026–2027 дайын тізімі сақталады.",
             "Ваш загруженный КТП удалён. Готовый каталог 2026–2027 сохранён."));
 });
 document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>{
  setTimeout(()=>{refresh();loadBuiltin(ru()?"ru":"kk")},0);
 }));
 refresh();
 loadBuiltin(ru()?"ru":"kk");
}
window.TarihKTP={parseCSV,parseRows,findHeader,decodeWordTable,refresh,loadBuiltin,availableEntries};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();