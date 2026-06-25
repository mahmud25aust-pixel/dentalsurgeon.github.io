/* ETCBL HR — Data Layer (localStorage) */
const DB = {

  init() {
    if (!localStorage.getItem('etcbl_hr_v1')) {
      this._seed();
      localStorage.setItem('etcbl_hr_v1', '1');
    }
  },

  _seed() {
    const users = [
      { id:'U001', username:'admin',    password:'admin123', role:'admin',    name:'Administrator' },
      { id:'U002', username:'rkarim',   password:'emp123',   role:'employee', name:'Rafiqul Karim',    empId:'E001' },
      { id:'U003', username:'shossain', password:'emp123',   role:'employee', name:'Shirin Hossain',   empId:'E002' },
      { id:'U004', username:'mahmed',   password:'emp123',   role:'employee', name:'Mohammad Ahmed',   empId:'E003' },
      { id:'U005', username:'fislam',   password:'emp123',   role:'employee', name:'Fatema Islam',     empId:'E004' },
      { id:'U006', username:'nrahman',  password:'emp123',   role:'employee', name:'Nasreen Rahman',   empId:'E005' },
    ];

    const employees = [
      { id:'E001', name:'Rafiqul Karim',   email:'rkarim@etcblglobal.com',   phone:'01711-123456', dept:'Information Technology', designation:'Software Engineer',   joinDate:'2022-03-15', salary:65000, status:'active', gender:'Male',   address:'Mohakhali, Dhaka' },
      { id:'E002', name:'Shirin Hossain',  email:'shossain@etcblglobal.com', phone:'01811-234567', dept:'Human Resources',        designation:'HR Manager',         joinDate:'2021-06-01', salary:75000, status:'active', gender:'Female', address:'GEC Circle, Chittagong' },
      { id:'E003', name:'Mohammad Ahmed',  email:'mahmed@etcblglobal.com',   phone:'01911-345678', dept:'Finance & Accounts',     designation:'Senior Accountant',  joinDate:'2023-01-10', salary:55000, status:'active', gender:'Male',   address:'Zindabazar, Sylhet' },
      { id:'E004', name:'Fatema Islam',    email:'fislam@etcblglobal.com',   phone:'01611-456789', dept:'Sales & Marketing',      designation:'Sales Executive',    joinDate:'2023-04-20', salary:45000, status:'active', gender:'Female', address:'Banasree, Dhaka' },
      { id:'E005', name:'Nasreen Rahman',  email:'nrahman@etcblglobal.com',  phone:'01511-567890', dept:'Operations',             designation:'Operations Manager', joinDate:'2020-08-01', salary:85000, status:'active', gender:'Female', address:'Gulshan, Dhaka' },
    ];

    const attendance = [];
    let aid = 1;
    const empIds = employees.map(e => e.id);
    for (let day = 1; day <= 24; day++) {
      const d = new Date(2026, 5, day);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const dateStr = `2026-06-${String(day).padStart(2,'0')}`;
      empIds.forEach(empId => {
        const r = Math.random();
        let status, checkIn, checkOut, hours;
        if (r < 0.80) {
          status = 'present'; checkIn = rndTime(9,0,9,25); checkOut = rndTime(17,25,18,0); hours = 8;
        } else if (r < 0.92) {
          status = 'late';    checkIn = rndTime(10,5,11,30); checkOut = rndTime(17,30,18,30); hours = 7;
        } else {
          status = 'absent';  checkIn = null; checkOut = null; hours = 0;
        }
        attendance.push({ id:`A${String(aid++).padStart(4,'0')}`, empId, date:dateStr, checkIn, checkOut, status, hours });
      });
    }

    const leaves = [
      { id:'L0001', empId:'E001', type:'Annual Leave',   start:'2026-07-01', end:'2026-07-03', days:3, reason:'Family vacation',    status:'pending',  applied:'2026-06-20' },
      { id:'L0002', empId:'E003', type:'Sick Leave',     start:'2026-06-18', end:'2026-06-19', days:2, reason:'Fever and cold',      status:'approved', applied:'2026-06-18', respondedOn:'2026-06-18', respondedBy:'admin' },
      { id:'L0003', empId:'E004', type:'Casual Leave',   start:'2026-06-22', end:'2026-06-22', days:1, reason:'Personal errand',     status:'approved', applied:'2026-06-21', respondedOn:'2026-06-21', respondedBy:'admin' },
      { id:'L0004', empId:'E002', type:'Annual Leave',   start:'2026-07-10', end:'2026-07-15', days:6, reason:'Annual family trip',  status:'pending',  applied:'2026-06-24' },
      { id:'L0005', empId:'E005', type:'Medical Leave',  start:'2026-06-10', end:'2026-06-11', days:2, reason:'Doctor appointment',  status:'approved', applied:'2026-06-09', respondedOn:'2026-06-09', respondedBy:'admin' },
    ];

    const payroll = [];
    let pid = 1;
    const histMonths = ['2026-03','2026-04','2026-05'];
    employees.forEach(emp => {
      histMonths.forEach(mo => {
        const p = buildPayEntry(emp, mo, 'paid', `${mo}-25`);
        p.id = `P${String(pid++).padStart(4,'0')}`;
        payroll.push(p);
      });
      const cur = buildPayEntry(emp, '2026-06', 'pending', null);
      cur.id = `P${String(pid++).padStart(4,'0')}`;
      payroll.push(cur);
    });

    ls('etcbl_users', users);
    ls('etcbl_employees', employees);
    ls('etcbl_attendance', attendance);
    ls('etcbl_leaves', leaves);
    ls('etcbl_payroll', payroll);
  },

  auth: {
    login(username, password) {
      const u = gl('etcbl_users').find(u => u.username === username && u.password === password);
      if (!u) return null;
      const sess = { userId:u.id, username:u.username, role:u.role, name:u.name, empId:u.empId||null };
      sessionStorage.setItem('etcbl_sess', JSON.stringify(sess));
      return sess;
    },
    logout() { sessionStorage.removeItem('etcbl_sess'); window.location.href='index.html'; },
    session() { return JSON.parse(sessionStorage.getItem('etcbl_sess')||'null'); },
    guard(role) {
      const s = this.session();
      if (!s) { window.location.href='index.html'; return null; }
      if (role && s.role !== role) { window.location.href='index.html'; return null; }
      return s;
    }
  },

  employees: {
    all() { return gl('etcbl_employees'); },
    get(id) { return gl('etcbl_employees').find(e => e.id===id)||null; },
    add(data) {
      const list = gl('etcbl_employees');
      data.id = nextId('E', list);
      list.push(data);
      ls('etcbl_employees', list);
      return data;
    },
    update(id, data) {
      const list = gl('etcbl_employees');
      const i = list.findIndex(e=>e.id===id);
      if (i<0) return null;
      list[i] = { ...list[i], ...data };
      ls('etcbl_employees', list);
      return list[i];
    },
    remove(id) { ls('etcbl_employees', gl('etcbl_employees').filter(e=>e.id!==id)); }
  },

  users: {
    all() { return gl('etcbl_users'); },
    byEmpId(empId) { return gl('etcbl_users').find(u=>u.empId===empId)||null; },
    add(data) {
      const list = gl('etcbl_users');
      data.id = nextId('U', list);
      list.push(data);
      ls('etcbl_users', list);
      return data;
    },
    remove(id) { ls('etcbl_users', gl('etcbl_users').filter(u=>u.id!==id)); },
    resetPwd(id, newPwd) {
      const list = gl('etcbl_users');
      const i = list.findIndex(u=>u.id===id);
      if (i<0) return;
      list[i].password = newPwd;
      ls('etcbl_users', list);
    }
  },

  attendance: {
    all() { return gl('etcbl_attendance'); },
    byEmp(empId) { return gl('etcbl_attendance').filter(a=>a.empId===empId); },
    byDate(date) { return gl('etcbl_attendance').filter(a=>a.date===date); },
    today(empId) {
      const d = todayStr();
      return gl('etcbl_attendance').find(a=>a.empId===empId && a.date===d)||null;
    },
    checkIn(empId) {
      const d = todayStr();
      if (this.today(empId)) return this.today(empId);
      const list = gl('etcbl_attendance');
      const now = new Date();
      const t = timeStr(now);
      const status = (now.getHours()>=10 || (now.getHours()===10 && now.getMinutes()>0)) ? 'late' : 'present';
      const rec = { id:nextId('A',list), empId, date:d, checkIn:t, checkOut:null, status, hours:0 };
      list.push(rec);
      ls('etcbl_attendance', list);
      return rec;
    },
    checkOut(empId) {
      const list = gl('etcbl_attendance');
      const d = todayStr();
      const i = list.findIndex(a=>a.empId===empId && a.date===d);
      if (i<0) return null;
      const now = new Date();
      const t = timeStr(now);
      list[i].checkOut = t;
      const [ih,im] = list[i].checkIn.split(':').map(Number);
      const [oh,om] = t.split(':').map(Number);
      list[i].hours = Math.round(((oh*60+om)-(ih*60+im))/6)/10;
      ls('etcbl_attendance', list);
      return list[i];
    },
    monthStats(empId, ym) {
      const recs = this.byEmp(empId).filter(a=>a.date.startsWith(ym));
      return {
        present: recs.filter(a=>a.status==='present').length,
        late:    recs.filter(a=>a.status==='late').length,
        absent:  recs.filter(a=>a.status==='absent').length,
        total:   recs.length
      };
    }
  },

  leaves: {
    all() { return gl('etcbl_leaves'); },
    byEmp(empId) { return gl('etcbl_leaves').filter(l=>l.empId===empId); },
    pending() { return gl('etcbl_leaves').filter(l=>l.status==='pending'); },
    add(data) {
      const list = gl('etcbl_leaves');
      data.id = nextId('L', list);
      data.applied = todayStr();
      data.status = 'pending';
      list.push(data);
      ls('etcbl_leaves', list);
      return data;
    },
    respond(id, status, by) {
      const list = gl('etcbl_leaves');
      const i = list.findIndex(l=>l.id===id);
      if (i<0) return null;
      list[i].status = status;
      list[i].respondedOn = todayStr();
      list[i].respondedBy = by;
      ls('etcbl_leaves', list);
      return list[i];
    },
    remove(id) { ls('etcbl_leaves', gl('etcbl_leaves').filter(l=>l.id!==id)); }
  },

  payroll: {
    all() { return gl('etcbl_payroll'); },
    byEmp(empId) { return gl('etcbl_payroll').filter(p=>p.empId===empId); },
    byMonth(mo) { return gl('etcbl_payroll').filter(p=>p.month===mo); },
    generate(empId, month) {
      const emp = DB.employees.get(empId);
      if (!emp) return null;
      const list = gl('etcbl_payroll');
      const existing = list.find(p=>p.empId===empId && p.month===month);
      if (existing) return existing;
      const p = buildPayEntry(emp, month, 'pending', null);
      p.id = nextId('P', list);
      list.push(p);
      ls('etcbl_payroll', list);
      return p;
    },
    markPaid(id) {
      const list = gl('etcbl_payroll');
      const i = list.findIndex(p=>p.id===id);
      if (i<0) return null;
      list[i].status = 'paid';
      list[i].paidOn = todayStr();
      ls('etcbl_payroll', list);
      return list[i];
    },
    update(id, fields) {
      const list = gl('etcbl_payroll');
      const i = list.findIndex(p=>p.id===id);
      if (i<0) return null;
      Object.assign(list[i], fields);
      list[i].gross = list[i].basic + list[i].houseRent + list[i].medical + list[i].transport + list[i].overtime;
      list[i].net   = list[i].gross - list[i].tax - list[i].pf - list[i].otherDed;
      ls('etcbl_payroll', list);
      return list[i];
    }
  }
};

