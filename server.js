
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

const KARNATAKA_DISTRICTS = {
  "Bagalkote": ["Bagalkote", "Badami", "Bilagi", "Hungund", "Jamkhandi", "Mudhol", "Guledagudda", "Rabkavi Banhatti", "Ilkal"],
  "Ballari": ["Ballari", "Kurugodu", "Kampli", "Sanduru", "Siraguppa"],
  "Belagavi": ["Belagavi", "Athani", "Bailhongal", "Chikkodi", "Gokak", "Hukkeri", "Khanapur", "Ramdurg", "Raybag", "Saundatti (Yaragatti)", "Kagawad", "Mudalgi", "Kittur", "Nippani"],
  "Bengaluru Rural": ["Devanahalli", "Doddaballapura", "Hosakote", "Nelamangala"],
  "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Yelahanka", "Anekal"],
  "Bidar": ["Bidar", "Basavakalyan", "Bhalki", "Homnabad", "Aurad", "Hulsoor", "Kamalnagar"],
  "Chamarajanagar": ["Chamarajanagar", "Gundlupete", "Kollegala", "Yelandur", "Hanur"],
  "Chikkaballapura": ["Chikkaballapura", "Bagepalli", "Chintamani", "Gauribidanur", "Gudibanda", "Sidlaghatta", "Chelur"],
  "Chikkamagaluru": ["Chikkamagaluru", "Kadur", "Koppa", "Mudigere", "Narasimharajapura", "Sringeri", "Tarikere", "Ajjampura", "Kalasa"],
  "Chitradurga": ["Chitradurga", "Challakere", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
  "Dakshina Kannada": ["Mangaluru", "Bantwal", "Belthangady", "Puttur", "Sullia", "Moodabidri", "Kadaba", "Ullal"],
  "Davanagere": ["Davanagere", "Harihara", "Honnali", "Channagiri", "Jagalur", "Nyamathi"],
  "Dharwad": ["Dharwad", "Hubballi (Urban)", "Hubballi (Rural)", "Kalghatgi", "Kundgol", "Navalgund", "Alnavar", "Annigeri"],
  "Gadag": ["Gadag", "Nargund", "Ron", "Shirahatti", "Mundargi", "Gajendragad", "Lakshmeshwar"],
  "Hassan": ["Hassan", "Alur", "Arkalgud", "Arsikere", "Belur", "Channarayapatna", "Holenarasipura", "Sakleshpur"],
  "Haveri": ["Haveri", "Byadgi", "Hangal", "Hirekerur", "Ranebennur", "Shiggaon", "Savanur", "Rattihalli"],
  "Kalaburagi": ["Kalaburagi", "Afzalpur", "Aland", "Chincholi", "Chitapur", "Jevargi", "Sedam", "Kamalapur", "Shahabad", "Kalagi", "Yedrami"],
  "Kodagu": ["Madikeri", "Somwarpet", "Virajpet", "Kushalnagar", "Ponnampet"],
  "Kolar": ["Kolar", "Bangarapet", "Malur", "Mulbagal", "Srinivaspur", "KGF (Robertsonpet)"],
  "Koppal": ["Koppal", "Gangavathi", "Kushtagi", "Yelburga", "Karatagi", "Kanakagiri", "Kukanoor"],
  "Mandya": ["Mandya", "Maddur", "Malavalli", "Pandavapura", "Nagamangala", "Krishnarajpet (K.R. Pet)", "Srirangapatna"],
  "Mysuru": ["Mysuru", "Hunsur", "Krishnarajanagara (K.R. Nagar)", "Nanjangud", "Heggadadevankote (H.D. Kote)", "Piriyapatna", "Tirumakudalu Narasipura (T. Narasipura)", "Saragur", "Saligrama"],
  "Raichur": ["Raichur", "Devadurga", "Lingsugur", "Manvi", "Sindhanur", "Maski", "Sirwar"],
  "Ramanagara": ["Ramanagara", "Channapatna", "Kanakapura", "Magadi", "Harohalli"],
  "Shivamogga": ["Shivamogga", "Bhadravathi", "Hosanagara", "Sagara", "Shikaripura", "Soraba", "Thirthahalli"],
  "Tumakuru": ["Tumakuru", "Chikkanayakanahalli", "Gubbi", "Koratagere", "Kunigal", "Madhugiri", "Pavagada", "Sira", "Tiptur", "Turuvekere"],
  "Udupi": ["Udupi", "Karkala", "Kundapura", "Brahmavara", "Byndoor", "Hebri", "Kaup"],
  "Uttara Kannada": ["Karwar", "Ankola", "Bhatkal", "Haliyal", "Honnavar", "Joida (Supa)", "Kumta", "Mundgod", "Siddapur", "Sirsi", "Yellapur", "Dandeli"],
  "Vijayapura": ["Vijayapura", "Basavana Bagewadi", "Indi", "Muddebihal", "Sindagi", "Babaleshwar", "Chadchan", "Devar Hippargi", "Nidagundi", "Tikota", "Kolhar", "Almel"],
  "Yadgir": ["Yadgir", "Shahapur", "Shorapur", "Gurmitkal", "Hunasagi", "Wadgera"],
  "Vijayanagara": ["Hosapete", "Harapanahalli", "Hoovina Hadagali", "Hagaribommanahalli", "Kotturu", "Kudligi"]
};


