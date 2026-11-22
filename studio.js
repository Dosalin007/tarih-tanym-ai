
(function(){
'use strict';
const $=id=>document.getElementById(id);
let lang='kk', tool='info', slide=0, design='royal';
const ART_BASE='https://dosalin007.github.io/tarih-tanym-ai/';
const REAL_PHOTOS={arch:"https://upload.wikimedia.org/wikipedia/commons/c/ca/Ahmet_yasawi.jpg",rock:"https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Petroglyphs_in_Tamgaly%2C_Kazakhstan_01.jpg/960px-Petroglyphs_in_Tamgaly%2C_Kazakhstan_01.jpg",yurt:"https://upload.wikimedia.org/wikipedia/commons/f/f7/%D0%9A%D0%B0%D0%B7%D0%B0%D1%85%D1%81%D0%BA%D0%B0%D1%8F_%D1%8E%D1%80%D1%82%D0%B0.jpg"};
const REAL_IMAGE_FOR={"heritage-hero.svg":"arch","illustration-info.svg":"rock","illustration-slides.svg":"arch","illustration-qmj.svg":"yurt","illustration-sheet.svg":"rock","illustration-form.svg":"arch","illustration-game.svg":"yurt"};
const imageSrc=name=>window.TARIH_CUSTOM_IMAGE||REAL_PHOTOS[window.TARIH_PHOTO_PRESET&&window.TARIH_PHOTO_PRESET!=='auto'?window.TARIH_PHOTO_PRESET:REAL_IMAGE_FOR[name]||'arch'];
const photoSourceCredit='<div class="export-photo-credit">Фотодереккөздер: CentrAsia (CC0); Ninaras, Alexandr frolov (CC BY-SA 4.0). Wikimedia Commons. Фото кесілген. <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></div>';
const dflt={
kk:{topic:'Қазақ хандығының құрылуы',objective:'Қазақ хандығының құрылу себептерін және тарихи маңызын талдау.',facts:'XV ғасыр — Қазақ хандығының құрылу кезеңі\nКерей мен Жәнібек — негізін қалаушылар\nМоғолстан — көшіп барған аймақ\n1465–1466 жж. — дәстүрлі шамаланған дата'},
ru:{topic:'Образование Казахского ханства',objective:'Определить причины образования Казахского ханства и объяснить его историческое значение.',facts:'XV век — период образования ханства\nКерей и Жанибек — основатели\nМогулистан — регион переселения\n1465–1466 гг. — традиционная приблизительная датировка'}};
const dict={
kk:{subject:'Пән',goal:'Оқу мақсаты',grade:'сынып',history:'Қазақстан тарихы',world:'Дүниежүзі тарихы',law:'Құқық негіздері',reason:'Себебі',meaning:'Маңызы',main:'Негізгі деректер',conclusion:'Қорытынды',open:'Сабақты ашу',task:'Тапсырма',answers:'Жауаптар',check:'Тексеру',points:'ұпай',score:'Нәтиже',restart:'Қайта бастау',next:'Келесі',start:'Ойынды бастау',complete:'Аяқталды',worksheet:'Жұмыс парағы',lesson:'Қысқа мерзімді жоспар',stages:'Сабақ кезеңдері',teacher:'Мұғалім әрекеті',student:'Оқушы әрекеті',assessment:'Бағалау',time:'Уақыт',correct:'Дұрыс!',wrong:'Қате жауап',quiz:'Тарихи тест',game:'Тарихи квест',type:'Материал',done:'Файл жүктелді',copied:'Сұраным көшірілді',intro:'Тарихи деректермен жұмыс',short:'Үлгі. Оқу мақсаттарын және тарихи фактілерді тексеріңіз.'},
ru:{subject:'Предмет',goal:'Цель обучения',grade:'класс',history:'История Казахстана',world:'Всемирная история',law:'Основы права',reason:'Причины',meaning:'Значение',main:'Ключевые факты',conclusion:'Вывод',open:'Начало урока',task:'Задание',answers:'Ответы',check:'Проверить',points:'баллов',score:'Результат',restart:'Начать заново',next:'Далее',start:'Начать игру',complete:'Завершено',worksheet:'Рабочий лист',lesson:'Краткосрочный план урока',stages:'Этапы урока',teacher:'Действия учителя',student:'Действия ученика',assessment:'Оценивание',time:'Время',correct:'Верно!',wrong:'Неверный ответ',quiz:'Исторический тест',game:'Исторический квест',type:'Материал',done:'Файл скачан',copied:'Запрос скопирован',intro:'Работа с историческими фактами',short:'Шаблон. Проверьте цели обучения и исторические факты.'}
};
const txt=k=>(dict[$('materialLanguage')?.value||lang]||dict.kk)[k]||k;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').trim().slice(0,2000);
const questions=[
{q:'Қазақ хандығының негізін қалаушылар кімдер?',options:['Керей мен Жәнібек','Абылай мен Кенесары','Тәуке мен Есім','Абай мен Шоқан'],correct:0},
{q:'Қазақ хандығының құрылуы қай ғасырға жатады?',options:['XIII ғасыр','XV ғасыр','XVIII ғасыр','XX ғасыр'],correct:1}
];
function getData(){
let subj=$('subject').value;let locale=$('materialLanguage').value;
let texts=dict[locale]||dict.kk;
return {locale,subject:texts[subj==='kaz'?'history':subj==='world'?'world':'law'],grade:$('grade').value,
topic:clean($('topic').value)||dflt[locale].topic,objective:clean($('objective').value),
facts:$('facts').value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,12),questions:questions.map(x=>({q:clean(x.q),options:x.options.map(clean),correct:Number(x.correct)||0})).filter(x=>x.q)};
}
function setLanguage(next){
let old=lang;lang=next==='ru'?'ru':'kk';
try{localStorage.setItem('tu_lang',lang)}catch{}
document.documentElement.lang=lang;
document.querySelectorAll('[data-kk][data-ru]').forEach(el=>{el.textContent=el.dataset[lang]});
document.querySelectorAll('[data-set-lang]').forEach(el=>el.classList.toggle('active',el.dataset.setLang===lang));
let current=$('materialLanguage').value;
if(current!==lang && $('topic').value.trim()===dflt[current].topic && $('objective').value.trim()===dflt[current].objective){
$('topic').value=dflt[lang].topic;$('objective').value=dflt[lang].objective;if($('facts').value.trim()===dflt[current].facts)$('facts').value=dflt[lang].facts;
}
$('materialLanguage').value=lang;
render();
}
function setTool(next){
tool=next;slide=0;
document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tool===tool)));
$('quizEditor').classList.toggle('hidden',!['form','game'].includes(tool));
$('factsEditor').classList.toggle('hidden',['form','game'].includes(tool));
$('slideControls').classList.toggle('hidden',tool!=='slides');
$('downloadButton').textContent=tool==='game'?(lang==='ru'?'↓ Скачать index.html':'↓ index.html жүктеу'):(lang==='ru'?'↓ Скачать HTML':'↓ HTML жүктеу');
render();
}
function questionEditor(){
$('questionList').innerHTML=questions.map((q,i)=>'<div class="question-edit"><label class="field"><span>'+(i+1)+'. '+(lang==='ru'?'Вопрос':'Сұрақ')+'</span><input data-qi="'+i+'" data-field="q" maxlength="300" value="'+escape(q.q)+'"></label>'+q.options.map((x,j)=>'<label class="field"><span>'+(lang==='ru'?'Ответ ':'Жауап ')+(j+1)+'</span><input data-qi="'+i+'" data-field="option" data-oi="'+j+'" maxlength="200" value="'+escape(x)+'"></label>').join('')+'<label class="field"><span>'+(lang==='ru'?'Правильный ответ':'Дұрыс жауап')+'</span><select data-qi="'+i+'" data-field="correct">'+[0,1,2,3].map(j=>'<option value="'+j+'"'+(q.correct===j?' selected':'')+'>'+(j+1)+'</option>').join('')+'</select></label><button type="button" class="pill-btn dark" data-remove="'+i+'">'+(lang==='ru'?'Удалить':'Жою')+'</button></div>').join('');
}
function factsHtml(d){return d.facts.map((s,i)=>'<div class="info-point"><b>0'+(i+1)+'</b><p>'+escape(s)+'</p></div>').join('')||'<p>—</p>';}

