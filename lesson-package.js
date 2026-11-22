/* Tarih Ustaz AI: 4-stage bilingual lesson package, local templates, no AI API */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const PHOTO={
 arch:"https://upload.wikimedia.org/wikipedia/commons/c/ca/Ahmet_yasawi.jpg",
 rock:"https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Petroglyphs_in_Tamgaly%2C_Kazakhstan_01.jpg/960px-Petroglyphs_in_Tamgaly%2C_Kazakhstan_01.jpg",
 yurt:"https://upload.wikimedia.org/wikipedia/commons/f/f7/%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D0%BA%D0%B0%D1%8F_%D1%8E%D1%80%D1%82%D0%B0.jpg"
};
const VALUES={
 patriot:{kk:"Тәуелсіздік және отаншылдық",ru:"Независимость и патриотизм"},
 unity:{kk:"Бірлік және ынтымақ",ru:"Единство и солидарность"},
 justice:{kk:"Әділдік және жауапкершілік",ru:"Справедливость и ответственность"},
 law:{kk:"Заң және тәртіп",ru:"Закон и порядок"},
 work:{kk:"Еңбекқорлық және кәсіби біліктілік",ru:"Трудолюбие и профессионализм"},
 create:{kk:"Жасампаздық және жаңашылдық",ru:"Созидательность и новаторство"}
};
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lang=()=>document.documentElement.lang==="ru"?"ru":"kk";
const tr=(kk,ru)=>lang()==="ru"?ru:kk;
let active="qmj",parts={},doc=null,questions=[];
const valueName=d=>(VALUES[d.value]||VALUES.patriot)[d.lang];
const str=x=>String(x||"").trim();
const editing=(s)=>'<span contenteditable="true" spellcheck="true">'+esc(s)+'</span>';
function read(){
 const l=lang();
 return {lang:l,topic:str($("topicInput").value)||"Tarih Ustaz AI",
 subject:$("subjectInput").value==="world"?(l==="ru"?"Всемирная история":"Дүниежүзі тарихы"):(l==="ru"?"История Казахстана":"Қазақстан тарихы"),
 grade:$("gradeInput").value,goal:str($("goalInput").value),
 facts:$("factsInput").value.split(/\r?\n/).map(str).filter(Boolean).slice(0,8),
 value:$("packageValue").value,duration:Number($("packageDuration").value)||45};
}
const label=(d,kk,ru)=>d.lang==="ru"?ru:kk;
function rows(d){
 const minutes=d.duration===40?[4,8,18,7,3]:[5,10,20,7,3];
 const lessonData=[
 [label(d,"Ұйымдастыру","Организационный момент"),label(d,"Сабақтың мақсатын анықтау, алдыңғы білімді белсендіру","Определение цели урока, актуализация знаний"),label(d,"Тақырыпқа қатысты бастапқы білімін айтады","Актуализирует знания по теме"),label(d,"Ауызша кері байланыс","Устная обратная связь")],
 [label(d,"Түсіндіру","Объяснение"),label(d,"Хронология мен тарихи деректерді инфографика арқылы түсіндіру","Объяснение хронологии и исторических сведений через инфографику"),label(d,"Тарихи оқиғаларды жүйелейді, деректермен танысады","Систематизирует события и знакомится с фактами"),label(d,"Түсінуді бақылау","Проверка понимания")],
 [label(d,"Зерттеу және тапсырма","Исследование и задание"),label(d,"Деректерді салыстыру, себеп-салдарлық талдау тапсырмаларын ұсыну","Сравнение фактов, задания на причинно-следственный анализ"),label(d,"Жұмыс парағын орындайды, дәлел келтіреді","Выполняет рабочий лист и приводит аргументы"),label(d,"Дескриптор бойынша бағалау","Оценивание по дескрипторам")],
 [label(d,"Бекіту","Закрепление"),label(d,"Қорытынды сұрақтар, тарихи маңызын талдау","Итоговые вопросы, анализ исторического значения"),label(d,"Тақырып бойынша тұжырым жасайды","Формулирует вывод по теме"),label(d,"Өзін-өзі бағалау","Самооценивание")],
 [label(d,"Рефлексия","Рефлексия"),label(d,"Ойын арқылы қорытындылау, кері байланыс алу","Итоговая игра и обратная связь"),label(d,"Ойын сұрақтарына жауап береді","Отвечает на вопросы игры"),label(d,"Жедел кері байланыс","Оперативная обратная связь")]
 ];
 return lessonData.map((r,i)=>'<tr><td>'+minutes[i]+' '+label(d,"мин","мин")+'</td>'+r.map(x=>'<td>'+esc(x)+'</td>').join("")+'</tr>').join("");
}
function qmj(d){
 const goal=d.goal||label(d,"КТЖ-дан оқу мақсатын енгізіңіз","Укажите цель обучения из КТП");
 return '<article class="lesson-document"><div class="lesson-edit-note">'+label(d,"Мәтін өрістерін тікелей өңдей аласыз.","Текстовые поля можно редактировать прямо здесь.")+'</div>'+
 '<h2>'+label(d,"Қысқа мерзімді сабақ жоспары (ҚМЖ)","Краткосрочный план урока (КСП)")+'</h2>'+
 '<table><tr><th>'+label(d,"Пән","Предмет")+'</th><td>'+esc(d.subject)+'</td><th>'+label(d,"Сынып","Класс")+'</th><td>'+esc(d.grade)+'</td></tr>'+
 '<tr><th>'+label(d,"Күні","Дата")+'</th><td>_______________</td><th>'+label(d,"Педагог","Педагог")+'</th><td>_______________</td></tr>'+
 '<tr><th>'+label(d,"Сабақтың тақырыбы","Тема урока")+'</th><td colspan="3">'+editing(d.topic)+'</td></tr>'+
 '<tr><th>'+label(d,"Оқу мақсаты (КТЖ бойынша)","Цель обучения (по КТП)")+'</th><td colspan="3">'+editing(goal)+'</td></tr>'+
 '<tr><th>'+label(d,"Сабақ мақсаты","Цель урока")+'</th><td colspan="3">'+editing(goal)+'</td></tr>'+
 '<tr><th>'+label(d,"Құндылықтарды дарыту","Привитие ценностей")+'</th><td colspan="3">'+editing(valueName(d))+'</td></tr>'+
 '<tr><th>'+label(d,"Құндылықты іске асыру","Реализация ценности")+'</th><td colspan="3">'+editing(label(d,"Тарихи шешімдерді талдау, өз пікірін құрметпен дәлелдеу және топта жауапкершілікпен жұмыс істеу.","Анализ исторических решений, уважительное аргументирование и ответственная групповая работа."))+'</td></tr></table>'+
 '<h3>'+label(d,"Сабақтың барысы","Ход урока")+'</h3>'+
 '<table><thead><tr><th>'+label(d,"Уақыт","Время")+'</th><th>'+label(d,"Кезең","Этап")+'</th><th>'+label(d,"Мұғалім әрекеті","Действия учителя")+'</th><th>'+label(d,"Оқушы әрекеті","Действия ученика")+'</th><th>'+label(d,"Бағалау","Оценивание")+'</th></tr></thead><tbody>'+rows(d)+'</tbody></table>'+
 '<h3>'+label(d,"Ресурстар","Ресурсы")+'</h3><p>'+editing(label(d,"Тарихи инфографика, түсіндірме слайдтар, жұмыс парағы, қорытынды HTML-ойын.","Историческая инфографика, объясняющие слайды, рабочий лист, итоговая HTML-игра."))+'</p>'+
 '<p class="lesson-muted">'+label(d,"Бұл — өңделетін әдістемелік үлгі; нақты оқу мақсаты мен тарихи деректерді мұғалім тексереді.","Это редактируемый методический шаблон. Цель обучения и исторические факты проверяет педагог.")+'</p></article>';
}
function photoCard(d,index,title,text,src){
 return '<div class="lesson-slide-card"><span class="slide-number">'+String(index).padStart(2,"0")+' · TARIH USTAZ AI</span><img alt="'+esc(title)+'" src="'+src+'"><h3>'+esc(title)+'</h3><p>'+editing(text)+'</p></div>';
}
function explain(d){
 const facts=d.facts.length?d.facts:[label(d,"Тарихи фактілерді енгізіңіз","Добавьте исторические факты")];
 const safeGoal=d.goal||label(d,"КТЖ бойынша оқу мақсаты","Цель обучения по КТП");
 return '<article class="lesson-document"><h2>'+label(d,"Түсіндірме слайдтар және тарихи инфографика","Объясняющие слайды и историческая инфографика")+'</h2>'+
 '<p class="lesson-muted">'+label(d,"Фотосуреттер — көрнекі дерек, көрсетілген оқиға дәуірінің міндетті фотосы емес.","Фотографии носят иллюстративный характер, не обязательно относятся к эпохе описываемого события.")+'</p>'+
 '<div class="lesson-slide-set">'+
 photoCard(d,1,d.topic,safeGoal,PHOTO.arch)+
 photoCard(d,2,label(d,"Негізгі тарихи деректер","Основные исторические факты"),facts.slice(0,2).join(" · "),PHOTO.rock)+
 photoCard(d,3,label(d,"Себеп пен салдар","Причины и следствия"),facts.slice(2,4).join(" · ")||safeGoal,PHOTO.yurt)+
 photoCard(d,4,label(d,"Қорытынды","Вывод"),safeGoal,"") .replace('<img alt="'+esc(label(d,"Қорытынды","Вывод"))+'" src="">','')+
 '</div><div class="lesson-infocard"><h3>'+label(d,"Инфографика: фактілер картасы","Инфографика: карта фактов")+'</h3>'+
 '<div class="lesson-fact-grid">'+facts.map((v,i)=>'<div><b>'+String(i+1).padStart(2,"0")+'</b>'+editing(v)+'</div>').join("")+'</div></div>'+
 '<p class="lesson-muted">'+label(d,"Фото дереккөздері: Wikimedia Commons (CentrAsia, Ninaras, Alexandr frolov). CC0 / CC BY-SA 4.0.","Источники фото: Wikimedia Commons (CentrAsia, Ninaras, Alexandr frolov). CC0 / CC BY-SA 4.0.")+'</p></article>';
}
function worksheet(d){
 const base=d.facts.length?d.facts.join("; "):label(d,"Деректерді сабақтан алыңыз","Возьмите сведения из урока");
 const tasks=[
 {title:label(d,"1-тапсырма. Тарихи ұғымдар","Задание 1. Исторические понятия"),description:label(d,"Тақырыпқа қатысты екі маңызды ұғымды анықтап, түсіндіріңіз.","Определите и объясните два ключевых понятия по теме."),
 desc:[label(d,"Екі тарихи ұғымды анықтайды","Выделяет два исторических понятия"),label(d,"Ұғымдардың мағынасын түсіндіреді","Объясняет их значение")]},
 {title:label(d,"2-тапсырма. Себеп пен салдар","Задание 2. Причины и следствия"),description:label(d,"Оқиғаның екі себебі мен бір салдарын жазыңыз. Жауапты тарихи дәлелмен негіздеңіз.","Назовите две причины и одно следствие события. Подкрепите ответ историческими аргументами."),
 desc:[label(d,"Екі себепті атайды","Называет две причины"),label(d,"Бір салдарды тарихи дерекпен негіздейді","Обосновывает одно следствие историческим фактом")]},
 {title:label(d,"3-тапсырма. Талдау","Задание 3. Анализ"),description:label(d,"Тарихи деректі немесе өзіңіз зерттеген мәліметті пайдаланып, оқиғаның маңызы туралы қорытынды жасаңыз.","Используя исторический источник или изученные сведения, сделайте вывод о значении события."),
 desc:[label(d,"Деректі орынды пайдаланады","Уместно использует факт"),label(d,"Негізделген қорытынды жасайды","Формулирует обоснованный вывод")]}
 ];
 return '<article class="lesson-document"><h2>'+label(d,"Жұмыс парағы және бағалау дескрипторлары","Рабочий лист и дескрипторы оценивания")+'</h2>'+
 '<p><b>'+label(d,"Тақырып","Тема")+':</b> '+editing(d.topic)+' • '+esc(d.grade)+' '+label(d,"сынып","класс")+'</p>'+
 '<p><b>'+label(d,"Оқу мақсаты","Цель обучения")+':</b> '+editing(d.goal||"—")+'</p>'+
 '<p class="lesson-chip">'+label(d,"Жалпы балл: 6","Всего баллов: 6")+'</p>'+
 '<p class="lesson-muted">'+label(d,"Сабақта қолданылатын деректер","Материалы для работы")+': '+esc(base)+'</p>'+
 tasks.map(x=>'<div class="lesson-task"><h3>'+esc(x.title)+'</h3><p>'+editing(x.description)+'</p><div class="lesson-answer-lines"></div><div class="lesson-answer-lines"></div><b>'+label(d,"Дескрипторлар (2 балл)","Дескрипторы (2 балла)")+':</b><ul>'+x.desc.map(y=>'<li>'+editing(y)+' — 1 '+label(d,"балл","балл")+'</li>').join("")+'</ul></div>').join("")+
 '<p class="lesson-muted">'+label(d,"Дескрипторлар — ұсынылатын үлгі, оларды оқу мақсатына сәйкестендіріңіз.","Дескрипторы предложены как образец; адаптируйте их к цели обучения.")+'</p></article>';
}
function gameQuestions(d){
 let vals=d.facts.filter(Boolean);
 const topic=label(d,"Тақырып","Тема")+": "+d.topic;
 const goal=label(d,"Мақсат","Цель")+": "+(d.goal||d.topic);
 const value=label(d,"Құндылық","Ценность")+": "+valueName(d);
 for(const x of [topic,goal,value])if(vals.length<4&&!vals.includes(x))vals.push(x);
 while(vals.length<4)vals.push(d.topic+" — "+String(vals.length+1));
 vals=vals.slice(0,4);
 return vals.map((val,i)=>{
  const order=[2,0,3,1];
  return {q:label(d,"Сабақ материалындағы "+(i+1)+"-деректі анықтаңыз.","Найдите факт №"+(i+1)+" из материалов урока."),options:order.map(j=>vals[j]),answer:order.indexOf(i)};
 });
}
function gameIntro(d){
 return '<article class="lesson-document"><h2>'+label(d,"Қорытынды ойын: Деректерді сәйкестендір","Итоговая игра: Сопоставь факты")+'</h2>'+
 '<p class="lesson-muted">'+label(d,"Ойын өзіңіз енгізген фактілердің ретін тексереді. Тарихи мазмұн бойынша сұрақтарды мұғалім өңдей алады.","Игра проверяет соответствие фактов из введённого материала. Педагог может изменить вопросы по содержанию.")+'</p>'+
 '<div id="packageQuiz" class="lesson-game"></div></article>';
}
function wireGame(root,qs,l){
 if(!root)return;
 let n=0,score=0;
 const title=l==="ru"?"Вопрос":"Сұрақ",correct=l==="ru"?"Верно!":"Дұрыс!",wrong=l==="ru"?"Неверно":"Қате",next=l==="ru"?"Следующий →":"Келесі →",finish=l==="ru"?"Готово!":"Аяқталды!",again=l==="ru"?"Начать снова":"Қайта бастау";
 function show(){
  root.textContent="";
  const info=document.createElement("small");info.textContent=n<qs.length?title+" "+(n+1)+" / "+qs.length+" · "+score+" / "+qs.length:finish;root.append(info);
  if(n>=qs.length){const h=document.createElement("h3");h.textContent=finish+" "+score+" / "+qs.length;root.append(h);const b=document.createElement("button");b.className="game-next";b.textContent=again;b.onclick=()=>{n=0;score=0;show()};root.append(b);return}
  const q=qs[n],h=document.createElement("h3");h.textContent=q.q;root.append(h);
  const options=document.createElement("div");options.className="game-options";root.append(options);
  const result=document.createElement("p");result.className="game-status";root.append(result);
  const button=document.createElement("button");button.type="button";button.className="game-next";button.hidden=true;button.textContent=next;button.onclick=()=>{n++;show()};root.append(button);
  q.options.forEach((text,j)=>{
   const b=document.createElement("button");b.type="button";b.textContent=text;options.append(b);
   b.onclick=()=>{if(j===q.answer)score++;result.textContent=j===q.answer?correct:wrong+" · "+q.options[q.answer];options.querySelectorAll("button").forEach(el=>el.disabled=true);button.hidden=false};
  });
 }
 show();
}
function section(d,k){if(k==="qmj")return qmj(d);if(k==="explain")return explain(d);if(k==="sheet")return worksheet(d);return gameIntro(d)}
function showTab(k){
 if(!doc)return;
 if(!["qmj","explain","sheet","game"].includes(k))return;
 const output=$("packageOutput");
 if(active!=="game"&&output.firstElementChild)parts[active]=output.innerHTML;
 active=k;
 output.innerHTML=parts[k];
 document.querySelectorAll("[data-package-tab]").forEach(b=>{const on=b.dataset.packageTab===k;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on))});
 if(k==="game")wireGame($("packageQuiz"),questions,doc.lang);
}
function cleanSection(html){
 const holder=document.createElement("div");holder.innerHTML=html;
 holder.querySelectorAll("script,iframe,object,embed,style,link,form,input,textarea,svg").forEach(x=>x.remove());
 holder.querySelectorAll("*").forEach(el=>{
  Array.from(el.attributes).forEach(attr=>{if(/^on/i.test(attr.name)||((attr.name==="href"||attr.name==="src")&&/^\s*javascript:/i.test(attr.value)))el.removeAttribute(attr.name)});
  el.removeAttribute("contenteditable");
 });
 return holder.innerHTML;
}
function keepEdit(){
 if(!doc||active==="game")return;
 if($("packageOutput").firstElementChild)parts[active]=cleanSection($("packageOutput").innerHTML);
}
function copyText(sectionKey){
 if(!doc)return;
 keepEdit();
 const sections=sectionKey?[sectionKey]:["qmj","explain","sheet","game"];
 const text=sections.map(k=>{const x=document.createElement("div");x.innerHTML=parts[k];return x.textContent}).join("\n\n------------------------\n\n");
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(()=>notice(tr("Мәтін көшірілді.","Текст скопирован."))).catch(()=>fallbackCopy(text));}
 else fallbackCopy(text);
}
function fallbackCopy(text){
 const el=document.createElement("textarea");el.value=text;document.body.append(el);el.select();try{document.execCommand("copy");notice(tr("Мәтін көшірілді.","Текст скопирован."))}catch{notice(tr("Көшіру мүмкін болмады.","Не удалось скопировать."))}el.remove();
}
function notice(t){$("packageNotice").textContent=t}
function documentHTML(){
 keepEdit();
 const safe=Object.fromEntries(Object.entries(parts).map(([key,value])=>[key,cleanSection(value)]));
 const css='body{font:14px/1.6 Arial,sans-serif;background:#edf4f2;color:#19394a;padding:25px;margin:0}main{max-width:1100px;margin:auto}section{margin:22px 0;padding:22px;background:white;border:1px solid #d8e6e2;border-radius:12px}h1,h2,h3{color:#173c51}table{width:100%;border-collapse:collapse}td,th{border:1px solid #c3d7d3;padding:10px;text-align:left;vertical-align:top}th{background:#e8f2f0}.lesson-slide-set,.lesson-fact-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.lesson-slide-card{background:#16465a;color:#fff;padding:17px;border-radius:10px}.lesson-slide-card h3{color:white}.lesson-slide-card img{width:100%;height:150px;object-fit:cover}.lesson-infocard,.lesson-task{padding:14px;margin:12px 0;border:1px solid #dbe8e4;border-radius:10px}.lesson-fact-grid>div{padding:14px;border:1px solid #dbe8e4}.lesson-game{background:#15394a;color:white;padding:24px;border-radius:11px}.lesson-game h3{color:#fff}.game-options{display:grid;grid-template-columns:1fr 1fr;gap:10px}.game-options button,.game-next{padding:12px;background:white;border:0;border-radius:8px;color:#16465a}.game-next{margin-top:12px}.game-next[hidden]{display:none}.lesson-answer-lines{height:32px;border-bottom:1px dotted #abb}.lesson-muted{font-size:11px;color:#607980}@media print{@page{size:A4;margin:12mm}body{padding:0;background:white}section{border:0;break-after:page;padding:0}.lesson-slide-card,.lesson-game{-webkit-print-color-adjust:exact;print-color-adjust:exact}button{display:none}}@media(max-width:650px){body{padding:8px}section{padding:10px}.lesson-slide-set,.lesson-fact-grid,.game-options{grid-template-columns:1fr}}';
 const labels=doc.lang==="ru"?["01 · КСП","02 · Слайды и инфографика","03 · Рабочий лист","04 · Игра"]:["01 · ҚМЖ","02 · Слайд және инфографика","03 · Жұмыс парағы","04 · Ойын"];
 const keys=["qmj","explain","sheet","game"];
 const body=keys.map((key,i)=>'<section><h2>'+labels[i]+'</h2>'+safe[key]+'</section>').join("");
 const qs=JSON.stringify(questions).replace(/</g,"\\u003c").replace(/>/g,"\\u003e");
 const runner='('+wireGame.toString()+')(document.getElementById("packageQuiz"),'+qs+','+JSON.stringify(doc.lang)+');';
 return '<!doctype html><html lang="'+doc.lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(doc.topic)+' — Tarih Ustaz AI</title><style>'+css+'</style></head><body><main><h1>'+esc(doc.topic)+'</h1><p>'+esc(doc.subject)+' · '+esc(doc.grade)+' · '+esc(valueName(doc))+'</p>'+body+'<small>Фотосуреттер: Wikimedia Commons (CC0 / CC BY-SA 4.0). Тарихи фактілерді мұғалім тексеруі тиіс.</small></main><script>'+runner+'</script></body></html>';
}
function download(){
 if(!doc)return;
 const html=documentHTML(),blob=new Blob([html],{type:"text/html;charset=utf-8"}),url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download="Tarih_Ustaz_AI_full_lesson.html";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);notice(tr("Дайын пакет жүктелді.","Комплект скачан."));
}
function print(){
 if(!doc)return;
 const frame=document.createElement("iframe");frame.style.cssText="position:fixed;left:-9999px;width:900px;height:720px";document.body.append(frame);
 frame.onload=()=>setTimeout(()=>{try{frame.contentWindow.focus();frame.contentWindow.print();notice(tr("PDF сақтау үшін басып шығару мәзірін қолданыңыз.","Для PDF используйте диалог печати."))}catch{notice(tr("Басып шығару ашылмады.","Не удалось открыть печать."))}},300);
 frame.srcdoc=documentHTML();setTimeout(()=>frame.remove(),40000);
}
async function generate(){
 const button=$("packageCreate"),progress=$("packageProgress"),text=$("packageProgressText");
 button.disabled=true;progress.hidden=false;text.textContent=tr("Өңделуде: материалдар құрастырылып жатыр...","Обработка: формируются материалы...");
 try{
  if(typeof requestAnimationFrame==="function")await new Promise(resolve=>requestAnimationFrame(resolve));
  doc=read();
  parts={qmj:qmj(doc),explain:explain(doc),sheet:worksheet(doc),game:gameIntro(doc)};
  questions=gameQuestions(doc);active="qmj";
  $("packageResult").hidden=false;$("packageTitle").textContent=doc.topic;
  $("packageOutput").innerHTML=parts.qmj;
  document.querySelectorAll("[data-package-tab]").forEach(b=>{const on=b.dataset.packageTab==="qmj";b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on))});
  notice(tr("Дайын. Мәтінді түзетіп, көшіріп немесе жүктей аласыз.","Готово. Можно редактировать, копировать и скачивать."));
  $("packageResult").scrollIntoView({behavior:"smooth",block:"start"});
 }catch(error){console.error(error);notice(tr("Пакетті жасау кезінде қате шықты.","Ошибка создания комплекта."))}
 finally{progress.hidden=true;button.disabled=false}
}
function init(){
 $("packageCreate").addEventListener("click",generate);
 document.querySelectorAll("[data-package-tab]").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.packageTab)));
 $("packageOutput").addEventListener("input",keepEdit);
 $("packageOutput").addEventListener("paste",event=>{
  if(!event.target.closest("[contenteditable]"))return;
  const text=event.clipboardData&&event.clipboardData.getData("text/plain");
  if(text!=null){event.preventDefault();document.execCommand("insertText",false,text)}
 });
 $("packageCopyAll").addEventListener("click",()=>copyText(null));
 $("packageCopySection").addEventListener("click",()=>copyText(active));
 $("packageDownload").addEventListener("click",download);
 $("packagePrint").addEventListener("click",print);
}
window.TarihLessonPackage={qmj,explain,worksheet,gameQuestions};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();