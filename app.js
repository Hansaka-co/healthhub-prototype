const TYPES=['Dental check-up','General consultation','Cardiology review','Eye test','Physiotherapy','Vaccination'];
  const OFFSETS=[{key:'d2',label:'2 days before'},{key:'d1',label:'1 day before'},{key:'h1',label:'1 hour before'},{key:'m30',label:'30 minutes before'}];
  const state={type:'Dental check-up',clinic:'Dr. Mensah – Bright Smile Clinic',date:null,time:null,
               rem:{d2:false,d1:true,h1:true,m30:false},added:false,taken:false};
  const $=id=>document.getElementById(id);
  const tabScreens=['dashboard','visits','meds','profile'];

  let current='welcome';
  function go(id,back=false){
    const from=$(current),to=$(id);
    from.classList.toggle('back',!back);from.classList.remove('active');
    setTimeout(()=>from.classList.remove('back'),320);
    to.classList.toggle('back',back);
    requestAnimationFrame(()=>{to.classList.remove('back');to.classList.add('active');to.scrollTop=0;});
    current=id; closePickers();
    $('nav').classList.toggle('show',tabScreens.includes(id));
    if(tabScreens.includes(id)) tabScreens.forEach(t=>$('nav-'+t).classList.toggle('on',t===id));
  }
  function tab(id){ go(id); }

  let tT; function toast(m){const e=$('toast');e.textContent=m;e.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>e.classList.remove('show'),1700);}

  function markTaken(ev){ ev&&ev.stopPropagation(); state.taken=true;
    const h=$('hero');h.classList.add('done');
    $('hero-urg').innerHTML='✓ Done';$('hero-lab').textContent='Nice work · Medication';
    $('hero-big').textContent='Amoxicillin taken';$('hero-small').textContent='Next dose · 10:00 PM today';
    $('hero-act').innerHTML='<button class="mini line" onclick="undoTaken(event)">Undo</button>'; }
  function undoTaken(ev){ ev&&ev.stopPropagation(); state.taken=false; resetHero(); }
  function resetHero(){ const h=$('hero');h.classList.remove('done');
    $('hero-urg').innerHTML='<span class="pulse"></span>In 35 min';$('hero-lab').textContent='Next up · Medication';
    $('hero-big').textContent='Take Amoxicillin 500 mg';$('hero-small').textContent='1 tablet · after meals · 2:00 PM';
    $('hero-act').innerHTML='<button class="mini solid" onclick="markTaken(event)">Mark as taken</button><button class="mini line" onclick="toast(\'Reminder snoozed 30 min\');event.stopPropagation()">Snooze</button>'; }

  function startAdd(){ renderTypes(); go('add'); }
  function readForm(){ state.clinic=$('clinic').value||'Clinic / doctor'; }

  function renderTypes(){ $('type-list').innerHTML=TYPES.map(t=>`<div class="opt ${t===state.type?'sel':''}" onclick="pickType('${t}')">${t}</div>`).join(''); }
  function toggleType(){ closePickers('typePanel'); $('typePanel').classList.toggle('open'); }
  function pickType(t){ state.type=t; $('type-val').textContent=t; renderTypes(); $('typePanel').classList.remove('open'); }

  const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DOW=['Su','Mo','Tu','We','Th','Fr','Sa'];
  let calView=new Date(); calView.setDate(1);
  function openCal(){ closePickers('calPanel'); const p=$('calPanel'); p.classList.toggle('open'); if(p.classList.contains('open')) renderCal(); }
  function calMove(d){ calView.setMonth(calView.getMonth()+d); renderCal(); }
  function renderCal(){
    const y=calView.getFullYear(),m=calView.getMonth();
    $('cal-title').textContent=MON[m]+' '+y;
    $('cal-dows').innerHTML=DOW.map(d=>`<div class="dow">${d}</div>`).join('');
    const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
    const today=new Date();today.setHours(0,0,0,0);
    let c='';for(let i=0;i<first;i++)c+='<div class="day mut"></div>';
    for(let d=1;d<=days;d++){const dd=new Date(y,m,d);
      const iso=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const past=dd<today,sel=state.date===iso;
      c+=`<div class="day ${past?'mut':''} ${sel?'sel':''}" ${past?'':`onclick="pickDate('${iso}')"`}>${d}</div>`;}
    $('cal-grid').innerHTML=c;
  }
  function pickDate(iso){ state.date=iso; $('date-val').textContent=fmtDate(iso); $('date-val').classList.remove('ph'); renderCal(); setTimeout(()=>$('calPanel').classList.remove('open'),140); }

  const SLOTS=['08:00','08:30','09:00','09:30','10:00','10:30','11:00','13:00','14:00','15:30'];
  function openTime(){ closePickers('timePanel'); const p=$('timePanel'); p.classList.toggle('open'); if(p.classList.contains('open')) renderSlots(); }
  function renderSlots(){ $('time-slots').innerHTML=SLOTS.map(t=>`<div class="slot ${state.time===t?'sel':''}" onclick="pickTime('${t}')">${fmtTime(t)}</div>`).join(''); }
  function pickTime(t){ state.time=t; $('time-val').textContent=fmtTime(t); $('time-val').classList.remove('ph'); renderSlots(); setTimeout(()=>$('timePanel').classList.remove('open'),140); }

  function closePickers(except){ ['typePanel','calPanel','timePanel'].forEach(id=>{ if(id!==except&&$(id)) $(id).classList.remove('open'); }); }

  function fmtDate(iso){return new Date(iso+'T00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});}
  function fmtDateShort(iso){return new Date(iso+'T00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});}
  function fmtTime(t){let[h,m]=t.split(':').map(Number);const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${String(m).padStart(2,'0')} ${ap}`;}
  function whenStr(){if(!state.date||!state.time)return'—';return `${fmtDateShort(state.date)} · ${fmtTime(state.time)}`;}
  function shiftDate(iso,n){const d=new Date(iso+'T00:00');d.setDate(d.getDate()+n);return fmtDateShort(d.toISOString().slice(0,10));}
  function shiftTime(t,mins){let[h,m]=t.split(':').map(Number);let tot=(h*60+m-mins+1440)%1440;return fmtTime(`${String(Math.floor(tot/60)).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`);}
  function subFor(k){if(k==='d2')return `${shiftDate(state.date,-2)} · ${fmtTime(state.time)}`;if(k==='d1')return `${shiftDate(state.date,-1)} · ${fmtTime(state.time)}`;if(k==='h1')return `${fmtDateShort(state.date)} · ${shiftTime(state.time,60)}`;return `${fmtDateShort(state.date)} · ${shiftTime(state.time,30)}`;}
  function selected(){return OFFSETS.filter(o=>state.rem[o.key]);}
  function remindersShort(){const s=selected();if(!s.length)return'No reminders';if(s.length===1)return s[0].label;const l=s.map(o=>o.label.replace(' before',''));return l.slice(0,-1).join(', ')+' & '+l.slice(-1)+' before';}

  function toReminder(){
    if(!state.date||!state.time){toast('Please choose a date and time');return;}
    readForm();
    $('r-type').textContent=state.type; $('r-when').textContent=whenStr();
    renderReminderRows(); go('reminder');
  }
  function renderReminderRows(){
    $('rem-rows').innerHTML=OFFSETS.map(o=>`
      <div class="trow" onclick="toggleRem('${o.key}')">
        <div class="rem-ic ${state.rem[o.key]?'on':'off'}">
          <svg width="20" height="20"><path d="M4 13 q0 -10 6 -10 q6 0 6 10 l2 3 l-16 0 z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 16 q2 2.5 4 0" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></div>
        <div class="t-txt"><div class="t-title">${o.label}</div><div class="t-sub">${subFor(o.key)}</div></div>
        <div class="sw ${state.rem[o.key]?'on':''}"></div>
      </div>`).join('');
  }
  function toggleRem(k){ state.rem[k]=!state.rem[k]; renderReminderRows(); }

  function renderConfirm(){
    $('cf-type').textContent=state.type; $('cf-clinic').textContent=state.clinic.replace('–','·'); $('cf-when').textContent=whenStr();
    const s=selected();
    $('confirm-sub').textContent=s.length?'Your reminders are set':'No reminders set';
    $('cf-rem').innerHTML=s.length?s.map(o=>`<div class="r"><svg width="16" height="16"><path d="M4 11 q0 -8 4 -8 q4 0 4 8 l1.5 2 l-11 0 z" fill="none" stroke="#0E5A54" stroke-width="1.4"/></svg>${o.label} — ${subFor(o.key)}</div>`).join(''):'<div class="r">No reminders selected</div>';
  }
  function saveAppt(){ renderConfirm(); go('confirm'); }
  function finishToDashboard(){ state.added=true; renderDashboard(); go('dashboard'); }

  function apptCard(o){
    const tooth=`<svg width="24" height="24"><path d="M3 4 q6 -5 12 0 q2 3 0 8 q-1.5 5.5 -3 5.5 q-2 0 -2 -4 q0 -2 -1.5 -2 q-1.5 0 -1.5 2 q0 4 -2 4 q-1.5 0 -3 -5.5 q-2 -5 0 -8 z" fill="none" stroke="#0E5A54" stroke-width="1.4"/></svg>`;
    const heart=`<svg width="24" height="24"><path d="M12 20 q-9 -6 -9 -13 q0 -4 4 -4 q3.5 0 5 3.5 q1.5 -3.5 5 -3.5 q4 0 4 4 q0 7 -9 13 z" fill="none" stroke="#0E5A54" stroke-width="1.5"/></svg>`;
    return `<div class="card"><div class="crow"><div class="tile teal">${o.icon==='tooth'?tooth:heart}</div>
      <div class="grow"><div class="c-title">${o.title}</div><div class="c-sub">${o.sub}</div></div></div>
      <div class="c-div"></div><div class="c-meta"><span class="when">${o.when}</span><span class="chip ${o.chipType}">${o.chip}</span></div></div>`;
  }
  function renderDashboard(){
    const a=$('dash-appts'),b=$('dash-banner');
    if(state.added){
      b.innerHTML=`<div class="banner"><span class="dot"><svg width="12" height="12"><path d="M2 6 L5 9 L10 3" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></span>New appointment added — ${remindersShort()}</div>`;
      a.innerHTML=apptCard({icon:'tooth',title:state.type,sub:state.clinic.replace('–','·'),when:whenStr(),chip:selected().length?'Reminders on':'No reminders',chipType:'on'});
    }else{ b.innerHTML=''; a.innerHTML=apptCard({icon:'heart',title:'Cardiology review',sub:'Dr. Sarah Lee · City Heart Clinic',when:'Mon, 24 Jun · 10:30 AM',chip:'Confirmed',chipType:'ok'}); }
    let v=apptCard({icon:'heart',title:'Cardiology review',sub:'Dr. Sarah Lee · City Heart Clinic',when:'Mon, 24 Jun · 10:30 AM',chip:'Confirmed',chipType:'ok'});
    if(state.added) v=apptCard({icon:'tooth',title:state.type,sub:state.clinic.replace('–','·'),when:whenStr(),chip:selected().length?'Reminders on':'No reminders',chipType:'on'})+v;
    $('visits-list').innerHTML=v;
  }

  function resetApp(){
    Object.assign(state,{type:'Dental check-up',clinic:'Dr. Mensah – Bright Smile Clinic',date:null,time:null,rem:{d2:false,d1:true,h1:true,m30:false},added:false,taken:false});
    $('clinic').value='Dr. Mensah – Bright Smile Clinic';
    $('type-val').textContent='Dental check-up';
    $('date-val').textContent='Tap to choose a date'; $('date-val').classList.add('ph');
    $('time-val').textContent='Tap to choose a time'; $('time-val').classList.add('ph');
    calView=new Date();calView.setDate(1);
    resetHero(); renderTypes(); renderReminderRows(); renderDashboard(); go('welcome');
  }
  let taps=0,tapT; function tapReset(){ taps++; clearTimeout(tapT); tapT=setTimeout(()=>taps=0,600); if(taps>=3){taps=0;resetApp();toast('Reset for next tester');} }

  renderTypes(); renderReminderRows(); renderDashboard();