function gl(k)   { return JSON.parse(localStorage.getItem(k)||'[]'); }
function ls(k,v) { localStorage.setItem(k, JSON.stringify(v)); }
function todayStr() { return new Date().toISOString().split('T')[0]; }
function timeStr(d) { return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }
function nextId(prefix, list) {
  if (!list.length) return `${prefix}0001`;
  const max = Math.max(...list.map(x=>parseInt(x.id.slice(prefix.length))||0));
  return `${prefix}${String(max+1).padStart(4,'0')}`;
}
function rndTime(h1,m1,h2,m2) {
  const mins = (h1*60+m1) + Math.floor(Math.random()*((h2*60+m2)-(h1*60+m1)));
  return `${String(Math.floor(mins/60)).padStart(2,'0')}:${String(mins%60).padStart(2,'0')}`;
}
function buildPayEntry(emp, month, status, paidOn) {
  const basic = emp.salary;
  const houseRent = Math.round(basic*0.40);
  const medical   = 1500;
  const transport = 1000;
  const overtime  = 0;
  const tax       = Math.round(basic*0.05);
  const pf        = Math.round(basic*0.03);
  const otherDed  = 0;
  const gross     = basic + houseRent + medical + transport + overtime;
  const net       = gross - tax - pf - otherDed;
  return { empId:emp.id, month, basic, houseRent, medical, transport, overtime, tax, pf, otherDed, gross, net, status, paidOn, generatedOn:todayStr() };
}

function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s+'T00:00:00');
  return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
}
function fmtMonth(s) {
  if (!s) return '';
  const [y,m] = s.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]+' '+y;
}
function fmtBDT(n) { return '৳'+Number(n||0).toLocaleString('en-IN'); }
function initials(name) { return (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function avClass(name) { return 'av-'+((name||'').charCodeAt(0)%8); }
function cap(s) { return s ? s[0].toUpperCase()+s.slice(1) : ''; }
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function badgeLeave(status) {
  const m = {approved:'b-success',pending:'b-warning',rejected:'b-danger'};
  return `<span class="badge ${m[status]||'b-secondary'}">${cap(status)}</span>`;
}
function badgeAtt(status) {
  const m = {present:'b-success',late:'b-warning',absent:'b-danger'};
  return `<span class="badge ${m[status]||'b-secondary'}">${cap(status)}</span>`;
}
function badgePay(status) {
  return status==='paid' ? `<span class="badge b-success">Paid</span>` : `<span class="badge b-warning">Pending</span>`;
}
function showAlert(el, msg, type='success') {
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(()=>{ el.style.display='none'; }, 3500);
}