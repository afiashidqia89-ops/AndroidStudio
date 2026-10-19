/* ============================================================
   ui.js — tampilan mobile-native (tab bawah + sheet) Retensi KSA1G
   Menggantikan renderer PC aplikasi asli; memakai mesin data core.js.
   ============================================================ */
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let VIEW={R:[],RA:[],RF:[]},curT=[];
const fmtShort=d=>d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});

/* ---------- overlay & tab ---------- */
function showLoad(t){$('loadtxt').textContent=t||'Memproses…';$('load').classList.remove('hidden')}
function hideLoad(){$('load').classList.add('hidden')}
function showTab(t){
  ['ringkasan','pemanen','update'].forEach(x=>$('page-'+x).classList.toggle('active',x===t));
  document.querySelectorAll('.nv').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  window.scrollTo(0,0);
}

/* ---------- sheet ---------- */
function openFilter(){$('bdrop').classList.remove('hidden');$('btnFilter').classList.add('on')}
function closeFilter(){$('bdrop').classList.add('hidden');$('btnFilter').classList.remove('on')}
function closeDetail(){$('dbdrop').classList.add('hidden')}

/* ---------- perhitungan inti (adaptasi go() asli) ---------- */
function go(){
  const as=st.a?[st.a]:AF,ix=as.map(a=>a-1),all=!st.a;
  const mi=st.m<0?N-1:Math.min(st.m,N-1),period=BL[mi];
  ters=AF.map(a=>S(D.ts[a][mi]||[0,0]));
  kur=keb.map((k,i)=>+(k-ters[i]).toFixed(1));
  const nm=[st.a?AL[st.a-1]:'Semua afdeling',{'*':'Semua kontrak',A:'Akad',N:'Non-Akad'}[st.k],{'':'Semua status',C:'CPL',S:'SGL'}[st.s],period].join(' · ');
  $('in').textContent='Menampilkan: '+nm+(st.c>=0?' · risiko '+KT[st.c]:'')+(st.q?' · cari "'+st.q+'"':'');
  const R=D.R.filter(r=>ksel(r[4])&&ssel(r[3])),RA=R.filter(r=>asel(r[2]));
  const cnt=(a,i)=>a.filter(r=>r[6]==i).length;
  const GJ=D.GJ.filter(r=>asel(r[0])&&ksel(r[1])&&ssel(r[2]));
  const gc=Array(6).fill(0),gA=Array(6).fill(0),gN=Array(6).fill(0);
  GJ.forEach(r=>{if(r[3]<6){gc[r[3]]++;(r[1]=='A'?gA:gN)[r[3]]++}});
  const nG=S(gc);
  const tsm=m=>S(as.map(a=>S(D.ts[a][m].filter((_,j)=>!st.s||(st.s=='C'?j==0:j==1)))));
  const availTot=m=>(all&&!st.s)?AK[m]+NA[m]:tsm(m);
  const kel=m=>S(as.map(a=>D.kel[a][m])),sum=arr=>S(ix.map(i=>arr[i])),kb=sum(keb),tr=sum(ters);
  const t0=cnt(RA,0),t1=cnt(RA,1),t2=cnt(RA,2);
  const K=[
    all?[P(S(TO)/TO.length),'Rata-rata turn over '+BL[0]+'–'+BL[N-1]+' (target 4%, baseline 8%)',(S(TO)/TO.length)>.04?'bad':'ok','a']:[kel(mi),'TK keluar '+period+' ('+AL[st.a-1]+')','','a'],
    [availTot(mi),'TK panen tersedia akhir '+period+' ('+BL[0]+': '+availTot(0)+', '+P(availTot(mi)/(availTot(0)||1)-1,0)+')','bad','as'],
    [P(tr/kb),'Kecukupan pemanen: '+tr+' dari '+Math.round(kb)+' orang (kurang ±'+Math.round(kb-tr)+')','bad','a'],
    [t0+' org','Risiko TINGGI ('+(RA.length?P(t0/RA.length,0):'–')+' dari '+RA.length+'); '+t1+' SEDANG','bad','aks'],
    [sum(kl)+' / '+sum(ms),'TK keluar / masuk '+BL[0]+'–'+BL[N-1],'bad','a'],
    [nG?P((gc[0]+gc[1])/nG,0):'–','Resign bergaji < Rp 3 juta (dari '+nG+' orang)','','aks'],
    [sum(lh)+' / '+sum(pt),'Pintu rumah dihuni / tersedia','','a']
  ];
  $('kpi').innerHTML=K.map(k=>{const u=un(k[3]);return `<div class="k"><b class="${k[2]}">${k[0]}</b><span>${k[1]}${u?' <em style="opacity:.8">('+u+')</em>':''}</span></div>`}).join('');
  const G=[];
  /* 1. TO / TK keluar per bulan */
  G.push(all
    ?card('Turn over pemanen per bulan','Garis putus-putus = target 4%','<div class="hscroll">'+cols(BL,[TO],(j,t)=>t>.04?C.r:C.g,.12,(v,t)=>P(t),[.04,'target 4%'])+'</div>','')
    :card('TK keluar per bulan','Jumlah orang keluar, '+AL[st.a-1],'<div class="hscroll">'+cols(BL,[BL.map((_,m)=>kel(m))],()=>C.r,Math.max(8,...BL.map((_,m)=>kel(m)))*1.1,v=>v[0])+'</div>','a'));
  /* 2. TK tersedia akhir bulan */
  if(!st.a&&!st.s){const sa=st.k!='N',sn=st.k!='A';
    G.push(card('TK panen tersedia akhir bulan','Akad vs Non-Akad',lg(['Akad','Non-Akad'].filter((_,j)=>j?sn:sa),[C.b,C.y].filter((_,j)=>j?sn:sa))+'<div class="hscroll">'+cols(BL,[sa?AK:BL.map(()=>0),sn?NA:BL.map(()=>0)],j=>j?C.y:C.b,Math.max(...AK.map((x,i)=>x+NA[i]),1)*1.1,(v,t)=>t)+'</div>','k'))}
  else{const sc=st.s!='S',ss=st.s!='C';
    G.push(card('TK panen tersedia akhir bulan','CPL vs SGL, '+(st.a?AL[st.a-1]:'semua afdeling'),lg(['CPL','SGL'].filter((_,j)=>j?ss:sc),[C.b,C.y].filter((_,j)=>j?ss:sc))+'<div class="hscroll">'+cols(BL,[BL.map((_,m)=>sc?S(as.map(a=>D.ts[a][m][0])):0),BL.map((_,m)=>ss?S(as.map(a=>D.ts[a][m][1])):0)],j=>j?C.y:C.b,Math.max(...BL.map((_,m)=>S(as.map(a=>S(D.ts[a][m])))))*1.1,(v,t)=>t)+'</div>','as'))}
  /* 3. Kebutuhan vs ketersediaan — baris afdeling yang bisa diketuk */
  const mxk=Math.max(...keb,1);
  G.push(card('Kebutuhan vs ketersediaan pemanen ('+period+')','Ketuk afdeling untuk memfilter · hijau tersedia, merah kekurangan',
    '<div class="afd-grid">'+AL.map((l,i)=>`<button type="button" class="afd-cell${st.a===AF[i]?' sel':''}" data-afd="${AF[i]}"><span class="l">${l}</span><span class="bar"><i style="width:${Math.min(ters[i]/mxk*100,100)}%;background:${C.g}"></i><i class="kur" style="width:${Math.max(kur[i],0)/mxk*100}%;background:${C.r}"></i></span><span class="vals">${ters[i]}/${Math.round(keb[i])}</span></button>`).join('')+'</div>','a'));
  /* 4. TK masuk vs keluar per afdeling */
  const mxmk=Math.max(...ms,...kl,1)*1.1;
  G.push(card('TK masuk vs keluar per afdeling',BL[0]+'–'+BL[N-1],lg(['Masuk','Keluar'],[C.g,C.r])+AL.map((l,i)=>`<div class="row${dm(i)}"><span class="l">${l}</span><span class="t stack2"><i style="height:7px;width:${ms[i]/mxmk*100}%;background:${C.g}"></i><i style="height:7px;width:${kl[i]/mxmk*100}%;background:${C.r}"></i></span><span class="v ${ms[i]<kl[i]?'bad':'ok'}">${ms[i]-kl[i]>0?'+':''}${ms[i]-kl[i]}</span></div>`).join(''),'a'));
  /* 5. Sebaran risiko per afdeling */
  const PA=AF.map(a=>R.filter(r=>r[2]==a)),mx6=Math.max(...PA.map(x=>x.length),1);
  G.push(card('Sebaran risiko resign per afdeling',RA.length+' pemanen: '+t0+' Tinggi · '+t1+' Sedang · '+t2+' Rendah',lg(KT.map(x=>x[0]+x.slice(1).toLowerCase()),KC)+hb(AL,[0,1,2].map(j=>PA.map(x=>cnt(x,j))),KC,mx6,(v,t)=>v[0]+' · '+(t?P(v[0]/t,0):'–'),1),'ks'));
  /* 6. Resign menurut rentang gaji */
  G.push(card('Resign menurut rentang gaji',nG+' orang; '+(nG?P((gc[0]+gc[1])/nG,0):'–')+' bergaji < Rp 3 juta',lg(['Akad','Non-Akad'],[C.b,C.y])+hb(rg,[gA,gN],[C.b,C.y],Math.max(...gc,1)*1.1),'aks'));
  /* 7. Rata-rata Output & HKE */
  const panelStatus=r=>!st.pf||r[3]===st.pf;
  const avgTrend=(afd,idx)=>{const vals=R.filter(r=>r[2]===afd&&panelStatus(r)).flatMap(r=>(r[idx]||[]).map(Number).filter(Number.isFinite));return vals.length?S(vals)/vals.length:0};
  const outAvg=AF.map(a=>avgTrend(a,12)),hkeAvg=AF.map(a=>avgTrend(a,13));
  const maxOut=Math.max(...outAvg,1),outputColor=v=>v<=1000?C.r:v<=1110?C.y:C.g;
  const outputBars=AL.map((l,i)=>{const v=outAvg[i],cl=outputColor(v);return `<div class="row"><span class="l">${l}</span><span class="t"><i style="width:${v/(maxOut*1.12)*100}%;background:${cl}"></i></span><span class="v" style="color:${cl}">${F(Math.round(v))}</span></div>`}).join('');
  const hkeColor=v=>v<18?C.r:v<=20.1?C.y:C.g,maxHke=Math.max(...hkeAvg,1)*1.12;
  const hkeRows=AL.map((l,i)=>{const v=hkeAvg[i],cl=hkeColor(v);return `<div class="row"><span class="l">${l}</span><span class="t"><i style="width:${v/maxHke*100}%;background:${cl}"></i></span><span class="v" style="color:${cl}">${v.toFixed(1).replace('.',',')}</span></div>`}).join('');
  G.push(card('Rata-rata Output & HKE per Afdeling','Rata-rata tren 3 bulan terakhir · Status '+(st.pf||'Semua'),
    '<div style="display:flex;justify-content:flex-end;margin:0 0 8px"><label style="display:flex;align-items:center;gap:7px;font-size:10.5px;color:var(--mu)">Status <select id="pf" class="minisel"><option value=""'+(!st.pf?' selected':'')+'>Semua</option><option value="S"'+(st.pf==='S'?' selected':'')+'>S</option><option value="C"'+(st.pf==='C'?' selected':'')+'>C</option></select></label></div>'
    +'<h3 class="mini">Output rata-rata</h3>'+lg(['≤1.000','1.001–1.110','>1.110'],[C.r,C.y,C.g])+outputBars
    +'<h3 class="mini">HKE rata-rata</h3>'+lg(['<18','18–20,1','>20,1'],[C.r,C.y,C.g])+hkeRows,'aks',1));
  /* 8. Heatmap TO */
  G.push(card('Turn over per afdeling dan per bulan','Persentase TK keluar terhadap TK tersedia akhir bulan',toAfdChart(),'a',1));
  $('g').innerHTML=G.join('');
  const pf=$('pf');if(pf)pf.onchange=()=>{st.pf=pf.value;go()};
  /* tab pemanen */
  const RF=RA.filter(r=>st.c<0||r[6]==st.c);
  VIEW={R:R,RA:RA,RF:RF};
  renderPemanen(RF);
  renderUpdateMeta();
  updateHeader();
}

