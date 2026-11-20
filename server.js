
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

const FAKE_PINCODES = new Set([
  '000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999',
  '123456', '654321', '012345', '234567', '345678', '456789', '987654', '876543', '765432', '543210',
  '100000', '200000', '300000', '400000', '500000', '600000', '700000', '800000', '900000',
  '121212', '131313', '141414', '151515', '161616', '171717', '181818', '191919', '202020',
  '565656', '575757', '585858', '595959', '999990', '123123', '654654'
]);

const pincodeCache = new Map();

async function validateIndianPincodeServer(raw) {
  const pin = String(raw || '').replace(/\D/g, '').trim();
  if (!pin) return { valid: false, error: 'PIN code is required.' };
  if (pin.length !== 6) return { valid: false, error: 'PIN code must be exactly 6 digits (you entered ' + pin.length + ').' };
  
  if (!/^[1-8][0-9]{5}$/.test(pin)) {
    return { valid: false, error: 'Invalid Indian PIN code format (must start with digits 1 to 8).' };
  }

  if (FAKE_PINCODES.has(pin) || /^(\d)\1{5}$/.test(pin)) {
    return { valid: false, error: 'Fake or dummy PIN code rejected (' + pin + '). Please enter an official Indian postal code.' };
  }

  const p2 = parseInt(pin.slice(0, 2), 10);
  const invalid2Digits = [10, 29, 35, 54, 55, 65, 66, 86, 87, 88, 89];
  if (invalid2Digits.includes(p2)) {
    return { valid: false, error: 'Invalid postal zone (' + pin + '). No India Post circle exists with this prefix.' };
  }

  if (pincodeCache.has(pin)) {
    return pincodeCache.get(pin);
  }

  try {
    const res = await fetch('https://api.postalpincode.in/pincode/' + pin, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0] && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        const state = po.State || '';
        const isKarnataka = state.toLowerCase() === 'karnataka' || ['56', '57', '58', '59'].includes(pin.slice(0, 2));
        const result = {
          valid: true,
          pincode: pin,
          office: po.Name,
          district: po.District,
          state: state,
          isKarnataka,
          deliveryDays: isKarnataka ? '2–4 Days' : '4–7 Days',
          hub: isKarnataka ? 'Karnataka Fast-Track Dispatch (Bengaluru Hub)' : 'Pan-India Insured Express'
        };
        pincodeCache.set(pin, result);
        return result;
      } else {
        const result = { valid: false, error: 'No official India Post office found for PIN code ' + pin + '. Please enter a genuine postal code.' };
        pincodeCache.set(pin, result);
        return result;
      }
    }
  } catch (err) {
    const isKarnataka = ['56', '57', '58', '59'].includes(pin.slice(0, 2));
    return {
      valid: true,
      pincode: pin,
      office: '',
      district: '',
      state: isKarnataka ? 'Karnataka' : 'India',
      isKarnataka,
      deliveryDays: isKarnataka ? '2–4 Days' : '4–7 Days',
      hub: isKarnataka ? 'Karnataka Fast-Track (Bengaluru Hub)' : 'Pan-India Express',
      fallback: true
    };
  }

  return { valid: false, error: 'Unable to verify postal pincode. Please check and try again.' };
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
const DEFAULT_DB = Buffer.from('cG9zdGdyZXNxbDovL3Bvc3RncmVzOiUyM0NoYW5kYW4uMzYwQGRiLmFyd3d3Y2ZneGl1aHJrcWV2ZG92LnN1cGFiYXNlLmNvOjU0MzIvcG9zdGdyZXM=','base64').toString('utf8');
const ADMIN_EMAIL=(process.env.ADMIN_EMAIL||'srinivasvm1122@gmail.com').toLowerCase();
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||Buffer.from('ODEwNTIyNzY0NA==','base64').toString('utf8');
const SESSION_TTL=1000*60*60*24*7;
const MONGODB_URI=process.env.MONGODB_URI||'';
const MONGODB_DB=process.env.MONGODB_DB||'volterax';
const SUPABASE_URL=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||'https://arwwwcfgxiuhrkqevdov.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_zkN2gnKmhUXwbGiuorYyKQ_-mURTLot';
const DATABASE_URL=process.env.DATABASE_URL||process.env.SUPABASE_DB_URL||DEFAULT_DB;
const pgPool=DATABASE_URL&&PgPool?new PgPool({connectionString:DATABASE_URL,ssl:{rejectUnauthorized:false},connectionTimeoutMillis:5000,idleTimeoutMillis:10000}):null;
const mongoClient=MONGODB_URI?new MongoClient(MONGODB_URI):null;
let db=blank(),storeDoc;
function blank(){return {users:[],orders:[],feedback:[],leads:[],sessions:{},adminSessions:{},projects:[]}}
async function initDb(){
  if(pgPool){
    try{
      console.log('[VolteraX] Connecting to Supabase PostgreSQL (arwwwcfgxiuhrkqevdov)...');
      await pgPool.query(`CREATE TABLE IF NOT EXISTS volterax_store (id VARCHAR(64) PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());`);
      try {
        await pgPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;`);
      } catch(_) {}
      const r=await pgPool.query(`SELECT data FROM volterax_store WHERE id = 'main'`);
      if(r.rows.length===0){
        await pgPool.query(`INSERT INTO volterax_store (id, data, updated_at) VALUES ('main', $1, NOW())`,[JSON.stringify(db)]);
      } else {
        db=r.rows[0].data||blank();
        for(const k of Object.keys(blank()))if(db[k]==null)db[k]=blank()[k];
      }
      try{
        const pR=await pgPool.query(`SELECT * FROM projects ORDER BY id ASC`);
        if(pR.rows&&pR.rows.length>0) db.projects=pR.rows;
      }catch(_){}
      console.log(`[VolteraX] PostgreSQL connected! Users: ${db.users.length}, Orders: ${db.orders.length}, Projects: ${db.projects?.length||0}`);
      return;
    }catch(err){
      globalThis.__lastDbError = err.message + ' | stack: ' + err.stack;
      console.error('[VolteraX] PostgreSQL init error:', err.message);
    }
  }
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
  if (pgPool) {
    try {
      if (type === 'customer') {
        await pgPool.query(`
          INSERT INTO customers (id, name, email, mobile, referral_code, referred_by, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            mobile = EXCLUDED.mobile,
            referral_code = EXCLUDED.referral_code;
        `, [item.id, item.name, item.email || null, item.mobile || null, item.ref, item.referredBy || null, item.createdAt || new Date()]);
      } else if (type === 'order') {
        const addrJson = item.shipping_address ? JSON.stringify(item.shipping_address) : null;
        try {
          await pgPool.query(`
            INSERT INTO orders (id, order_id, user_id, title, amount_paise, status, details, shipping_address, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              amount_paise = EXCLUDED.amount_paise,
              status = EXCLUDED.status,
              details = EXCLUDED.details,
              shipping_address = EXCLUDED.shipping_address,
              updated_at = NOW();
          `, [item.id, item.order_id || item.id, item.userId, item.title, Number(item.amount_paise || 0), item.status || 'pending', item.details || '', addrJson, item.createdAt || new Date(), item.updatedAt || new Date()]);
        } catch(pgErr) {
          await pgPool.query(`
            INSERT INTO orders (id, order_id, user_id, title, amount_paise, status, details, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              amount_paise = EXCLUDED.amount_paise,
              status = EXCLUDED.status,
              details = EXCLUDED.details,
              updated_at = NOW();
          `, [item.id, item.order_id || item.id, item.userId, item.title, Number(item.amount_paise || 0), item.status || 'pending', item.details || '', item.createdAt || new Date(), item.updatedAt || new Date()]);
        }
      } else if (type === 'lead') {
        await pgPool.query(`
          INSERT INTO leads (id, user_id, name, mobile, message, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status;
        `, [item.id, item.userId || null, item.name, item.mobile, item.message, item.status || 'new', item.createdAt || new Date()]);
      } else if (type === 'feedback') {
        await pgPool.query(`
          INSERT INTO feedback (id, user_id, name, rating, message, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status;
        `, [item.id, item.userId || null, item.name, Number(item.rating || 5), item.feedbackText || item.message, item.status || 'new', item.createdAt || new Date()]);
      } else if (type === 'project') {
        await pgPool.query(`
          INSERT INTO projects (id, code, title, category, price, image, specs, features, badge, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            category = EXCLUDED.category,
            price = EXCLUDED.price,
            image = EXCLUDED.image;
        `, [item.id, item.code || item.id, item.title, item.category || 'HARDWARE', Number(item.price || 0), item.image || '', JSON.stringify(item.specs || []), JSON.stringify(item.features || []), item.badge || '', item.createdAt || new Date()]);
      } else if (type === 'delete_project') {
        await pgPool.query(`DELETE FROM projects WHERE id = $1`, [item.id]);
      }
    } catch (pgSyncErr) {
      console.warn('[pgPool Sync Warning]', pgSyncErr.message);
    }
  }
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
  if(req.method==='GET' && (p.startsWith('/api/pincode/') || p==='/api/validate-pincode')){
    let pin = '';
    if(p.startsWith('/api/pincode/')) pin = p.slice(13);
    else pin = u.searchParams.get('pincode') || u.searchParams.get('pin') || '';
    const result = await validateIndianPincodeServer(pin);
    const code = result.valid ? 200 : 400;
    return json(res, code, result, {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400'
    });
  }
  if(req.method==='GET'&&p==='/api/projects'){
    if(pgPool){
      try{
        const pRes=await pgPool.query('SELECT * FROM projects ORDER BY id ASC');
        if(pRes.rows && pRes.rows.length>0){
          db.projects=pRes.rows;
          return json(res,200,pRes.rows,{'Cache-Control':'no-cache, no-store, must-revalidate','Pragma':'no-cache','Expires':'0','Access-Control-Allow-Origin':'*'});
        }
      }catch(err){
        console.warn('[VolteraX] Live projects pgPool fetch fallback:', err.message);
      }
    }
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
  if(req.method==='POST'&&p==='/api/customer/order'){
    const c=requireCustomer(req,res);
    if(!c)return;
    const x=await body(req);
    const title=String(x.title||'VOLTERAX PROJECT').slice(0,200).trim();
    if(!title)return json(res,400,{error:'Project title is required.'});

    let shipping_address = null;
    if(x.shipping_address && typeof x.shipping_address === 'object'){
      const sa = x.shipping_address;
      shipping_address = {
        street: String(sa.street || sa.address || '').slice(0, 500).trim(),
        city: String(sa.city || '').slice(0, 100).trim(),
        state: String(sa.state || 'Karnataka').slice(0, 100).trim(),
        pincode: String(sa.pincode || '').replace(/\D/g, '').slice(0, 6),
        phone: String(sa.phone || c.mobile || '').replace(/\D/g, '').slice(0, 10),
        landmark: String(sa.landmark || '').slice(0, 200).trim(),
        updatedAt: now()
      };
    } else if(typeof x.shipping_address === 'string' && x.shipping_address.trim()){
      shipping_address = {
        street: x.shipping_address.trim(),
        city: '',
        state: 'Karnataka',
        pincode: '',
        phone: c.mobile || '',
        landmark: '',
        updatedAt: now()
      };
    }

    if(shipping_address && shipping_address.pincode){
      const pinCheck = await validateIndianPincodeServer(shipping_address.pincode);
      if(!pinCheck.valid) return json(res, 400, { error: pinCheck.error });
      if(pinCheck.district && (!shipping_address.city || shipping_address.city.length < 2)) shipping_address.city = pinCheck.district;
      if(pinCheck.state && !shipping_address.state) shipping_address.state = pinCheck.state;
    }

    const item={
      id:id('ORD'),
      order_id:String(x.order_id||id('VX-ORD-')),
      userId:c.id,
      title:title,
      amount_paise:Number(x.amount_paise||0),
      status:String(x.status||'pending'),
      details:String(x.details||'Custom commissioned hardware prototype').slice(0,5000),
      shipping_address: shipping_address,
      createdAt:now(),
      updatedAt:now()
    };
    db.orders.unshift(item);
    save();
    syncRelational('order', item);
    return json(res,201,{ok:true,order:item});
  }

  // Customer Delivery Address Update Endpoint
  if((req.method==='PATCH'||req.method==='POST') && (p.startsWith('/api/customer/order/') || p==='/api/customer/order/address')){
    if(p.endsWith('/address') || p==='/api/customer/order/address'){
      const c=requireCustomer(req,res);
      if(!c)return;
      const x=await body(req);
      let targetOid = x.orderId || x.order_id || x.id;
      if(!targetOid && p.startsWith('/api/customer/order/')){
        const segs = p.split('/');
        targetOid = segs[4]; // /api/customer/order/:orderId/address
      }
      if(!targetOid) return json(res, 400, { error: 'Order ID is required.' });

      const order = db.orders.find(o => (o.id === targetOid || o.order_id === targetOid) && o.userId === c.id);
      if(!order) return json(res, 404, { error: 'Order not found or unauthorized.' });

      const street = String(x.street || x.address || '').slice(0, 500).trim();
      const city = String(x.city || '').slice(0, 100).trim();
      const state = String(x.state || 'Karnataka').slice(0, 100).trim();
      const pincode = String(x.pincode || '').replace(/\D/g, '').slice(0, 6);
      const phone = String(x.phone || c.mobile || '').replace(/\D/g, '').slice(0, 10);
      const landmark = String(x.landmark || '').slice(0, 200).trim();

      if(!street || street.length < 4) return json(res, 400, { error: 'Please enter your complete house/flat and street address.' });
      if(!city || city.length < 2) return json(res, 400, { error: 'Please enter your city or town name.' });
      if(!pincode || pincode.length !== 6) return json(res, 400, { error: 'Please enter a valid 6-digit postal PIN code.' });

      const pinCheck = await validateIndianPincodeServer(pincode);
      if(!pinCheck.valid) return json(res, 400, { error: pinCheck.error });

      order.shipping_address = {
        street,
        city,
        state,
        pincode,
        phone,
        landmark,
        updatedAt: now()
      };
      order.updatedAt = now();
      save();
      syncRelational('order', order);
      return json(res, 200, { ok: true, order, message: 'Delivery address saved successfully.' });
    }
  }
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
    if(req.method==='POST'&&p==='/api/admin/order'){const x=await body(req);const user=db.users.find(v=>v.id===x.userId||v.mobile===String(x.mobile||'').replace(/\D/g,''));if(!user)return json(res,404,{error:'Customer not found.'});const item={id:id('ORD'),order_id:String(x.order_id||id('VX-ORD-')),userId:user.id,title:String(x.title||'VOLTERAX PROJECT').slice(0,200),amount_paise:Number(x.amount_paise||0),status:String(x.status||'pending'),details:String(x.details||'').slice(0,5000),shipping_address:x.shipping_address||null,createdAt:now(),updatedAt:now()};db.orders.unshift(item);save();syncRelational('order', item);return json(res,201,{ok:true,order:item})}
    if(req.method==='PATCH'&&p.startsWith('/api/admin/order/')){const oid=p.split('/').pop();const x=await body(req);const o=db.orders.find(v=>v.id===oid||v.order_id===oid);if(!o)return json(res,404,{error:'Order not found.'});for(const k of ['title','status','details'])if(x[k]!==undefined)o[k]=String(x[k]);if(x.amount_paise!==undefined)o.amount_paise=Number(x.amount_paise);if(x.shipping_address!==undefined)o.shipping_address=x.shipping_address;o.updatedAt=now();save();syncRelational('order', o);return json(res,200,{ok:true,order:o})}
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
