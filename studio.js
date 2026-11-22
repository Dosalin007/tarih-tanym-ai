
(function(){
'use strict';
const $=id=>document.getElementById(id);
let lang='kk', tool='info', slide=0;
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
function infoHtml(d){return '<div class="infographic"><small>TARIH USTAZ AI • INFOGRAPHIC</small><h3>'+escape(d.topic)+'</h3><p>'+escape(d.objective)+'</p><div class="info-track">'+factsHtml(d)+'</div><p class="info-foot">'+escape(d.subject)+' • '+escape(d.grade)+' '+escape(txt('grade'))+' • '+escape(txt('short'))+'</p></div>';}
function slidesArray(d){
let facts=d.facts;
return [
{title:d.topic,text:d.objective,note:txt('goal')},
{title:txt('intro'),text:facts.slice(0,2).join(' • ')||d.objective,note:txt('main')},
{title:txt('main'),text:facts.slice(2).join(' • ')||facts.join(' • '),note:txt('subject')},
{title:txt('conclusion'),text:d.objective,note:txt('meaning')}
];
}
function slideHtml(d,n){
const a=slidesArray(d)[n];return '<div class="slides-preview"><small>TARIH USTAZ AI • '+escape(a.note)+' • '+(n+1)+'/4</small><h3>'+escape(a.title)+'</h3><p>'+escape(a.text)+'</p></div>';
}
function planHtml(d){
return '<div class="doc-preview"><h3>'+escape(txt('lesson'))+'</h3><p><b>'+escape(txt('subject'))+':</b> '+escape(d.subject)+' &nbsp; <b>'+escape(d.grade)+' '+escape(txt('grade'))+'</b></p><p><b>'+escape(d.topic)+'</b></p><p><b>'+escape(txt('goal'))+':</b> '+escape(d.objective)+'</p><table><thead><tr><th>'+escape(txt('time'))+'</th><th>'+escape(txt('teacher'))+'</th><th>'+escape(txt('student'))+'</th><th>'+escape(txt('assessment'))+'</th></tr></thead><tbody>'+
[['5',txt('open'),d.topic,'—'],['10',txt('intro'),d.facts[0]||d.topic,'—'],['20',txt('task'),d.facts.slice(1,3).join('; ')||d.objective,txt('answers')],['7',txt('conclusion'),d.objective,txt('assessment')],['3',txt('complete'),d.topic,'—']].map(r=>'<tr>'+r.map(x=>'<td>'+escape(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table><p><small>'+escape(txt('short'))+'</small></p></div>';
}
function sheetHtml(d){
return '<div class="doc-preview"><h3>'+escape(txt('worksheet'))+'</h3><p>'+escape(d.subject)+' • '+escape(d.grade)+' '+escape(txt('grade'))+'</p><h4>'+escape(d.topic)+'</h4><p><b>'+escape(txt('goal'))+':</b> '+escape(d.objective)+'</p><ol><li>'+escape(d.locale==='ru'?'Определите ключевые понятия по теме.':'Тақырыпқа қатысты негізгі ұғымдарды анықтаңыз.')+'<div class="lines"></div></li><li>'+escape(d.locale==='ru'?'Назовите две причины и одно следствие события.':'Оқиғаның екі себебі мен бір салдарын жазыңыз.')+'<div class="lines"></div></li><li>'+escape(d.locale==='ru'?'Сформулируйте аргументированный исторический вывод.':'Тарихи қорытынды жасап, дәлел келтіріңіз.')+'<div class="lines"></div></li></ol><p><small>'+escape(txt('short'))+'</small></p></div>';
}
function quizHtml(d,game){
if(game)return '<div class="game-stage"><div class="game-card"><div class="controller">♞</div><h3>'+escape(d.topic)+'</h3><p>'+(d.locale==='ru'?'Историческая викторина с CSS 3D-эффектом. ':'CSS 3D әсері бар тарихи викторина. ')+escape(d.questions.length)+' '+escape(d.locale==='ru'?'вопросов':'сұрақ')+'</p><button type="button" class="pill-btn" id="tryGame">'+escape(txt('start'))+'</button></div></div>';
return '<div class="quiz-preview"><h3>'+escape(txt('quiz'))+'</h3><p>'+escape(d.topic)+'</p>'+d.questions.map((q,i)=>'<div class="question"><p>'+(i+1)+'. '+escape(q.q)+'</p>'+q.options.map((o,j)=>'<label class="answer"><input type="radio" name="demoq'+i+'" value="'+j+'"> '+escape(o)+'</label>').join('')+'</div>').join('')+'<button type="button" id="checkQuiz">'+escape(txt('check'))+'</button><p id="quizScore" aria-live="polite"></p></div>';
}
function render(){
let d=getData();
const tags={info:'INFOGRAPHIC',slides:'SLIDES 16:9',qmj:'ҚМЖ / КСП',sheet:'WORKSHEET',form:'TEST FORM',game:'HTML / 3D CSS'};
$('previewTag').textContent=tags[tool];
$('slideControls').classList.toggle('hidden',tool!=='slides');
$('slideCounter').textContent=(slide+1)+' / 4';
$('preview').innerHTML=tool==='info'?infoHtml(d):tool==='slides'?slideHtml(d,slide):tool==='qmj'?planHtml(d):tool==='sheet'?sheetHtml(d):quizHtml(d,tool==='game');
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
function shell(inner,title){return '<!doctype html><html lang="'+($('materialLanguage').value==='ru'?'ru':'kk')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+'</title><style>'+documentStyle+'</style></head><body><main>'+inner+'</main></body></html>'}
function standAloneQuiz(game){
const d=getData();const label=dict[d.locale];const data=JSON.stringify(d.questions).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');const intro=game?label.game:label.quiz;
let styles='body{margin:0;font:17px/1.5 Arial,sans-serif;background:linear-gradient(140deg,#06172d,#16445f);color:#f9ead0;min-height:100vh;display:grid;place-items:center}main{width:min(720px,91%);background:#0f2d46;border:2px solid #e1b574;border-radius:22px;padding:30px;box-shadow:0 22px 60px #0009}h1{font:700 31px Georgia,serif;color:#ffdc9f}button{display:block;width:100%;padding:14px;margin:10px 0;background:#fff1d2;color:#15324a;border:0;border-radius:11px;text-align:left;cursor:pointer;font-size:16px}button:hover,button:focus{background:#e2bf7e}#score{color:#ffce81;font-size:19px}small{color:#c6d8df}'+(game?'main{transform:perspective(1300px) rotateY(-3deg);box-shadow:17px 23px 0 #081b2b,0 34px 70px #0008}button{transition:transform .2s}button:hover{transform:translateZ(12px)}':'');
const code='const questions='+data+';let n=0,score=0;const box=document.getElementById("box");const result=document.getElementById("score");function render(){if(n>=questions.length){box.textContent="";const h=document.createElement("h2");h.textContent="'+(d.locale==='ru'?'Готово!':'Аяқталды!')+'";box.append(h);result.textContent="'+label.score+': "+score+" / "+questions.length;const again=document.createElement("button");again.textContent="'+label.restart+'";again.onclick=()=>{n=0;score=0;render()};box.append(again);return}const q=questions[n];box.textContent="";result.textContent=(n+1)+" / "+questions.length+" • "+score+" '+label.points+'";const h=document.createElement("h2");h.textContent=q.q;box.append(h);q.options.forEach((o,j)=>{const b=document.createElement("button");b.textContent=(j+1)+". "+o;b.onclick=()=>{if(j===q.correct)score++;const note=document.createElement("p");note.textContent=j===q.correct?"'+label.correct+'":"'+label.wrong+'";note.style.color=j===q.correct?"#96f0ae":"#ffaf99";box.querySelectorAll("button").forEach(el=>el.disabled=true);box.append(note);const next=document.createElement("button");next.textContent="'+label.next+' →";next.onclick=()=>{n++;render()};box.append(next)};box.append(b)})}render();';
return '<!doctype html><html lang="'+d.locale+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(d.topic)+'</title><style>'+styles+'</style></head><body><main><small>TARIH USTAZ AI • '+intro+'</small><h1>'+escape(d.topic)+'</h1><div id="box"></div><p id="score" aria-live="polite"></p></main><script>'+code+'</script></body></html>';
}
function downloadedContent(){let d=getData();if(tool==='form'||tool==='game')return standAloneQuiz(tool==='game');if(tool==='slides')return shell(slidesArray(d).map((x,i)=>slideHtml(d,i)).join(''),d.topic);return shell(tool==='info'?infoHtml(d):tool==='qmj'?planHtml(d):sheetHtml(d),d.topic)}
function download(){
let content=downloadedContent(),blob=new Blob([content],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
a.href=url;a.download=tool==='game'?'index.html':('TarihUstazAI_'+tool+'.html');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);showStatus(txt('done'));
}
function printDoc(){
let w=window.open('','_blank');if(!w){showStatus(lang==='kk'?'Браузердің қалқымалы терезесіне рұқсат беріңіз.':'Разрешите всплывающие окна.');return}w.document.open();w.document.write(downloadedContent());w.document.close();showStatus(lang==='kk'?'Жаңа қойындыдан PDF ретінде сақтаңыз (Ctrl+P).':'В новой вкладке сохраните как PDF (Ctrl+P).');
}
function promptFor(kind){
const d=getData();const heading=kind==='ksp'?'ҚМЖ/КСП':kind==='helper'?'тарихи түсіндіру және инфографика':kind==='ent'?'ҰБТ/ЕНТ тесті':tool;
return 'Сен тарих мұғалімінің әдістемелік көмекшісісің. '+heading+' дайында. Пән: '+d.subject+'. Сынып: '+d.grade+'. Тіл: '+(d.locale==='ru'?'орысша':'қазақша')+'. Тақырып: '+d.topic+'. Оқу мақсаты: '+d.objective+'. Негізгі деректер: '+d.facts.join('; ')+'. Оқиғалардың уақытын, тарихи тұлғаларды, себеп-салдарды нақты көрсет. Тексерілмеген мәліметті факт деп ұсынба. Қажет болса дереккөздер ұсын. Қысқа, түсінікті және оқытуға ыңғайлы материал дайында.';
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
['subject','grade','topic','objective','facts','materialLanguage'].forEach(id=>$(id).addEventListener('input',()=>{if(id==='materialLanguage')setLanguage($(id).value);else render()}));
$('questionList').addEventListener('input',e=>{let x=e.target;let i=Number(x.dataset.qi);if(!Number.isInteger(i)||!questions[i])return;if(x.dataset.field==='q')questions[i].q=x.value;else if(x.dataset.field==='option')questions[i].options[Number(x.dataset.oi)]=x.value;else if(x.dataset.field==='correct')questions[i].correct=Number(x.value);render()});
$('questionList').addEventListener('change',e=>{let x=e.target;if(x.dataset.field==='correct'){questions[Number(x.dataset.qi)].correct=Number(x.value);render()}});
$('questionList').addEventListener('click',e=>{let b=e.target.closest('[data-remove]');if(!b)return;if(questions.length<=1){showStatus(lang==='kk'?'Кемінде бір сұрақ қажет.':'Нужен минимум один вопрос.');return}questions.splice(Number(b.dataset.remove),1);questionEditor();render()});
$('addQuestion').addEventListener('click',()=>{if(questions.length>=20){showStatus(lang==='kk'?'Ең көбі 20 сұрақ.':'Максимум 20 вопросов.');return}questions.push({q:lang==='kk'?'Жаңа сұрақ':'Новый вопрос',options:['A','B','C','D'],correct:0});questionEditor();render()});
$('prevSlide').addEventListener('click',()=>{slide=(slide+3)%4;render()});$('nextSlide').addEventListener('click',()=>{slide=(slide+1)%4;render()});
$('downloadButton').addEventListener('click',download);$('printButton').addEventListener('click',printDoc);$('copyPrompt').addEventListener('click',()=>copyPrompt(tool));
document.querySelectorAll('[data-bot]').forEach(b=>b.addEventListener('click',()=>copyPrompt(b.dataset.bot)));
setLanguage(lang);questionEditor();setTool('info');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
