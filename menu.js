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

