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
 law:{kk:"Заң мен тәртіп",ru:"Закон и порядок"},
 work:{kk:"Еңбекқорлық және кәсіби біліктілік",ru:"Трудолюбие и профессионализм"},
 create:{kk:"Жасампаздық және жаңашылдық",ru:"Созидательность и новаторство"}
};
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lang=()=>document.documentElement.lang==="ru"?"ru":"kk";
const tr=(kk,ru)=>lang()==="ru"?ru:kk;
let active="qmj",parts={},doc=null,questions=[];
const valueName=d=>(VALUES[d.value]||VALUES.patriot)[d.lang];

const MONTH_VALUES={9:"work",10:"patriot",11:"justice",12:"unity",1:"law",2:"create",3:"patriot",4:"work",5:"unity"};
// Week themes transcribed from the user's 2026–2027 “5 минуттық құндылықтар” plan.
// The school calendar and individual daily/grade-band prompts still require teacher verification.
const WEEK_TOPICS_KK={
 "9-4":"Еңбек және қазіргі қоғам",
 "10-1":"Туған елге құрмет","10-2":"Мемлекеттік рәміздер","10-3":"Тілге құрмет",
 "11-1":"Адал әрекет – дұрыс таңдау","11-2":"Жауапкершілік – өз ісіңе жауап беру",
 "11-3":"Сөз бен істің бірлігі","11-4":"Құқық, міндет және қоғамдық жауапкершілік",
 "12-1":"Бірлік – ортақ күш","12-2":"Отбасы, сынып және мектептегі ынтымақ",
 "12-3":"Бірлік – қоғамның күші","12-4":"Ынтымақтан – ортақ іске",
 "1-1":"Заңды білу – өзіңді қорғау","1-2":"Цифрлық ортадағы заң және қауіпсіздік",
 "1-3":"Тәртіпсіздікке жол жоқ",
 "2-1":"Идея және бастама","2-2":"Жаңашыл ойлау және цифрлық мәдениет",
 "2-3":"Идеяны іске асыру және жасампаз әрекет","2-4":"Мәселені шешу және пайдалы әрекет",
 "3-1":"Тәуелсіздік және болашақ","3-2":"Туған жер және елге қызмет",
 "3-3":"Ұлттық құндылық және бірлік",
 "4-1":"Еңбекке дұрыс көзқарас","4-2":"Еңбек мәдениеті және өзара жауапкершілік",
 "4-3":"Болашақ мамандық және кәсіби бағдар","4-4":"Кәсіби шеберлік және дағды",
 "5-1":"Бірлік – ортақ күш","5-2":"Құрмет және өзара түсіністік",
 "5-3":"Отбасы, мектеп және қоғам ынтымақтастығы",
 "5-4":"Бейбітшілік, келісім және ортақ жауапкершілік"
};
const WEEK_TOPICS_RU={
 "9-4":"Труд и современное общество",
 "10-1":"Уважение к родной стране","10-2":"Государственные символы","10-3":"Уважение к языку",
 "11-1":"Честный поступок — правильный выбор","11-2":"Ответственность за свои поступки",
 "11-3":"Единство слова и дела","11-4":"Права, обязанности и общественная ответственность",
 "12-1":"Единство — общая сила","12-2":"Согласие в семье, классе и школе",
 "12-3":"Единство — сила общества","12-4":"От согласия к общему делу",
 "1-1":"Знать закон — значит защищать себя","1-2":"Закон и безопасность в цифровой среде",
 "1-3":"Нет нарушениям порядка",
 "2-1":"Идея и инициатива","2-2":"Новаторское мышление и цифровая культура",
 "2-3":"Воплощение идеи и созидательные действия","2-4":"Решение проблем и полезные поступки",
 "3-1":"Независимость и будущее","3-2":"Родной край и служение стране",
 "3-3":"Национальные ценности и единство",
 "4-1":"Ответственное отношение к труду","4-2":"Культура труда и взаимная ответственность",
 "4-3":"Будущая профессия и профориентация","4-4":"Профессиональное мастерство и навыки",
 "5-1":"Единство — общая сила","5-2":"Уважение и взаимопонимание",
 "5-3":"Сотрудничество семьи, школы и общества",
 "5-4":"Мир, согласие и общая ответственность"
};
const MONTH_LABELS={
kk:{9:"Еңбекқорлық және кәсіби біліктілік айы",10:"Тәуелсіздік және отаншылдық айы",11:"Әділдік және жауапкершілік айы",12:"Бірлік және ынтымақ айы",1:"Заң мен тәртіп айы",2:"Жасампаздық және жаңашылдық айы",3:"Тәуелсіздік және отаншылдық айы",4:"Еңбекқорлық және кәсіби біліктілік айы",5:"Бірлік және ынтымақ айы"},
ru:{9:"Месяц трудолюбия и профессионализма",10:"Месяц независимости и патриотизма",11:"Месяц справедливости и ответственности",12:"Месяц единства и солидарности",1:"Месяц закона и порядка",2:"Месяц созидательности и новаторства",3:"Месяц независимости и патриотизма",4:"Месяц трудолюбия и профессионализма",5:"Месяц единства и солидарности"}
};
function calendarInfo(d){
 const iso=d.date||"",date=new Date(iso+"T12:00:00");
 const valid=/^\d{4}-\d{2}-\d{2}$/.test(iso)&&!isNaN(date.getTime());
 const month=valid?date.getMonth()+1:0;
 const week=valid?Math.min(5,Math.ceil(date.getDate()/7)):null;
 const band=Number(d.grade)<=8?"5–8":"9–11";
 const monthName=(MONTH_LABELS[d.lang]||MONTH_LABELS.kk)[month]||"";
 return {valid,month,week,band,monthName,weekTopic:(d.lang==="ru"?WEEK_TOPICS_RU:WEEK_TOPICS_KK)[month+"-"+week]||"",fromCalendar:!!MONTH_VALUES[month]};
}
function calendarPrompt(d){
 const info=calendarInfo(d),v=valueName(d);
 const prefix=label(d,"5 минуттық құндылық","5 минут ценностей");
 const challenge=label(d,
  "Осы құндылық сабақ тақырыбында қалай көрініс тапқанын 1–2 сұрақ арқылы талқылаңыз.",
  "Обсудите в 1–2 вопросах, как эта ценность проявляется в теме урока.");
 return prefix+": "+v+". "+(info.weekTopic?label(d,"Апта тақырыбы: ","Тема недели: ")+info.weekTopic+". ":"")+(info.monthName?info.monthName+". ":"")+challenge;
}
function meta(id){const e=$(id);return e?str(e.value):""}
function lessonSubject(l,key){
 const x={kaz:["Қазақстан тарихы","История Казахстана"],world:["Дүниежүзі тарихы","Всемирная история"],law:["Құқық негіздері","Основы права"],constitution:["Конституция негіздері","Основы Конституции"],order:["Заң және тәртіп","Закон и порядок"]};
 return (x[key]||x.kaz)[l==="ru"?1:0];
}
function updateDateValue(){
 const v=meta("packageDate"),m=/^\d{4}-(\d{2})-\d{2}$/.exec(v);
 if(m&&MONTH_VALUES[Number(m[1])]){
  $("packageValue").value=MONTH_VALUES[Number(m[1])];
 }
 const test=read(),info=calendarInfo(test);
 const hint=$("packageValueHint");
 if(hint)hint.textContent=info.fromCalendar?
  (test.lang==="ru"?info.monthName+(info.weekTopic?" · "+info.weekTopic:"")+" · "+info.band+" классы. Тему дня и цитату недели уточните по плану.":info.monthName+(info.weekTopic?" · "+info.weekTopic:"")+" · "+info.band+" сыныптар. Күннің нақты тақырыбы мен апта дәйексөзін жоспардан тексеріңіз."):
  label(test,"Күнді таңдаңыз. Айлық құндылық автоматты ұсынылады; аптаның дәйексөзі қолмен енгізіледі.","Выберите дату. Месячная ценность предлагается автоматически; цитата недели вводится вручную.");
}

