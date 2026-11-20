
// ==================== GMAIL / EMAIL OTP VERIFICATION SYSTEM ====================
globalThis.__vxPendingOtps = globalThis.__vxPendingOtps || {};

let mailerTransport = null;
function getMailer() {
  if (mailerTransport) return mailerTransport;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'srinivasvm1122@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || 'weyhhwyvozukjnbk';
  if (!pass) return null;
  try {
    const { createTransport } = require('nodemailer');
    mailerTransport = createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
    return mailerTransport;
  } catch (err) {
    console.error('[Nodemailer Init Error]', err.message);
    return null;
  }
}

async function sendOtpEmail(toEmail, otp, name = 'Customer') {
  const mailer = getMailer();
  const senderEmail = process.env.SMTP_USER || process.env.GMAIL_USER || 'srinivasvm1122@gmail.com';
  const htmlContent = `
    <div style="background:#050508;color:#ffffff;padding:36px;font-family:Arial,-apple-system,sans-serif;border-radius:14px;border:1px solid #6C3BFF;max-width:540px;margin:0 auto;box-shadow:0 20px 50px rgba(0,0,0,0.8);">
      <div style="margin-bottom:24px;">
        <span style="font-size:24px;font-weight:900;letter-spacing:3px;color:#ffffff;">VOLTERAX</span>
        <span style="font-size:11px;font-family:monospace;color:#00E5FF;letter-spacing:2px;margin-left:8px;">/ VERIFICATION HUB</span>
      </div>
      <h2 style="color:#ffffff;margin:0 0 12px;font-size:22px;font-weight:800;">Your 6-Digit Verification Code</h2>
      <p style="color:#d1d5db;font-size:14.5px;line-height:1.6;margin:0 0 24px;">
        Hello ${name},<br>
        Use the one-time code below to authenticate your VOLTERAX customer portal:
      </p>
      <div style="background:#0c0c14;border:1px solid #6C3BFF;padding:20px;text-align:center;font-size:36px;font-weight:900;letter-spacing:12px;color:#00E5FF;border-radius:10px;margin:24px 0;">
        ${otp}
      </div>
      <p style="color:#9da0ad;font-size:12.5px;line-height:1.6;margin:24px 0 0;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
        ⏱️ This security code is valid for <strong>10 minutes</strong>.<br>
        🔒 Do not share this code with anyone. VOLTERAX will never ask for your code over the phone.
      </p>
    </div>
  `;

  if (mailer) {
    try {
      await mailer.sendMail({
        from: `"VOLTERAX Systems" <${senderEmail}>`,
        to: toEmail,
        subject: `VOLTERAX Verification Code: ${otp}`,
        text: `Your VOLTERAX 6-digit verification code is: ${otp}. It expires in 10 minutes.`,
        html: htmlContent
      });
      console.log(`[VOLTERAX OTP] Dispatched email to ${toEmail}`);
      return { sent: true };
    } catch (err) {
      console.error(`[VOLTERAX OTP Send Error]`, err.message);
      return { sent: false, error: err.message };
    }
  } else {
    console.log(`[VOLTERAX OTP Notice] SMTP_PASS not set in environment. Live code for ${toEmail} is: ${otp}`);
    return { sent: false, code: otp, notice: 'Code logged to server' };
  }
}


const dns = require('dns').promises;

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com','10minutemail.com','mailinator.com','guerrillamail.com',
  'throwawaymail.com','yopmail.com','sharklasers.com','dispostable.com',
  'getnada.com','fake.com','fakemail.com','test.com','example.com',
  'asdf.com','maildrop.cc','inboxkitten.com','temp-mail.org',
  'fakemailgenerator.com','burnermail.io','crazymailing.com','trashmail.com',
  'mytemp.email','mohmal.com','generator.email','nada.ltd','temp-mail.io',
  'emailondeck.com','trashmail.net','discard.email','mytempemail.com',
  'tempail.com','fakemail.net','tempmailaddress.com','spamgourmet.com',
  'grr.la','guerrillamailblock.com','pokemail.net','inbound.plus'
]);