/* ---------- tab pemanen ---------- */
function renderPemanen(RF){
  const T=curT=(st.la?RF.filter(r=>r[2]==st.la):RF)
    .filter(r=>!st.q||r[1].toLowerCase().includes(st.q)||r[0].includes(st.q))
    .sort((x,y)=>y[5]-x[5]||x[7]-y[7]);
  $('fla').value=String(st.la||0);
  $('fc').value=String(st.c);
  $('pcount').textContent=T.length+' pemanen ditampilkan'+(st.la?' · '+AL[st.la-1]:' · semua afdeling')+(st.c>=0?' · risiko '+KT[st.c].toLowerCase():'')+(st.q?' · cari "'+st.q+'"':'');
  const shown=st.all?T:T.slice(0,30);
  $('plist').innerHTML=(shown.length?shown.map((r,i)=>`<div class="pcard" data-ri="${i}">
      <div class="pc-top"><b>${esc(r[1])}</b><span class="ch" style="background:${KC[r[6]]}">${KT[r[6]]}</span></div>
      <div class="pc-sub">NIK ${esc(r[0])} · ${AL[r[2]-1]} · ${r[3]||'–'} · ${r[4]=='A'?'Akad':'Non-Akad'}</div>
      <div class="pc-stats">
        <span class="pc-stat"><em>SKOR</em><b>${r[5]}</b></span>
        <span class="pc-stat"><em>PEND (RP)</em><b>${F(r[7])}</b></span>
        <span class="pc-stat"><em>HKE</em><b>${r[8]}</b></span>
        <span class="pc-stat"><em>OUTPUT</em><b>${F(r[9])}</b></span>
      </div></div>`).join('')
    :'<div class="c"><div class="sub">Tidak ada pemanen untuk filter ini. Coba ubah filter atau sinkronkan data terbaru.</div></div>')
   +(T.length>30?`<button class="btn gh" id="tm" type="button">${st.all?'Tampilkan 30 teratas':'Tampilkan semua ('+T.length+')'}</button>`:'');
  const tm=$('tm');if(tm)tm.onclick=()=>{st.all=!st.all;go()};
}
function openDetail(r){
  const FL2=[['Pendapatan < Rp 3,5 jt',16],['Pendapatan turun ≥10%',1],['Output < 880',32],['Output turun ≥10%',2],['HKE < 18 hari',8]];
  const flags=FL2.map(f=>{const on=(r[10]>>f[1])&1;return `<span class="flag${on?' ya':''}">${on?'✓ ':''}${f[0]}</span>`}).join('');
  const tren=[['Pendapatan (juta Rp)',11,v=>(v/1e6).toFixed(1).replace('.',',')+' jt'],
              ['Output (kg)',12,v=>F(Math.round(v))],
              ['HKE (hari)',13,v=>String(Math.round(v))]]
    .map(x=>`<div class="lbl"><em>${x[0]} · M-2 → M-1 → aktual</em>${spark(r[x[1]],x[2])}</div>`).join('');
  $('dbody').innerHTML=`
    <div class="dhead"><h2>${esc(r[1])}</h2><span class="ch" style="background:${KC[r[6]]}">${KT[r[6]]}</span></div>
    <div class="dnik">NIK ${esc(r[0])}</div>
    <div class="dsrow"><span class="k2">Afdeling</span><span class="v2">${AL[r[2]-1]}</span></div>
    <div class="dsrow"><span class="k2">Status</span><span class="v2">${r[3]||'–'}</span></div>
    <div class="dsrow"><span class="k2">Kontrak</span><span class="v2">${r[4]=='A'?'Akad':'Non-Akad'}</span></div>
    <div class="dsrow"><span class="k2">Skor risiko</span><span class="v2">${r[5]}</span></div>
    <div class="dsrow"><span class="k2">Pendapatan aktual</span><span class="v2">Rp ${F(r[7])}</span></div>
    <div class="dsrow"><span class="k2">HKE aktual</span><span class="v2">${r[8]} hari</span></div>
    <div class="dsrow"><span class="k2">Output aktual</span><span class="v2">${F(r[9])}</span></div>
    <div class="dsec"><h3>Penanda risiko</h3><div class="flags">${flags}</div></div>
    <div class="dsec"><h3>Tren 3 bulan</h3><div class="dspark">${tren}</div></div>
    <div class="btnrow"><button class="btn gh" id="dclose" type="button">Tutup</button></div>`;
  $('dclose').onclick=closeDetail;
  $('dbdrop').classList.remove('hidden');
}

