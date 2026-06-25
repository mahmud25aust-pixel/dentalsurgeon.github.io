/* ETCBL HR — Data Layer (Firebase Firestore) */

const firebaseConfig = {
  apiKey: "AIzaSyB0Gj4CseJ-bbqC_BQ7K3dswh3dSJsEMTE",
  authDomain: "etcbl-hr.firebaseapp.com",
  projectId: "etcbl-hr",
  storageBucket: "etcbl-hr.firebasestorage.app",
  messagingSenderId: "194996687647",
  appId: "1:194996687647:web:06149940f5ab5eaba0562a"
};

firebase.initializeApp(firebaseConfig);
const fdb = firebase.firestore();

const DB = {

  async init() {
    const meta = await fdb.doc('meta/init').get();
    if (!meta.exists) {
      await DB._seed();
      await fdb.doc('meta/init').set({ done: true, seededAt: new Date().toISOString() });
    }
  },

  async _seed() {
    const users = [
      { username:'admin',    password:'admin123', role:'admin',    name:'Administrator',  empId:null },
      { username:'rkarim',   password:'emp123',   role:'employee', name:'Rafiqul Karim',   empId:'E001' },
      { username:'shossain', password:'emp123',   role:'employee', name:'Shirin Hossain',  empId:'E002' },
      { username:'mahmed',   password:'emp123',   role:'employee', name:'Mohammad Ahmed',  empId:'E003' },
      { username:'fislam',   password:'emp123',   role:'employee', name:'Fatema Islam',    empId:'E004' },
      { username:'nrahman',  password:'emp123',   role:'employee', name:'Nasreen Rahman',  empId:'E005' },
    ];

    const employees = [
      { id:'E001', name:'Rafiqul Karim',   email:'rkarim@etcblglobal.com',   phone:'01711-123456', dept:'Information Technology', designation:'Software Engineer',   joinDate:'2022-03-15', salary:65000, status:'active', gender:'Male',   address:'Mohakhali, Dhaka' },
      { id:'E002', name:'Shirin Hossain',  email:'shossain@etcblglobal.com', phone:'01811-234567', dept:'Human Resources',        designation:'HR Manager',         joinDate:'2021-06-01', salary:75000, status:'active', gender:'Female', address:'GEC Circle, Chittagong' },
      { id:'E003', name:'Mohammad Ahmed',  email:'mahmed@etcblglobal.com',   phone:'01911-345678', dept:'Finance & Accounts',     designation:'Senior Accountant',  joinDate:'2023-01-10', salary:55000, status:'active', gender:'Male',   address:'Zindabazar, Sylhet' },
      { id:'E004', name:'Fatema Islam',    email:'fislam@etcblglobal.com',   phone:'01611-456789', dept:'Sales & Marketing',      designation:'Sales Executive',    joinDate:'2023-04-20', salary:45000, status:'active', gender:'Female', address:'Banasree, Dhaka' },
      { id:'E005', name:'Nasreen Rahman',  email:'nrahman@etcblglobal.com',  phone:'01511-567890', dept:'Operations',             designation:'Operations Manager', joinDate:'2020-08-01', salary:85000, status:'active', gender:'Female', address:'Gulshan, Dhaka' },
    ];

    // Fixed attendance pattern: 0=absent, 1=present, 2=late (24 entries, indices 5,6,12,13,19,20 are weekends—skipped)
    const patterns = [
      [1,1,1,1,0,0,0,1,1,1,1,1,0,0,1,1,2,1,1,0,0,1,1,1],
      [1,1,2,1,1,0,0,1,0,1,1,1,0,0,1,1,1,1,1,0,0,0,1,1],
      [1,1,1,0,1,0,0,1,1,1,2,1,0,0,1,1,1,1,0,0,0,1,2,1],
      [2,1,1,1,1,0,0,1,0,1,1,1,0,0,1,2,1,1,1,0,0,1,1,1],
      [1,1,1,1,1,0,0,2,1,0,1,1,0,0,1,1,1,1,2,0,0,1,1,1],
    ];
    const empIds = ['E001','E002','E003','E004','E005'];

    const attendance = [];
    let aid = 1;
    for (let day = 1; day <= 24; day++) {
      const d = new Date(2026, 5, day);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const dateStr = `2026-06-${String(day).padStart(2,'0')}`;
      empIds.forEach((empId, ei) => {
        const pat = patterns[ei][day - 1];
        let status, checkIn, checkOut, hours;
        if (pat === 0) {
          status = 'absent'; checkIn = null; checkOut = null; hours = 0;
        } else if (pat === 2) {
          status = 'late';    checkIn = '10:15'; checkOut = '18:00'; hours = 7.8;
        } else {
          status = 'present'; checkIn = '09:00'; checkOut = '17:30'; hours = 8.5;
        }
        attendance.push({ id: `A${String(aid++).padStart(4,'0')}`, empId, date: dateStr, checkIn, checkOut, status, hours });
      });
    }

    const leaves = [
      { id:'L0001', empId:'E001', type:'Annual Leave',  start:'2026-07-01', end:'2026-07-03', days:3, reason:'Family vacation',    status:'pending',  applied:'2026-06-20' },
      { id:'L0002', empId:'E003', type:'Sick Leave',    start:'2026-06-18', end:'2026-06-19', days:2, reason:'Fever and cold',      status:'approved', applied:'2026-06-18', respondedOn:'2026-06-18', respondedBy:'admin' },
      { id:'L0003', empId:'E004', type:'Casual Leave',  start:'2026-06-22', end:'2026-06-22', days:1, reason:'Personal errand',     status:'approved', applied:'2026-06-21', respondedOn:'2026-06-21', respondedBy:'admin' },
      { id:'L0004', empId:'E002', type:'Annual Leave',  start:'2026-07-10', end:'2026-07-15', days:6, reason:'Annual family trip',  status:'pending',  applied:'2026-06-24' },
      { id:'L0005', empId:'E005', type:'Medical Leave', start:'2026-06-10', end:'2026-06-11', days:2, reason:'Doctor appointment',  status:'approved', applied:'2026-06-09', respondedOn:'2026-06-09', respondedBy:'admin' },
    ];

    const payroll = [];
    let pid = 1;
    employees.forEach(emp => {
      ['2026-03','2026-04','2026-05'].forEach(mo => {
        const p = buildPayEntry(emp, mo, 'paid', `${mo}-25`);
        p.id = `P${String(pid++).padStart(4,'0')}`;
        payroll.push(p);
      });
      const cur = buildPayEntry(emp, '2026-06', 'pending', null);
      cur.id = `P${String(pid++).padStart(4,'0')}`;
      payroll.push(cur);
    });

    const b1 = fdb.batch();
    users.forEach(u => b1.set(fdb.doc(`users/${u.username}`), u));
    employees.forEach(e => { const { id, ...d } = e; b1.set(fdb.doc(`employees/${id}`), d); });
    leaves.forEach(l => { const { id, ...d } = l; b1.set(fdb.doc(`leaves/${id}`), d); });
    payroll.forEach(p => { const { id, ...d } = p; b1.set(fdb.doc(`payroll/${id}`), d); });
    await b1.commit();

    const b2 = fdb.batch();
    attendance.forEach(a => { const { id, ...d } = a; b2.set(fdb.doc(`attendance/${id}`), d); });
    await b2.commit();
  },

  // ── Auth ──
  auth: {
    async login(username, password) {
      const snap = await fdb.collection('users').where('username', '==', username).limit(1).get();
      if (snap.empty) return null;
      const doc = snap.docs[0];
      const data = doc.data();
      if (data.password !== password) return null;
      const sess = { userId: doc.id, username: data.username, role: data.role, name: data.name, empId: data.empId || null };
      sessionStorage.setItem('etcbl_sess', JSON.stringify(sess));
      return sess;
    },
    logout() { sessionStorage.removeItem('etcbl_sess'); window.location.href = 'index.html'; },
    session() { return JSON.parse(sessionStorage.getItem('etcbl_sess') || 'null'); },
    guard(role) {
      const s = this.session();
      if (!s) { window.location.href = 'index.html'; return null; }
      if (role && s.role !== role) { window.location.href = 'index.html'; return null; }
      return s;
    }
  },

  // ── Employees ──
  employees: {
    async all() {
      const snap = await fdb.collection('employees').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => a.name.localeCompare(b.name));
    },
    async get(id) {
      const doc = await fdb.doc(`employees/${id}`).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },
    async add(data) {
      const all = await DB.employees.all();
      const nums = all.map(e => parseInt(e.id.slice(1))).filter(n => !isNaN(n));
      const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
      const id = 'E' + String(nextNum).padStart(3, '0');
      data.id = id;
      await fdb.doc(`employees/${id}`).set(data);
      return data;
    },
    async update(id, data) {
      await fdb.doc(`employees/${id}`).update(data);
    },
    async remove(id) {
      await fdb.doc(`employees/${id}`).delete();
    }
  },

  // ── Users ──
  users: {
    async all() {
      const snap = await fdb.collection('users').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async byEmpId(empId) {
      const snap = await fdb.collection('users').where('empId', '==', empId).limit(1).get();
      return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
    },
    async add(data) {
      await fdb.doc(`users/${data.username}`).set(data);
      return { id: data.username, ...data };
    },
    async remove(id) {
      await fdb.doc(`users/${id}`).delete();
    },
    async resetPwd(id, newPwd) {
      await fdb.doc(`users/${id}`).update({ password: newPwd });
    }
  },

  // ── Attendance ──
  attendance: {
    async all() {
      const snap = await fdb.collection('attendance').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.date.localeCompare(a.date));
    },
    async byEmp(empId) {
      const snap = await fdb.collection('attendance').where('empId', '==', empId).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.date.localeCompare(a.date));
    },
    async byDate(date) {
      const snap = await fdb.collection('attendance').where('date', '==', date).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async today(empId) {
      const d = todayStr();
      const snap = await fdb.collection('attendance').where('empId', '==', empId).get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).find(a => a.date === d) || null;
    },
    async checkIn(empId) {
      const existing = await DB.attendance.today(empId);
      if (existing) return existing;
      const d = todayStr();
      const now = new Date();
      const t = timeStr(now);
      const status = now.getHours() >= 10 ? 'late' : 'present';
      const ref = fdb.collection('attendance').doc();
      const rec = { id: ref.id, empId, date: d, checkIn: t, checkOut: null, status, hours: 0 };
      await ref.set(rec);
      return rec;
    },
    async checkOut(empId) {
      const rec = await DB.attendance.today(empId);
      if (!rec || rec.checkOut) return rec;
      const now = new Date();
      const t = timeStr(now);
      const [ih, im] = rec.checkIn.split(':').map(Number);
      const [oh, om] = t.split(':').map(Number);
      const hours = Math.round(((oh*60+om)-(ih*60+im))/6)/10;
      await fdb.doc(`attendance/${rec.id}`).update({ checkOut: t, hours });
      return { ...rec, checkOut: t, hours };
    },
    async monthStats(empId, ym) {
      const recs = (await DB.attendance.byEmp(empId)).filter(a => a.date.startsWith(ym));
      return {
        present: recs.filter(a => a.status === 'present').length,
        late:    recs.filter(a => a.status === 'late').length,
        absent:  recs.filter(a => a.status === 'absent').length,
        total:   recs.length
      };
    }
  },

  // ── Leaves ──
  leaves: {
    async all() {
      const snap = await fdb.collection('leaves').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.applied.localeCompare(a.applied));
    },
    async byEmp(empId) {
      const snap = await fdb.collection('leaves').where('empId', '==', empId).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.applied.localeCompare(a.applied));
    },
    async pending() {
      const snap = await fdb.collection('leaves').where('status', '==', 'pending').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.applied.localeCompare(a.applied));
    },
    async add(data) {
      const ref = fdb.collection('leaves').doc();
      const rec = { id: ref.id, ...data, status: 'pending', applied: todayStr() };
      await ref.set(rec);
      return rec;
    },
    async respond(id, status, by) {
      await fdb.doc(`leaves/${id}`).update({ status, respondedOn: todayStr(), respondedBy: by });
    },
    async remove(id) {
      await fdb.doc(`leaves/${id}`).delete();
    }
  },

  // ── Payroll ──
  payroll: {
    async all() {
      const snap = await fdb.collection('payroll').get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.month.localeCompare(a.month));
    },
    async byEmp(empId) {
      const snap = await fdb.collection('payroll').where('empId', '==', empId).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => b.month.localeCompare(a.month));
    },
    async byMonth(mo) {
      const snap = await fdb.collection('payroll').where('month', '==', mo).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async generate(empId, month) {
      const emp = await DB.employees.get(empId);
      if (!emp) return null;
      const existing = await DB.payroll.byMonth(month);
      if (existing.find(p => p.empId === empId)) return null;
      const p = buildPayEntry(emp, month, 'pending', null);
      const ref = fdb.collection('payroll').doc();
      const rec = { id: ref.id, ...p };
      await ref.set(rec);
      return rec;
    },
    async markPaid(id) {
      await fdb.doc(`payroll/${id}`).update({ status: 'paid', paidOn: todayStr() });
    },
    async update(id, fields) {
      const doc = await fdb.doc(`payroll/${id}`).get();
      if (!doc.exists) return null;
      const cur = doc.data();
      const merged = { ...cur, ...fields };
      merged.gross = merged.basic + merged.houseRent + merged.medical + merged.transport + merged.overtime;
      merged.net   = merged.gross - merged.tax - merged.pf - merged.otherDed;
      await fdb.doc(`payroll/${id}`).update(merged);
      return { id, ...merged };
    }
  }
};