const DUMMY_USERNAMES = new Set([
  'test','testing','testuser','tester','admin','administrator','root',
  'fake','fakeuser','fakeemail','testmail','testemail','asdf','asdfgh',
  'asdfghjkl','qwerty','qwertyuiop','123456','1234567','12345678',
  '123456789','1234567890','sample','samplemail','user','user123',
  'demo','demouser','abc','abcd','abcdef','xyz','xyz123','temp',
  'tempuser','dummy','dummyuser','noemail','noreply','example',
  'unknown','anonymous','null','undefined','random','someone','nobody'
]);

const FAKE_MOBILES = new Set([
  '1234567890','0123456789','9876543210','8765432109','7654321098','6543210987',
  '9898989898','9123456789','9000000000','8000000000','7000000000','6000000000',
  '9111111111','9222222222','9333333333','9444444444','9555555555','9666666666',
  '9777777777','9888888888','9999999999','8888888888','7777777777','6666666666',
  '0000000000','1111111111','2222222222','3333333333','4444444444','5555555555',
  '9876598765','9898098980','9191919191','9090909090','8080808080','7070707070',
  '9012345678','9988776655','9123491234','9876501234'
]);

function validateIndianMobile(raw) {
  let m = String(raw || '').replace(/\D/g, '');
  if (m.length === 12 && m.startsWith('91')) m = m.slice(2);
  if (m.length === 11 && m.startsWith('0')) m = m.slice(1);

  if (!m) return { valid: false, error: 'Mobile number is required.' };
  if (m.length !== 10) return { valid: false, error: 'Mobile number must be exactly 10 digits (you entered ' + m.length + ').' };
  if (!/^[6-9]/.test(m)) {
    return { valid: false, error: 'Please enter a genuine Indian mobile number starting with 6, 7, 8, or 9.' };
  }
  if (FAKE_MOBILES.has(m) || /^(\d)\1{9}$/.test(m)) {
    return { valid: false, error: 'Please enter a genuine mobile number (test/dummy numbers are not permitted).' };
  }
  if (/(\d)\1{5,}/.test(m)) {
    return { valid: false, error: 'Please enter a genuine mobile number (repeated digit pattern rejected).' };
  }
  const uniqueDigits = new Set(m.split('')).size;
  if (uniqueDigits < 4) {
    return { valid: false, error: 'Please enter a genuine active mobile number.' };
  }
  return { valid: true, mobile: m };
}