function infoHtml(d){
 const art=imageSrc('heritage-hero.svg');
 return '<div class="infographic premium design-'+design+'"><div class="info-photo-header"><img src="'+art+'" alt="Тарихи дала мен сәулет өнерінің иллюстрациясы"><div class="info-photo-title"><small>TARIH USTAZ AI • '+escape(d.subject)+'</small><h3>'+escape(d.topic)+'</h3></div></div><div class="info-content"><p class="info-objective"><b>'+escape(txt('goal'))+':</b> '+escape(d.objective)+'</p><div class="info-track">'+factsHtml(d)+'</div><p class="info-foot">'+escape(d.subject)+' • '+escape(d.grade)+' '+escape(txt('grade'))+' • '+escape(txt('short'))+'</p></div></div>';
}
function slidesArray(d){
 const facts=d.facts;
 return [
 {type:'cover',art:'heritage-hero.svg',title:d.topic,text:d.objective,note:txt('goal'),facts:[]},
 {type:'story',art:'heritage-hero.svg',title:txt('intro'),text:d.objective,note:txt('main'),facts:facts.slice(0,2)},
 {type:'story',art:'illustration-info.svg',title:txt('main'),text:d.objective,note:txt('intro'),facts:facts.slice(2).length?facts.slice(2):facts.slice(0,2)},
 {type:'conclusion',art:'heritage-hero.svg',title:txt('conclusion'),text:d.objective,note:txt('meaning'),facts:[]}
 ];
}
function slideHtml(d,n){
 const a=slidesArray(d)[n];
 const factMarkup=a.facts.length?'<div class="slide-facts">'+a.facts.map((item,j)=>'<div class="slide-fact"><em>0'+(j+1)+'</em><span>'+escape(item)+'</span></div>').join('')+'</div>':'<p class="slide-subtitle">'+escape(a.text)+'</p>';
 return '<div class="slides-preview premium design-'+design+' slide-'+a.type+'"><div class="slide-art"><img src="'+imageSrc(a.art)+'" alt="Тарихи тақырыпқа арналған иллюстрация"></div><div class="slide-body"><div class="slide-eyebrow">'+escape(d.subject)+' • '+escape(d.grade)+' '+escape(txt('grade'))+'</div><div class="slide-underline"></div><h3>'+escape(a.title)+'</h3>'+factMarkup+'</div><div class="slide-medallion">✥</div><div class="slide-footer"><span>TARIH USTAZ AI • '+escape(a.note)+'</span><span>'+String(n+1).padStart(2,'0')+' / 04</span></div></div>';
}
function photoHtml(d){
 const photo=imageSrc('heritage-hero.svg');
 const facts=d.facts.slice(0,3).map((v,i)=>'<div class="photo-card-fact"><strong>'+String(i+1).padStart(2,'0')+'</strong><span>'+escape(v)+'</span></div>').join('');
 return '<section class="historical-photo-card design-'+design+'"><div class="photo-card-visual"><img src="'+escape(photo)+'" alt="Тарихи тақырыпқа таңдалған көрнекі фотосурет"><div class="photo-card-category">TARIH USTAZ AI / HISTORY STUDIO</div><div class="photo-card-headline"><span>'+escape(d.subject)+' · '+escape(d.grade)+' '+escape(txt('grade'))+'</span><h2>'+escape(d.topic)+'</h2></div></div><div class="photo-card-details"><p>'+escape(d.objective)+'</p><div class="photo-card-facts">'+facts+'</div><footer>'+escape(d.locale==='ru'?'Фото — современный наглядный материал, не изображение исторического события.':'Фото — қазіргі көрнекі материал, тарихи оқиғаның тікелей түсірілімі емес.')+'</footer></div></section>';
}
function illustratedDoc(markup,kind){
 const art=kind==='qmj'?'illustration-qmj.svg':'illustration-sheet.svg';
 const label=kind==='qmj'?txt('lesson'):txt('worksheet');
 return markup.replace('<div class="doc-preview">','<div class="doc-preview premium design-'+design+'"><div class="document-hero"><img src="'+imageSrc(art)+'" alt=""><span>Tarih Ustaz AI • '+escape(label)+'</span></div><div class="document-content">').replace(/<\/div>$/,'</div></div>');
}
function updateSlideThumbnails(d){
 const bar=$('slideThumbnails');if(!bar)return;
 bar.classList.toggle('hidden',tool!=='slides');
 if(tool!=='slides'){bar.innerHTML='';return}
 bar.innerHTML=slidesArray(d).map((item,i)=>'<button type="button" class="slide-thumb'+(slide===i?' selected':'')+'" data-thumb="'+i+'" aria-label="'+(i+1)+'-слайд"><img src="'+imageSrc(item.art)+'" alt=""><span>'+(i+1)+' / 4</span></button>').join('');
}

