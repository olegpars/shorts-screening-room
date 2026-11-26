'use strict';
const by=id=>document.getElementById(id);
const key='short-story-favourites-v1';let picked=new Set(),all=[],shown=[],group='',query='',favs=false,current='',opening=null;
function read(){try{const a=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(a))picked=new Set(a.filter(x=>typeof x==='string'));}catch{}}
function sync(){try{localStorage.setItem(key,JSON.stringify([...picked]));}catch{}}
function count(n){const r=n%100,t=n%10;return n+' '+(r>=11&&r<=14?'роликов':t===1?'ролик':t>=2&&t<=4?'ролика':'роликов');}
function button(caption,label,cls){const e=document.createElement('button');e.type='button';e.className=cls;e.textContent=caption;e.setAttribute('aria-label',label);return e;}
function elem(tag,cls,content){const e=document.createElement(tag);if(cls)e.className=cls;if(content)e.textContent=content;return e;}
function fav(id){if(picked.has(id))picked.delete(id);else picked.add(id);sync();if(by('viewer').open){updateFavorite();}else draw();}
function updateFavorite(){const yes=picked.has(current);by('save').setAttribute('aria-pressed',String(yes));by('save').textContent=yes?'♥ В избранном':'♡ В избранное';}
function draw(){
 shown=all.filter(a=>(!group||a.collection===group)&&(!favs||picked.has(a.id))&&a.title.toLocaleLowerCase('ru').replaceAll('ё','е').includes(query));
 by('summary').textContent=shown.length===all.length?count(all.length):count(shown.length)+' из '+all.length;
 by('favFilter').setAttribute('aria-pressed',String(favs));by('favFilter').querySelector('b').textContent=all.filter(a=>picked.has(a.id)).length;
 by('empty').hidden=shown.length>0;const f=document.createDocumentFragment();
 for(const a of shown){
  const card=elem('article','card'),open=button('','Смотреть: '+a.title,'open'),poster=elem('div','poster'),image=elem('img'),p=elem('span','play','▶');
  open.dataset.id=a.id;image.src=a.poster;image.alt='';image.loading='lazy';image.decoding='async';p.setAttribute('aria-hidden','true');poster.append(image,p);
  open.append(poster,elem('span','label',a.title),elem('span','batch',a.collection));open.onclick=()=>{opening=a.id;view(a.id);};
  const yes=picked.has(a.id),like=button(yes?'♥':'♡',(yes?'Убрать из избранного: ':'В избранное: ')+a.title,'like');like.setAttribute('aria-pressed',String(yes));like.onclick=()=>fav(a.id);
  card.append(open,like);f.append(card);
 }
 by('cards').replaceChildren(f);
}
function view(id){const i=shown.findIndex(a=>a.id===id);if(i<0)return;const a=shown[i],v=by('video');current=id;by('vtitle').textContent=a.title;by('vcollection').textContent=a.collection;by('position').textContent=(i+1)+' из '+shown.length;by('prev').disabled=i===0;by('next').disabled=i===shown.length-1;updateFavorite();if(!by('viewer').open)by('viewer').showModal();v.pause();v.poster=a.poster;v.src=a.video;v.load();v.play().catch(()=>{});}
function step(dir){const next=shown[shown.findIndex(a=>a.id===current)+dir];if(next)view(next.id);}
by('search').oninput=e=>{query=e.target.value.trim().toLocaleLowerCase('ru').replaceAll('ё','е');draw();};
by('collection').onchange=e=>{group=e.target.value;draw();};by('favFilter').onclick=()=>{favs=!favs;draw();};
by('reset').onclick=()=>{group='';query='';favs=false;by('search').value='';by('collection').value='';draw();};
by('close').onclick=()=>by('viewer').close();by('prev').onclick=()=>step(-1);by('next').onclick=()=>step(1);by('save').onclick=()=>fav(current);
by('viewer').addEventListener('close',()=>{const v=by('video');v.pause();v.removeAttribute('src');v.removeAttribute('poster');v.load();draw();const entry=document.querySelector('.open[data-id="'+opening+'"]');if(entry)entry.focus({preventScroll:true});else by('favFilter').focus({preventScroll:true});});
by('viewer').addEventListener('click',e=>{if(e.target===by('viewer'))by('viewer').close();});
document.addEventListener('keydown',e=>{if(!by('viewer').open||document.activeElement===by('video'))return;if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1);});
window.addEventListener('storage',e=>{if(e.key===key){read();if(by('viewer').open)updateFavorite();else draw();}});
read();fetch('./manifest.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{all=data.items;for(const name of new Set(all.map(x=>x.collection))){by('collection').add(new Option(name,name));}draw();}).catch(()=>{by('summary').textContent='Не удалось загрузить ролики. Обновите страницу.';});