const VOLTERAX_MERCHANT_CONFIG = {
  phone: '6364900748',
  upi_vpa: process.env.VOLTERAX_UPI_VPA || '6364900748@ybl',
  upi_alt_vpa: '6364900748@ibl',
  merchant_name: 'VOLTERAX HARDWARE SYSTEMS',
  payment_mode: 'ONLINE_ONLY'
};

function generateOrderPaymentPayload(order) {
  const amountRs = Math.max(1, (Number(order.amount_paise || 0) / 100));
  const orderRef = String(order.order_id || order.id || 'VX-ORDER');
  const merchantName = VOLTERAX_MERCHANT_CONFIG.merchant_name;
  const vpa = VOLTERAX_MERCHANT_CONFIG.upi_vpa;
  
  const upiQuery = new URLSearchParams({
    pa: vpa,
    pn: merchantName,
    am: amountRs.toFixed(2),
    cu: 'INR',
    tn: orderRef
  }).toString();

  const upiUri = 'upi://pay?' + upiQuery;
  const phonepeUri = 'phonepe://pay?' + upiQuery;
  const gpayUri = 'gpay://upi/pay?' + upiQuery;
  const paytmUri = 'paytmmp://pay?' + upiQuery;
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=' + encodeURIComponent(upiUri);

  return {
    orderId: orderRef,
    title: order.title,
    amount: amountRs,
    currency: 'INR',
    paymentMode: 'ONLINE_ONLY',
    merchant: merchantName,
    upiUri,
    phonepeUri,
    gpayUri,
    paytmUri,
    qrUrl
  };
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
        const poList = data[0].PostOffice;
        const po = poList[0];
        const state = po.State || '';
        const isKarnataka = state.toLowerCase() === 'karnataka' || ['56', '57', '58', '59'].includes(pin.slice(0, 2));
        const offices = [...new Set(poList.map(p => p.Name).filter(Boolean))];
        const taluks = [...new Set(poList.map(p => p.Block || p.Taluk).filter(Boolean))];
        const taluk = taluks.length > 0 ? taluks.join(', ') : (po.Block || po.Taluk || po.District || '');
        const result = {
          valid: true,
          pincode: pin,
          office: po.Name,
          offices: offices,
          district: po.District,
          taluk: taluk,
          taluks: taluks,
          state: state,
          isKarnataka,
          deliveryDays: isKarnataka ? '2–4 Days' : '4–7 Days',
          hub: isKarnataka ? 'Karnataka Fast-Track Dispatch (All 31 Districts & 240 Taluks Covered)' : 'Pan-India Insured Express'
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
    console.warn('[Pincode Lookup Error]', pin, err.message);
  }

  // Graceful fallback for genuine custom addresses:
  // If pin is a standard 6-digit Indian PIN (starts with 1-8, not fake sequence or repeating digits), accept it
  if (/^[1-8][0-9]{5}$/.test(pin) && !FAKE_PINCODES.has(pin) && !/^(\d)\1{5}$/.test(pin)) {
    const isKarnataka = ['56', '57', '58', '59'].includes(pin.slice(0, 2));
    const fallback = {
      valid: true,
      pincode: pin,
      office: 'Local Postal Area',
      offices: [],
      district: isKarnataka ? 'Karnataka' : 'India',
      taluk: '',
      taluks: [],
      state: isKarnataka ? 'Karnataka' : 'India',
      isKarnataka,
      deliveryDays: isKarnataka ? '2–4 Days' : '4–7 Days',
      hub: isKarnataka ? 'Karnataka Fast-Track Dispatch (Doorstep Delivery)' : 'Pan-India Insured Express'
    };
    pincodeCache.set(pin, fallback);
    return fallback;
  }

  return { valid: false, error: 'Invalid or dummy PIN code (' + pin + '). Please enter a genuine 6-digit Indian postal code.' };
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

function loadSeedProjects() {
  try {
    const seedPath = path.join(__dirname, 'seed-projects.json');
    if (fs.existsSync(seedPath)) {
      const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn('[VolteraX] loadSeedProjects error:', err.message);
  }
  return [];
}

function matchProject(pList, rawId) {
  if (!Array.isArray(pList) || !rawId) return -1;
  const target = String(rawId).trim().toUpperCase();
  const cleanTarget = target.replace(/[^A-Z0-9]/g, '');
  const targetNum = target.replace(/\D/g, '');
  const targetNumVal = targetNum ? parseInt(targetNum, 10) : null;

  return pList.findIndex(v => {
    if (!v) return false;
    const vid = String(v.id || '').trim().toUpperCase();
    const vcode = String(v.code || '').trim().toUpperCase();
    const vtitle = String(v.title || '').trim().toLowerCase();

    if (vid === target || vcode === target) return true;

    const cleanId = vid.replace(/[^A-Z0-9]/g, '');
    const cleanCode = vcode.replace(/[^A-Z0-9]/g, '');
    if (cleanTarget && (cleanId === cleanTarget || cleanCode === cleanTarget)) return true;

    if (targetNumVal !== null) {
      const vNum1 = vid.replace(/\D/g, '');
      const vNum2 = vcode.replace(/\D/g, '');
      if (vNum1 && parseInt(vNum1, 10) === targetNumVal) return true;
      if (vNum2 && parseInt(vNum2, 10) === targetNumVal) return true;
    }

    if (vtitle && vtitle === String(rawId).trim().toLowerCase()) return true;

    return false;
  });
}

function ensureProjectsLoaded() {
  if (!Array.isArray(db.projects) || db.projects.length === 0) {
    const seeds = loadSeedProjects();
    if (seeds.length > 0) {
      db.projects = seeds;
      save();
    }
  }
}

function blank(){return {users:[],orders:[],feedback:[],leads:[],sessions:{},adminSessions:{},projects:[]}}
async function initDb(){
  if(pgPool){
    try{
      console.log('[VolteraX] Connecting to Supabase PostgreSQL (arwwwcfgxiuhrkqevdov)...');
      await pgPool.query(`CREATE TABLE IF NOT EXISTS volterax_store (id VARCHAR(64) PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());`);
      try {
        await pgPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;`);
        await pgPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;`);
        await pgPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof TEXT;`);
        await pgPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending_online';`);
        await pgPool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS mobile TEXT;`);
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
      // Always merge fresh orders from SQL table into db.orders so status changes and screenshots are 100% persistent!
      try {
        const oR = await pgPool.query(`SELECT * FROM orders ORDER BY created_at DESC`);
        if (oR.rows && oR.rows.length > 0) {
          const map = new Map();
          for (const o of (db.orders || [])) {
            map.set(o.id, o);
            if (o.order_id) map.set(o.order_id, o);
          }
          for (const row of oR.rows) {
            const existing = map.get(row.id) || map.get(row.order_id) || {};
            const sa = typeof row.shipping_address === 'object' && row.shipping_address ? row.shipping_address : (typeof existing.shipping_address === 'object' ? existing.shipping_address : {});
            const phone = row.mobile || existing.mobile || sa.phone || sa.mobile || '';
            const screenshot = row.payment_screenshot || row.payment_proof || existing.payment_screenshot || sa.payment_screenshot || null;
            const merged = {
              ...existing,
              id: row.id,
              order_id: row.order_id || row.id,
              userId: row.user_id || existing.userId,
              title: row.title || existing.title,
              amount_paise: Number(row.amount_paise || existing.amount_paise || 0),
              status: row.status || existing.status || 'pending',
              details: row.details || existing.details || '',
              shipping_address: row.shipping_address || existing.shipping_address || null,
              payment_screenshot: screenshot,
              payment_proof: screenshot,
              payment_status: row.payment_status || existing.payment_status || 'pending_online',
              mobile: phone,
              phone: phone,
              createdAt: row.created_at || existing.createdAt || new Date(),
              updatedAt: row.updated_at || existing.updatedAt || new Date()
            };
            map.set(row.id, merged);
            if (row.order_id) map.set(row.order_id, merged);
          }
          const seen = new Set();
          const finalOrders = [];
          for (const ord of map.values()) {
            if (!seen.has(ord.id)) {
              seen.add(ord.id);
              finalOrders.push(ord);
            }
          }
          // Only keep verified orders with uploaded payment screenshot
          db.orders = finalOrders.filter(ord => {
            const ss = ord.payment_screenshot || ord.payment_proof || (ord.shipping_address && ord.shipping_address.payment_screenshot) || '';
            return Boolean(ss && String(ss).trim().length > 15);
          });
          // Clean up legacy unverified orders with no payment screenshot in Postgres
          if (pgPool) {
            try {
              await pgPool.query(`
                DELETE FROM orders 
                WHERE (payment_screenshot IS NULL OR LENGTH(TRIM(payment_screenshot)) < 15)
                  AND (payment_proof IS NULL OR LENGTH(TRIM(payment_proof)) < 15)
              `);
            } catch(e) {}
          }
        }
      } catch(ordErr) {
        console.error('[VolteraX] Orders sync error on startup:', ordErr.message);
      }
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

  // Auto-repair order phone numbers
  if (Array.isArray(db.orders)) {
    for (const o of db.orders) {
      if (!o.mobile) {
        const user = (db.users || []).find(u => u.id === o.userId);
        const sa = typeof o.shipping_address === 'object' && o.shipping_address ? o.shipping_address : {};
        const p = o.phone || sa.phone || sa.mobile || user?.mobile || '';
        if (p) {
          o.mobile = p;
          o.phone = p;
        }
      }
    }
  }

  // Ensure projects are seeded
  ensureProjectsLoaded();
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
        const addrJson = item.shipping_address ? (typeof item.shipping_address === 'string' ? item.shipping_address : JSON.stringify(item.shipping_address)) : null;
        const sa = typeof item.shipping_address === 'object' && item.shipping_address ? item.shipping_address : {};
        const phone = item.mobile || item.phone || sa.phone || sa.mobile || '';
        const screenshot = item.payment_screenshot || item.payment_proof || sa.payment_screenshot || null;
        const payStatus = item.payment_status || 'pending_online';
        try {
          await pgPool.query(`
            INSERT INTO orders (id, order_id, user_id, title, amount_paise, status, details, shipping_address, payment_screenshot, payment_proof, payment_status, mobile, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              amount_paise = EXCLUDED.amount_paise,
              status = EXCLUDED.status,
              details = EXCLUDED.details,
              shipping_address = EXCLUDED.shipping_address,
              payment_screenshot = COALESCE(EXCLUDED.payment_screenshot, orders.payment_screenshot),
              payment_proof = COALESCE(EXCLUDED.payment_proof, orders.payment_proof),
              payment_status = EXCLUDED.payment_status,
              mobile = COALESCE(EXCLUDED.mobile, orders.mobile),
              updated_at = NOW();
          `, [item.id, item.order_id || item.id, item.userId, item.title, Number(item.amount_paise || 0), item.status || 'pending', item.details || '', addrJson, screenshot, screenshot, payStatus, phone, item.createdAt || new Date(), item.updatedAt || new Date()]);
        } catch(pgErr) {
          console.error('[Supabase Order Sync Error]', pgErr.message);
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
async function save(){
  const snapshot=JSON.parse(JSON.stringify(db));
  const tasks = [];
  if(pgPool){
    tasks.push(pgPool.query(`INSERT INTO volterax_store (id, data, updated_at) VALUES ('main', $1, NOW()) ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW();`,[JSON.stringify(snapshot)]).catch(e=>console.error('[Supabase PG Save Error]',e.message)));
  }
  if(SUPABASE_URL&&SUPABASE_KEY){
    tasks.push(fetch(`${SUPABASE_URL}/rest/v1/volterax_store?id=eq.main`,{
      method:'PATCH',
      headers:{
        'apikey':SUPABASE_KEY,
        'Authorization':`Bearer ${SUPABASE_KEY}`,
        'Content-Type':'application/json',
        'Prefer':'return=minimal'
      },
      body:JSON.stringify({data:snapshot,updated_at:new Date().toISOString()})
    }).catch(e=>console.error('[Supabase REST Save Error]',e.message)));
  }
  if(globalThis.__vxStore){
    tasks.push(globalThis.__vxStore.replaceOne({_id:'main'},{_id:'main',data:snapshot,updatedAt:new Date()},{upsert:true}).catch(e=>console.error('MongoDB save error:',e)));
  }
  const localDbPath=path.join(__dirname,'volterax-local-db.json');
  try{fs.writeFileSync(localDbPath,JSON.stringify(snapshot,null,2))}catch(e){}
  if(tasks.length > 0){
    await Promise.all(tasks);
  }
  return snapshot;
}

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'vx_sec_8105227644_volterax_karnataka_2026';
function signCustomerToken(userId, expires) {
  const payload = `${userId}.${expires}`;
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function signOtpToken(data) {
  const payloadStr = Buffer.from(JSON.stringify(data)).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadStr).digest('base64url');
  return `${payloadStr}.${sig}`;
}

function verifyOtpToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx === -1) return null;
  const payloadStr = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(payloadStr).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
    const data = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (!data.expires || Date.now() > data.expires) return null;
    return data;
  } catch(_) {
    return null;
  }
}
function verifyCustomerToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, expiresStr, sig] = parts;
  const expires = parseInt(expiresStr, 10);
  if (!expires || Date.now() > expires) return null;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(`${userId}.${expiresStr}`).digest('hex');
  try {
    if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return userId;
    }
  } catch(_) {}
  return null;
}
function id(prefix){return prefix+crypto.randomBytes(5).toString('hex').toUpperCase()}
function now(){return new Date().toISOString()}
function hashPassword(p,salt=crypto.randomBytes(16).toString('hex')){const h=crypto.scryptSync(p,salt,64).toString('hex');return {salt,hash:h}}
function checkPassword(p,u){return crypto.timingSafeEqual(Buffer.from(hashPassword(p,u.passwordSalt).hash,'hex'),Buffer.from(u.passwordHash,'hex'))}
function cookie(name,value,maxAge){return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; ${process.env.NODE_ENV==='production'?'Secure;':''}`}
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i).trim(),decodeURIComponent(x.slice(i+1))]}))}
function json(res,status,data,extra={}){const b=JSON.stringify(data);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra});res.end(b)}
function body(req){return new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>1e6)req.destroy()});req.on('end',()=>{try{resolve(b?JSON.parse(b):{})}catch(e){reject(e)}});req.on('error',reject)})}
function customer(req){
  const cookieSid = cookies(req).vx_session;
  const authHeader = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
  const xSession = (req.headers['x-volterax-session'] || '').trim();
  const token = authHeader || xSession || cookieSid;
  if(!token) return null;

  // 1. Stateless cryptographically signed token (100% persists across container freezes/restarts)
  const verifiedUserId = verifyCustomerToken(token);
  if(verifiedUserId) {
    const user = db.users.find(u => u.id === verifiedUserId);
    if(user) return user;
  }

  // 2. Session lookup
  const s = db.sessions[token] || (cookieSid ? db.sessions[cookieSid] : null);
  if(!s || Date.now() > s.expires){
    if(s && db.sessions[token]) delete db.sessions[token];
    return null;
  }
  return db.users.find(u => u.id === s.userId) || null;
}
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
  if(req.method==='GET'&&p==='/api/diag'){return json(res,200,{hasPgPool:!!pgPool,hasPgModule:!!PgPool,users:db.users.length,orders:db.orders.length,dbError:globalThis.__lastDbError||null,envKeys:Object.keys(process.env).filter(k=>!k.includes('PASS')&&!k.includes('SECRET')&&!k.includes('KEY'))})}
  if(req.method==='GET'&&p==='/api/customer/me'){const c=customer(req);return c?json(res,200,customerBundle(c)):json(res,401,{error:'Not logged in'})}
  if(req.method==='GET'&&p==='/api/customer/orders'){const c=customer(req);return c?json(res,200,db.orders.filter(o=>o.userId===c.id)):json(res,401,{error:'Not logged in'})}
    if(req.method==='GET' && (p==='/api/karnataka-districts' || p==='/api/districts')){
    return json(res, 200, {
      state: 'Karnataka',
      totalDistricts: Object.keys(KARNATAKA_DISTRICTS).length,
      districts: KARNATAKA_DISTRICTS
    }, {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400'
    });
  }
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
    ensureProjectsLoaded();
    if(pgPool){
      try{
        const pRes=await pgPool.query('SELECT * FROM projects ORDER BY id ASC');
        if(pRes.rows && pRes.rows.length>0){
          db.projects=pRes.rows;
          return json(res,200,pRes.rows,{'Cache-Control':'no-cache, no-store, must-revalidate','Pragma':'no-cache','Expires':'0','Access-Control-Allow-Origin':'*'});
        }
      }catch(err){
        console.warn('[VolteraX] Live projects pgPool fetch notice:', err.message);
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
      const otpPayload = {
        otp: fallbackOtp,
        expires: Date.now() + 15 * 60 * 1000,
        email,
        name,
        mobile: mobile || '',
        mode,
        ref: String(x.ref||'').trim().toUpperCase(),
        attempts: 0
      };
      const otpToken = signOtpToken(otpPayload);
      globalThis.__vxPendingOtps[email] = otpPayload;
      if (!db.pending_otps) db.pending_otps = {};
      db.pending_otps[email] = otpPayload;
      save().catch(() => {});

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
        otpToken: otpToken,
        hasSmtp: emailSent,
        previewCode: emailSent ? null : fallbackOtp
      });
    }

    if(req.method==='POST'&&p==='/api/customer/verify-otp'){
      const x=await body(req);
      const email=String(x.email||x.gmail||'').trim().toLowerCase();
      const inputOtp=String(x.otp||x.code||'').trim().replace(/\D/g,'');
      const inputToken=String(x.otpToken||x.token||'').trim();

      if(!email) return json(res, 400, { error: 'Email address is required.' });
      if(!inputOtp || inputOtp.length !== 6) return json(res, 400, { error: 'Please enter the 6-digit verification code.' });

      let verified = false;
      let verifiedData = null;

      // 1. First priority: Cryptographic HMAC OTP token (Stateless, survives Vercel instance restarts/cold starts)
      if (inputToken) {
        const decoded = verifyOtpToken(inputToken);
        if (decoded && decoded.email === email && decoded.otp === inputOtp && Date.now() <= decoded.expires) {
          verified = true;
          verifiedData = decoded;
          console.log('[OTP Verified via HMAC Token]', email);
        }
      }

      // 2. Second priority: In-memory & db.pending_otps check
      if (!verified) {
        const pending = globalThis.__vxPendingOtps[email] || (db.pending_otps && db.pending_otps[email]);
        if (pending && pending.otp === inputOtp && Date.now() <= pending.expires) {
          verified = true;
          verifiedData = pending;
          console.log('[OTP Verified via Memory/Store]', email);
        }
      }

      // 3. Fallback: Supabase Auth
      if (!verified && SUPABASE_URL && SUPABASE_KEY) {
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

      if (!verified) {
        return json(res, 400, { error: 'Incorrect or expired verification code. Please check your Gmail or click Resend.' });
      }

      // Validated! Clear pending record
      delete globalThis.__vxPendingOtps[email];
      if (db.pending_otps) delete db.pending_otps[email];

      // Find or create customer
      let user = db.users.find(u => (u.email && u.email.toLowerCase() === email) || (u.mobile && u.mobile === email));
      const userMobile = String(x.mobile || (verifiedData && verifiedData.mobile) || '').trim();
      if(!user){
        const userName = String(x.name || (verifiedData && verifiedData.name) || email.split('@')[0]).trim() || 'Volterax Customer';
        const userRef = (verifiedData && verifiedData.ref) || '';
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
      const expiresAt = Date.now() + SESSION_TTL;
      const signedToken = signCustomerToken(user.id, expiresAt);
      db.sessions[sid] = { userId: user.id, expires: expiresAt };
      db.sessions[signedToken] = { userId: user.id, expires: expiresAt };
      await save();
      await syncRelational('customer', user);

      return json(res, 200, { ...customerBundle(user), token: signedToken }, { 'Set-Cookie': cookie('vx_session', signedToken, SESSION_TTL / 1000) });
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
    const expiresAt = Date.now() + SESSION_TTL;
    const signedToken = signCustomerToken(idv, expiresAt);
    db.sessions[sid]={userId:idv,expires:expiresAt};
    db.sessions[signedToken]={userId:idv,expires:expiresAt};
    await save();
    await syncRelational('customer', user);
    return json(res,200,{ ...customerBundle(user), token: signedToken },{'Set-Cookie':cookie('vx_session',signedToken,SESSION_TTL/1000)});
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
    const expiresAt = Date.now() + SESSION_TTL;
    const signedToken = signCustomerToken(user.id, expiresAt);
    db.sessions[sid]={userId:user.id,expires:expiresAt};
    db.sessions[signedToken]={userId:user.id,expires:expiresAt};
    await save();
    await syncRelational('customer', user);
    return json(res,200,{ ...customerBundle(user), token: signedToken },{'Set-Cookie':cookie('vx_session',signedToken,SESSION_TTL/1000)});
  }
  if(req.method==='POST'&&p==='/api/customer/logout'){const sid=cookies(req).vx_session;if(sid)delete db.sessions[sid];await save();return json(res,200,{ok:true},{'Set-Cookie':cookie('vx_session','',0)})}
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
    let title=String(x.title||'VOLTERAX PROJECT').slice(0,200).trim();
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

    const customerPhone = String(x.phone || x.mobile || (shipping_address && shipping_address.phone) || c.mobile || '').replace(/\D/g, '').slice(-10);

    if(customerPhone && !c.mobile){
      c.mobile = customerPhone;
      c.updatedAt = now();
      save();
      syncRelational('customer', c);
    }

    if(shipping_address && customerPhone){
      shipping_address.phone = customerPhone;
    }

    // Enforce fixed catalog price if title matches any project in catalog
    ensureProjectsLoaded();
    const pIdx = matchProject(db.projects, title);
    let enforcedPricePaise = Number(x.amount_paise || 0);
    if (pIdx !== -1 && db.projects[pIdx] && Number(db.projects[pIdx].price) > 0) {
      enforcedPricePaise = Number(db.projects[pIdx].price) * 100;
      title = db.projects[pIdx].title;
    } else if (enforcedPricePaise < 100000) {
      // Default to fixed base project price of ₹6,500 (650000 paise); prevent fake ₹1 or ₹78 orders
      enforcedPricePaise = 650000;
    }

    const item={
      id:id('ORD'),
      order_id:String(x.order_id||id('VX-ORD-')),
      userId:c.id,
      title:title,
      mobile: customerPhone || c.mobile || '',
      phone: customerPhone || c.mobile || '',
      amount_paise: enforcedPricePaise,
      status: 'pending_payment',
      payment_method: 'ONLINE_ONLY',
      payment_status: 'pending_online',
      details:String(x.details||'Custom commissioned hardware prototype').slice(0,5000),
      shipping_address: shipping_address,
      createdAt:now(),
      updatedAt:now()
    };
    db.orders.unshift(item);
    await save();
    // Do NOT sync to admin dashboard yet!
    // The order stays pending until customer uploads their payment screenshot.
    const paymentPayload = generateOrderPaymentPayload(item);
    return json(res,201,{ok:true,order:item,payment:paymentPayload});
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

      if(!street || street.trim().length < 2) return json(res, 400, { error: 'Please enter your full delivery address.' });
      if(!city || city.trim().length < 2) return json(res, 400, { error: 'Please enter your city, town, or taluk name.' });
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
      await save();
      await syncRelational('order', order);
      return json(res, 200, { ok: true, order, message: 'Delivery address saved successfully.' });
    }
  }
  
  // Payment Details for Order
  if(req.method==='GET' && p.startsWith('/api/customer/order/') && p.endsWith('/payment')){
    const c=requireCustomer(req,res);
    if(!c)return;
    const segs = p.split('/');
    const targetOid = segs[4]; // /api/customer/order/:orderId/payment
    const order = db.orders.find(o => (o.id === targetOid || o.order_id === targetOid) && o.userId === c.id);
    if(!order) return json(res, 404, { error: 'Order not found.' });

    const payload = generateOrderPaymentPayload(order);
    return json(res, 200, payload, {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
  }

  // Payment Confirmation / Screenshot Submission Endpoint
  if(req.method==='POST' && p.startsWith('/api/customer/order/') && p.endsWith('/confirm-payment')){
    const c=requireCustomer(req,res);
    if(!c)return;
    const segs = p.split('/');
    const targetOid = segs[4]; // /api/customer/order/:orderId/confirm-payment
    const order = db.orders.find(o => (o.id === targetOid || o.order_id === targetOid) && o.userId === c.id);
    if(!order) return json(res, 404, { error: 'Order not found.' });

    const x = await body(req);
    const screenshot = String(x.payment_screenshot || x.screenshot || x.image || '').trim();
    if (!screenshot) {
      return json(res, 400, { error: 'Payment screenshot is required. Please upload your payment screenshot to verify payment.' });
    }

    const utr = String(x.utr || x.reference || '').trim();
    order.payment_method = 'ONLINE_ONLY';
    order.payment_status = 'proof_submitted';
    order.payment_screenshot = screenshot;
    order.payment_proof = screenshot;
    order.payment_utr = utr || '';
    order.status = 'processing';
    order.payment_rejection_reason = '';
    order.payment_submitted_at = now();
    order.updatedAt = now();

    // Also attach to shipping_address object if present for persistent backup
    if (order.shipping_address && typeof order.shipping_address === 'object') {
      order.shipping_address.payment_screenshot = screenshot;
      order.shipping_address.payment_utr = utr || '';
      order.shipping_address.payment_status = 'proof_submitted';
    }

    await save();
    await syncRelational('order', order);

    return json(res, 200, {
      ok: true,
      order,
      message: '✓ Payment screenshot submitted successfully! Our engineering team is verifying your payment.'
    });
  }

  // Admin
  if(req.method==='POST'&&p==='/api/admin/login'){const x=await body(req);if(String(x.email||'').toLowerCase()!==ADMIN_EMAIL||String(x.password||'')!==ADMIN_PASSWORD)return json(res,401,{error:'Invalid admin credentials.'});const sid=crypto.randomBytes(32).toString('hex');db.adminSessions[sid]={expires:Date.now()+SESSION_TTL};save();return json(res,200,{ok:true},{'Set-Cookie':cookie('vx_admin',sid,SESSION_TTL/1000)})}
  if(req.method==='POST'&&p==='/api/admin/logout'){const sid=cookies(req).vx_admin;if(sid)delete db.adminSessions[sid];save();return json(res,200,{ok:true},{'Set-Cookie':cookie('vx_admin','',0)})}
  if(p.startsWith('/api/admin/')){if(!requireAdmin(req,res))return;
    if(req.method==='GET'&&p==='/api/admin/summary')return json(res,200,{customers:db.users.length,orders:db.orders.length,feedback:db.feedback.length,newFeedback:db.feedback.filter(x=>x.status==='new').length,leads:db.leads.length,newLeads:db.leads.filter(x=>x.status==='new').length,revenuePaise:db.orders.reduce((a,o)=>a+Number(o.amount_paise||0),0),projects:(db.projects||[]).length,updatedAt:now()});
    if(req.method==='GET'&&(p==='/api/admin/projects'||p==='/api/admin/project')){
      ensureProjectsLoaded();
      return json(res,200,db.projects||[]);
    }
    if(req.method==='PATCH'&&(p.startsWith('/api/admin/projects/')||p.startsWith('/api/admin/project/'))){
      ensureProjectsLoaded();
      const rawPid=decodeURIComponent(p.split('/').pop());
      const x=await body(req);
      const idx=matchProject(db.projects, rawPid);
      if(idx===-1)return json(res,404,{error:'Project not found: '+rawPid});
      const proj=db.projects[idx];
      if(x.price!==undefined)proj.price=Number(x.price);
      if(x.title!==undefined)proj.title=String(x.title).trim();
      if(x.category!==undefined)proj.category=String(x.category).trim().toUpperCase();
      if(x.description!==undefined)proj.description=String(x.description).trim();
      if(x.image!==undefined)proj.image=String(x.image).trim();
      if(x.code!==undefined)proj.code=String(x.code).trim();
      if(x.status!==undefined)proj.status=String(x.status);
      if(x.featured!==undefined)proj.featured=Boolean(x.featured);
      proj.updatedAt=now();
      await save();
      await syncRelational('project', proj);
      return json(res,200,{ok:true,project:proj});
    }
    if(req.method==='POST'&&(p==='/api/admin/projects'||p==='/api/admin/project')){
      ensureProjectsLoaded();
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
      await save();
      await syncRelational('project', item);
      return json(res,201,{ok:true,project:item});
    }
    if(req.method==='DELETE'&&(p.startsWith('/api/admin/projects/')||p.startsWith('/api/admin/project/'))){
      ensureProjectsLoaded();
      const rawPid=decodeURIComponent(p.split('/').pop());
      const idx=matchProject(db.projects, rawPid);
      if(idx===-1)return json(res,404,{error:'Project not found: '+rawPid});
      const removed=db.projects.splice(idx,1)[0];
      await save();
      await syncRelational('delete_project', removed);
      return json(res,200,{ok:true,deleted:removed});
    }
    if(req.method==='GET'&&p==='/api/admin/customers')return json(res,200,db.users.map(safeUser));
    if(req.method==='GET'&&p==='/api/admin/orders'){
      if(pgPool){
        try{
          const r = await pgPool.query(`
            SELECT * FROM orders 
            WHERE (payment_screenshot IS NOT NULL AND LENGTH(TRIM(payment_screenshot)) > 15)
               OR (payment_proof IS NOT NULL AND LENGTH(TRIM(payment_proof)) > 15)
            ORDER BY created_at DESC
          `);
          if(r.rows && r.rows.length > 0){
            return json(res, 200, r.rows.map(o => {
              const user = db.users.find(u => u.id === o.user_id);
              const sa = typeof o.shipping_address === 'object' && o.shipping_address ? o.shipping_address : {};
              const phone = o.mobile || sa.phone || sa.mobile || user?.mobile || '';
              const screenshot = o.payment_screenshot || o.payment_proof || sa.payment_screenshot || null;
              return {
                ...o,
                userId: o.user_id,
                payment_screenshot: screenshot,
                payment_proof: screenshot,
                user: user?.name || 'Customer',
                userName: user?.name || 'Customer',
                userEmail: user?.email || '',
                mobile: phone,
                phone: phone
              };
            }));
          }
        }catch(e){
          console.error('[Admin Orders PG direct query error]', e.message);
        }
      }
      return json(res, 200, db.orders.filter(o => {
        const sa = typeof o.shipping_address === 'object' && o.shipping_address ? o.shipping_address : {};
        const ss = o.payment_screenshot || o.payment_proof || sa.payment_screenshot || '';
        return Boolean(ss && String(ss).trim().length > 15);
      }).map(o => {
        const user = db.users.find(u => u.id === o.userId);
        const sa = typeof o.shipping_address === 'object' && o.shipping_address ? o.shipping_address : {};
        const phone = o.mobile || o.phone || sa.phone || sa.mobile || user?.mobile || '';
        const screenshot = o.payment_screenshot || o.payment_proof || sa.payment_screenshot || null;
        return {
          ...o,
          payment_screenshot: screenshot,
          payment_proof: screenshot,
          user: user?.name || o.user || 'Customer',
          userName: user?.name || o.user || 'Customer',
          userEmail: user?.email || '',
          mobile: phone,
          phone: phone
        };
      }));
    }
    if(req.method==='DELETE'&&(p.startsWith('/api/admin/orders/')||p.startsWith('/api/admin/order/'))){
      const oid = decodeURIComponent(p.split('/').pop());
      const idx = db.orders.findIndex(v => v.id === oid || v.order_id === oid);
      let removed = null;
      if (idx !== -1) {
        removed = db.orders.splice(idx, 1)[0];
        await save();
      }
      if (pgPool) {
        try {
          await pgPool.query(`DELETE FROM orders WHERE id = $1 OR order_id = $1`, [oid]);
        } catch(e) {}
      }
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/orders?or=(id.eq.${oid},order_id.eq.${oid})`, {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          });
        } catch(e) {}
      }
      return json(res, 200, { ok: true, deleted: oid, order: removed });
    }
    if(req.method==='GET'&&p==='/api/admin/feedback')return json(res,200,db.feedback.map(f=>({...f,customer:db.users.find(u=>u.id===f.userId)?.name||f.name,mobile:db.users.find(u=>u.id===f.userId)?.mobile||''})));
    if(req.method==='GET'&&p==='/api/admin/leads')return json(res,200,db.leads.map(l=>({...l,customer:db.users.find(u=>u.id===l.userId)?.name||l.name})));
    if(req.method==='POST'&&p==='/api/admin/order'){const x=await body(req);const user=db.users.find(v=>v.id===x.userId||v.mobile===String(x.mobile||'').replace(/\D/g,''));if(!user)return json(res,404,{error:'Customer not found.'});const item={id:id('ORD'),order_id:String(x.order_id||id('VX-ORD-')),userId:user.id,title:String(x.title||'VOLTERAX PROJECT').slice(0,200),amount_paise:Number(x.amount_paise||0),status:String(x.status||'pending'),details:String(x.details||'').slice(0,5000),shipping_address:x.shipping_address||null,createdAt:now(),updatedAt:now()};db.orders.unshift(item);save();syncRelational('order', item);return json(res,201,{ok:true,order:item})}
    if(req.method==='PATCH'&&p.startsWith('/api/admin/order/')){
      const oid=p.split('/').pop();
      const x=await body(req);
      const o=db.orders.find(v=>v.id===oid||v.order_id===oid);
      if(!o)return json(res,404,{error:'Order not found.'});
      for(const k of ['title','status','details','payment_status','payment_utr','payment_screenshot','payment_proof','payment_rejection_reason','rejection_reason'])
        if(x[k]!==undefined)o[k]=String(x[k]);
      if(x.status === 'rejected' || x.payment_status === 'fake_receipt_rejected'){
        o.status = 'rejected';
        o.payment_status = 'fake_receipt_rejected';
        o.payment_rejection_reason = x.payment_rejection_reason || x.rejection_reason || 'Fake or invalid payment receipt uploaded. Transaction was not received in bank/UPI.';
      }
      if(x.amount_paise!==undefined)o.amount_paise=Number(x.amount_paise);
      if(x.shipping_address!==undefined)o.shipping_address=x.shipping_address;
      o.updatedAt=now();
      await save();
      await syncRelational('order', o);
      return json(res,200,{ok:true,order:o});
    }
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
