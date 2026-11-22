
(function(){
"use strict";
const $=id=>document.getElementById(id);
const URLS={
 arch:"https://upload.wikimedia.org/wikipedia/commons/c/ca/Ahmet_yasawi.jpg",
 rock:"https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Petroglyphs_in_Tamgaly%2C_Kazakhstan_01.jpg/960px-Petroglyphs_in_Tamgaly%2C_Kazakhstan_01.jpg",
 yurt:"https://upload.wikimedia.org/wikipedia/commons/f/f7/%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D0%BA%D0%B0%D1%8F_%D1%8E%D1%80%D1%82%D0%B0.jpg"
};
const PRESETS={slides:"arch",info:"rock",illustration:"yurt",sheet:"rock"};
const SIZES={slides:[1280,720],info:[1080,1350],illustration:[1280,720],sheet:[1080,1400]};
const COLORS={
 navy:{bg:"#113247",deep:"#071b2b",accent:"#e7bd81",light:"#e7f1ef",ink:"#14384c"},
 forest:{bg:"#17443f",deep:"#0b2c2c",accent:"#dcbf87",light:"#e8f4e9",ink:"#1c5148"},
 warm:{bg:"#594533",deep:"#2c251e",accent:"#f3c992",light:"#f9eddf",ink:"#604c38"}
};
const TEXT={
 kk:{slides:"Слайдтар",info:"Инфографика",illustration:"Иллюстрация",sheet:"Жұмыс парағы",subjectKaz:"Қазақстан тарихы",subjectWorld:"Дүниежүзі тарихы",grade:"сынып",goal:"Сабақтың мақсаты",facts:"Негізгі тарихи деректер",event:"Тарихи дерек",summary:"Қорытынды",review:"Тарихи деректерді мұғалім тексереді",credit:"Көрнекі фотосурет · Wikimedia Commons",uploaded:"Пайдаланушы жүктеген фото",saved:"Материал жасалып, осы браузерде сақталды.",notSaved:"Материал ашылды, бірақ браузерде сақтау мүмкін болмады.",loading:"Сурет дайындалуда...",empty:"Әзірше материал жоқ. Жоғарыдан «Жасау» батырмасын басыңыз.",open:"Ашу",edit:"Өңдеу",remove:"Жою",downloaded:"Файл жүктелді.",failedImage:"Фотосурет жүктелмеді. Материалға градиенттік фон қойылды.",error:"Материалды жасау мүмкін болмады.",large:"Сурет 2 МБ-тан аспауы керек.",file:"JPG, PNG немесе WebP файлын таңдаңыз.",pdf:"Браузердің басып шығару терезесінде «PDF сақтау» таңдаңыз.",slideNames:["Тақырып","Тарихи деректер","Талдау","Қорытынды"]},
 ru:{slides:"Слайды",info:"Инфографика",illustration:"Иллюстрация",sheet:"Рабочий лист",subjectKaz:"История Казахстана",subjectWorld:"Всемирная история",grade:"класс",goal:"Цель урока",facts:"Основные исторические факты",event:"Исторический факт",summary:"Вывод",review:"Исторические сведения проверяет учитель",credit:"Иллюстративное фото · Wikimedia Commons",uploaded:"Фото загружено пользователем",saved:"Материал создан и сохранён в этом браузере.",notSaved:"Материал открыт, но сохранить его в браузере не удалось.",loading:"Подготовка изображения...",empty:"Материалов пока нет. Нажмите «Создать» выше.",open:"Открыть",edit:"Изменить",remove:"Удалить",downloaded:"Файл скачан.",failedImage:"Фото не загрузилось. Использован градиентный фон.",error:"Не удалось создать материал.",large:"Размер изображения не должен превышать 2 МБ.",file:"Выберите JPG, PNG или WebP.",pdf:"В диалоге печати выберите «Сохранить как PDF».",slideNames:["Тема","Исторические факты","Анализ","Вывод"]}
};
const KEY="tarih-ustaz-three-tools-v1";
const state={lang:"kk",mode:"slides",page:0,data:null,photo:null,photoSrc:null,upload:null,library:[],job:0};
const $t=k=>TEXT[state.lang][k]||k;
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const currentPhoto=d=>d.upload||URLS[d.image!=="auto"?d.image:PRESETS[d.mode]];
function setStatus(s){$("status").textContent=s}
function readForm(){
 const f=$("factsInput").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,6);
 return {mode:state.mode,lang:state.lang,topic:$("topicInput").value.trim().slice(0,300)||"Tarih Ustaz AI",subject:$("subjectInput").value,grade:$("gradeInput").value,goal:$("goalInput").value.trim().slice(0,1500),facts:f,image:$("imageSelect").value,theme:$("themeInput").value,upload:state.upload||null};
}
function fillForm(d){
 state.mode=d.mode;state.lang=d.lang==="ru"?"ru":"kk";state.upload=d.upload||null;
 $("topicInput").value=d.topic||"Tarih Ustaz AI";
 $("subjectInput").value=d.subject||"kaz";
 $("gradeInput").value=d.grade||"7";
 $("goalInput").value=d.goal||"";
 $("factsInput").value=(d.facts||[]).join("\n");
 $("imageSelect").value=d.image||"auto";
 $("themeInput").value=d.theme||"navy";
 $("uploadInput").value="";
 translate();selectMode(state.mode,false);
}
function translate(){
 document.documentElement.lang=state.lang;
 document.querySelectorAll("[data-kk][data-ru]").forEach(el=>{el.textContent=el.dataset[state.lang]});
 document.querySelectorAll("[data-lang]").forEach(b=>{const yes=b.dataset.lang===state.lang;b.classList.toggle("active",yes);b.setAttribute("aria-pressed",yes?"true":"false")});
 $("previewType").textContent=state.mode==="slides"?"SLIDES / 16:9":state.mode==="info"?"INFOGRAPHIC / 4:5":state.mode==="sheet"?"WORKSHEET / A4":"PHOTO POSTER / 16:9";
 renderLibrary();
}
function selectMode(mode,preview=true){
 if(!SIZES[mode])return;
 state.mode=mode;state.page=0;
 document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.mode===mode)));
 $("slideNav").hidden=mode!=="slides";
 $("modalSlideNav").hidden=mode!=="slides";
 $("previewType").textContent=mode==="slides"?"SLIDES / 16:9":mode==="info"?"INFOGRAPHIC / 4:5":mode==="sheet"?"WORKSHEET / A4":"PHOTO POSTER / 16:9";
 if(preview)drawPreview();
}
function cover(ctx,img,x,y,w,h){
 const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
 const r=Math.max(w/iw,h/ih),sw=w/r,sh=h/r;
 ctx.drawImage(img,(iw-sw)/2,(ih-sh)/2,sw,sh,x,y,w,h);
}
function fill(ctx,x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
function rrect(ctx,x,y,w,h,r,c){
 ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,Math.max(0,Math.min(r,w/2,h/2)));ctx.fill();
}
function line(ctx,x1,y1,x2,y2,c,weight=2){ctx.strokeStyle=c;ctx.lineWidth=weight;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function font(ctx,size,weight=700){ctx.font=weight+" "+size+"px Manrope, 'Segoe UI', sans-serif"}
function wrap(ctx,s,x,y,maxW,lineH,maxLines=4,color="#fff",size=30,weight=700){
 ctx.fillStyle=color;font(ctx,size,weight);ctx.textBaseline="top";
 const words=String(s||"").split(/\s+/).filter(Boolean);
 let lines=[],cur="";
 for(const word of words){const test=cur?cur+" "+word:word;if(ctx.measureText(test).width>maxW&&cur){lines.push(cur);cur=word;}else cur=test}
 if(cur)lines.push(cur);if(!lines.length)lines=[""];
 lines=lines.slice(0,maxLines);
 if(lines.length===maxLines){while(ctx.measureText(lines[lines.length-1]).width>maxW&&lines[lines.length-1].length>1)lines[lines.length-1]=lines[lines.length-1].slice(0,-2)+"…"}
 lines.forEach((text,i)=>ctx.fillText(text,x,y+i*lineH,maxW));
 return y+lines.length*lineH;
}
function drawBackground(ctx,w,h,c,img){
 const base=ctx.createLinearGradient(0,0,w,h);base.addColorStop(0,c.bg);base.addColorStop(1,c.deep);fill(ctx,0,0,w,h,base);
 if(img){ctx.save();ctx.globalAlpha=.84;cover(ctx,img,0,0,w,h);ctx.restore()}
 const shade=ctx.createLinearGradient(0,0,w*.9,0);shade.addColorStop(0,c.deep);shade.addColorStop(.55,c.deep+"ee");shade.addColorStop(1,c.deep+"08");fill(ctx,0,0,w,h,shade);
}
function headingLine(ctx,c,x,y,w){fill(ctx,x,y,w,5,c.accent)}
function brand(ctx,c,x,y,label){
 font(ctx,18,800);ctx.textBaseline="top";ctx.fillStyle=c.accent;ctx.fillText("TARIH USTAZ AI",x,y);
 font(ctx,14,700);ctx.fillStyle="#d6e4e7";ctx.fillText(label,x,y+31);
}
function creditLine(d){
 if(d.upload)return TEXT[d.lang].uploaded;
 const selected=d.image!=="auto"?d.image:PRESETS[d.mode];
 if(selected==="arch")return "CentrAsia · CC0 · Wikimedia Commons";
 if(selected==="rock")return "Ninaras · CC BY-SA 4.0 · Wikimedia Commons";
 return "Alexandr frolov · CC BY-SA 4.0 · Wikimedia Commons";
}
function photoCredit(ctx,d,c,w,h){
 ctx.textBaseline="alphabetic";font(ctx,14,600);ctx.fillStyle="#d9e8e8";
 ctx.fillText(creditLine(d),52,h-25,Math.min(w-80,950));
}
function drawSlide(ctx,d,page,img){
 const w=1280,h=720,c=COLORS[d.theme]||COLORS.navy,T=TEXT[d.lang];
 drawBackground(ctx,w,h,c,img);
 const panel=ctx.createLinearGradient(0,0,w,0);panel.addColorStop(0,c.deep);panel.addColorStop(.59,c.deep+"e5");panel.addColorStop(1,"#07152500");fill(ctx,0,0,w,h,panel);
 headingLine(ctx,c,60,70,108);brand(ctx,c,60,96,T.slideNames[page]+" · "+d.grade+" "+T.grade);
 const title=page===0?d.topic:page===1?T.facts:page===2?T.event:T.summary;
 const titleY=page===0?210:175;
 const bottom=wrap(ctx,title,60,titleY,Math.min(840,w*.67),page===0?78:70,page===0?3:2,"#ffffff",page===0?69:56,800);
 if(page===0){wrap(ctx,d.goal,62,bottom+24,660,35,3,"#dcf0f1",25,500);headingLine(ctx,c,62,568,150)}
 if(page===1||page===2){
  const facts=page===1?d.facts.slice(0,3):d.facts.slice(3,6);
  const values=facts.length?facts:(d.goal?[d.goal]:[]);
  let y=Math.min(330,bottom+20);
  values.slice(0,4).forEach((s,i)=>{rrect(ctx,60,y,690,76,9,"#0d2c3bd9");fill(ctx,75,y+18,4,39,c.accent);font(ctx,19,800);ctx.fillStyle=c.accent;ctx.fillText(String(i+1).padStart(2,"0"),95,y+20);wrap(ctx,s,140,y+14,580,27,2,"#effafa",19,650);y+=89;});
 }
 if(page===3){wrap(ctx,d.goal,60,bottom+22,720,41,4,"#e8f5f3",28,550);headingLine(ctx,c,60,583,125)}
 line(ctx,60,660,1220,660,"#ffffff55",1);
 font(ctx,13,700);ctx.fillStyle="#d5e9e8";const names={kaz:[T.subjectKaz,"Қазақстан тарихы"],world:[T.subjectWorld,"Дүниежүзі тарихы"],law:["Құқық негіздері","Основы права"],constitution:["Конституция негіздері","Основы Конституции"],order:["Заң және тәртіп","Закон и порядок"]};
 const sub=(names[d.subject]||names.kaz);ctx.fillText(d.subject==="kaz"?T.subjectKaz:d.subject==="world"?T.subjectWorld:sub[d.lang==="ru"?1:0],60,676);
 font(ctx,11,500);ctx.fillStyle="#c8d9d9";ctx.fillText(creditLine(d),360,676,690);ctx.textAlign="right";ctx.fillText(String(page+1).padStart(2,"0")+" / 04",1215,676);ctx.textAlign="left";
}
function drawInfo(ctx,d,img){
 const w=1080,h=1350,c=COLORS[d.theme]||COLORS.navy,T=TEXT[d.lang];
 fill(ctx,0,0,w,h,"#f7f9f7");
 fill(ctx,0,0,w,464,c.deep);
 if(img){ctx.save();ctx.globalAlpha=.9;cover(ctx,img,0,0,w,464);ctx.restore()}
 const shade=ctx.createLinearGradient(0,0,0,464);shade.addColorStop(0,"#071b2b42");shade.addColorStop(1,c.deep+"f7");fill(ctx,0,0,w,464,shade);
 headingLine(ctx,c,58,55,110);brand(ctx,c,58,83,"INFOGRAPHIC · "+d.grade+" "+T.grade);
 wrap(ctx,d.topic,58,252,945,66,3,"#fff",57,800);
 rrect(ctx,42,487,996,151,14,"#eaf2ef");
 font(ctx,16,800);ctx.fillStyle=c.ink;ctx.fillText(T.goal.toUpperCase(),68,515);
 wrap(ctx,d.goal,68,557,930,34,2,c.ink,25,600);
 font(ctx,17,800);ctx.fillStyle=c.ink;ctx.fillText(T.facts.toUpperCase(),51,686);
 const vals=d.facts.length?d.facts:[d.goal||"—"];
 let i=0;vals.slice(0,6).forEach(s=>{
 const col=i%2,row=Math.floor(i/2),x=44+col*507,y=728+row*161;
 rrect(ctx,x,y,488,144,12,"#fff");ctx.strokeStyle="#dce7e3";ctx.lineWidth=2;ctx.strokeRect(x+.8,y+.8,486,142);
 rrect(ctx,x+18,y+19,57,55,10,c.bg);
 font(ctx,25,800);ctx.fillStyle=c.accent;ctx.fillText(String(i+1).padStart(2,"0"),x+28,y+28);
 wrap(ctx,s,x+92,y+23,365,33,3,c.ink,23,750);i++;
 });
 fill(ctx,0,1255,w,95,c.bg);font(ctx,18,800);ctx.fillStyle="#fff";ctx.fillText("TARIH USTAZ AI",48,1280);
 font(ctx,15,500);ctx.fillStyle="#d5eceb";ctx.fillText(creditLine(d),48,1311,950);
}
function drawPoster(ctx,d,img){
 const w=1280,h=720,c=COLORS[d.theme]||COLORS.navy,T=TEXT[d.lang];
 drawBackground(ctx,w,h,c,img);
 const gr=ctx.createLinearGradient(0,0,0,h);gr.addColorStop(0,"#081e3155");gr.addColorStop(.42,"#051e3155");gr.addColorStop(1,c.deep+"fc");fill(ctx,0,0,w,h,gr);
 brand(ctx,c,55,51,"HISTORY PHOTO POSTER");
 fill(ctx,55,165,5,132,c.accent);
 const bottom=wrap(ctx,d.topic,79,170,1010,77,3,"#fff",71,800);
 wrap(ctx,d.goal,76,bottom+24,975,38,2,"#f2faf9",27,550);
 const values=d.facts.slice(0,3),x0=56;
 values.forEach((s,i)=>{
 const x=x0+i*400,y=548;
 rrect(ctx,x,y,381,82,9,"#0a2b3ce0");
 fill(ctx,x+15,y+16,3,49,c.accent);
 wrap(ctx,s,x+32,y+15,330,25,2,"#f2ffff",19,600);
 });
 line(ctx,55,662,1225,662,"#ffffff55",1);photoCredit(ctx,d,c,w,h);
}

function drawWorksheet(ctx,d,img){
 const w=1080,h=1400,c=COLORS[d.theme]||COLORS.navy,T=TEXT[d.lang];
 const isRu=d.lang==="ru",fact=d.facts.slice(0,4);
 fill(ctx,0,0,w,h,"#f7faf9");
 fill(ctx,0,0,w,260,c.bg);
 if(img){ctx.save();ctx.globalAlpha=.58;cover(ctx,img,0,0,w,260);ctx.restore()}
 const shade=ctx.createLinearGradient(0,0,w,0);shade.addColorStop(0,c.deep);shade.addColorStop(.7,c.deep+"da");shade.addColorStop(1,c.deep+"4d");fill(ctx,0,0,w,260,shade);
 headingLine(ctx,c,48,39,105);brand(ctx,c,48,62,isRu?"РАБОЧИЙ ЛИСТ • "+d.grade+" КЛАСС":"ЖҰМЫС ПАРАҒЫ • "+d.grade+" СЫНЫП");
 wrap(ctx,d.topic,48,142,970,52,2,"#fff",43,800);
 rrect(ctx,42,281,996,124,12,"#e8f2ee");
 font(ctx,16,800);ctx.fillStyle=c.ink;ctx.fillText(isRu?"ЦЕЛЬ ОБУЧЕНИЯ":"ОҚУ МАҚСАТЫ",64,302);
 wrap(ctx,d.goal|| (isRu?"Укажите учебную цель.":"Оқу мақсатын енгізіңіз."),64,335,935,30,2,c.ink,22,650);
 const tasks=[
  {n:"01",pts:2,title:isRu?"Исторические понятия":"Тарихи ұғымдар",
   prompt:isRu?"Назовите два ключевых понятия по теме. Кратко объясните их значение.":"Тақырыпқа байланысты екі тарихи ұғымды жазып, олардың мағынасын түсіндіріңіз.",
   desc:isRu?"2 понятия — 1 б. · Объяснение — 1 б.":"2 ұғым — 1 б. · Түсіндірме — 1 б."},
  {n:"02",pts:4,title:isRu?"Причины и последствия":"Себеп пен салдар",
   prompt:isRu?"Укажите две причины и два последствия исторического события.":"Оқиғаның екі себебі мен екі салдарын анықтап жазыңыз.",
   desc:isRu?"2 причины — 2 б. · 2 последствия — 2 б.":"2 себеп — 2 б. · 2 салдар — 2 б."},
  {n:"03",pts:4,title:isRu?"Историческое значение":"Тарихи маңызы",
   prompt:isRu?"Приведите два аргумента и сделайте обоснованный вывод.":"Екі тарихи дәлел келтіріп, негізделген қорытынды жасаңыз.",
   desc:isRu?"2 аргумента — 2 б. · Сравнение и вывод — 2 б.":"2 дәлел — 2 б. · Салыстыру мен қорытынды — 2 б."}
 ];
 if(fact.length){
  font(ctx,15,800);ctx.fillStyle="#56747a";ctx.fillText(isRu?"ОПОРНЫЕ ФАКТЫ":"НЕГІЗГІ ДЕРЕКТЕР",53,428);
  wrap(ctx,fact.join(" • "),53,454,965,27,2,c.ink,17,550);
 }
 tasks.forEach((x,i)=>{
  const y=535+i*250;
  rrect(ctx,42,y,996,236,13,"#fff");
  ctx.strokeStyle="#d8e5e1";ctx.lineWidth=2;ctx.strokeRect(43,y+1,994,234);
  rrect(ctx,60,y+19,61,56,10,c.bg);
  font(ctx,26,800);ctx.fillStyle=c.accent;ctx.fillText(x.n,71,y+30);
  font(ctx,25,800);ctx.fillStyle=c.ink;ctx.fillText(x.title,139,y+18,650);
  rrect(ctx,889,y+24,124,41,7,"#e8f4f0");
  font(ctx,17,750);ctx.fillStyle=c.ink;ctx.fillText(x.pts+(isRu?" БАЛЛА":" БАЛЛ"),901,y+35);
  wrap(ctx,x.prompt,62,y+86,926,30,2,c.ink,19,550);
  line(ctx,63,y+159,993,y+159,"#c5d6d2",1);
  line(ctx,63,y+190,993,y+190,"#c5d6d2",1);
  font(ctx,15,700);ctx.fillStyle="#2f7a7c";ctx.fillText(x.desc,63,y+209,940);
 });
 fill(ctx,0,1301,w,99,c.bg);
 font(ctx,21,800);ctx.fillStyle="#fff";ctx.fillText("TARIH USTAZ AI",45,1323);
 font(ctx,16,650);ctx.fillStyle="#d2e9e6";ctx.fillText(isRu?"ВСЕГО 10 БАЛЛОВ":"ЖАЛПЫ 10 БАЛЛ",690,1328);
 font(ctx,12,500);ctx.fillStyle="#d0e7e4";ctx.fillText(isRu?"Шаблон. Проверяйте соответствие заданий цели урока.":"Үлгі. Тапсырмаларды оқу мақсатына сәйкестендіріңіз.",45,1362);
}

function paint(canvas,d,img,page){
 const [w,h]=SIZES[d.mode];if(canvas.width!==w)canvas.width=w;if(canvas.height!==h)canvas.height=h;
 const ctx=canvas.getContext("2d");ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
 if(d.mode==="slides")drawSlide(ctx,d,page,img);
 else if(d.mode==="info")drawInfo(ctx,d,img);
 else if(d.mode==="sheet")drawWorksheet(ctx,d,img);
 else drawPoster(ctx,d,img);
}
const cache=new Map();
function loadPhoto(src){
 if(!src)return Promise.resolve(null);
 if(cache.has(src))return cache.get(src);
 const p=new Promise(resolve=>{
  const img=new Image();
  if(!src.startsWith("data:"))img.crossOrigin="anonymous";
  img.onload=()=>{
   try{const t=document.createElement("canvas");t.width=1;t.height=1;t.getContext("2d").drawImage(img,0,0,1,1);t.toDataURL("image/png");resolve(img)}
   catch(e){resolve(null)}
  };
  img.onerror=()=>resolve(null);img.src=src;
 });
 cache.set(src,p);return p;
}
async function prepare(d){
 const image=await loadPhoto(currentPhoto(d));
 return image;
}
async function drawPreview(){
 const token=++state.job,d=readForm();
 $("canvasLoading").hidden=false;$("canvasLoading").textContent=$t("loading");
 const img=await prepare(d);
 if(token!==state.job)return;
 state.photo=img;state.photoSrc=currentPhoto(d);
 paint($("previewCanvas"),d,img,state.page);
 if($("viewModal").open)paint($("modalCanvas"),d,img,state.page);
 $("slidePage").textContent=state.page+1+" / 4";$("modalSlideNumber").textContent=state.page+1+" / 4";
 $("canvasLoading").hidden=true;
 if(!img)setStatus($t("failedImage"));else setStatus("");
}
function liveNow(){
 const d=readForm();state.data=d;return d;
}
function libraryRead(){try{const a=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(a)?a:[]}catch{return []}}
function librarySave(a){try{localStorage.setItem(KEY,JSON.stringify(a));return true}catch{return false}}
function persist(d){
 const id=Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
 const doc={id,created:Date.now(),...d};
 const data=[doc,...state.library].slice(0,8);
 if(librarySave(data)){state.library=data;return true}
 const small={...doc,upload:null};
 if(librarySave([small,...state.library].slice(0,8))){state.library=[small,...state.library].slice(0,8);return false}
 return false;
}
function downloadURL(url,name){
 const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
}
function asImage(canvas,type,filename){
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>{
  if(!blob){reject(new Error("Image export failed"));return}
  const url=URL.createObjectURL(blob);downloadURL(url,filename);setTimeout(()=>URL.revokeObjectURL(url),3500);resolve();
 },type,type==="image/jpeg"?.92:undefined));
}
async function exportImage(type,fromModal=false){
 const d=liveNow(),img=await prepare(d);
 const can=fromModal?$("modalCanvas"):$("previewCanvas");
 paint(can,d,img,state.page);
 const label=d.mode==="slides"?"_slide_"+(state.page+1):"";
 await asImage(can,type,"Tarih_Ustaz_"+d.mode+label+"."+(type==="image/png"?"png":"jpg"));
 setStatus($t("downloaded"));
}
async function imagesFor(d){
 const img=await prepare(d),pages=d.mode==="slides"?4:1;const arr=[];
 for(let i=0;i<pages;i++){const c=document.createElement("canvas");paint(c,d,img,i);arr.push(c.toDataURL("image/jpeg",.9))}
 return arr;
}
async function exportHTML(){
 const d=liveNow(),imgs=await imagesFor(d);
 const title=esc(d.topic);
 const slides=d.mode==="slides";
 const tags=imgs.map((src,i)=>'<img class="page" src="'+src+'" alt="'+esc(d.topic)+' '+(i+1)+'"'+(i?' hidden':'')+'>').join("");
 const code=slides?'let n=0;const pages=document.querySelectorAll(".page");function go(k){pages[n].hidden=true;n=(n+k+pages.length)%pages.length;pages[n].hidden=false;document.getElementById("pageNumber").textContent=(n+1)+" / "+pages.length}document.getElementById("back").onclick=()=>go(-1);document.getElementById("forward").onclick=()=>go(1);document.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")go(-1);if(e.key==="ArrowRight")go(1)})':'';
 const nav=slides?'<nav><button id="back">←</button> <span id="pageNumber">1 / '+imgs.length+'</span> <button id="forward">→</button></nav>':'';
 const printOrientation=(d.mode==="info"||d.mode==="sheet")?"portrait":"landscape";
 const html='<!doctype html><html lang="'+d.lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{margin:0;min-height:100vh;background:#102e40;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;font:14px system-ui;padding:16px;box-sizing:border-box}.page{max-width:100%;max-height:calc(100vh - 110px);width:auto;object-fit:contain;box-shadow:0 15px 60px #0006}.page[hidden]{display:none}nav{padding:12px;display:flex;align-items:center;gap:20px}button{background:#fff;color:#123648;padding:9px 18px;border:0;border-radius:7px;cursor:pointer}@media print{body{background:white;padding:0;display:block}.page{display:block!important;max-width:100%;width:100%;height:auto;max-height:none;page-break-after:always;box-shadow:none}nav{display:none}@page{size:'+printOrientation+';margin:0}}</style></head><body>'+tags+nav+(slides?'<script>'+code+'</script>':'')+'</body></html>';
 const tempURL=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}));downloadURL(tempURL,"Tarih_Ustaz_"+d.mode+".html");setTimeout(()=>URL.revokeObjectURL(tempURL),3500);
 setStatus($t("downloaded"));
}
function printPDF(){
 const d=liveNow();
 imagesFor(d).then(images=>{
 const iframe=document.createElement("iframe");iframe.style.cssText="position:fixed;left:-10000px;top:-10000px;width:1000px;height:700px;border:0";
 document.body.append(iframe);
 const html='<!doctype html><html><head><meta charset="utf-8"><style>@page{size:'+(d.mode==="info"||d.mode==="sheet"?"portrait":"landscape")+';margin:0}body{margin:0;background:white}img{width:100%;height:auto;display:block;page-break-after:always;break-after:page}@media print{img{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'+images.map(src=>'<img src="'+src+'">').join("")+'</body></html>';
 iframe.onload=()=>{setTimeout(()=>{try{iframe.contentWindow.focus();iframe.contentWindow.print();setStatus($t("pdf"));}catch(e){setStatus($t("error"))}},300);setTimeout(()=>iframe.remove(),35000)};
 iframe.srcdoc=html;
 }).catch(()=>setStatus($t("error")));
}
function renderLibrary(){
 const out=$("libraryGrid");if(!out)return;out.textContent="";
 if(!state.library.length){const e=document.createElement("div");e.className="empty-state";e.textContent=$t("empty");out.append(e);return}
 state.library.forEach(d=>{
 const card=document.createElement("article");card.className="library-card";
 const cover=document.createElement("img");cover.className="library-thumb";cover.alt="";cover.src=currentPhoto(d);
 const inner=document.createElement("div");inner.className="library-content";
 const type=document.createElement("span");type.className="library-type";type.textContent=TEXT[state.lang][d.mode];
 const h=document.createElement("h3");h.textContent=d.topic;
 const meta=document.createElement("p");meta.textContent=d.grade+" "+TEXT[state.lang].grade+" · "+new Date(d.created).toLocaleDateString(state.lang==="ru"?"ru-RU":"kk-KZ");
 const actions=document.createElement("div");actions.className="library-actions";
 [["open",()=>openSaved(d)],["edit",()=>editSaved(d)],["remove",()=>removeSaved(d.id)]].forEach(pair=>{const b=document.createElement("button");b.type="button";b.textContent=$t(pair[0]);b.addEventListener("click",pair[1]);actions.append(b)});
 inner.append(type,h,meta,actions);card.append(cover,inner);out.append(card);
 });
}
async function openSaved(d){
 fillForm(d);state.data=d;state.page=0;await drawPreview();openModal();$("studio").scrollIntoView({behavior:"smooth"});
}
function editSaved(d){fillForm(d);drawPreview();$("studio").scrollIntoView({behavior:"smooth"});}
function removeSaved(id){state.library=state.library.filter(x=>x.id!==id);librarySave(state.library);renderLibrary();}
function openModal(){
 $("modalTitle").textContent=readForm().topic+" · "+$t(state.mode);
 $("modalSlideNav").hidden=state.mode!=="slides";
 paint($("modalCanvas"),readForm(),state.photo,state.page);
 $("modalSlideNumber").textContent=(state.page+1)+" / 4";
 const modal=$("viewModal");if(typeof modal.showModal==="function"&&!modal.open)modal.showModal();else modal.setAttribute("open","");
}
async function create(){
 $("generateBtn").disabled=true;
 try{
  const d=liveNow(),img=await prepare(d);
  state.photo=img;state.page=0;
  paint($("previewCanvas"),d,img,0);
  const saved=persist(d);renderLibrary();openModal();
  setStatus(saved?$t("saved"):$t("notSaved"));
 }catch(e){setStatus($t("error"));console.error(e)}
 finally{$("generateBtn").disabled=false}
}
function movePage(delta){
 if(state.mode!=="slides")return;
 state.page=(state.page+delta+4)%4;
 drawPreview();
}
function init(){
 state.library=libraryRead().slice(0,8);
 try{state.lang=localStorage.getItem("tarih-ustaz-lang")==="ru"?"ru":"kk"}catch{}
 document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{state.lang=b.dataset.lang;try{localStorage.setItem("tarih-ustaz-lang",state.lang)}catch{}translate();drawPreview()}));
 document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>selectMode(b.dataset.mode)));
 document.querySelectorAll("[data-jump]").forEach(b=>b.addEventListener("click",()=>{selectMode(b.dataset.jump);$("studio").scrollIntoView({behavior:"smooth"})}));
 $("editorForm").addEventListener("submit",e=>{e.preventDefault();create()});
 let timeout;
 ["topicInput","subjectInput","gradeInput","goalInput","factsInput","imageSelect","themeInput"].forEach(id=>{
 const el=$(id);el.addEventListener("input",()=>{clearTimeout(timeout);timeout=setTimeout(drawPreview,170)});
 });
 $("uploadInput").addEventListener("change",e=>{
 const file=e.target.files&&e.target.files[0];if(!file)return;
 if(!/^image\/(jpeg|png|webp)$/.test(file.type)){setStatus($t("file"));return}
 if(file.size>2*1024*1024){setStatus($t("large"));e.target.value="";return}
 const reader=new FileReader();reader.onload=()=>{state.upload=String(reader.result);drawPreview()};reader.readAsDataURL(file);
 });
 $("imageSelect").addEventListener("change",()=>{state.upload=null;$("uploadInput").value="";drawPreview()});
 $("prevSlide").addEventListener("click",()=>movePage(-1));$("nextSlide").addEventListener("click",()=>movePage(1));
 $("modalPrev").addEventListener("click",()=>movePage(-1));$("modalNext").addEventListener("click",()=>movePage(1));
 $("pngBtn").addEventListener("click",()=>exportImage("image/png").catch(()=>setStatus($t("error"))));
 $("jpgBtn").addEventListener("click",()=>exportImage("image/jpeg").catch(()=>setStatus($t("error"))));
 $("htmlBtn").addEventListener("click",()=>exportHTML().catch(()=>setStatus($t("error"))));
 $("copyBtn").addEventListener("click",async()=>{
 const d=readForm(),r=d.lang==="ru",facts=d.facts.map((f,i)=>(i+1)+". "+f).join("\n");
 const sheet=r?"РАБОЧИЙ ЛИСТ · 10 БАЛЛОВ\n1. Назовите два понятия и объясните их. (2 б.)\n2. Определите две причины и два последствия. (4 б.)\n3. Приведите два аргумента и сделайте вывод. (4 б.)":"ЖҰМЫС ПАРАҒЫ · 10 БАЛЛ\n1. Екі ұғымды атаңыз және түсіндіріңіз. (2 б.)\n2. Екі себеп пен екі салдарды анықтаңыз. (4 б.)\n3. Екі дәлел келтіріп, қорытынды жасаңыз. (4 б.)";
 const body=d.topic+"\n"+d.goal+"\n"+(d.mode==="sheet"?sheet+"\n":"")+facts;
 try{await navigator.clipboard.writeText(body);setStatus(r?"Текст скопирован.":"Мәтін көшірілді.")}catch(e){setStatus(r?"Скопировать не удалось.":"Көшіру мүмкін болмады.")}
});
 $("pdfBtn").addEventListener("click",printPDF);
 $("modalPng").addEventListener("click",()=>exportImage("image/png",true).catch(()=>setStatus($t("error"))));
 $("modalHtml").addEventListener("click",()=>exportHTML().catch(()=>setStatus($t("error"))));
 $("modalClose").addEventListener("click",()=>{const d=$("viewModal");d.close?.();d.removeAttribute("open")});
 $("viewModal").addEventListener("click",e=>{if(e.target===$("viewModal")){const d=$("viewModal");d.close?.();d.removeAttribute("open")}});
 translate();selectMode("slides",false);drawPreview();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
