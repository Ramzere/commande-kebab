// Configuration Supabase (clé publique : sans danger, les accès sont limités côté base)
const SUPABASE_URL = 'https://cmsebqqkhcvvotqwmlwd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_E_1HTCMOY--LtsPYA_zrpw_4YFdjiom';

async function rpc(fn, args){
  const r = await fetch(SUPABASE_URL+'/rest/v1/rpc/'+fn, {
    method:'POST',
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'},
    body: JSON.stringify(args)
  });
  if(!r.ok) throw new Error('HTTP '+r.status);
  const t = await r.text(); return t ? JSON.parse(t) : null;
}

// ====== MENU : tout se modifie ici ======
const MENU = {
  dishes: [
    {id:'naan',    name:'Cheese naan', desc:'Naan garni de fromage fondant', price:7,    meats:1, fries:1,   drink:1},
    {id:'galette', name:'Galette',     desc:'Galette garnie',                price:7,    meats:1, fries:1,   drink:1},
    {id:'tacosM',  name:'Tacos M',     desc:'1 viande',                      price:7.5,  meats:1, fries:0.5, drink:1},
    {id:'tacosL',  name:'Tacos L',     desc:'2 viandes',                     price:9.5,  meats:2, fries:0.5, drink:1},
    {id:'tacosXL', name:'Tacos XL',    desc:'3 viandes',                     price:11.5, meats:3, fries:0.5, drink:1},
    {id:'tacosXXL',name:'Tacos XXL',   desc:'4 viandes',                     price:13.5, meats:4, fries:0.5, drink:1},
    {id:'assiette',name:'Assiette',    desc:'Frites incluses',               price:11.5, meats:1, fries:0,   drink:1, fixedFries:true}
  ],
  meats: ['Kebab','Tandoori','Curry','Tenders','Nuggets','Cordon bleu','Steak','Merguez','Falafel'],
  sauces: ['Ketchup','Mayonnaise','Algérienne','Harissa','Blanche','Samouraï','Andalouse','Marocaine','Barbecue','Biggy burger','Brasil'],
  maxSauces: 2,
  payments: ['Ticket resto','Carte resto','Espèces','Wero'],
  cutoffHour: 11, // heure affichée dans le bandeau (l'ouverture/fermeture se fait depuis admin.html)
  payInfo: 'À déposer au bureau de RRO ou MBA avant 12h',
  drinks: ['Coca','Coca zéro','Coca Cherry','Oasis tropical','Oasis pomme cassis'] // à compléter
};
// =========================================

const $ = id => document.getElementById(id);
const eur = n => n.toFixed(2).replace('.',',') + ' €';
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dishOf = id => MENU.dishes.find(d=>d.id===id);
const sum = m => Object.values(m).reduce((a,b)=>a+b,0);
function orderPrice(o){
  const d = dishOf(o.dish); if(!d) return 0;
  return d.price + (o.fries&&!d.fixedFries?d.fries:0) + (o.drink?d.drink:0);
}
function meatsText(m){
  return Object.entries(m||{}).filter(([,n])=>n>0).map(([k,n])=>n>1?k+' x'+n:k).join(' + ');
}
function describe(o){
  const d = dishOf(o.dish);
  return [d?d.name:o.dish, meatsText(o.meats),
    (o.sauces&&o.sauces.length)?'sauce '+o.sauces.join(' + '):'sans sauce',
    o.fries?'avec frites':'sans frites', o.drink?o.drink:'sans boisson', o.note?'('+o.note+')':null].filter(Boolean).join(', ');
}



// Popup de confirmation commune (remplace confirm()/alert() du navigateur)
function confirmBox(title, text, okLabel, opts){
  opts = opts || {};
  return new Promise(resolve=>{
    if(!document.getElementById('cb-css')){
      const st = document.createElement('style'); st.id='cb-css';
      st.textContent = '.cb-ov{position:fixed;inset:0;background:rgba(31,39,72,.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:9999}'
        +'.cb{background:#fff;border-radius:20px;max-width:380px;width:100%;padding:22px;box-shadow:0 12px 40px rgba(0,0,0,.3);font:16px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1f2748}'
        +'.cb h3{margin:0 0 6px;font-size:20px;color:#2a406c}.cb p{margin:0 0 18px;color:#5d6785}'
        +'.cb .acts{display:flex;gap:10px}.cb button{flex:1;border-radius:12px;padding:12px 14px;font:inherit;font-weight:800;cursor:pointer;border:1px solid #2a406c;background:#fff;color:#2a406c}'
        +'.cb button.ok{background:#b91432;border-color:#b91432;color:#fff}.cb button.ok.info{background:#2a406c;border-color:#2a406c}';
      document.head.appendChild(st);
    }
    const ov = document.createElement('div'); ov.className='cb-ov';
    const box = document.createElement('div'); box.className='cb'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true');
    const h = document.createElement('h3'); h.textContent = title;
    const p = document.createElement('p'); p.textContent = text || '';
    const acts = document.createElement('div'); acts.className='acts';
    const done = v => { document.removeEventListener('keydown', onKey); ov.remove(); resolve(v); };
    const onKey = e => { if(e.key==='Escape') done(false); };
    if(!opts.info){
      const no = document.createElement('button'); no.type='button'; no.textContent = opts.cancelLabel || 'Annuler'; no.onclick=()=>done(false); acts.appendChild(no);
    }
    const ok = document.createElement('button'); ok.type='button'; ok.className='ok'+(opts.info?' info':''); ok.textContent = okLabel || 'Oui'; ok.onclick=()=>done(true); acts.appendChild(ok);
    box.append(h,p,acts); ov.appendChild(box);
    ov.addEventListener('click', e=>{ if(e.target===ov && !opts.info) done(false); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov); (opts.info?ok:acts.firstChild).focus();
  });
}