function planHtml(d){
return '<div class="doc-preview"><h3>'+escape(txt('lesson'))+'</h3><p><b>'+escape(txt('subject'))+':</b> '+escape(d.subject)+' &nbsp; <b>'+escape(d.grade)+' '+escape(txt('grade'))+'</b></p><p><b>'+escape(d.topic)+'</b></p><p><b>'+escape(txt('goal'))+':</b> '+escape(d.objective)+'</p><table><thead><tr><th>'+escape(txt('time'))+'</th><th>'+escape(txt('teacher'))+'</th><th>'+escape(txt('student'))+'</th><th>'+escape(txt('assessment'))+'</th></tr></thead><tbody>'+
[['5',txt('open'),d.topic,'—'],['10',txt('intro'),d.facts[0]||d.topic,'—'],['20',txt('task'),d.facts.slice(1,3).join('; ')||d.objective,txt('answers')],['7',txt('conclusion'),d.objective,txt('assessment')],['3',txt('complete'),d.topic,'—']].map(r=>'<tr>'+r.map(x=>'<td>'+escape(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table><p><small>'+escape(txt('short'))+'</small></p></div>';
}
function sheetHtml(d){
return '<div class="doc-preview"><h3>'+escape(txt('worksheet'))+'</h3><p>'+escape(d.subject)+' • '+escape(d.grade)+' '+escape(txt('grade'))+'</p><h4>'+escape(d.topic)+'</h4><p><b>'+escape(txt('goal'))+':</b> '+escape(d.objective)+'</p><ol><li>'+escape(d.locale==='ru'?'Определите ключевые понятия по теме.':'Тақырыпқа қатысты негізгі ұғымдарды анықтаңыз.')+'<div class="lines"></div></li><li>'+escape(d.locale==='ru'?'Назовите две причины и одно следствие события.':'Оқиғаның екі себебі мен бір салдарын жазыңыз.')+'<div class="lines"></div></li><li>'+escape(d.locale==='ru'?'Сформулируйте аргументированный исторический вывод.':'Тарихи қорытынды жасап, дәлел келтіріңіз.')+'<div class="lines"></div></li></ol><p><small>'+escape(txt('short'))+'</small></p></div>';
}

function quizHtml(d,game){
 if(game)return '<div class="game-stage premium"><div class="game-card"><img class="game-hero-img" src="'+imageSrc('illustration-game.svg')+'" alt="Тарихи қамал мен ойын иллюстрациясы"><h3>'+escape(d.topic)+'</h3><p>'+(d.locale==='ru'?'Историческая HTML-викторина с CSS 3D-эффектом. ':'CSS 3D әсері бар тарихи HTML-викторина. ')+escape(d.questions.length)+' '+escape(d.locale==='ru'?'вопросов':'сұрақ')+'</p><button type="button" class="pill-btn" id="tryGame">'+escape(txt('start'))+'</button></div></div>';
 return '<div class="quiz-preview premium"><div class="quiz-banner"><img src="'+imageSrc('illustration-form.svg')+'" alt="Тарих тестінің иллюстрациясы"><span>TARIH USTAZ AI • '+escape(txt('quiz'))+'</span></div><div class="quiz-content"><h3>'+escape(txt('quiz'))+'</h3><p>'+escape(d.topic)+'</p>'+d.questions.map((q,i)=>'<div class="question"><p>'+(i+1)+'. '+escape(q.q)+'</p>'+q.options.map((o,j)=>'<label class="answer"><input type="radio" name="demoq'+i+'" value="'+j+'"> '+escape(o)+'</label>').join('')+'</div>').join('')+'<button type="button" id="checkQuiz">'+escape(txt('check'))+'</button><p id="quizScore" aria-live="polite"></p></div></div>';
}
function render(){
let d=getData();
const tags={info:'INFOGRAPHIC',slides:'SLIDES 16:9',qmj:'ҚМЖ / КСП',sheet:'WORKSHEET',form:'TEST FORM',game:'HTML QUIZ',illustration:'PHOTO POSTER'};
$('previewTag').textContent=tags[tool];
$('slideControls').classList.toggle('hidden',tool!=='slides');
$('slideCounter').textContent=(slide+1)+' / 4';
$('preview').innerHTML=tool==='info'?infoHtml(d):tool==='slides'?slideHtml(d,slide):tool==='qmj'?illustratedDoc(planHtml(d),'qmj'):tool==='sheet'?illustratedDoc(sheetHtml(d),'sheet'):tool==='illustration'?photoHtml(d):quizHtml(d,tool==='game').replace('class="game-stage"','class="game-stage premium"');
updateSlideThumbnails(d);
if(tool==='game'){
let b=$('tryGame');if(b)b.addEventListener('click',()=>{const html=downloadedContent();let w=window.open('','_blank');if(w){w.document.open();w.document.write(html);w.document.close()}else showStatus(lang==='kk'?'Қалқымалы терезеге рұқсат беріңіз.':'Разрешите всплывающее окно.')});
}
if(tool==='form'){
let b=$('checkQuiz');if(b)b.addEventListener('click',()=>{let score=0;d.questions.forEach((q,i)=>{const v=$('preview').querySelector('input[name="demoq'+i+'"]:checked');if(v&&Number(v.value)===q.correct)score++});$('quizScore').textContent=txt('score')+': '+score+' / '+d.questions.length});
}
}
function showStatus(s){$('status').textContent=s;let toast=$('toast');toast.textContent=s;toast.classList.add('show');clearTimeout(showStatus.timer);showStatus.timer=setTimeout(()=>toast.classList.remove('show'),2800);}
const documentStyle='body{margin:0;background:#f0e5cf;color:#18364a;font:16px/1.65 Arial,sans-serif}main{max-width:1000px;margin:35px auto;background:white;border:1px solid #c8a16b;border-radius:18px;overflow:hidden;padding:24px;box-shadow:0 14px 35px #0002}h1,h2,h3{font-family:Georgia,serif;color:#143952}button{cursor:pointer} @media print{body{background:white}main{margin:0;max-width:none;border:0;box-shadow:none;padding:0}@page{size:A4;margin:14mm}}'+
'.infographic{padding:25px;border:8px solid #173750;background:#fff7e6}.infographic h3{font-size:32px}.infographic small{color:#aa7a40}.info-track{display:grid;grid-template-columns:1fr 1fr;gap:12px}.info-point{border:1px solid #c99f68;border-radius:10px;padding:14px}.info-point b{color:#b47d37}.info-foot{color:#85623d}.slides-preview{background:#143650;color:#fff1cd;aspect-ratio:16/9;display:flex;justify-content:center;flex-direction:column;padding:9%;box-sizing:border-box;margin-bottom:20px;break-inside:avoid}.slides-preview h3{font-size:40px;color:#ffe0a1}.slides-preview p{font-size:21px;color:#e2ebed}.slides-preview small{color:#eab96d}.doc-preview table{width:100%;border-collapse:collapse}.doc-preview td,.doc-preview th{border:1px solid #aaa;padding:10px;text-align:left}.doc-preview th{background:#e7eff4}.doc-preview li{margin-bottom:16px}.lines{height:24px;border-bottom:1px dotted #888;margin-top:14px}';
function shell(inner,title){
const l=$('materialLanguage').value==='ru'?'ru':'kk';
return '<!doctype html><html lang="'+l+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+'</title><style>'+documentStyle+'</style><link rel="stylesheet" href="'+ART_BASE+'cinematic.css?v=20261122e"><link rel="stylesheet" href="'+ART_BASE+'premium-pro.css?v=20261122e"></head><body><main class="'+(tool==='slides'?'slideshow-sheet':'')+'">'+inner+'</main>'+photoSourceCredit+'</body></html>';
}
function standAloneQuiz(game){
const d=getData();const label=dict[d.locale];const data=JSON.stringify(d.questions).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');const intro=game?label.game:label.quiz;
let styles='body{margin:0;font:17px/1.5 Arial,sans-serif;background:linear-gradient(140deg,#06172d,#16445f);color:#f9ead0;min-height:100vh;display:grid;place-items:center}main{width:min(720px,91%);background:#0f2d46;border:2px solid #e1b574;border-radius:22px;padding:30px;box-shadow:0 22px 60px #0009}h1{font:700 31px Georgia,serif;color:#ffdc9f}button{display:block;width:100%;padding:14px;margin:10px 0;background:#fff1d2;color:#15324a;border:0;border-radius:11px;text-align:left;cursor:pointer;font-size:16px}button:hover,button:focus{background:#e2bf7e}#score{color:#ffce81;font-size:19px}small{color:#c6d8df}'+(game?'main{transform:perspective(1300px) rotateY(-3deg);box-shadow:17px 23px 0 #081b2b,0 34px 70px #0008}button{transition:transform .2s}button:hover{transform:translateZ(12px)}':'');
styles+='main{position:relative;overflow:hidden}main:before{content:"";display:block;height:145px;margin:-30px -30px 20px;background:linear-gradient(0deg,#0b2d44a0,#072b4222),url("'+imageSrc(game?'illustration-game.svg':'illustration-form.svg')+'") center/cover;border-bottom:4px solid #d7aa6b}';
const code='const questions='+data+';let n=0,score=0;const box=document.getElementById("box");const result=document.getElementById("score");function render(){if(n>=questions.length){box.textContent="";const h=document.createElement("h2");h.textContent="'+(d.locale==='ru'?'Готово!':'Аяқталды!')+'";box.append(h);result.textContent="'+label.score+': "+score+" / "+questions.length;const again=document.createElement("button");again.textContent="'+label.restart+'";again.onclick=()=>{n=0;score=0;render()};box.append(again);return}const q=questions[n];box.textContent="";result.textContent=(n+1)+" / "+questions.length+" • "+score+" '+label.points+'";const h=document.createElement("h2");h.textContent=q.q;box.append(h);q.options.forEach((o,j)=>{const b=document.createElement("button");b.textContent=(j+1)+". "+o;b.onclick=()=>{if(j===q.correct)score++;const note=document.createElement("p");note.textContent=j===q.correct?"'+label.correct+'":"'+label.wrong+'";note.style.color=j===q.correct?"#96f0ae":"#ffaf99";box.querySelectorAll("button").forEach(el=>el.disabled=true);box.append(note);const next=document.createElement("button");next.textContent="'+label.next+' →";next.onclick=()=>{n++;render()};box.append(next)};box.append(b)})}render();';
return '<!doctype html><html lang="'+d.locale+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(d.topic)+'</title><style>'+styles+'</style></head><body><main><small>TARIH USTAZ AI • '+intro+'</small><h1>'+escape(d.topic)+'</h1><div id="box"></div><p id="score" aria-live="polite"></p></main><script>'+code+'</script></body></html>';
}
function downloadedContent(){let d=getData();if(tool==='form'||tool==='game')return standAloneQuiz(tool==='game');if(tool==='slides')return shell(slidesArray(d).map((x,i)=>slideHtml(d,i)).join(''),d.topic);return shell(tool==='info'?infoHtml(d):tool==='qmj'?illustratedDoc(planHtml(d),'qmj'):tool==='illustration'?photoHtml(d):illustratedDoc(sheetHtml(d),'sheet'),d.topic)}
function download(){
let content=downloadedContent(),blob=new Blob([content],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
a.href=url;a.download=tool==='game'?'index.html':('TarihUstazAI_'+tool+'.html');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);showStatus(txt('done'));
}
function printDoc(){
let w=window.open('','_blank');if(!w){showStatus(lang==='kk'?'Браузердің қалқымалы терезесіне рұқсат беріңіз.':'Разрешите всплывающие окна.');return}w.document.open();w.document.write(downloadedContent());w.document.close();showStatus(lang==='kk'?'Жаңа қойындыдан PDF ретінде сақтаңыз (Ctrl+P).':'В новой вкладке сохраните как PDF (Ctrl+P).');
}
function promptFor(kind){
const d=getData();const heading=kind==='ksp'?'45 минуттық ҚМЖ/КСП, сабақ кезеңдері, критерийлер, дескрипторлар және жұмыс парағы':kind==='helper'?'тарихи түсіндіру, уақыт сызығы, себеп-салдар, инфографикаға арналған нақты деректер және тексеруге болатын дереккөздер':kind==='ent'?'ҰБТ/ЕНТ үлгісінде 10 сұрақ, 4 жауап нұсқасы, жауап кілті және түсіндірмесі':tool;
return 'Сен тарих мұғалімінің әдістемелік көмекшісісің. '+heading+' дайында. Пән: '+d.subject+'. Сынып: '+d.grade+'. Тіл: '+(d.locale==='ru'?'орысша':'қазақша')+'. Тақырып: '+d.topic+'. Оқу мақсаты: '+d.objective+'. Негізгі деректер: '+d.facts.join('; ')+'. Оқиғалардың уақытын, тарихи тұлғаларды, себеп-салдарды нақты көрсет. Тексерілмеген мәліметті факт деп ұсынба. Қажет болса дереккөздер ұсын. Қысқа, түсінікті және оқытуға ыңғайлы материал дайында.';
}
function openAssistant(which){
 const query=promptFor(which);
 const url='https://chatgpt.com/?q='+encodeURIComponent(query);
 const tab=window.open(url,'_blank');
 if(tab){try{tab.opener=null}catch(e){}}
 else {window.location.assign(url)}
}
async function copyPrompt(which){
let s=promptFor(which||tool);
try{await navigator.clipboard.writeText(s);showStatus(txt('copied'))}catch{const t=document.createElement('textarea');t.value=s;t.style.position='fixed';t.style.left='-9999px';document.body.append(t);t.select();try{document.execCommand('copy');showStatus(txt('copied'))}catch{showStatus(s)}t.remove()}
}
function init(){
try{lang=localStorage.getItem('tu_lang')||'kk'}catch{lang='kk'}
document.querySelectorAll('[data-set-lang]').forEach(btn=>btn.addEventListener('click',()=>{setLanguage(btn.dataset.setLang);questionEditor()}));
$('mobileMenu').addEventListener('click',()=>{const n=$('mainNav');n.classList.toggle('open');$('mobileMenu').setAttribute('aria-expanded',String(n.classList.contains('open')))});
$('mainNav').addEventListener('click',e=>{if(e.target.closest('a')){$('mainNav').classList.remove('open');$('mobileMenu').setAttribute('aria-expanded','false')}});
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));
document.querySelectorAll('[data-go-tool]').forEach(link=>link.addEventListener('click',()=>{setTool(link.dataset.goTool)}));
document.querySelectorAll('[data-design]').forEach(b=>b.addEventListener('click',()=>{
 design=b.dataset.design;
 document.querySelectorAll('[data-design]').forEach(x=>{const active=x.dataset.design===design;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));});
 render();
}));
$('slideThumbnails').addEventListener('click',e=>{
 const b=e.target.closest('[data-thumb]');if(!b)return;
 slide=Number(b.dataset.thumb);render();
});
['subject','grade','topic','objective','facts','materialLanguage'].forEach(id=>$(id).addEventListener('input',()=>{if(id==='materialLanguage')setLanguage($(id).value);else render()}));
$('questionList').addEventListener('input',e=>{let x=e.target;let i=Number(x.dataset.qi);if(!Number.isInteger(i)||!questions[i])return;if(x.dataset.field==='q')questions[i].q=x.value;else if(x.dataset.field==='option')questions[i].options[Number(x.dataset.oi)]=x.value;else if(x.dataset.field==='correct')questions[i].correct=Number(x.value);render()});
$('questionList').addEventListener('change',e=>{let x=e.target;if(x.dataset.field==='correct'){questions[Number(x.dataset.qi)].correct=Number(x.value);render()}});
$('questionList').addEventListener('click',e=>{let b=e.target.closest('[data-remove]');if(!b)return;if(questions.length<=1){showStatus(lang==='kk'?'Кемінде бір сұрақ қажет.':'Нужен минимум один вопрос.');return}questions.splice(Number(b.dataset.remove),1);questionEditor();render()});
$('addQuestion').addEventListener('click',()=>{if(questions.length>=20){showStatus(lang==='kk'?'Ең көбі 20 сұрақ.':'Максимум 20 вопросов.');return}questions.push({q:lang==='kk'?'Жаңа сұрақ':'Новый вопрос',options:['A','B','C','D'],correct:0});questionEditor();render()});
$('prevSlide').addEventListener('click',()=>{slide=(slide+3)%4;render()});$('nextSlide').addEventListener('click',()=>{slide=(slide+1)%4;render()});
$('downloadButton').addEventListener('click',download);$('printButton').addEventListener('click',printDoc);$('copyPrompt').addEventListener('click',()=>copyPrompt(tool));
document.querySelectorAll('[data-bot]').forEach(b=>b.addEventListener('click',()=>copyPrompt(b.dataset.bot)));
document.querySelectorAll('[data-open-assistant]').forEach(button=>button.addEventListener('click',()=>openAssistant(button.dataset.openAssistant)));
setLanguage(lang);questionEditor();setTool('info');
}
window.TarihStudio={setTool,getData,render,downloadedContent,openAssistant,promptFor,tool:()=>tool,lang:()=>lang,imageSrc,photoHtml};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