/* ---------- tab update & header ---------- */
function renderUpdateMeta(){
  const hi=D.R.filter(r=>r[6]==0).length;
  $('upmeta').innerHTML=
    `<div><em>Pemanen</em><b>${D.R.length} org</b></div>`+
    `<div><em>Periode</em><b>${BL[0]}–${BL[N-1]}</b></div>`+
    `<div><em>Afdeling</em><b>${AF.length}</b></div>`+
    `<div><em>Risiko tinggi</em><b>${hi}</b></div>`;
}
function updateHeader(){
  $('abPeriod').textContent=BL[N-1];
  const fresh=CUR&&CUR.ts&&(Date.now()-CUR.ts<7*24*3600*1000);
  const b=$('abSync');
  b.classList.toggle('fresh',!!fresh);
  $('abSyncTxt').textContent=CUR&&CUR.ts?('Sync '+fmtShort(new Date(CUR.ts))):('Data awal · '+D.R.length+' pemanen');
}
const _saveLU=saveLastUpload;
saveLastUpload=function(name){_saveLU(name);try{updateHeader()}catch(e){}};

/* ---------- inisialisasi ---------- */
$('fla').innerHTML='<option value="0">Semua afdeling</option>'+AF.map((n,i)=>`<option value="${n}">${AL[i]}</option>`).join('');
$('fla').onchange=()=>{st.la=+$('fla').value;st.all=0;go()};
$('fc').onchange=()=>{st.c=+$('fc').value;st.all=0;go()};
$('q').oninput=()=>{st.q=$('q').value.trim().toLowerCase();st.all=0;go()};
document.querySelectorAll('.nv').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.t)));
$('btnFilter').onclick=openFilter;
$('fapply').onclick=()=>{closeFilter();go()};
$('abSync').onclick=()=>showTab('update');
$('bdrop').addEventListener('click',e=>{if(e.target.id==='bdrop')closeFilter()});
$('dbdrop').addEventListener('click',e=>{if(e.target.id==='dbdrop')closeDetail()});
$('g').addEventListener('click',e=>{
  const b=e.target.closest('.afd-cell');if(!b)return;
  const a=+b.dataset.afd;
  st.a=(st.a===a)?0:a;$('fa').value=String(st.a||0);go();
});
$('plist').addEventListener('click',e=>{
  const c=e.target.closest('.pcard');if(!c)return;
  const r=curT[+c.dataset.ri];if(r)openDetail(r);
});
loadLastUpload();
setM(clone(D0));
fillPeriod();
go();
restoreSaved();
initSync();
