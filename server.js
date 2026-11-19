const http=require('http');const fs=require('fs');const path=require('path');const crypto=require('crypto');
// Load local .env without requiring dotenv
try{const envPath=path.join(__dirname,'.env');if(fs.existsSync(envPath)){for(const line of fs.readFileSync(envPath,'utf8').split(/\r?\n/)){const m=line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);if(m&&!process.env[m[1]]){let v=m[2].trim();if((v.startsWith('\"')&&v.endsWith('\"'))||(v.startsWith("'")&&v.endsWith("'")))v=v.slice(1,-1);process.env[m[1]]=v;}}}}catch(e){console.error('[VolteraX] Could not read .env:',e.message)}
const {MongoClient}=require('mongodb');
const {Pool:PgPool}=(()=>{try{return require('pg')}catch(_){return {Pool:null}}})();
const PORT=Number(process.env.PORT||3000);const HOST=process.env.HOST||'0.0.0.0';
const DEFAULT_DB = Buffer.from('cG9zdGdyZXNxbDovL3Bvc3RncmVzOnNyaW5pdmFzdm0xMTIyJTQwZ21haWwuY29tQGRiLmZlbXhyZXVjYm1xZnVuYWRsamFwLnN1cGFiYXNlLmNvOjY1NDMvcG9zdGdyZXM=','base64').toString('utf8');
const ADMIN_EMAIL=(process.env.ADMIN_EMAIL||'srinivasvm1122@gmail.com').toLowerCase();
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||Buffer.from('ODEwNTIyNzY0NA==','base64').toString('utf8');
const SESSION_TTL=1000*60*60*24*7;
const MONGODB_URI=process.env.MONGODB_URI||'';
const MONGODB_DB=process.env.MONGODB_DB||'volterax';
const SUPABASE_URL=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'https://femxreucbmqfunadljap.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_zkN2gnKmhUXwbGiuorYyKQ_-mURTLot';
const DATABASE_URL=process.env.DATABASE_URL||process.env.SUPABASE_DB_URL||DEFAULT_DB;
const pgPool=DATABASE_URL&&PgPool?new PgPool({connectionString:DATABASE_URL,ssl:{rejectUnauthorized:false},connectionTimeoutMillis:4000,idleTimeoutMillis:10000}):null;
const mongoClient=MONGODB_URI?new MongoClient(MONGODB_URI):null;
let db=blank(),storeDoc;
function blank(){return {users:[],orders:[],feedback:[],leads:[],sessions:{},adminSessions:{},projects:[]}}
async function initDb(){
  if(SUPABASE_URL&&SUPABASE_KEY){
    try{
      const res=await fetch(`${SUPABASE_URL}/rest/v1/volterax_store?id=eq.main&select=*`,{
        headers:{'apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`}
      });
      if(res.ok){
        const rows=await res.json();
        if(rows&&rows.length>0&&rows[0].data){
          db=rows[0].data;
          for(const k of Object.keys(blank()))if(db[k]==null)db[k]=blank()[k];
          console.log(`[VolteraX] Supabase REST connected! Users: ${db.users.length}, Orders: ${db.orders.length}, Projects: ${db.projects?.length||0}`);
          return;
        }
      }
    }catch(err){
      console.error('[VolteraX] Supabase REST init failed:', err.message);
    }
  }
  if(pgPool){
    try{
      console.log('[VolteraX] Connecting to Supabase PostgreSQL...');
      await pgPool.query(`CREATE TABLE IF NOT EXISTS volterax_store (id VARCHAR(64) PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());`);
      const r=await pgPool.query(`SELECT data FROM volterax_store WHERE id = 'main'`);
      if(r.rows.length===0){await pgPool.query(`INSERT INTO volterax_store (id, data, updated_at) VALUES ('main', $1, NOW())`,[JSON.stringify(db)])}
      else{db=r.rows[0].data||blank();for(const k of Object.keys(blank()))if(db[k]==null)db[k]=blank()[k]}
      console.log('[VolteraX] Supabase PostgreSQL connected and store loaded!');
      return;
    }catch(err){
      globalThis.__lastDbError = err.message + ' | stack: ' + err.stack;
      console.error('[VolteraX] Supabase init failed, running with memory store:', err.message);
    }
  }
  if(MONGODB_URI){
    try{
      await mongoClient.connect();
      const col=mongoClient.db(MONGODB_DB).collection('volterax_store');
      storeDoc=await col.findOne({_id:'main'});
      if(!storeDoc){db=blank();await col.insertOne({_id:'main',data:db,updatedAt:new Date()})}
      else{db=storeDoc.data||blank();for(const k of Object.keys(blank()))if(db[k]==null)db[k]=blank()[k];await col.replaceOne({_id:'main'},{_id:'main',data:db,updatedAt:new Date()},{upsert:true})}
      globalThis.__vxStore=col;
      return;
    }catch(err){
      console.error('[VolteraX] MongoDB init failed:', err.message);
    }
  }
  const localDbPath=path.join(__dirname,'volterax-local-db.json');
  if(fs.existsSync(localDbPath)){try{db=JSON.parse(fs.readFileSync(localDbPath,'utf8'))}catch(_){db=blank()}}
  for(const k of Object.keys(blank()))if(db[k]==null)db[k]=blank()[k];
}
let saveQueue=Promise.resolve();
function save(){
  const snapshot=JSON.parse(JSON.stringify(db));
  if(SUPABASE_URL&&SUPABASE_KEY){
    saveQueue=saveQueue.then(()=>fetch(`${SUPABASE_URL}/rest/v1/volterax_store?id=eq.main`,{
      method:'PATCH',
      headers:{
        'apikey':SUPABASE_KEY,
        'Authorization':`Bearer ${SUPABASE_KEY}`,
        'Content-Type':'application/json',
        'Prefer':'return=minimal'
      },
      body:JSON.stringify({data:snapshot,updated_at:new Date().toISOString()})
    })).catch(e=>console.error('[Supabase REST Save Error]',e.message));
  }
  if(pgPool){
    saveQueue=saveQueue.then(()=>pgPool.query(`INSERT INTO volterax_store (id, data, updated_at) VALUES ('main', $1, NOW()) ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW();`,[JSON.stringify(snapshot)])).catch(e=>console.error('[Supabase Save Error]',e.message));
  }
  if(!MONGODB_URI){
    const localDbPath=path.join(__dirname,'volterax-local-db.json');
    try{fs.writeFileSync(localDbPath,JSON.stringify(snapshot,null,2))}catch(e){console.error('Local DB save error:',e)}
    return saveQueue;
  }
  saveQueue=saveQueue.then(()=>globalThis.__vxStore.replaceOne({_id:'main'},{_id:'main',data:snapshot,updatedAt:new Date()},{upsert:true})).catch(e=>console.error('MongoDB save error:',e));
  return saveQueue;
}
function id(prefix){return prefix+crypto.randomBytes(5).toString('hex').toUpperCase()}
function now(){return new Date().toISOString()}
function hashPassword(p,salt=crypto.randomBytes(16).toString('hex')){const h=crypto.scryptSync(p,salt,64).toString('hex');return {salt,hash:h}}
function checkPassword(p,u){return crypto.timingSafeEqual(Buffer.from(hashPassword(p,u.passwordSalt).hash,'hex'),Buffer.from(u.passwordHash,'hex'))}
function cookie(name,value,maxAge){return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; ${process.env.NODE_ENV==='production'?'Secure;':''}`}
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i).trim(),decodeURIComponent(x.slice(i+1))]}))}
function json(res,status,data,extra={}){const b=JSON.stringify(data);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra});res.end(b)}
function body(req){return new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>1e6)req.destroy()});req.on('end',()=>{try{resolve(b?JSON.parse(b):{})}catch(e){reject(e)}});req.on('error',reject)})}
function customer(req){const sid=cookies(req).vx_session;if(!sid)return null;const s=db.sessions[sid];if(!s||Date.now()>s.expires){if(s)delete db.sessions[sid];return null}return db.users.find(u=>u.id===s.userId)||null}
function safeUser(u){return {id:u.id,name:u.name,mobile:u.mobile,createdAt:u.createdAt,lastLoginAt:u.lastLoginAt,ref:u.ref,referralCode:u.ref, referredBy:u.referredBy||null, mobileVerified:true}}
function customerBundle(u){const orders=db.orders.filter(o=>o.userId===u.id);const referrals=db.users.filter(x=>x.referredBy===u.ref).map(x=>({id:x.id,name:x.name,status:'registered',reward_paise:0}));return {user:safeUser(u),orders,referrals,earningsPaise:orders.filter(o=>o.status==='completed').reduce((a,o)=>a+Number(o.reward_paise||0),0)}}
function admin(req){const sid=cookies(req).vx_admin;const s=sid&&db.adminSessions[sid];if(!s||Date.now()>s.expires)return false;return true}
function requireCustomer(req,res){const u=customer(req);if(!u){json(res,401,{error:'Customer login required.'});return null}return u}
function requireAdmin(req,res){if(!admin(req)){json(res,401,{error:'Admin login required.'});return false}return true}
let dbPromise=null;
function ensureDb(){if(!dbPromise)dbPromise=initDb();return dbPromise}
async function route(req,res){
 try{
  await ensureDb();
  const u=new URL(req.url,'http://localhost');const p=u.pathname;
  if(req.method==='GET'&&p==='/api/diag'){return json(res,200,{hasPgPool:!!pgPool,hasPgModule:!!PgPool,users:db.users.length,orders:db.orders.length,dbError:globalThis.__lastDbError||null})}
  if(req.method==='GET'&&p==='/api/customer/me'){const c=customer(req);return c?json(res,200,customerBundle(c)):json(res,401,{error:'Not logged in'})}
  if(req.method==='GET'&&p==='/api/customer/orders'){const c=customer(req);return c?json(res,200,db.orders.filter(o=>o.userId===c.id)):json(res,401,{error:'Not logged in'})}
  if(req.method==='POST'&&p==='/api/customer/signup'){
    const x=await body(req);
    const name=String(x.name||'').trim();
    let mobile=String(x.mobile||'').replace(/\D/g,'');
    if(mobile.length===12&&mobile.startsWith('91')) mobile=mobile.slice(2);
    if(mobile.length===11&&mobile.startsWith('0')) mobile=mobile.slice(1);
    const password=String(x.password||'');
    const ref=String(x.ref||'').trim().toUpperCase();
    if(name.length<2||!/^[0-9]{10}$/.test(mobile)||password.length<6)return json(res,400,{error:'Invalid signup details. Name (2+ chars), valid 10-digit mobile, and password (6+ chars) required.'});
    if(db.users.some(v=>v.mobile===mobile))return json(res,409,{error:'Mobile already registered. Please sign in.'});
    if(ref&&!db.users.some(v=>v.ref===ref))return json(res,400,{error:'Referral code not found.'});
    const hp=hashPassword(password);
    const idv=id('VX');
    const user={id:idv,name,mobile,passwordHash:hp.hash,passwordSalt:hp.salt,ref:'VX'+crypto.randomBytes(4).toString('hex').toUpperCase(),referredBy:ref||null,createdAt:now(),lastLoginAt:now()};
    db.users.push(user);
    const sid=crypto.randomBytes(32).toString('hex');
    db.sessions[sid]={userId:idv,expires:Date.now()+SESSION_TTL};
    save();
    return json(res,200,customerBundle(user),{'Set-Cookie':cookie('vx_session',sid,SESSION_TTL/1000)});
  }
  if(req.method==='POST'&&p==='/api/customer/login'){
    const x=await body(req);
    let mobile=String(x.mobile||'').replace(/\D/g,'');
    if(mobile.length===12&&mobile.startsWith('91')) mobile=mobile.slice(2);
    if(mobile.length===11&&mobile.startsWith('0')) mobile=mobile.slice(1);
    const password=String(x.password||'');
    const user=db.users.find(v=>v.mobile===mobile);
    if(!user||!checkPassword(password,user))return json(res,401,{error:'Incorrect mobile number or password.'});
    user.lastLoginAt=now();
    const sid=crypto.randomBytes(32).toString('hex');
    db.sessions[sid]={userId:user.id,expires:Date.now()+SESSION_TTL};
    save();
    return json(res,200,customerBundle(user),{'Set-Cookie':cookie('vx_session',sid,SESSION_TTL/1000)});
  }
  if(req.method==='POST'&&p==='/api/customer/logout'){const sid=cookies(req).vx_session;if(sid)delete db.sessions[sid];save();return json(res,200,{ok:true},{'Set-Cookie':cookie('vx_session','',0)})}
  if(req.method==='POST'&&p==='/api/customer/feedback'){const x=await body(req);const c=customer(req);const name=String(x.name||c?.name||'').trim(),message=String(x.feedbackText||'').trim(),rating=Number(x.rating);if(!name||!message||rating<1||rating>5)return json(res,400,{error:'Invalid feedback.'});const item={id:id('FB'),userId:c?.id||null,name,rating,feedbackText:message,createdAt:now(),status:'new'};db.feedback.unshift(item);save();return json(res,201,{ok:true,id:item.id})}
  if(req.method==='POST'&&p==='/api/customer/lead'){const c=requireCustomer(req,res);if(!c)return;const x=await body(req);const item={id:id('LD'),userId:c.id,name:c.name,mobile:String(x.mobile||c.mobile).replace(/\D/g,''),message:String(x.message||'').slice(0,5000),createdAt:now(),status:'new'};db.leads.unshift(item);save();return json(res,201,{ok:true,id:item.id})}
  if(req.method==='POST'&&p==='/api/customer/order'){const c=requireCustomer(req,res);if(!c)return;const x=await body(req);const title=String(x.title||'VOLTERAX PROJECT').slice(0,200).trim();if(!title)return json(res,400,{error:'Project title is required.'});const item={id:id('ORD'),order_id:String(x.order_id||id('VX-ORD-')),userId:c.id,title:title,amount_paise:Number(x.amount_paise||0),status:String(x.status||'pending'),details:String(x.details||'Custom commissioned hardware prototype').slice(0,5000),createdAt:now(),updatedAt:now()};db.orders.unshift(item);save();return json(res,201,{ok:true,order:item})}
  // Admin
  if(req.method==='POST'&&p==='/api/admin/login'){const x=await body(req);if(String(x.email||'').toLowerCase()!==ADMIN_EMAIL||String(x.password||'')!==ADMIN_PASSWORD)return json(res,401,{error:'Invalid admin credentials.'});const sid=crypto.randomBytes(32).toString('hex');db.adminSessions[sid]={expires:Date.now()+SESSION_TTL};save();return json(res,200,{ok:true},{'Set-Cookie':cookie('vx_admin',sid,SESSION_TTL/1000)})}
  if(req.method==='POST'&&p==='/api/admin/logout'){const sid=cookies(req).vx_admin;if(sid)delete db.adminSessions[sid];save();return json(res,200,{ok:true},{'Set-Cookie':cookie('vx_admin','',0)})}
  if(p.startsWith('/api/admin/')){if(!requireAdmin(req,res))return;
    if(req.method==='GET'&&p==='/api/admin/summary')return json(res,200,{customers:db.users.length,orders:db.orders.length,feedback:db.feedback.length,newFeedback:db.feedback.filter(x=>x.status==='new').length,leads:db.leads.length,newLeads:db.leads.filter(x=>x.status==='new').length,revenuePaise:db.orders.reduce((a,o)=>a+Number(o.amount_paise||0),0),projects:(db.projects||[]).length,updatedAt:now()});
    if(req.method==='GET'&&p==='/api/admin/projects')return json(res,200,db.projects||[]);
    if(req.method==='GET'&&p==='/api/admin/customers')return json(res,200,db.users.map(safeUser));
    if(req.method==='GET'&&p==='/api/admin/orders')return json(res,200,db.orders.map(o=>({...o,user:db.users.find(u=>u.id===o.userId)?.name||'Unknown',mobile:db.users.find(u=>u.id===o.userId)?.mobile||''})));
    if(req.method==='GET'&&p==='/api/admin/feedback')return json(res,200,db.feedback.map(f=>({...f,customer:db.users.find(u=>u.id===f.userId)?.name||f.name,mobile:db.users.find(u=>u.id===f.userId)?.mobile||''})));
    if(req.method==='GET'&&p==='/api/admin/leads')return json(res,200,db.leads.map(l=>({...l,customer:db.users.find(u=>u.id===l.userId)?.name||l.name})));
    if(req.method==='POST'&&p==='/api/admin/order'){const x=await body(req);const user=db.users.find(v=>v.id===x.userId||v.mobile===String(x.mobile||'').replace(/\D/g,''));if(!user)return json(res,404,{error:'Customer not found.'});const item={id:id('ORD'),order_id:String(x.order_id||id('VX-ORD-')),userId:user.id,title:String(x.title||'VOLTERAX PROJECT').slice(0,200),amount_paise:Number(x.amount_paise||0),status:String(x.status||'pending'),details:String(x.details||'').slice(0,5000),createdAt:now(),updatedAt:now()};db.orders.unshift(item);save();return json(res,201,{ok:true,order:item})}
    if(req.method==='PATCH'&&p.startsWith('/api/admin/order/')){const oid=p.split('/').pop();const x=await body(req);const o=db.orders.find(v=>v.id===oid||v.order_id===oid);if(!o)return json(res,404,{error:'Order not found.'});for(const k of ['title','status','details'])if(x[k]!==undefined)o[k]=String(x[k]);if(x.amount_paise!==undefined)o.amount_paise=Number(x.amount_paise);o.updatedAt=now();save();return json(res,200,{ok:true,order:o})}
    if(req.method==='PATCH'&&p.startsWith('/api/admin/feedback/')){const fid=p.split('/').pop();const x=await body(req);const f=db.feedback.find(v=>v.id===fid);if(!f)return json(res,404,{error:'Feedback not found.'});if(x.status)f.status=String(x.status);save();return json(res,200,{ok:true,feedback:f})}
    if(req.method==='PATCH'&&p.startsWith('/api/admin/lead/')){const lid=p.split('/').pop();if(!lid||!/^LD[A-Za-z0-9_-]+$/.test(lid))return json(res,400,{error:'Invalid lead ID format.'});const x=await body(req);const allowed=['new','contacted','quoted','closed'];const status=String(x.status||'').toLowerCase().trim();if(!allowed.includes(status))return json(res,400,{error:'Invalid status. Allowed: '+allowed.join(', ')});const l=db.leads.find(v=>v.id===lid);if(!l)return json(res,404,{error:'Lead not found.'});l.status=status;l.updatedAt=now();save();return json(res,200,{ok:true,lead:l})}
  }
  if(req.method==='GET'&&p==='/admin'){return serveFile(res,path.join(__dirname,'public','admin.html'),'text/html; charset=utf-8')}
  if(req.method==='GET'&&p==='/admin/login'){return serveFile(res,path.join(__dirname,'public','admin.html'),'text/html; charset=utf-8')}
  if(req.method==='GET'){let fp;if(p==='/'||p==='/index.html')fp=path.join(__dirname,'public','index.html');else if(p==='/projects'||p==='/projects.html')fp=path.join(__dirname,'public','projects.html');else if(p.startsWith('/assets/'))fp=path.join(__dirname,'public',p);else if(fs.existsSync(path.join(__dirname,'public',p.slice(1))))fp=path.join(__dirname,'public',p.slice(1));else return json(res,404,{error:'Not found'});return serveFile(res,fp)}
  json(res,404,{error:'Not found'});
 }catch(e){console.error(e);json(res,500,{error:'Server error.'})}
}
function serveFile(res,fp,type){if(!fs.existsSync(fp))return json(res,404,{error:'File not found'});const ext=path.extname(fp);const ct=type||({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json'}[ext]||'application/octet-stream');res.writeHead(200,{'Content-Type':ct,'Cache-Control':'no-cache'});fs.createReadStream(fp).pipe(res)}
http.createServer(route).listen(PORT,HOST,()=>{
  console.log(`VOLTERAX platform running on http://${HOST==='0.0.0.0'?'localhost':HOST}:${PORT}`);
  initDb().catch(e=>console.error('[VolteraX] Startup DB error:',e.message));
});
