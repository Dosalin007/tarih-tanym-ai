const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.join(__dirname,'..');
class Element{
 constructor(tag='div'){
  this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.dataset={};
  this.value='';this.hidden=false;this.disabled=false;this.attributes={};this.style={};
  this.classList={toggle(){}};this.open=false;
 }
 set textContent(v){this._text=String(v);this.children=[]}
 get textContent(){return this._text||this.children.map(x=>x.textContent).join('')}
 append(...items){this.children.push(...items);for(const item of items)item.parent=this}
 replaceChildren(...items){this.children=[];this.append(...items)}
 get lastElementChild(){return this.children.at(-1)}
 addEventListener(name,fn){(this.listeners[name]||=[]).push(fn)}
 async emit(name,event={}){for(const fn of this.listeners[name]||[])await fn({target:this,preventDefault(){},...event})}
 dispatchEvent(e){return this.emit(e.type,e)}
 setAttribute(k,v){this.attributes[k]=v}
 removeAttribute(k){delete this.attributes[k]}
 getAttribute(k){return this.attributes[k]}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)}
 focus(){this.focused=true}
 scrollIntoView(){}
 showModal(){this.open=true}
 close(){this.open=false}
 getContext(){return new Proxy({createLinearGradient:()=>({addColorStop(){}}),measureText:s=>({width:s.length*9})},
  {get(target,key){return key in target?target[key]:()=>{}}})}
 toDataURL(){return 'data:image/jpeg;base64,AA'}
 toBlob(fn){fn(new Blob(['image']))}
 querySelector(selector){
  const field=selector.match(/\[data-field=([^\]]+)\]/)?.[1];
  const tag=selector.split('[')[0].toUpperCase();
  const stack=[...this.children];while(stack.length){const el=stack.shift();if(el.tagName===tag&&el.dataset.field===field)return el;stack.push(...el.children)}
  return null;
 }
}
const store=new Map(),downloads=[],imported=[];
const catalog=JSON.parse(fs.readFileSync(base+'/data/ktp-2026-2027-ru.json','utf8'));
const catalogRows=catalog.map(x=>({grade:x.g,subject:x.s,title:x.t,goal:x.o,date:x.d,quarter:x.q,section:x.b}));
function setup(){
 const ids=Object.fromEntries(['subjectInput','gradeInput','ktpSource','ktpQuarter','ktpBuilderRows',
  'ktpBuild','ktpAdd','ktpBuilderExport','ktpBuilderStatus','ktpWorkspace','ktpCsv','ktpHtml','ktpPdf']
   .map(id=>[id,new Element(id==='ktpBuilderRows'?'tbody':'div')]));
 ids.subjectInput.value='kaz';ids.subjectInput.selectedOptions=[{textContent:'История Казахстана'}];
 ids.gradeInput.value='7';ids.ktpSource.value='catalog';ids.ktpQuarter.value='';
 const lang=[new Element('button'),new Element('button')];
 const document={readyState:'complete',documentElement:{lang:'ru'},
  getElementById:id=>ids[id],createElement:tag=>new Element(tag),
  querySelectorAll:selector=>selector==='[data-lang]'?lang:[],
  body:new Element('body')};
 const window={listeners:{},confirm:()=>true,TarihWorkshop:{useLesson(row,mode){window.lastLesson={row,mode}}},
  TarihKTP:{getEntries:(source)=>source==='catalog'?catalogRows:imported,loadBuiltin:async()=>catalogRows},
  addEventListener(name,fn){(this.listeners[name]||=[]).push(fn)},
  dispatchEvent(e){for(const f of this.listeners[e.type]||[])f(e)}};
 const localStorage={getItem:key=>store.get(key)||null,setItem:(key,val)=>store.set(key,val)};
 const URL={createObjectURL:blob=>{downloads.push(blob);return 'blob:test'},revokeObjectURL(){}};
 const origCreate=document.createElement;
 document.createElement=tag=>{
  const el=origCreate(tag);
  if(tag==='a')el.click=()=>{};
  return el;
 };
 const ctx={document,window,localStorage,URL,Blob,console,setTimeout:()=>0};
 vm.runInNewContext(fs.readFileSync(base+'/ktp-builder.js','utf8'),ctx,{filename:'ktp-builder.js'});
 return {ids,window,document};
}
async function main(){
 let {ids,window,document}=setup();
 window.TarihKTPBuilder.show();
 assert.equal(ids.ktpBuilderRows.children.length,0);
 await ids.ktpBuild.emit('click');
 const n=catalogRows.filter(x=>x.grade==='7'&&x.subject==='kaz').length;
 assert.equal(ids.ktpBuilderRows.children.length,n);
 assert.equal(n,62);
 const first=ids.ktpBuilderRows.children[0];
 const topic=first.children[2].children[0];topic.value='=2+2 <script>alert(1)</script>';
 await ids.ktpBuilderRows.emit('input',{target:topic});
 assert.equal(JSON.parse(store.get('tarih-ustaz-ktp-drafts-v1'))['ru:kaz:7:catalog'][0].title,topic.value);
 await ids.ktpCsv.emit('click');
 const csv=await downloads.at(-1).text();
 assert.match(csv,/"'=2\+2 <script>alert\(1\)<\/script>"/);
 assert.doesNotMatch(csv,/Дата|Күні/);
 assert.equal(csv.split('\r\n').length,n+1);
 await ids.ktpHtml.emit('click');
 const html=await downloads.at(-1).text();
 assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
 assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
 assert.doesNotMatch(html,/>Дата<|>Күні</);
 await ids.ktpPdf.emit('click');
 assert.match(document.body.children.find(x=>x.tagName==='IFRAME').srcdoc,/@page\{size:A4 landscape/);
 await first.children[4].children[0].emit('click');
 assert.equal(window.lastLesson.mode,'info');
 assert.equal(window.lastLesson.row.title,topic.value);
 ids.ktpQuarter.value='1';await ids.ktpQuarter.emit('change');
 assert.ok(ids.ktpBuilderRows.children.length<n);
 const firstQuarter=ids.ktpBuilderRows.children.length;
 await ids.ktpAdd.emit('click');
 assert.equal(ids.ktpBuilderRows.children.length,firstQuarter+1);
 ids.ktpQuarter.value='';await ids.ktpQuarter.emit('change');
 assert.equal(ids.ktpBuilderRows.children.length,n+1);
 ids.gradeInput.value='8';window.TarihKTPBuilder.show();assert.equal(ids.ktpBuilderRows.children.length,0);
 ids.gradeInput.value='7';window.TarihKTPBuilder.show();assert.equal(ids.ktpBuilderRows.children.length,n+1);
 const copy=setup();copy.window.TarihKTPBuilder.show();assert.equal(copy.ids.ktpBuilderRows.children.length,n+1);
 imported.push({grade:'7',subject:'kaz',quarter:'ІІ',title:'Импортированный урок',goal:'Цель'});
 ids.ktpSource.value='import';window.TarihKTPBuilder.show();await ids.ktpBuild.emit('click');
 assert.equal(ids.ktpBuilderRows.children[0].children[1].children[0].value,'2');
 console.log('PASS: KTP build, quarter, edit, localStorage reload, CSV escaping, HTML escaping, infographic route');

 const pickerIds=Object.fromEntries(['ktpFileInput','ktpSearch','ktpTopicSelect','ktpStatus','ktpClear',
  'gradeInput','subjectInput','topicInput','goalInput','factsInput'].map(id=>[id,new Element()]));
 pickerIds.gradeInput.value='7';pickerIds.subjectInput.value='kaz';
 const pickerLang=[new Element('button'),new Element('button')];
 const pickerDocument={readyState:'complete',documentElement:{lang:'ru'},
  getElementById:id=>pickerIds[id],createElement:tag=>new Element(tag),
  querySelectorAll:selector=>selector==='[data-lang]'?pickerLang:[]};
 const pickerWindow={listeners:{},addEventListener(name,fn){(this.listeners[name]||=[]).push(fn)},
  dispatchEvent(e){for(const fn of this.listeners[e.type]||[])fn(e)}};
 const pickerCtx={document:pickerDocument,window:pickerWindow,localStorage:{getItem:key=>store.get(key)||null,
  setItem:(key,val)=>store.set(key,val),removeItem:key=>store.delete(key)},console,
  fetch:async()=>({ok:true,json:async()=>catalog}),TextDecoder,Event:class{constructor(type){this.type=type}},
  CustomEvent:class{constructor(type,opt){this.type=type;this.detail=opt.detail}},setTimeout:()=>0};
 vm.runInNewContext(fs.readFileSync(base+'/ktp.js','utf8'),pickerCtx,{filename:'ktp.js'});
 await pickerWindow.TarihKTP.loadBuiltin('ru');
 const selected=catalogRows.filter(x=>x.grade==='7'&&x.subject==='kaz');
 const unique=new Set(selected.map(x=>[x.grade,x.subject,x.title.toLowerCase().replace(/\s+/g,' ').trim(),x.goal.toLowerCase().replace(/\s+/g,' ').trim()].join('|')));
 assert.equal(pickerIds.ktpTopicSelect.children.length,unique.size+1);
 assert.ok(unique.size<selected.length);
 pickerIds.ktpTopicSelect.value='0';pickerIds.factsInput.value='stale fact';
 await pickerIds.ktpTopicSelect.emit('change');
 assert.equal(pickerIds.topicInput.value,pickerIds.ktpTopicSelect.children[1].textContent);
 assert.equal(pickerIds.factsInput.value,'');
 const parsed=pickerWindow.TarihKTP.parseCSV('Тема;Цель\n"A; B";"Объясните\nфакт"');
 assert.equal(parsed[1][0],'A; B');assert.equal(parsed[1][1],'Объясните\nфакт');
 const fileBytes=Buffer.from('Тема урока;Цель обучения\nЧастный урок;Учимся сравнивать');
 const ownFile={name:'custom-plan.csv',size:fileBytes.length,arrayBuffer:async()=>fileBytes};
 await pickerIds.ktpFileInput.emit('change',{target:{files:[ownFile]}});
 const own=pickerWindow.TarihKTP.getEntries('import','ru');
 assert.equal(own.length,1);assert.equal(own[0].grade,'7');assert.equal(own[0].subject,'kaz');
 console.log('PASS: KTP picker deduplicates topics, imports CSV into selected subject/class, fills goals and clears stale facts');

 const htmlSource=fs.readFileSync(base+'/index.html','utf8');
 const allIds=[...htmlSource.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(allIds.length,new Set(allIds).size,'HTML must contain unique IDs');
 for(const id of ['plugin_fb8d5bda9a948191a1d20360a2763266',
  'plugin_41418c5317408191a2a00288743aac21','plugin_99a0e8de787c81919e79985c790b37db']){
  assert.equal(htmlSource.split('https://chatgpt.com/plugins/'+id).length,2,'one link per plugin');
 }
 assert.match(htmlSource,/<nav class="plugin-grid"/);
 const appIds=Object.fromEntries(allIds.map(id=>[id,new Element(id.includes('Canvas')?'canvas':'div')]));
 Object.assign(appIds.topicInput,{value:'Сақтар және дереккөздер'});
 Object.assign(appIds.goalInput,{value:'Дереккөздерді салыстыру'});
 Object.assign(appIds.factsInput,{value:'Бір дерек\nЕкінші дерек'});
 Object.assign(appIds.subjectInput,{value:'kaz'});
 Object.assign(appIds.gradeInput,{value:'7'});
 Object.assign(appIds.imageSelect,{value:'auto'});
 Object.assign(appIds.themeInput,{value:'navy'});
 const buttons=['ktp','slides','info','illustration','sheet'].map(mode=>{
  const el=new Element('button');el.dataset.mode=mode;return el;
 });
 const languages=['kk','ru'].map(lang=>{const el=new Element('button');el.dataset.lang=lang;return el});
 const savedPanel=new Element(),modeSwitch=new Element();
 const appDocument={readyState:'complete',documentElement:{lang:'kk'},
  getElementById:id=>appIds[id],createElement:tag=>new Element(tag),
  querySelectorAll:selector=>selector==='[data-mode]'?buttons:selector==='[data-lang]'?languages:[],
  querySelector:selector=>selector==='.workshop-saved'?savedPanel:selector==='.mode-switch'?modeSwitch:null,
  body:new Element('body')};
 const appWindow={TarihKTPBuilder:{show(){appWindow.builderShown=true}}};
 const appStorage={getItem:key=>store.get(key)||null,setItem:(key,val)=>store.set(key,val)};
 const appURL={createObjectURL:blob=>{downloads.push(blob);return 'blob:app'},revokeObjectURL(){}};
 const appCtx={document:appDocument,window:appWindow,localStorage:appStorage,URL:appURL,Blob,console,
  setTimeout:(fn,ms)=>{if(ms===4500)queueMicrotask(fn);return 0},clearTimeout:()=>{},
  Image:class{set src(x){/* Simulate an image request that never finishes. */}},
  navigator:{clipboard:{writeText:async()=>{}}},Event:class{constructor(type){this.type=type}}};
 const origAppCreate=appDocument.createElement;
 appDocument.createElement=tag=>{const e=origAppCreate(tag);if(tag==='a')e.click=()=>{};return e};
 vm.runInNewContext(fs.readFileSync(base+'/app.js','utf8'),appCtx,{filename:'app.js'});
 const sizes={slides:[1280,720],info:[1080,1350],illustration:[1280,720],sheet:[1080,1528]};
 for(const [mode,[w,h]] of Object.entries(sizes)){
  appWindow.TarihWorkshop.selectMode(mode);
  await new Promise(setImmediate);
  assert.equal(appIds.previewCanvas.width,w,mode+' width');
  assert.equal(appIds.previewCanvas.height,h,mode+' height');
  assert.equal(buttons.find(x=>x.dataset.mode===mode).getAttribute('aria-selected'),'true');
 }
 appWindow.TarihWorkshop.selectMode('ktp');
 assert.equal(appIds.studioBody.hidden,true);assert.equal(appWindow.builderShown,true);
 appWindow.TarihWorkshop.selectMode('slides');
 await new Promise(setImmediate);
 await appIds.nextSlide.emit('click');await Promise.resolve();await Promise.resolve();
 assert.equal(appIds.slidePage.textContent,'2 / 4');
 await appIds.editorForm.emit('submit');
 await Promise.resolve();await Promise.resolve();await Promise.resolve();
 assert.equal(appIds.viewModal.open,true);
 assert.equal(JSON.parse(store.get('tarih-ustaz-three-tools-v1')).length,1);
 const downloadsBefore=downloads.length;
 await appIds.modalPng.emit('click');await Promise.resolve();await Promise.resolve();
 await appIds.modalJpg.emit('click');await Promise.resolve();await Promise.resolve();
 await appIds.modalHtml.emit('click');await Promise.resolve();await Promise.resolve();
 assert.ok(downloads.length>=downloadsBefore+3);
 assert.equal((await downloads.at(-1).text()).match(/class="page"/g).length,4);
 await appIds.modalPdf.emit('click');await Promise.resolve();await Promise.resolve();
 assert.ok(appDocument.body.children.find(x=>x.tagName==='IFRAME').srcdoc.includes('img:last-child{break-after:auto}'));
 await appIds.modalClose.emit('click');appIds.topicInput.value='';
 await appIds.editorForm.emit('submit');await Promise.resolve();
 assert.equal(JSON.parse(store.get('tarih-ustaz-three-tools-v1')).length,1);
 assert.ok(appIds.topicInput.focused);
 console.log('PASS: four canvas modes, slide navigation, creation modal, localStorage, PNG/JPG/HTML/PDF export paths');
}
main().catch(e=>{console.error(e);process.exitCode=1});