// ── Helpers ──
function todayStr() { return new Date().toISOString().split('T')[0]; }
function timeStr(d) { return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'00')}`; }
function buildPayEntry(emp, month, status, paidOn) {
  const basic = emp.salary;
  const houseRent = Math.round(basic * 0.40);
  const medical   = 1500;
  const transport = 1000;
  const overtime  = 0;
  const tax       = Math.round(basic * 0.05);
  const pf        = Math.round(basic * 0.03);
  const otherDed  = 0;
  const gross     = basic + houseRent + medical + transport + overtime;
  const net       = gross - tax - pf - otherDed;
  return { empId: emp.id, month, basic, houseRent, medical, transport, overtime, tax, pf, otherDed, gross, net, status, paidOn, generatedOn: todayStr() };
}

// ── UI helpers ──
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}
function fmtMonth(s) {
  if (!s) return '';
  const [y,m] = s.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + y;
}
function fmtBDT(n) { return '৳' + Number(n||0).toLocaleString('en-IN'); }
function initials(name) { return (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function avClass(name) { return 'av-' + ((name||'').charCodeAt(0) % 8); }
function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function badgeLeave(status) {
  const m = { approved:'b-success', pending:'b-warning', rejected:'b-danger' };
  return `<span class="badge ${m[status]||'b-secondary'}">${cap(status)}</span>`;
}
function badgeAtt(status) {
  const m = { present:'b-success', late:'b-warning', absent:'b-danger' };
  return `<span class="badge ${m[status]||'b-secondary'}">${cap(status)}</span>`;
}
function badgePay(status) {
  return status === 'paid'
    ? `<span class="badge b-success">Paid</span>`
    : `<span class="badge b-warning">Pending</span>`;
}
function showAlert(el, msg, type='success') {
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3500);
}
