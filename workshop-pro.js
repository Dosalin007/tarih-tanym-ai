/* Tarih Ustaz AI — professional creation, in-site viewing, local library */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const LIB_KEY='tarih_ustaz_material_library_v2';
const MAX_ITEMS=12;
const labels={
kk:{create:'Материал дайын! Сайтта ашылды.',saved:'Материал осы браузерде сақталды.',limited:'Дайын материал ашылды, бірақ браузер жадына сыймағандықтан сақталмады.',empty:'Материал әлі жоқ. Жоғарыдағы шеберханада «Жасау» батырмасын басыңыз.',open:'Ашу',download:'Жүктеу',remove:'Жою',close:'Жабу',ready:'Дайын материал',error:'Файлды дайындау кезінде қате шықты.',large:'Суреттің көлемі 2 МБ-тан аспауы керек.',photo:'Фото таңдалды. «Жасау» батырмасын басыңыз.'},
ru:{create:'Материал готов! Открыт прямо на сайте.',saved:'Материал сохранён в этом браузере.',limited:'Материал открыт, но не сохранился: недостаточно памяти браузера.',empty:'Материалов пока нет. Нажмите «Создать» в мастерской выше.',open:'Открыть',download:'Скачать',remove:'Удалить',close:'Закрыть',ready:'Готовый материал',error:'Не удалось подготовить файл.',large:'Размер изображения не должен превышать 2 МБ.',photo:'Фото выбрано. Нажмите «Создать».'}
};
let current=null;
let fallback=[];
const api=()=>window.TarihStudio;
const locale=()=>api()?.getData().locale==='ru'?'ru':'kk';
const tr=k=>labels[locale()][k]||k;
function notice(msg){
 const status=$('status');if(status)status.textContent=msg;
 const t=$('toast');if(t){t.textContent=msg;t.classList.add('show');window.setTimeout(()=>t.classList.remove('show'),3500);}
}
function fromStorage(){try{const parsed=JSON.parse(localStorage.getItem(LIB_KEY)||'[]');return Array.isArray(parsed)?parsed.slice(0,MAX_ITEMS):[]}catch{return fallback}}
function store(records){
 fallback=records;
 try{localStorage.setItem(LIB_KEY,JSON.stringify(records));return true}catch{return false}
}
const kindName=(k,l)=>({kk:{info:'Инфографика',slides:'Слайдтар',qmj:'ҚМЖ',sheet:'Жұмыс парағы',form:'Тест',game:'HTML ойын',illustration:'Фотоиллюстрация'},ru:{info:'Инфографика',slides:'Презентация',qmj:'КСП',sheet:'Рабочий лист',form:'Тест',game:'HTML-игра',illustration:'Фотоиллюстрация'}}[l]||{})[k]||k;
function downloadDoc(doc){
 const blob=new Blob([doc.html],{type:'text/html;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;a.download=doc.kind==='game'?'index.html':('Tarih_Ustaz_AI_'+doc.kind+'_'+doc.id+'.html');
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function openDoc(doc){
 current=doc;
 $('resultTitle').textContent=doc.title+' — '+kindName(doc.kind,locale());
 $('resultFrame').srcdoc=doc.html;
 const dialog=$('resultDialog');
 if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();
 else dialog.setAttribute('open','');
}
function createMaterial(kind){
 try{
 const a=api();if(!a)throw new Error('editor unavailable');
 if(kind)a.setTool(kind);
 const d=a.getData();
 const html=a.downloadedContent();
 if(!html||!html.includes('<!doctype html>'))throw new Error('No HTML');
 const doc={id:Date.now().toString(36),kind:a.tool(),title:d.topic,subject:d.subject,grade:d.grade,locale:d.locale,html,createdAt:new Date().toISOString(),photo:a.imageSrc('heritage-hero.svg')};
 const records=[doc,...fromStorage()].slice(0,MAX_ITEMS);
 const saved=store(records);
 renderLibrary();openDoc(doc);
 notice(saved?tr('create')+' '+tr('saved'):tr('limited'));
 }catch(e){console.error('Material generation:',e);notice(tr('error'))}
}
function removeDoc(id){
 const next=fromStorage().filter(x=>x.id!==id);
 store(next);renderLibrary();
}
function renderLibrary(){
 const area=$('myMaterials');if(!area)return;
 area.textContent='';
 const records=fromStorage();
 if(!records.length){const p=document.createElement('p');p.className='empty-materials';p.textContent=tr('empty');area.append(p);return}
 for(const item of records){
 const card=document.createElement('article');card.className='saved-material';
 const media=document.createElement('div');media.className='saved-cover';
 const img=document.createElement('img');img.loading='lazy';img.alt='';img.src=item.photo||'';
 media.append(img);
 const type=document.createElement('span');type.className='saved-kind';type.textContent=kindName(item.kind,locale());media.append(type);
 const content=document.createElement('div');content.className='saved-content';
 const h=document.createElement('h3');h.textContent=item.title;content.append(h);
 const meta=document.createElement('p');const dt=new Date(item.createdAt);meta.textContent=(item.grade||'')+' · '+(Number.isFinite(dt.getTime())?dt.toLocaleDateString(locale()==='ru'?'ru-RU':'kk-KZ'):'');content.append(meta);
 const actions=document.createElement('div');actions.className='saved-actions';
 const open=document.createElement('button');open.type='button';open.textContent=tr('open');open.className='saved-open';open.addEventListener('click',()=>openDoc(item));actions.append(open);
 const down=document.createElement('button');down.type='button';down.textContent=tr('download');down.addEventListener('click',()=>downloadDoc(item));actions.append(down);
 const del=document.createElement('button');del.type='button';del.textContent=tr('remove');del.className='saved-remove';del.addEventListener('click',()=>removeDoc(item.id));actions.append(del);
 content.append(actions);card.append(media,content);area.append(card);
 }
}
function init(){
 if(!api()){console.error('TarihStudio core unavailable');return}
 const preset=$('photoPreset');
 if(preset){
 const auto=document.createElement('option');auto.value='auto';auto.textContent=locale()==='ru'?'Автоматически по разделу':'Бөлімге сай автоматты';preset.insertBefore(auto,preset.firstChild);preset.value='auto';
 preset.addEventListener('change',()=>{window.TARIH_PHOTO_PRESET=preset.value;window.TARIH_CUSTOM_IMAGE=null;api().render();});
 }
 const upload=$('photoUpload');if(upload)upload.addEventListener('change',()=>{
 const file=upload.files&&upload.files[0];if(!file)return;
 if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>2*1024*1024){notice(tr('large'));upload.value='';return}
 const reader=new FileReader();
 reader.onload=()=>{window.TARIH_CUSTOM_IMAGE=String(reader.result);api().render();notice(tr('photo'))};
 reader.readAsDataURL(file);
 });
 const create=$('createMaterial');if(create)create.addEventListener('click',()=>createMaterial());
 document.querySelectorAll('[data-create-tool]').forEach(btn=>btn.addEventListener('click',()=>createMaterial(btn.dataset.createTool)));
 $('modalClose').addEventListener('click',()=>{const d=$('resultDialog');d.close?.();d.removeAttribute('open');$('resultFrame').removeAttribute('srcdoc')});
 $('modalDownload').addEventListener('click',()=>{if(current)downloadDoc(current)});
 $('resultDialog').addEventListener('click',event=>{if(event.target===$('resultDialog')){$('resultDialog').close?.();$('resultFrame').removeAttribute('srcdoc')}});
 document.querySelectorAll('[data-set-lang]').forEach(btn=>btn.addEventListener('click',()=>{window.setTimeout(renderLibrary,0)}));
 renderLibrary();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