const str=x=>String(x||"").trim();
const editing=(s)=>'<span contenteditable="true" spellcheck="true">'+esc(s)+'</span>';
function read(){
 const l=lang();
 return {lang:l,topic:str($("topicInput").value)||"Tarih Ustaz AI",
 subject:lessonSubject(l,$("subjectInput").value),
 grade:$("gradeInput").value,goal:str($("goalInput").value),
 facts:$("factsInput").value.split(/\r?\n/).map(str).filter(Boolean).slice(0,8),
 value:$("packageValue").value,duration:Number($("packageDuration").value)||40,
 school:meta("packageSchool"),teacher:meta("packageTeacher"),date:meta("packageDate"),
 section:meta("packageSection"),present:meta("packagePresent"),absent:meta("packageAbsent"),quote:meta("packageQuote")};
}
const label=(d,kk,ru)=>d.lang==="ru"?ru:kk;
function rows(d){
 const stages=d.duration===45?["0–7","8–40","41–45"]:["0–7","8–35","36–40"];
 const values=[
  [
   label(d,"Сабақтың басы","Начало урока"),
   calendarPrompt(d)+" "+label(d,"0–5 минут: шағын құндылық талқылауы. 5–7 минут: сабақ мақсатымен таныстыру және екі қысқа сұрақ.","0–5 мин: мини-беседа о ценности. 5–7 мин: знакомство с целью урока и два коротких вопроса."),
   label(d,"Құндылық туралы пікір айтады; екі ұғымды анықтайды.","Обсуждает ценность и определяет два понятия."),
   label(d,"1-тапсырма: екі дескриптор × 1 балл = 2 балл. Қажет болса, ауызша кері байланыс.","Задание 1: два дескриптора по 1 баллу = 2 балла. Устная обратная связь."),
   label(d,"Апта дәйексөзі, 5 минуттық құндылық, тақырыптық сұрақ","Цитата недели, 5 минут ценностей, вопросы по теме")
  ],
  [
   label(d,"Сабақтың ортасы","Середина урока"),
   label(d,"Слайд пен инфографика арқылы түсіндіру; тарихи деректерді зерттеу; жұмыс парағының 2 және 3-тапсырмаларын ұйымдастыру.","Объяснение по слайдам и инфографике, анализ исторических фактов, выполнение заданий 2 и 3 рабочего листа."),
   label(d,"Деректерді салыстырады, себеп пен салдарды анықтайды, дәлелмен қорытынды жасайды. Дескрипторларды орындайды.","Сравнивает факты, устанавливает причинно-следственные связи, формулирует вывод по дескрипторам."),
   label(d,"2-тапсырма: 4 балл; 3-тапсырма: 4 балл. Барлығы: 8 балл.","Задание 2: 4 балла; задание 3: 4 балла. Всего: 8 баллов."),
   label(d,"Тарихи дерек, иллюстрациялық слайдтар, инфографика, жұмыс парағы","Исторический источник, слайды, инфографика, рабочий лист")
  ],
  [
   label(d,"Сабақтың соңы","Конец урока"),
   label(d,"Қорытынды интерактивті ойын, рефлексия және үй тапсырмасын беру.","Итоговая интерактивная игра, рефлексия и домашнее задание."),
   label(d,"Ойынға қатысады, өз нәтижесін бағалайды, үй жұмысын жазады.","Участвует в игре, оценивает результат, записывает домашнее задание."),
   label(d,"10 балдық қорытындыны тіркеу (2 + 4 + 4); ойын — қалыптастырушы кері байланыс.","Итоговая оценка из 10 баллов (2 + 4 + 4); игра — формирующая обратная связь."),
   label(d,"HTML-ойын, рефлексия парағы, күнделік","HTML-игра, рефлексия, дневник")
  ]
 ];
 return values.map((r,i)=>'<tr><td><strong>'+esc(r[0])+'</strong><p>'+stages[i]+' '+label(d,"мин","мин")+'</p></td>'+r.slice(1).map(x=>'<td>'+editing(x)+'</td>').join("")+'</tr>').join("");
}
function qmj(d){
 const goal=d.goal||label(d,"КТЖ-дан нақты оқу мақсатын таңдаңыз","Выберите точную цель обучения из КТП");
 const blank=label(d,"Толтырыңыз","Заполните");
 const quote=d.quote||label(d,"Аптаның нақты дәйексөзін енгізіңіз","Введите точную цитату недели");
 const month=calendarInfo(d);
 return '<article class="lesson-document">'+
 '<p class="lesson-edit-note">'+label(d,"Сіздің ҚМЖ шаблонына сәйкестендірілген. Өрістерді тікелей өзгертуге болады.","Структура приведена к вашему шаблону КСП. Поля можно редактировать.")+'</p>'+
 '<h2>'+label(d,"Қысқа мерзімді сабақ жоспары (ҚМЖ)","Краткосрочный план урока (КСП)")+'</h2>'+
 '<table><tbody>'+
 '<tr><th>'+label(d,"Оқу мекемесі","Учебное заведение")+'</th><td colspan="3">'+editing(d.school||blank)+'</td></tr>'+
 '<tr><th>'+label(d,"Оқу бағдарламасының бөлімі","Раздел учебной программы")+'</th><td colspan="3">'+editing(d.section||blank)+'</td></tr>'+
 '<tr><th>'+label(d,"Педагогтің аты-жөні","ФИО педагога")+'</th><td colspan="3">'+editing(d.teacher||blank)+'</td></tr>'+
 '<tr><th>'+label(d,"Күні","Дата")+'</th><td colspan="3">'+editing(d.date||blank)+'</td></tr>'+
 '<tr><th>'+label(d,"Сынып","Класс")+'</th><td>'+esc(d.grade)+'</td><th>'+label(d,"Қатысушылар / Қатыспағандар","Присутствуют / Отсутствуют")+'</th><td>'+editing(d.present||"—")+' / '+editing(d.absent||"—")+'</td></tr>'+
 '<tr><th>'+label(d,"Сабақтың тақырыбы","Тема урока")+'</th><td colspan="3">'+editing(d.topic)+'</td></tr>'+
 '<tr><th>'+label(d,"Оқу мақсаты (КТЖ бойынша)","Цель обучения (по КТП)")+'</th><td colspan="3">'+editing(goal)+'</td></tr>'+
 '<tr><th>'+label(d,"Сабақтың мақсаты","Цель урока")+'</th><td colspan="3">'+editing(goal)+'</td></tr>'+
 '<tr><th>'+label(d,"Құндылыққа баулу","Привитие ценности")+'</th><td colspan="3">'+editing(valueName(d))+'</td></tr>'+
 '<tr><th>'+label(d,"Апта дәйексөзі","Цитата недели")+'</th><td colspan="3">'+editing(quote)+'</td></tr>'+
 '<tr><th>'+label(d,"5 минуттық құндылық","Пять минут ценностей")+'</th><td colspan="3">'+editing(calendarPrompt(d))+'</td></tr>'+
 '</tbody></table>'+
 (month.monthName?'<p class="qmj-source">'+esc(month.monthName)+' · '+esc(month.band)+' '+label(d,"сыныптар","классы")+'. '+label(d,"Күнделікті нақты тақырып мектеп жоспары бойынша тексеріледі.","Точная тема дня уточняется по школьному плану.")+'</p>':"")+
 '<h3>'+label(d,"Сабақтың барысы","Ход урока")+'</h3>'+
 '<table><thead><tr>'+
 [label(d,"Сабақтың кезеңі / уақыты","Этап урока / время"),label(d,"Педагогтің әрекеті","Действия педагога"),label(d,"Оқушының әрекеті","Действия ученика"),label(d,"Бағалау (10 балдық жүйе)","Оценивание (10-балльная система)"),label(d,"Ресурстар","Ресурсы")].map(x=>'<th>'+x+'</th>').join("")+
 '</tr></thead><tbody>'+rows(d)+'</tbody></table>'+
 '<p class="rubric-total">'+label(d,"Барлығы: 10 балл (2 + 4 + 4)","Итого: 10 баллов (2 + 4 + 4)")+'</p>'+
 '<p><strong>'+label(d,"Үйге тапсырма","Домашнее задание")+': </strong>'+editing(label(d,"Сабақта қарастырылған тарихи деректердің негізінде шағын қорытынды жазу.","Написать краткий вывод по историческим фактам, рассмотренным на уроке."))+'</p>'+
 '<p class="lesson-muted">'+label(d,"Сабақ кезеңдері 40 минуттық жіберілген үлгіге сай; 45 минутты таңдағанда орта және соңғы кезең ұзартылады. Мәтін мұғалімнің тексеруін қажет етеді.","Этапы соответствуют вашему 40-минутному шаблону; при выборе 45 минут увеличиваются средний и заключительный этапы. Текст проверяется педагогом.")+'</p>'+
 '</article>';
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
 const data=d.facts.length?d.facts.join("; "):label(d,"КТЖ тақырыбына сәйкес тарихи деректерді енгізіңіз","Добавьте исторические факты по выбранной теме КТП");
 const tasks=[
  {pts:2,title:label(d,"1-тапсырма. Тарихи ұғымдар","Задание 1. Исторические понятия"),
   text:label(d,"Тақырыпқа қатысты екі ұғымды анықтаңыз. Мағынасын қысқаша жазыңыз.","Назовите два понятия по теме и кратко объясните их смысл."),
   desc:[[label(d,"Екі тарихи ұғымды дұрыс анықтайды","Правильно называет два исторических понятия"),1],[label(d,"Түсінігін қысқаша сипаттайды","Кратко объясняет их смысл"),1]]},
  {pts:4,title:label(d,"2-тапсырма. Себеп пен салдар","Задание 2. Причины и следствия"),
   text:label(d,"Оқиғаның екі себебі мен екі салдарын көрсетіңіз. Әр тұжырымды сабақ деректерімен байланыстырыңыз.","Укажите две причины и два следствия события, связывая их с материалом урока."),
   desc:[[label(d,"Бірінші себепті көрсетеді","Определяет первую причину"),1],[label(d,"Екінші себепті көрсетеді","Определяет вторую причину"),1],[label(d,"Бірінші салдарды түсіндіреді","Объясняет первое следствие"),1],[label(d,"Екінші салдарды түсіндіреді","Объясняет второе следствие"),1]]},
  {pts:4,title:label(d,"3-тапсырма. Тарихи маңызы","Задание 3. Историческое значение"),
   text:label(d,"Тарихи оқиғаның маңызын екі дәлелмен негіздеп, салыстыру арқылы қорытынды жасаңыз.","Обоснуйте историческое значение двумя аргументами и сформулируйте вывод на основе сравнения."),
   desc:[[label(d,"Бірінші дәлел келтіреді","Приводит первый аргумент"),1],[label(d,"Екінші дәлел келтіреді","Приводит второй аргумент"),1],[label(d,"Дәлелдерді салыстырады","Сравнивает аргументы"),1],[label(d,"Негізделген қорытынды жасайды","Формулирует обоснованный вывод"),1]]}
 ];
 return '<article class="lesson-document"><h2>'+label(d,"Жұмыс парағы және 10 балдық дескрипторлар","Рабочий лист и дескрипторы на 10 баллов")+'</h2>'+
 '<p><b>'+label(d,"Тақырып","Тема")+':</b> '+editing(d.topic)+' · '+esc(d.grade)+' '+label(d,"сынып","класс")+'</p>'+
 '<p><b>'+label(d,"Оқу мақсаты","Цель обучения")+':</b> '+editing(d.goal||"—")+'</p>'+
 '<p class="rubric-total">'+label(d,"Жалпы 10 балл: 2 + 4 + 4","Всего 10 баллов: 2 + 4 + 4")+'</p>'+
 '<p class="lesson-muted">'+label(d,"Мұғалім ұсынған тексерілген деректер","Проверенные педагогом сведения")+': '+esc(data)+'</p>'+
 tasks.map(item=>'<div class="lesson-task"><h3>'+esc(item.title)+' · '+item.pts+' '+label(d,"балл","балла")+'</h3><p>'+editing(item.text)+'</p>'+
 '<div class="lesson-answer-lines"></div><div class="lesson-answer-lines"></div><b>'+label(d,"Дескрипторлар","Дескрипторы")+':</b><ul>'+
 item.desc.map(([desc,points])=>'<li>'+editing(desc)+' — '+points+' '+label(d,"балл","балл")+'</li>').join("")+
 '</ul></div>').join("")+
 '<p class="lesson-muted">'+label(d,"Критерийлер — 10 балдық үлгі. Оқу мақсаты мен нақты тапсырмаға бейімдеу қажет.","Критерии — шаблон на 10 баллов. Адаптируйте к цели обучения и фактическому заданию.")+'</p></article>';
}
function gameQuestions(d){
 // Questions are derived only from facts supplied by the teacher. No invented historical answers.
 const source=d.facts.map(raw=>{
  const pieces=raw.split(/\s+[—–-]\s+|:\s+/);
  return {raw,term:(pieces[0]||raw).trim(),description:pieces.length>=2?pieces.slice(1).join(" — ").trim():""};
 }).filter(item=>item.raw&&item.term).slice(0,8);
 if(source.length<3)return[];
 const selected=source.slice(0,Math.min(5,source.length));
 return selected.map((item,i)=>{
  const pool=[item,...source.filter(x=>x.raw!==item.raw)].slice(0,4);
  const options=pool.map(x=>x.term);
  const correct=options.indexOf(item.term);
  const shift=(i+1)%options.length;
  const shuffled=options.slice(shift).concat(options.slice(0,shift));
  const actual=shuffled.indexOf(item.term);
  return {
   q:item.description?
      label(d,"«"+item.description+"» сипаттамасына сәйкес келетін тарихи атауды таңдаңыз.","Выберите историческое понятие по описанию «"+item.description+"»."):
      label(d,"Сабақта берілген "+(i+1)+"-деректі белгілеңіз.","Укажите факт №"+(i+1)+" из материала урока."),
   options:shuffled,answer:actual};
 });
}
function gameIntro(d){
 return '<article class="lesson-document"><h2>'+label(d,"Қорытынды ойын: Деректерді сәйкестендір","Итоговая игра: Сопоставь факты")+'</h2>'+
 '<p class="lesson-muted">'+(d.facts.length<3?label(d,"Толық ойын үшін кемінде үш тексерілген тарихи дерек енгізіңіз.","Для полноценной игры добавьте минимум три проверенных исторических факта."):"")+'</p>'+
 '<p class="lesson-muted">'+label(d,"Ойын өзіңіз енгізген фактілердің ретін тексереді. Тарихи мазмұн бойынша сұрақтарды мұғалім өңдей алады.","Игра проверяет соответствие фактов из введённого материала. Педагог может изменить вопросы по содержанию.")+'</p>'+
 '<div id="packageQuiz" class="lesson-game"></div></article>';
}
function wireGame(root,qs,l){
 if(!root)return;
 if(!qs.length){root.textContent=l==="ru"?"Добавьте минимум три проверенных исторических факта для создания вопросов.":"Ойын сұрақтары үшін кемінде үш тексерілген тарихи дерек енгізіңіз.";return}
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
 const date=$("packageDate");
 if(date){
  if(!date.value){const today=new Date();const yyyy=today.getFullYear(),mm=String(today.getMonth()+1).padStart(2,"0"),dd=String(today.getDate()).padStart(2,"0");date.value=yyyy+"-"+mm+"-"+dd;}
  date.addEventListener("change",updateDateValue);
 }
 window.addEventListener("tarih:ktp-selected",event=>{
  const item=event.detail||{};
  if(item.section)$("packageSection").value=item.section;
  if(item.date){
   const m=/^(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](\d{2,4}))?$/.exec(item.date);
   if(m){
    const year=m[3]?Number(m[3].length===2?"20"+m[3]:m[3]):Number(m[2])>=9?2026:2027;
    if(year>2000&&year<2100){$("packageDate").value=year+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0");}
   }
  }
  updateDateValue();
 });
 $("packageValue").addEventListener("change",()=>{const info=calendarInfo(read());$("packageValueHint").textContent=(lang()==="ru"?"Выбрана ценность: ":"Таңдалған құндылық: ")+valueName(read())+(info.monthName?" · "+info.monthName:"");});
 updateDateValue();

}
window.TarihLessonPackage={qmj,explain,worksheet,gameQuestions};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();