async function validateEmailServer(raw, checkMx = false) {
  const email = String(raw || '').trim().toLowerCase();
  if (!email) return { valid: false, error: 'Gmail / Email address is required.' };

  const emailRegex = /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email address format.' };
  }

  const parts = email.split('@');
  if (parts.length !== 2) return { valid: false, error: 'Invalid email address.' };
  const username = parts[0];
  const domain = parts[1];

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, error: 'Temporary or disposable email domains are blocked. Please use an official Gmail address.' };
  }

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const rawUserWithoutDots = username.replace(/\./g, '');
    if (rawUserWithoutDots.length < 6 || rawUserWithoutDots.length > 30) {
      return { valid: false, error: 'Google requires Gmail usernames to be between 6 and 30 characters long.' };
    }
    if (!/^[a-z0-9.]+$/.test(username)) {
      return { valid: false, error: 'Gmail usernames can only contain letters (a-z), numbers (0-9), and periods (.).' };
    }
    if (username.startsWith('.') || username.endsWith('.') || username.includes('..')) {
      return { valid: false, error: 'Gmail usernames cannot start, end, or contain consecutive periods.' };
    }
    if (DUMMY_USERNAMES.has(rawUserWithoutDots)) {
      return { valid: false, error: 'The Gmail address "' + email + '" is a test/placeholder username. Please use your genuine Gmail.' };
    }
    const uniqueChars = new Set(rawUserWithoutDots.split('')).size;
    if (uniqueChars < 3) {
      return { valid: false, error: 'Please enter a genuine Gmail address (character repetition pattern blocked).' };
    }
  } else {
    if (username.length < 3) {
      return { valid: false, error: 'Email username must be at least 3 characters.' };
    }
    if (DUMMY_USERNAMES.has(username)) {
      return { valid: false, error: 'The email address "' + email + '" is a placeholder username.' };
    }
    if (checkMx) {
      try {
        const mx = await dns.resolveMx(domain);
        if (!mx || mx.length === 0) {
          return { valid: false, error: 'The email domain "@' + domain + '" does not have active mail servers. Please enter a genuine address.' };
        }
      } catch (err) {
        return { valid: false, error: 'The email domain "@' + domain + '" could not be verified. Please enter a valid, active Gmail or email address.' };
      }
    }
  }

  return { valid: true, email };
}

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
          if(!db.projects||db.projects.length===0){
            try{
              const pRes=await fetch(`${SUPABASE_URL}/rest/v1/projects?select=*&order=id.asc`,{headers:{'apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`}});
              if(pRes.ok){const pRows=await pRes.json();if(Array.isArray(pRows)&&pRows.length>0)db.projects=pRows;}
            }catch(pe){console.warn('[VolteraX] Projects table load warning:',pe.message);}
          }
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
async function syncRelational(type, item) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
  };
  try {
    if (type === 'customer') {
      await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          email: item.email || null,
          mobile: item.mobile || null,
          referral_code: item.ref,
          referred_by: item.referredBy || null,
          created_at: item.createdAt || new Date().toISOString(),
          last_login_at: item.lastLoginAt || new Date().toISOString()
        })
      });
    } else if (type === 'order') {
      const u = db.users.find(x => x.id === item.userId);
      await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: item.id,
          order_id: item.order_id || item.id,
          user_id: item.userId,
          customer_name: u ? u.name : 'Customer',
          customer_mobile: u ? u.mobile : '',
          title: item.title,
          amount_inr: (Number(item.amount_paise || 0) / 100),
          status: item.status || 'pending',
          details: item.details || '',
          created_at: item.createdAt || new Date().toISOString(),
          updated_at: item.updatedAt || new Date().toISOString()
        })
      });
    } else if (type === 'lead') {
      const u = db.users.find(x => x.id === item.userId);
      await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: item.id,
          user_id: item.userId || null,
          customer_name: item.name || (u ? u.name : 'Prospect'),
          mobile: item.mobile || (u ? u.mobile : ''),
          message: item.message,
          status: item.status || 'new',
          created_at: item.createdAt || new Date().toISOString()
        })
      });
    } else if (type === 'feedback') {
      const u = db.users.find(x => x.id === item.userId);
      await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: item.id,
          user_id: item.userId || null,
          customer_name: item.name || (u ? u.name : 'Customer'),
          rating: Number(item.rating || 5),
          feedback_text: item.feedbackText,
          status: item.status || 'new',
          created_at: item.createdAt || new Date().toISOString()
        })
      });
    } else if (type === 'project') {
      const pId = encodeURIComponent(item.id || item.code);
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${pId}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          title: item.title,
          category: item.category,
          price: Number(item.price || 0),
          description: item.description,
          image: item.image,
          status: item.status || 'active',
          featured: Boolean(item.featured)
        })
      });
      const patchedRows = patchRes.ok ? await patchRes.json().catch(() => []) : [];
      if (!Array.isArray(patchedRows) || patchedRows.length === 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id: item.id || item.code,
            code: item.code || item.id,
            title: item.title,
            category: item.category || 'HARDWARE',
            price: Number(item.price || 0),
            description: item.description || '',
            image: item.image || '',
            status: item.status || 'active',
            featured: Boolean(item.featured)
          })
        });
      }
    } else if (type === 'delete_project') {
      const pId = encodeURIComponent(item.id || item.code);
      await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${pId}`, {
        method: 'DELETE',
        headers
      });
    }
  } catch (err) {
    console.error(`[Supabase Relational Sync Error: ${type}]`, err.message);
  }
}
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
function safeUser(u){return {id:u.id,name:u.name,email:u.email||'',mobile:u.mobile||'',createdAt:u.createdAt,lastLoginAt:u.lastLoginAt,ref:u.ref,referralCode:u.ref, referredBy:u.referredBy||null, mobileVerified:Boolean(u.mobile), emailVerified:Boolean(u.email)}}
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
  if(req.method==='GET'&&p==='/api/projects'){
    if(SUPABASE_URL&&SUPABASE_KEY){
      try{
        const pRes=await fetch(SUPABASE_URL+'/rest/v1/projects?select=*&order=id.asc',{
          headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY},
          signal:AbortSignal.timeout(3500)
        });
        if(pRes.ok){
          const pRows=await pRes.json();
          if(Array.isArray(pRows)&&pRows.length>0){
            db.projects=pRows;
            return json(res,200,pRows,{'Cache-Control':'no-cache, no-store, must-revalidate','Pragma':'no-cache','Expires':'0','Access-Control-Allow-Origin':'*'});
          }
        }
      }catch(err){
        console.warn('[VolteraX] Live projects fetch fallback to memory:', err.message);
      }
    }
    return json(res,200,db.projects||[],{'Cache-Control':'no-cache, no-store, must-revalidate','Pragma':'no-cache','Expires':'0','Access-Control-Allow-Origin':'*'});
  }
  
    // --- GMAIL OTP ENDPOINTS ---
    if(req.method==='POST'&&p==='/api/customer/send-otp'){
      const x=await body(req);
      const email=String(x.email||x.gmail||'').trim().toLowerCase();
      const name=String(x.name||'').trim()||'Customer';
      const mode=String(x.mode||'login').toLowerCase();
      let mobile=String(x.mobile||'').trim();

      const emailCheck = await validateEmailServer(email, false);
      if(!emailCheck.valid) return json(res, 400, { error: emailCheck.error });

      if (mode === 'create') {
        const mobCheck = validateIndianMobile(mobile);
        if(!mobCheck.valid) return json(res, 400, { error: mobCheck.error });
        mobile = mobCheck.mobile;
      }

      const fallbackOtp = String(Math.floor(100000 + Math.random() * 900000));
      globalThis.__vxPendingOtps[email] = {
        otp: fallbackOtp,
        expires: Date.now() + 10 * 60 * 1000,
        name,
        mobile: mobile || '',
        mode,
        ref: String(x.ref||'').trim().toUpperCase(),
        attempts: 0
      };

      // 1. Dispatch real email OTP via direct Gmail SMTP
      let emailSent = false;
      const mailResult = await sendOtpEmail(email, fallbackOtp, name);
      if (mailResult && mailResult.sent) {
        emailSent = true;
      } else if (SUPABASE_URL && SUPABASE_KEY) {
        // Fallback to Supabase Auth OTP if SMTP is unconfigured
        try {
          const supaRes = await fetch(SUPABASE_URL + '/auth/v1/otp', {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, create_user: true })
          });
          if (supaRes.ok) {
            emailSent = true;
            console.log('[Supabase Auth OTP] Real email code dispatched to ' + email);
          }
        } catch (supaErr) {
          console.warn('[Supabase Auth OTP Warning]', supaErr.message);
        }
      }

      return json(res, 200, {
        ok: true,
        message: 'Verification code sent to ' + email + '. Please check your Inbox and Spam folder.',
        email: email,
        hasSmtp: emailSent,
        previewCode: emailSent ? null : fallbackOtp
      });
    }

    if(req.method==='POST'&&p==='/api/customer/verify-otp'){
      const x=await body(req);
      const email=String(x.email||x.gmail||'').trim().toLowerCase();
      const inputOtp=String(x.otp||x.code||'').trim().replace(/\D/g,'');

      if(!email) return json(res, 400, { error: 'Email address is required.' });
      if(!inputOtp || inputOtp.length !== 6) return json(res, 400, { error: 'Please enter the 6-digit verification code.' });

      const pending = globalThis.__vxPendingOtps[email];
      let verified = false;

      // 1. Verify with Supabase Auth
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supaVerify = await fetch(SUPABASE_URL + '/auth/v1/verify', {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'email',
              email: email,
              token: inputOtp
            })
          });
          if (supaVerify.ok) {
            verified = true;
            console.log('[Supabase Auth] Code successfully verified for ' + email);
          }
        } catch (supaVerifyErr) {
          console.warn('[Supabase Auth Verify Warning]', supaVerifyErr.message);
        }
      }

      // 2. Verify with local fallback OTP
      if (!verified && pending && pending.otp === inputOtp && Date.now() <= pending.expires) {
        verified = true;
      }

      if (!verified) {
        if (pending) pending.attempts++;
        return json(res, 400, { error: 'Incorrect or expired verification code. Please check your Gmail or click Resend.' });
      }

      // Validated! Clear pending record
      delete globalThis.__vxPendingOtps[email];

      // Find or create customer
      let user = db.users.find(u => (u.email && u.email.toLowerCase() === email) || (u.mobile && u.mobile === email));
      const userMobile = String(x.mobile || (pending && pending.mobile) || '').trim();
      if(!user){
        const userName = String(x.name || (pending && pending.name) || email.split('@')[0]).trim() || 'Volterax Customer';
        const userRef = (pending && pending.ref) || '';
        const hp = hashPassword(crypto.randomBytes(16).toString('hex'));
        const idv = id('VX');
        user = {
          id: idv,
          name: userName,
          email: email,
          mobile: userMobile,
          passwordHash: hp.hash,
          passwordSalt: hp.salt,
          ref: 'VX' + crypto.randomBytes(4).toString('hex').toUpperCase(),
          referredBy: userRef && db.users.some(v => v.ref === userRef) ? userRef : null,
          createdAt: now(),
          lastLoginAt: now()
        };
        db.users.push(user);
      } else {
        user.lastLoginAt = now();
        if(x.name && (!user.name || user.name === 'Customer')) user.name = String(x.name).trim();
        if(userMobile && !user.mobile) user.mobile = userMobile;
      }

      const sid = crypto.randomBytes(32).toString('hex');
      db.sessions[sid] = { userId: user.id, expires: Date.now() + SESSION_TTL };
      save();
      syncRelational('customer', user);

      return json(res, 200, customerBundle(user), { 'Set-Cookie': cookie('vx_session', sid, SESSION_TTL / 1000) });
    }

    if(req.method==='POST'&&p==='/api/customer/signup'){
    const x=await body(req);
    const name=String(x.name||'').trim();
    const email=String(x.email||x.gmail||'').trim().toLowerCase();
    let mobile=String(x.mobile||'').replace(/\D/g,'');
    if(mobile.length===12&&mobile.startsWith('91')) mobile=mobile.slice(2);
    if(mobile.length===11&&mobile.startsWith('0')) mobile=mobile.slice(1);
    const password=String(x.password||'');
    const ref=String(x.ref||'').trim().toUpperCase();

    if(name.length<2) return json(res,400,{error:'Please enter your full name (at least 2 characters).'});
    if(password.length<6) return json(res,400,{error:'Password must be at least 6 characters.'});

    const emailCheck = await validateEmailServer(email, true);
    if(!emailCheck.valid) return json(res,400,{error: emailCheck.error});

    if(mobile){
      const mobCheck = validateIndianMobile(mobile);
      if(!mobCheck.valid) return json(res,400,{error: mobCheck.error});
      mobile = mobCheck.mobile;
    }
    if(email && db.users.some(v=>(v.email&&v.email.toLowerCase()===email)||(v.mobile===email))){
      return json(res,409,{error:'Email already registered. Please sign in.'});
    }
    if(mobile && db.users.some(v=>v.mobile===mobile)){
      return json(res,409,{error:'Mobile already registered. Please sign in.'});
    }
    if(ref&&!db.users.some(v=>v.ref===ref))return json(res,400,{error:'Referral code not found.'});
    const hp=hashPassword(password);
    const idv=id('VX');
    const user={
      id:idv,
      name,
      email:email||'',
      mobile:mobile||'',
      passwordHash:hp.hash,
      passwordSalt:hp.salt,
      ref:'VX'+crypto.randomBytes(4).toString('hex').toUpperCase(),
      referredBy:ref||null,
      createdAt:now(),
      lastLoginAt:now()
    };
    db.users.push(user);
    const sid=crypto.randomBytes(32).toString('hex');
    db.sessions[sid]={userId:idv,expires:Date.now()+SESSION_TTL};
    save();
    syncRelational('customer', user);
    return json(res,200,customerBundle(user),{'Set-Cookie':cookie('vx_session',sid,SESSION_TTL/1000)});
  }
  if(req.method==='POST'&&p==='/api/customer/login'){
    const x=await body(req);
    const input=String(x.email||x.gmail||x.mobile||'').trim().toLowerCase();
    let cleanMob=input.replace(/\D/g,'');
    if(cleanMob.length===12&&cleanMob.startsWith('91')) cleanMob=cleanMob.slice(2);
    if(cleanMob.length===11&&cleanMob.startsWith('0')) cleanMob=cleanMob.slice(1);
    const password=String(x.password||'');

    const user=db.users.find(v=>(v.email&&v.email.toLowerCase()===input)||(v.mobile&&v.mobile===input)||(cleanMob&&v.mobile===cleanMob));
    if(!user||!checkPassword(password,user))return json(res,401,{error:'Incorrect Gmail/Email address or password.'});
    user.lastLoginAt=now();
    const sid=crypto.randomBytes(32).toString('hex');
    db.sessions[sid]={userId:user.id,expires:Date.now()+SESSION_TTL};
    save();
    syncRelational('customer', user);
    return json(res,200,customerBundle(user),{'Set-Cookie':cookie('vx_session',sid,SESSION_TTL/1000)});
  }
  if(req.method==='POST'&&p==='/api/customer/logout'){const sid=cookies(req).vx_session;if(sid)delete db.sessions[sid];save();return json(res,200,{ok:true},{'Set-Cookie':cookie('vx_session','',0)})}
  if(req.method==='POST'&&p==='/api/customer/feedback'){const x=await body(req);const c=customer(req);const name=String(x.name||c?.name||'').trim(),message=String(x.feedbackText||'').trim(),rating=Number(x.rating);if(!name||!message||rating<1||rating>5)return json(res,400,{error:'Invalid feedback.'});const item={id:id('FB'),userId:c?.id||null,name,rating,feedbackText:message,createdAt:now(),status:'new'};db.feedback.unshift(item);save();syncRelational('feedback', item);return json(res,201,{ok:true,id:item.id})}
  if(req.method==='POST'&&p==='/api/customer/lead'){
    const c=requireCustomer(req,res);
    if(!c)return;
    const x=await body(req);
    const rawMob = String(x.mobile || c.mobile || '');
    const mobCheck = validateIndianMobile(rawMob);
    if(!mobCheck.valid) return json(res, 400, { error: mobCheck.error });
    const item={id:id('LD'),userId:c.id,name:c.name,mobile:mobCheck.mobile,message:String(x.message||'').slice(0,5000),createdAt:now(),status:'new'};
    db.leads.unshift(item);
    save();
    syncRelational('lead', item);
    return json(res,201,{ok:true,id:item.id});
  }
  if(req.method==='POST'&&p==='/api/customer/order'){const c=requireCustomer(req,res);if(!c)return;const x=await body(req);const title=String(x.title||'VOLTERAX PROJECT').slice(0,200).trim();if(!title)return json(res,400,{error:'Project title is required.'});const item={id:id('ORD'),order_id:String(x.order_id||id('VX-ORD-')),userId:c.id,title:title,amount_paise:Number(x.amount_paise||0),status:String(x.status||'pending'),details:String(x.details||'Custom commissioned hardware prototype').slice(0,5000),createdAt:now(),updatedAt:now()};db.orders.unshift(item);save();syncRelational('order', item);return json(res,201,{ok:true,order:item})}
  // Admin
  if(req.method==='POST'&&p==='/api/admin/login'){const x=await body(req);if(String(x.email||'').toLowerCase()!==ADMIN_EMAIL||String(x.password||'')!==ADMIN_PASSWORD)return json(res,401,{error:'Invalid admin credentials.'});const sid=crypto.randomBytes(32).toString('hex');db.adminSessions[sid]={expires:Date.now()+SESSION_TTL};save();return json(res,200,{ok:true},{'Set-Cookie':cookie('vx_admin',sid,SESSION_TTL/1000)})}
  if(req.method==='POST'&&p==='/api/admin/logout'){const sid=cookies(req).vx_admin;if(sid)delete db.adminSessions[sid];save();return json(res,200,{ok:true},{'Set-Cookie':cookie('vx_admin','',0)})}
  if(p.startsWith('/api/admin/')){if(!requireAdmin(req,res))return;
    if(req.method==='GET'&&p==='/api/admin/summary')return json(res,200,{customers:db.users.length,orders:db.orders.length,feedback:db.feedback.length,newFeedback:db.feedback.filter(x=>x.status==='new').length,leads:db.leads.length,newLeads:db.leads.filter(x=>x.status==='new').length,revenuePaise:db.orders.reduce((a,o)=>a+Number(o.amount_paise||0),0),projects:(db.projects||[]).length,updatedAt:now()});
    if(req.method==='GET'&&(p==='/api/admin/projects'||p==='/api/admin/project'))return json(res,200,db.projects||[]);
    if(req.method==='PATCH'&&(p.startsWith('/api/admin/projects/')||p.startsWith('/api/admin/project/'))){
      const rawPid=decodeURIComponent(p.split('/').pop());
      const pid=rawPid.toUpperCase().replace(/\s+/g,'');
      const x=await body(req);
      const proj=(db.projects||[]).find(v=>(v.id&&v.id.toUpperCase().replace(/\s+/g,'')===pid)||(v.code&&v.code.toUpperCase().replace(/\s+/g,'')===pid));
      if(!proj)return json(res,404,{error:'Project not found: '+rawPid});
      if(x.price!==undefined)proj.price=Number(x.price);
      if(x.title!==undefined)proj.title=String(x.title).trim();
      if(x.category!==undefined)proj.category=String(x.category).trim().toUpperCase();
      if(x.description!==undefined)proj.description=String(x.description).trim();
      if(x.image!==undefined)proj.image=String(x.image).trim();
      if(x.status!==undefined)proj.status=String(x.status);
      if(x.featured!==undefined)proj.featured=Boolean(x.featured);
      proj.updatedAt=now();
      save();
      syncRelational('project', proj);
      return json(res,200,{ok:true,project:proj});
    }
    if(req.method==='POST'&&(p==='/api/admin/projects'||p==='/api/admin/project')){
      const x=await body(req);
      const newId=x.id||id('VX-');
      const item={
        id:newId,
        code:x.code||('VX / '+newId),
        title:String(x.title||'New Hardware Project').trim(),
        category:String(x.category||'HARDWARE').toUpperCase(),
        description:String(x.description||'').trim(),
        image:String(x.image||''),
        price:Number(x.price||0),
        status:String(x.status||'active'),
        featured:Boolean(x.featured),
        createdAt:now(),
        updatedAt:now()
      };
      if(!db.projects)db.projects=[];
      db.projects.unshift(item);
      save();
      syncRelational('project', item);
      return json(res,201,{ok:true,project:item});
    }
    if(req.method==='DELETE'&&(p.startsWith('/api/admin/projects/')||p.startsWith('/api/admin/project/'))){
      const rawPid=decodeURIComponent(p.split('/').pop());
      const pid=rawPid.toUpperCase().replace(/\s+/g,'');
      const idx=(db.projects||[]).findIndex(v=>(v.id&&v.id.toUpperCase().replace(/\s+/g,'')===pid)||(v.code&&v.code.toUpperCase().replace(/\s+/g,'')===pid));
      if(idx===-1)return json(res,404,{error:'Project not found.'});
      const removed=db.projects.splice(idx,1)[0];
      save();
      syncRelational('delete_project', removed);
      return json(res,200,{ok:true,deleted:removed});
    }
    if(req.method==='GET'&&p==='/api/admin/customers')return json(res,200,db.users.map(safeUser));
    if(req.method==='GET'&&p==='/api/admin/orders')return json(res,200,db.orders.map(o=>({...o,user:db.users.find(u=>u.id===o.userId)?.name||'Unknown',mobile:db.users.find(u=>u.id===o.userId)?.mobile||''})));
    if(req.method==='GET'&&p==='/api/admin/feedback')return json(res,200,db.feedback.map(f=>({...f,customer:db.users.find(u=>u.id===f.userId)?.name||f.name,mobile:db.users.find(u=>u.id===f.userId)?.mobile||''})));
    if(req.method==='GET'&&p==='/api/admin/leads')return json(res,200,db.leads.map(l=>({...l,customer:db.users.find(u=>u.id===l.userId)?.name||l.name})));
    if(req.method==='POST'&&p==='/api/admin/order'){const x=await body(req);const user=db.users.find(v=>v.id===x.userId||v.mobile===String(x.mobile||'').replace(/\D/g,''));if(!user)return json(res,404,{error:'Customer not found.'});const item={id:id('ORD'),order_id:String(x.order_id||id('VX-ORD-')),userId:user.id,title:String(x.title||'VOLTERAX PROJECT').slice(0,200),amount_paise:Number(x.amount_paise||0),status:String(x.status||'pending'),details:String(x.details||'').slice(0,5000),createdAt:now(),updatedAt:now()};db.orders.unshift(item);save();syncRelational('order', item);return json(res,201,{ok:true,order:item})}
    if(req.method==='PATCH'&&p.startsWith('/api/admin/order/')){const oid=p.split('/').pop();const x=await body(req);const o=db.orders.find(v=>v.id===oid||v.order_id===oid);if(!o)return json(res,404,{error:'Order not found.'});for(const k of ['title','status','details'])if(x[k]!==undefined)o[k]=String(x[k]);if(x.amount_paise!==undefined)o.amount_paise=Number(x.amount_paise);o.updatedAt=now();save();syncRelational('order', o);return json(res,200,{ok:true,order:o})}
    if(req.method==='PATCH'&&p.startsWith('/api/admin/feedback/')){const fid=p.split('/').pop();const x=await body(req);const f=db.feedback.find(v=>v.id===fid);if(!f)return json(res,404,{error:'Feedback not found.'});if(x.status)f.status=String(x.status);save();syncRelational('feedback', f);return json(res,200,{ok:true,feedback:f})}
    if(req.method==='PATCH'&&p.startsWith('/api/admin/lead/')){const lid=p.split('/').pop();if(!lid||!/^LD[A-Za-z0-9_-]+$/.test(lid))return json(res,400,{error:'Invalid lead ID format.'});const x=await body(req);const allowed=['new','contacted','quoted','closed'];const status=String(x.status||'').toLowerCase().trim();if(!allowed.includes(status))return json(res,400,{error:'Invalid status. Allowed: '+allowed.join(', ')});const l=db.leads.find(v=>v.id===lid);if(!l)return json(res,404,{error:'Lead not found.'});l.status=status;l.updatedAt=now();save();syncRelational('lead', l);return json(res,200,{ok:true,lead:l})}
  }
  if(req.method==='GET'&&p==='/admin'){return serveFile(res,path.join(__dirname,'public','admin.html'),'text/html; charset=utf-8')}
  if(req.method==='GET'&&p==='/admin/login'){return serveFile(res,path.join(__dirname,'public','admin.html'),'text/html; charset=utf-8')}
  if(req.method==='GET'){let fp;if(p==='/'||p==='/index.html')fp=path.join(__dirname,'public','index.html');else if(p==='/projects'||p==='/projects.html')fp=path.join(__dirname,'public','projects.html');else if(p==='/privacy'||p==='/privacy.html')fp=path.join(__dirname,'public','privacy.html');else if(p==='/terms'||p==='/terms.html')fp=path.join(__dirname,'public','terms.html');else if(p==='/refund'||p==='/refund.html'||p==='/cancellation'||p==='/cancellation.html')fp=path.join(__dirname,'public','refund.html');else if(p.startsWith('/assets/'))fp=path.join(__dirname,'public',p);else if(fs.existsSync(path.join(__dirname,'public',p.slice(1))))fp=path.join(__dirname,'public',p.slice(1));else return json(res,404,{error:'Not found'});return serveFile(res,fp)}
  json(res,404,{error:'Not found'});
 }catch(e){console.error(e);json(res,500,{error:'Server error.'})}
}
function serveFile(res,fp,type){if(!fs.existsSync(fp))return json(res,404,{error:'File not found'});const ext=path.extname(fp);const ct=type||({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json'}[ext]||'application/octet-stream');res.writeHead(200,{'Content-Type':ct,'Cache-Control':'no-cache'});fs.createReadStream(fp).pipe(res)}
http.createServer(route).listen(PORT,HOST,()=>{
  console.log(`VOLTERAX platform running on http://${HOST==='0.0.0.0'?'localhost':HOST}:${PORT}`);
  initDb().catch(e=>console.error('[VolteraX] Startup DB error:',e.message));
});
