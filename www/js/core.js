/* ============================================================
   core.js — mesin data Dashboard Retensi Pemanen KSA1G (mode APK)
   Diadaptasi 1:1 dari aplikasi asli:
   - parser Excel (applyWB + format template asli/DB Query)
   - penyimpanan IndexedDB (+cadangan localStorage)
   - sync Google Spreadsheet (export xlsx + gviz, dengan proxy cadangan)
   - unduh berkas: di APK via Filesystem + Share, di browser via unduhan biasa
   Renderer tampilan ada di ui.js (UI mobile).
   ============================================================ */

const F=n=>n.toLocaleString('id-ID'),P=(n,d=1)=>(n*100).toFixed(d).replace('.',',')+'%',S=a=>a.reduce((x,y)=>x+y,0);
const C={g:'var(--g)',r:'var(--r)',y:'var(--y)',b:'var(--b)',x:'var(--gr)'};
const AF=[1,2,3,4,5,6,7,8,9,10],AL=AF.map(n=>'Afd '+String(n).padStart(2,'0'));
let D,BL,TO,AK,NA,keb,luas,ms,kl,kp,lh,ks,pt,ters,kur,N,LAST=[];
function setM(d){D=d;const m=d.M;BL=m.BL;TO=m.TO;AK=m.AK;NA=m.NA;keb=m.keb;luas=m.luas;ms=m.ms;kl=m.kl;kp=m.kp;lh=m.lh;ks=m.ks;pt=m.pt;N=BL.length;ters=AF.map(a=>S(d.ts[a][N-1]));kur=keb.map((k,i)=>+(k-ters[i]).toFixed(1))}
const LASTUP_KEY='ksa1g_retensi_last_upload';
const fmtUpload=d=>new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZoneName:'short'}).format(d);
function showLastUpload(text){const el=$('lastup');if(el)el.textContent=text}
function saveLastUpload(name){const text=fmtUpload(new Date())+' · '+name;showLastUpload(text);try{localStorage.setItem(LASTUP_KEY,text)}catch(e){}}
function loadLastUpload(){let text='Belum ada unggahan pada sesi ini';try{text=localStorage.getItem(LASTUP_KEY)||text}catch(e){}showLastUpload(text)}
const rg=['0–2 jt','2–3 jt','3–4 jt','4–5 jt','5–6 jt','>6 jt'];
const st={a:0,k:'*',s:'',m:-1,c:-1,q:'',all:0,la:0,pf:''};
function fillPeriod(){const fm=$('fm');if(!fm||!Array.isArray(BL))return;fm.innerHTML='<option value="-1">Bulan terbaru</option>'+BL.map((b,i)=>`<option value="${i}">${b}</option>`).join('');fm.value=String(st.m)}
const $=id=>document.getElementById(id);
$('fa').innerHTML='<option value="0">Semua afdeling</option>'+AF.map((n,i)=>`<option value="${n}">${AL[i]}</option>`).join('');
$('fa').onchange=()=>{st.a=+$('fa').value;st.all=0;go()};$('fk').onchange=()=>{st.k=$('fk').value;st.all=0;go()};
$('fs').onchange=()=>{st.s=$('fs').value;st.all=0;go()};$('fm').onchange=()=>{st.m=+$('fm').value;st.all=0;go()};
$('rs').onclick=()=>{Object.assign(st,{a:0,k:'*',s:'',m:-1,c:-1,q:'',all:0,la:0,pf:''});$('fa').value='0';$('fk').value='*';$('fs').value='';$('fm').value='-1';const fc=$('fc');if(fc)fc.value='-1';const q=$('q');if(q)q.value='';go()};
const asel=a=>!st.a||a==st.a,ksel=k=>st.k=='*'||k==st.k,ssel=s=>!st.s||s==st.s;
const NM={a:'afdeling',k:'kontrak',s:'status'};
const act=()=>[st.a?'a':'',st.k!='*'?'k':'',st.s?'s':''].filter(Boolean);
const un=ap=>{const u=act().filter(x=>!ap.includes(x)).map(x=>NM[x]);return u.length?'tidak terfilter: '+u.join(', '):''};
const card=(t,s,b,ap,wide)=>{const g=un(ap||'');return `<div class="c${wide?' wide':''}"><h2>${t}${g?`<span class="tag">${g}</span>`:''}</h2><div class="sub">${s}</div>${b}</div>`};
const lg=(n,c)=>'<div class="lg">'+n.map((x,i)=>`<span><u style="background:${c[i]}"></u>${x}</span>`).join('')+'</div>';
const dm=i=>st.a&&AF[i]!=st.a?' d':'';
function hb(lb,se,cc,mx,fmt,dim){return lb.map((l,i)=>{const vs=se.map(s=>s[i]),tot=S(vs);
 return `<div class="row${dim?dm(i):''}"><span class="l">${l}</span><span class="t">${vs.map((v,j)=>`<i style="width:${v/mx*100}%;background:${cc[j]}"></i>`).join('')}</span><span class="v">${fmt?fmt(vs,tot):tot}</span></div>`}).join('')}
function cols(lb,se,cc,mx,top,line){const b=lb.map((l,i)=>{const vs=se.map(s=>s[i]),tot=S(vs);
 return `<div class="col"><span>${top(vs,tot)}</span><div class="s" style="height:${tot/mx*100}%">${vs.map((v,j)=>`<i style="height:${tot?v/tot*100:0}%;background:${cc(j,tot)}"></i>`).join('')}</div></div>`}).join('');
 return `<div class="cols">${b}${line?`<div class="tl" style="bottom:${line[0]/mx*100}%"><em>${line[1]}</em></div>`:''}</div><div class="xl">${lb.map(l=>`<span>${l}</span>`).join('')}</div>`}
const FL=[[1,'Akad'],[16,'Pend<3,5jt'],[8,'HKE<18'],[2,'Pend↓'],[32,'Output<880'],[4,'Output↓']];
const KT=['TINGGI','SEDANG','RENDAH'],KC=[C.r,C.y,C.g];
const spark=(a,fmt)=>{a=(a||[0,0,0]).map(Number);const mn=Math.min(...a,0),mx=Math.max(...a,1),rg=mx-mn||1,pts=a.map((v,i)=>`${i*30+2},${22-(v-mn)/rg*18}`).join(' '),d=a[2]-a[0],cl=d<0?'dn':d>0?'up':'flat',ar=d<0?'▼':d>0?'▲':'•';return `<div class="spark"><svg viewBox="0 0 64 24"><polyline points="${pts}" fill="none" stroke="${d<0?C.r:d>0?C.g:C.y}" stroke-width="2"/></svg><small>${a.map(fmt).join(' → ')}<br><b class="${cl}">${ar} ${fmt(Math.abs(d))}</b></small></div>`};
const toAfdChart=()=>{const vals=AF.map(a=>BL.map((_,m)=>D.kel[a][m]/(S(D.ts[a][m])||1))),head='<span></span>'+BL.map(b=>`<span class="tohm-h">${b}</span>`).join(''),body=AF.map((a,i)=>`<span class="tohm-l">${AL[i]}</span>`+vals[i].map(v=>{const pct=v*100,bg=pct>=4?'rgba(229,103,90,.78)':pct<=3?'rgba(79,179,122,.42)':'rgba(233,184,74,.55)',hot=pct>=4?' hot':'';return `<span class="tohm-c${hot}" style="background:${bg}" title="${AL[i]} · ${P(v)}">${P(v,0)}</span>`}).join('')).join('');return `<div class="tohm"><div class="tohm-grid" style="--n:${N}">${head}${body}</div><div class="tohm-legend"><span style="display:inline-block;width:12px;height:8px;border-radius:3px;background:rgba(79,179,122,.60)"></span><span>≤ 3% hijau</span><span style="display:inline-block;width:12px;height:8px;border-radius:3px;background:rgba(229,103,90,.85)"></span><span>≥ 4% merah</span><span>TO = TK keluar ÷ TK tersedia akhir bulan</span></div></div>`};

const DSt=$('dst');
function say(m,bad){DSt.textContent=m;DSt.style.color=bad?'var(--r)':'var(--mu)'}
const nk=s=>String(s==null?'':s).toLowerCase().replace(/↓/g,'dn').replace(/[^a-z0-9]/g,'');
const num=v=>{if(typeof v=='number')return v;const x=parseFloat(String(v).replace(/\s/g,'').replace(',','.'));return isNaN(x)?0:x};
const afdN=v=>{const m=String(v).match(/\d+/);return m?+m[0]:0};
const kon=v=>{const s=nk(v);return s.includes('non')?'N':s.includes('akad')?'A':''};
const stt=v=>{const s=nk(v);return s=='cpl'?'C':s=='sgl'?'S':''};
const RN=['0-2Juta','2-3Juta','3-4Juta','4-5Juta','5-6Juta','>6Juta','Tidak Pernah Ada Gaji'],RNK={'02juta':0,'23juta':1,'34juta':2,'45juta':3,'56juta':4,'6juta':5,'tidakpernahadagaji':6};
const pick=(r,ks)=>{for(const k of ks)if(r[k]!==undefined&&r[k]!=='')return r[k];return''};
const pk=(r,p)=>{const k=Object.keys(r).find(x=>x.startsWith(p));return k?r[k]:''};
const cleanNik=v=>String(v).trim().replace(/\.0$/,'');
const SA={Pemanen:['pemanen','skorresikoresign'],Resign_Gaji:['resigngaji','gajikaryawanresign'],Resign_Skor:['resignskor','skoractualresign'],Afdeling:['afdeling'],Bulanan:['bulanan'],Tersedia_Afd:['tersediaafd'],Keluar_Afd:['keluarafd'],Kebutuhan:['kebutuhantkpanen'],TurnOver:['turnover'],Rumah:['ketersediaanrumah']};
const findSheet=(wb,k)=>wb.SheetNames.find(s=>SA[k].includes(nk(s)));
const wantNames=w0=>Object.keys(SA).map(k=>findSheet(w0,k)).filter(Boolean);
const MON=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const AOA=ws=>XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
const isAf=x=>/^afdeling\s*\d+$/i.test(String(x).trim());
function tblRows(ws,req){const a=AOA(ws);let h=-1;
 for(let i=0;i<Math.min(a.length,40);i++){const ks=a[i].map(nk);if(req.every(q=>ks.includes(q))){h=i;break}}
 if(h<0)return null;const seen={},keys=a[h].map(x=>{const k=nk(x);if(!k)return null;seen[k]=(seen[k]||0)+1;return seen[k]>1?k+'_'+seen[k]:k});
 return a.slice(h+1).map(row=>{const o={};keys.forEach((k,j)=>{if(k&&row[j]!==undefined&&row[j]!=='')o[k]=row[j]});return o})}
const grade=g=>g<=0?6:g<2e6?0:g<3e6?1:g<4e6?2:g<5e6?3:g<6e6?4:5;
function pGorig(ws){const a=AOA(ws);let hr=-1;
 for(let i=0;i<Math.min(a.length,40);i++){const ks=a[i].map(nk);if(ks.includes('desc')&&ks.includes('nama')&&ks.includes('nik')){hr=i;break}}
 if(hr<0)return null;const H=a[hr].map(nk),c={a:H.indexOf('desc'),n:H.indexOf('nama'),i:H.indexOf('nik'),s:H.indexOf('status'),k:H.findIndex(x=>x.startsWith('kontrak'))};
 let cg=-1,cr=-1;for(let i=0;i<=hr;i++)a[i].forEach((x,j)=>{const y=nk(x);if(y.startsWith('gajiratarata'))cg=j;if(y=='rentanggaji')cr=j});
 const out=[];let skip=0;
 for(let i=hr+1;i<a.length;i++){const r=a[i];if(!isAf(r[c.a])||!String(r[c.n]).trim())continue;const af=afdN(r[c.a]),k=kon(r[c.k]);if(af<1||af>10||!k){skip++;continue}
  const g=cg>=0?Math.round(num(r[cg])):0;let ri=cr>=0?RNK[nk(String(r[cr]).replace('>',''))]:undefined;if(ri===undefined)ri=grade(g);
  out.push([af,k,stt(r[c.s]),ri,String(r[c.n]).trim(),cleanNik(r[c.i]),g])}
 return{out,skip}}
function pivotAf(a,lab){const li=a.findIndex(r=>r.some(x=>nk(x)==lab));if(li<0)return null;
 let hi=-1,c=-1;for(let i=li;i<li+6&&i<a.length;i++){const j=a[i].findIndex(x=>nk(x)=='desc');if(j>=0){hi=i;c=j;break}}
 if(hi<0)return null;let nm=0;while(/^\d+$/.test(String(a[hi][c+1+nm]).trim()))nm++;
 const out={};for(let i=hi+1;i<a.length;i++){const lb=a[i][c];if(!isAf(lb))break;out[afdN(lb)]=a[i].slice(c+1,c+1+nm).map(num)}return out}
function pTO(ws){const a=AOA(ws),o={};
 const ri=a.findIndex(r=>r.some(x=>nk(x)=='tersediaawalbulan'));
 if(ri>=0){const c=a[ri].findIndex(x=>nk(x)=='tersediaawalbulan');let nm=0;const hd=a[ri-1]||[];while(/^\d+$/.test(String(hd[c+1+nm]).trim()))nm++;
  const row=lab=>a.slice(ri,ri+12).find(r=>nk(r[c])==lab);
  const to=row('to');if(to&&nm){o.BL=hd.slice(c+1,c+1+nm).map(x=>MON[+x-1]||String(x));o.TO=to.slice(c+1,c+1+nm).map(x=>{const v=num(x);return v>1?v/100:v})}}
 const lab=l=>{const r=a.find(r=>r.some((x,j)=>nk(x)==l&&typeof r[j+1]=='number'));if(!r)return null;const j=r.findIndex(x=>nk(x)==l);return r.slice(j+1).filter(x=>typeof x=='number')};
 o.AK=lab('akad');o.NA=lab('nonakad');o.kel=pivotAf(a,'sumoftotalkeluar');
 const hi=a.findIndex(r=>{const ks=r.map(nk);return ks.includes('desc')&&ks.includes('tkmasuk')&&ks.includes('tkkeluar')});
 if(hi>=0){const ks=a[hi].map(nk),cd=ks.indexOf('desc'),cm=ks.indexOf('tkmasuk'),ck=ks.indexOf('tkkeluar');o.ms={};o.kl={};
  for(let i=hi+1;i<a.length&&isAf(a[i][cd]);i++){const af=afdN(a[i][cd]);o.ms[af]=num(a[i][cm]);o.kl[af]=num(a[i][ck])}}
 return o}
function pKeb(ws){const a=AOA(ws);let kc=-1,lc=-1,hr=-1;
 for(let i=0;i<Math.min(a.length,20);i++)a[i].forEach((x,j)=>{const y=nk(x);if(y=='keborang'&&kc<0){kc=j;hr=i}if(y=='luas'&&lc<0)lc=j});
 const o={keb:{},luas:{},ts:{}};
 if(kc>=0&&lc>=0)for(let i=hr+1;i<a.length;i++){const r=a[i],j=r.findIndex((x,jj)=>jj<lc&&isAf(x));if(j<0)continue;const af=afdN(r[j]);if(af>=1&&af<=10){o.keb[af]=num(r[kc]);o.luas[af]=num(r[lc])}}
 let dc=-1,bc=-1,cc=-1,sc=-1,hb=-1;
 for(let i=0;i<Math.min(a.length,20)&&hb<0;i++){const ks=a[i].map(nk),d=ks.indexOf('desc');if(d>=0){const b=ks.indexOf('bulanperiode3',d);if(b>=0){const c1=ks.indexOf('cpl',b),s1=ks.indexOf('sgl',b);if(c1>=0&&s1>=0){hb=i;dc=d;bc=b;cc=c1;sc=s1}}}}
 if(hb>=0)for(let i=hb+1;i<a.length;i++){const r=a[i];if(!isAf(r[dc]))continue;const af=afdN(r[dc]),m=parseInt(r[bc]);if(af<1||af>10||!m)continue;(o.ts[af]=o.ts[af]||[])[m-1]=[num(r[cc]),num(r[sc])]}
 return(Object.keys(o.keb).length||Object.keys(o.ts).length)?o:null}
function pR(rows){const out=[];let skip=0;rows.forEach(r=>{const nik=cleanNik(pick(r,['nik'])),nama=String(pick(r,['nama'])).trim(),a=afdN(pick(r,['afdeling','afd'])),k=kon(pick(r,['kontrak','kontrakkerjaakadnonakad']));
 if(/^contoh/i.test(nama)||nik==='0000000')return;if(!(nik||nama)||a<1||a>10||!k){skip++;return}
 const skor=num(pick(r,['skor','skortotal']));let kt=KT.indexOf(String(pick(r,['kategori'])).toUpperCase().trim());if(kt<0)kt=skor>3?0:skor>=2?1:2;
 const fl=ks=>num(pick(r,ks))?1:0;
 const f=(k=='A'?1:0)|fl(['pendturun10','pendapatandn'])*2|fl(['outputturun10','trenoutputdn'])*4|fl(['hke18','hke18hari'])*8|fl(['pend35jt','pendapatan35jt'])*16|fl(['output880'])*32;
 out.push([nik,nama,a,stt(pick(r,['status'])),k,skor,kt,Math.round(num(pick(r,['pendapatanaktualrp','pendapatanbulanactualrp']))),Math.round(num(pick(r,['hkeaktual','hkeactual','hke']))),Math.round(num(pick(r,['outputaktual','outputbulanactual','output']))),f,...TRS(r)])});return{out,skip}}
function pG(rows){const out=[];let skip=0;rows.forEach(r=>{const a=afdN(pick(r,['afdeling','afd'])),k=kon(pick(r,['kontrak','kontrakkerjaakadnonakad']));if(/^contoh/i.test(String(pick(r,['nama']))))return;if(a<1||a>10||!k){skip++;return}
 const g=Math.round(num(pk(r,'gaji')));let ri=RNK[nk(String(pick(r,['rentanggaji','rentang'])).replace('>',''))];
 if(ri===undefined)ri=g<=0?6:g<2e6?0:g<3e6?1:g<4e6?2:g<5e6?3:g<6e6?4:5;
 out.push([a,k,stt(pick(r,['status'])),ri,String(pick(r,['nama'])).trim(),cleanNik(pick(r,['nik'])),g])});return{out,skip}}
function pA(rows){const out=[];let skip=0;rows.forEach(r=>{const a=afdN(pick(r,['afdeling','afd'])),k=kon(pick(r,['kontrak','kontrakkerjaakadnonakad']));if(/^contoh/i.test(String(pick(r,['nama']))))return;if(a<1||a>10||!k){skip++;return}
 const skor=num(pick(r,['skor','skortotal']));let kt=KT.indexOf(String(pick(r,['kategori'])).toUpperCase().trim());if(kt<0)kt=skor>=3?0:skor>=2?1:2;
 out.push([a,k,stt(pick(r,['status'])),nk(pick(r,['keterangan']))=='countable'?1:0,kt,String(pick(r,['nama'])).trim(),cleanNik(pick(r,['nik'])),skor])});return{out,skip}}
function applyWB(wb){
 const nd=JSON.parse(JSON.stringify(D)),m=nd.M,rep=[],warn=[];let hit=0,orig=0,pts=null,pkel=null,rows,p,s;
 const sh=k=>{const n=findSheet(wb,k);return n&&wb.Sheets[n]?{n,ws:wb.Sheets[n]}:null};
 const skp=(n,x)=>{if(x)warn.push(x+' baris '+n+' dilewati')};
 if(s=sh('Pemanen')){rows=tblRows(s.ws,['nik','nama']);if(rows){hit++;TMISS=0;p=pR(rows);if(!p.out.length)throw new Error('Sheet '+s.n+' tidak berisi baris valid (wajib: NIK/Nama, Afdeling 1–10, Kontrak Akad/Non-Akad)');nd.R=p.out;rep.push(p.out.length+' pemanen');skp('Pemanen',p.skip);if(TMISS)warn.push('kolom tren M-2/M-1 tidak ditemukan untuk sebagian pemanen (dipakai nilai aktual)')}}
 if(s=sh('Resign_Gaji')){const og=nk(s.n)=='gajikaryawanresign';if(og)orig++;rows=og?null:tblRows(s.ws,['nama','nik']);p=og?pGorig(s.ws):rows?pG(rows):null;if(p){hit++;nd.GJ=p.out;rep.push(p.out.length+' resign (gaji)');skp('Resign_Gaji',p.skip)}}
 if(s=sh('Resign_Skor')){rows=tblRows(s.ws,['nik','nama']);if(rows){hit++;if(nk(s.n)=='skoractualresign')orig++;p=pA(rows);nd.AC=p.out;rep.push(p.out.length+' resign (skor)');skp('Resign_Skor',p.skip)}}
 if(s=sh('Afdeling')){rows=tblRows(s.ws,['afdeling']);if(rows){hit++;let c=0;rows.forEach(r=>{const a=afdN(pick(r,['afdeling','afd']));if(a<1||a>10)return;const i=a-1,set=(arr,q)=>{const x=pk(r,q);if(x!=='')arr[i]=num(x)};c++;
  set(m.luas,'luas');set(m.keb,'kebutuhanpemanen');set(m.ms,'tkmasuk');set(m.kl,'tkkeluar');set(m.kp,'kebutuhanpintu');set(m.pt,'pintutersedia');set(m.lh,'pintudihuni');set(m.ks,'pintukosong')});
  rep.push(c+' afdeling');if(c<10)warn.push('Sheet Afdeling hanya memuat '+c+' dari 10 afdeling; sisanya memakai data sebelumnya')}}
 if(s=sh('Bulanan')){rows=tblRows(s.ws,['bulan']);if(rows){hit++;rows=rows.filter(r=>String(pick(r,['bulan'])).trim());if(!rows.length)throw new Error('Sheet Bulanan kosong');
  m.BL=rows.map(r=>String(pick(r,['bulan'])).trim());m.TO=rows.map(r=>{const x=num(pk(r,'to'));return x>1?x/100:x});m.AK=rows.map(r=>num(pk(r,'akad')));m.NA=rows.map(r=>num(pk(r,'nonakad')));rep.push(rows.length+' bulan')}}
 if(s=sh('Tersedia_Afd')){rows=tblRows(s.ws,['afdeling','cpl']);if(rows){hit++;pts={};let c=0;rows.forEach(r=>{const a=afdN(pick(r,['afdeling'])),b=num(pk(r,'bulan'));if(a<1||a>10||b<1)return;(pts[a]=pts[a]||[])[b-1]=[num(pick(r,['cpl'])),num(pick(r,['sgl']))];c++});rep.push(c+' baris tersedia/afd')}}
 if(s=sh('Keluar_Afd')){rows=tblRows(s.ws,['afdeling']);if(rows){hit++;pkel={};rows.forEach(r=>{const a=afdN(pick(r,['afdeling']));if(a<1||a>10)return;pkel[a]=Object.keys(r).filter(k=>k!='afdeling').map(k=>num(r[k]))});rep.push(Object.keys(pkel).length+' afdeling keluar/bulan')}}
 // ---- format template asli (pivot)
 if(s=sh('TurnOver')){p=pTO(s.ws);if(p&&(p.BL||p.kel||p.ms)){hit++;orig++;const got=[];
  if(p.BL){m.BL=p.BL;m.TO=p.TO;got.push(p.BL.length+' bulan')}
  const nn=m.BL.length;
  if(p.AK&&p.NA){m.AK=p.AK.slice(0,nn);m.NA=p.NA.slice(0,nn)}
  if(p.kel){pkel=p.kel;got.push('TK keluar/bulan')}
  if(p.ms){Object.keys(p.ms).forEach(a=>{m.ms[a-1]=p.ms[a];m.kl[a-1]=p.kl[a]});got.push('masuk/keluar per afdeling')}
  rep.push('Turn Over ('+got.join(', ')+')')}}
 if(s=sh('Kebutuhan')){p=pKeb(s.ws);if(p){hit++;orig++;Object.keys(p.keb).forEach(a=>{m.keb[a-1]=p.keb[a];m.luas[a-1]=p.luas[a]});if(Object.keys(p.ts).length)pts=p.ts;rep.push('Kebutuhan TK panen ('+Object.keys(p.keb).length+' afdeling)')}}
 if(s=sh('Rumah')){rows=tblRows(s.ws,['afd','pintudihuni']);if(rows){hit++;orig++;let c=0;rows.forEach(r=>{const a=afdN(pick(r,['afd']));if(a<1||a>10)return;const i=a-1;c++;
  m.kp[i]=num(pick(r,['kebutuhanpintu']));m.pt[i]=num(pick(r,['jumlahpintutersedia','pintutersedia']));m.lh[i]=num(pick(r,['pintudihuni']));m.ks[i]=num(pick(r,['pintukosong']));const l=num(pick(r,['luastanamha']));if(l)m.luas[i]=l});rep.push('Ketersediaan Rumah ('+c+' afdeling)')}}
 if(!hit){const w=wb.Sheets[wb.SheetNames[0]];rows=w?tblRows(w,['nik','nama']):null;p=rows?pR(rows):{out:[]};if(!p.out.length)throw new Error('Tidak ada sheet yang dikenali. Unggah file template asli "Data Pendukung Retensi Panen - DB Query.xlsx", "Template unggah", atau file hasil "Unduh data".');nd.R=p.out;rep.push(p.out.length+' pemanen (sheet tunggal)');skp('',p.skip)}
 const nn=m.BL.length;
 ['TO','AK','NA'].forEach(k=>{if(m[k].length!=nn)throw new Error('Jumlah bulan tidak konsisten pada data Bulanan/Turn Over')});
 if(pts){let miss=0;AF.forEach(a=>{nd.ts[a]=Array.from({length:nn},(_,j)=>{const x=pts[a]&&pts[a][j];if(!x)miss++;return x||[0,0]})});if(miss)warn.push('Tersedia per afdeling: '+miss+' kombinasi afdeling-bulan kosong (dihitung 0)')}
 if(pkel){let miss=0;AF.forEach(a=>{nd.kel[a]=Array.from({length:nn},(_,j)=>{const x=pkel[a]&&pkel[a][j];if(x===undefined)miss++;return x||0})});if(miss)warn.push('TK keluar per bulan: '+miss+' sel kosong (dihitung 0)')}
 AF.forEach(a=>{nd.ts[a]=(nd.ts[a]||[]).slice(0,nn);while(nd.ts[a].length<nn)nd.ts[a].push([0,0]);nd.kel[a]=(nd.kel[a]||[]).slice(0,nn);while(nd.kel[a].length<nn)nd.kel[a].push(0)});
 if(!rep.length)throw new Error('Tidak ada data yang bisa dibaca');
 return{nd,rep,warn,orig}}
$('up').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
 if(typeof XLSX=='undefined'){say('Pustaka Excel gagal dimuat; unggah tidak tersedia.',1);return}
 try{say('Membaca "'+f.name+'" ('+(f.size/1048576).toFixed(1)+' MB)… file besar bisa memerlukan beberapa detik.');showLoadSafe('Membaca berkas Excel…');await new Promise(r=>setTimeout(r,60));
  const buf=await f.arrayBuffer(),o={type:'array',cellFormula:false,cellHTML:false,cellStyles:false,cellNF:false};let wb;
  if(/\.csv$/i.test(f.name))wb=XLSX.read(buf,o);else{const w0=XLSX.read(buf,{type:'array',bookSheets:true}),want=wantNames(w0);wb=XLSX.read(buf,want.length?Object.assign({sheets:want},o):o)}
  const r=applyWB(wb),old=D;setM(r.nd);st.m=-1;fillPeriod();st.all=0;go();saveLastUpload(f.name);persist(r.nd,f.name,old);say('Dimuat dari "'+f.name+'"'+(r.orig?' (format template asli)':'')+': '+r.rep.join(', ')+'.'+(r.warn.length?' Perhatian: '+r.warn.join('; ')+'.':'')+' Tersimpan otomatis di browser ini.',r.warn.length);hideLoadSafe()}
 catch(err){hideLoadSafe();say('Gagal memuat "'+f.name+'": '+err.message+' (data lama tetap dipakai).',1)}};
// ---- penyimpanan berkas: APK (Filesystem+Share) dengan cadangan unduh browser
const isNativeApp=()=>!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
function b64FromBlob(b){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]||'');r.onerror=()=>rej(r.error);r.readAsDataURL(b)})}
function b64FromStr(s){return btoa(unescape(encodeURIComponent(s)))}
function fallbackSave(name,data){try{const b=data instanceof Blob?data:new Blob([data],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);
 say('Berkas diunduh: '+name)}catch(e){say('Unduh tidak tersedia di tampilan ini.',1)}}
async function save(name,data){
 if(isNativeApp()){
  try{
   const P=window.Capacitor.Plugins;
   const b64=(data instanceof Blob)?await b64FromBlob(data):b64FromStr(String(data));
   const res=await P.Filesystem.writeFile({path:name,data:b64,directory:'CACHE',recursive:true});
   await P.Share.share({title:name,url:res.uri,dialogTitle:'Simpan / Bagikan berkas'});
   say('Berkas siap disimpan: '+name);return
  }catch(e){/* lanjut cara browser */}
 }
 fallbackSave(name,data)}

const AFn=a=>'Afd '+String(a).padStart(2,'0'),TT=['TINGGI','SEDANG','RENDAH'];
const rowP=r=>({'NIK':r[0],'Nama':r[1],'Afdeling':AFn(r[2]),'Status':r[3]=='C'?'CPL':r[3]=='S'?'SGL':'-','Kontrak':r[4]=='A'?'Akad':'Non-Akad','Skor':r[5],'Kategori':TT[r[6]],'Pendapatan Aktual (Rp)':r[7],'HKE Aktual':r[8],'Output Aktual':r[9],'Pend < 3,5jt':(r[10]>>4)&1,'HKE < 18':(r[10]>>3)&1,'Pend turun ≥10%':(r[10]>>1)&1,'Output < 880':(r[10]>>5)&1,'Output turun ≥10%':(r[10]>>2)&1,'Pendapatan M-2':tv(r,11,0),'Pendapatan M-1':tv(r,11,1),'Output M-2':tv(r,12,0),'Output M-1':tv(r,12,1),'HKE M-2':tv(r,13,0),'HKE M-1':tv(r,13,1)});
const SS=x=>x=='C'?'CPL':x=='S'?'SGL':'-',KK=x=>x=='A'?'Akad':'Non-Akad';
function buildWB(d,tpl){const m=d.M,nn=m.BL.length,wb=XLSX.utils.book_new(),add=(n,rows)=>XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),n);
 const R=tpl?[['0000000','Contoh Nama',1,'C','A',3,1,3000000,20,900,1]]:d.R,GJ=tpl?[[1,'A','C',1,'Contoh Nama','0000000',2500000]]:d.GJ,AC=tpl?[[1,'A','C',1,0,'Contoh Nama','0000000',3]]:d.AC;
 XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Petunjuk unggah data'],['0. File template asli "Data Pendukung Retensi Panen - DB Query.xlsx" juga bisa diunggah langsung (dibaca dari sheet Skor Resiko Resign, Gaji Karyawan Resign, Skor Actual Resign, Kebutuhan TK panen, Turn Over, Ketersediaan Rumah).'],['1. Atau unggah file .xlsx dengan nama sheet & kolom persis seperti berikut; sheet yang tidak ada akan dilewati (data lama tetap).'],['2. Sheet: Pemanen, Resign_Gaji, Resign_Skor, Afdeling, Bulanan, Tersedia_Afd, Keluar_Afd. File .csv dianggap sheet Pemanen (pemisah koma).'],['3. Afdeling ditulis "Afd 01".."Afd 10"; Kontrak = Akad / Non-Akad; Status = CPL / SGL; Kategori = TINGGI / SEDANG / RENDAH.'],['4. Kolom flag pada sheet Pemanen bernilai 1 (ya) atau 0 (tidak). Rentang gaji: 0-2Juta, 2-3Juta, 3-4Juta, 4-5Juta, 5-6Juta, >6Juta, Tidak Pernah Ada Gaji.'],['5. Bulanan: % TO berupa pecahan (0,038) atau persen (3,8). Tersedia_Afd harus memuat semua bulan (Bulan (no) 1..n) untuk 10 afdeling.'],[tpl?'6. Nilai pada sheet Afdeling/Bulanan/Tersedia_Afd/Keluar_Afd di template ini hanyalah contoh (data saat ini).':'6. Berkas ini dibuat dari data yang sedang tampil di dashboard.']]),'Petunjuk');
 add('Pemanen',R.map(rowP));
 add('Resign_Gaji',GJ.map(r=>({'Nama':r[4],'NIK':r[5],'Afdeling':AFn(r[0]),'Status':SS(r[2]),'Kontrak':KK(r[1]),'Gaji Rata-rata (Rp)':r[6],'Rentang Gaji':RN[r[3]]})));
 add('Resign_Skor',AC.map(r=>({'Nama':r[5],'NIK':r[6],'Afdeling':AFn(r[0]),'Status':SS(r[2]),'Kontrak':KK(r[1]),'Skor':r[7],'Kategori':TT[r[4]],'Keterangan':r[3]?'Countable':'Uncountable'})));
 add('Afdeling',AF.map((a,i)=>({'Afdeling':AFn(a),'Luas Tanam (Ha)':m.luas[i],'Kebutuhan Pemanen (org)':m.keb[i],'TK Masuk':m.ms[i],'TK Keluar':m.kl[i],'Kebutuhan Pintu':m.kp[i],'Pintu Tersedia':m.pt[i],'Pintu Dihuni':m.lh[i],'Pintu Kosong':m.ks[i]})));
 add('Bulanan',m.BL.map((b,i)=>({'Bulan':b,'% TO':m.TO[i],'Akad (akhir bulan)':m.AK[i],'Non-Akad (akhir bulan)':m.NA[i]})));
 const wsB=wb.Sheets['Bulanan'];m.BL.forEach((_,i)=>{const c=wsB['B'+(i+2)];if(c)c.z='0.0%'});
 const tr=[];AF.forEach(a=>d.ts[a].slice(0,nn).forEach((x,j)=>tr.push({'Afdeling':AFn(a),'Bulan (no)':j+1,'CPL':x[0],'SGL':x[1]})));add('Tersedia_Afd',tr);
 add('Keluar_Afd',AF.map(a=>{const o={'Afdeling':AFn(a)};m.BL.forEach((b,j)=>o[b]=d.kel[a][j]);return o}));
 return wb}
const xl=(wb)=>new Blob([XLSX.write(wb,{type:'array',bookType:'xlsx'})],{type:'application/octet-stream'});
const need=()=>{if(typeof XLSX=='undefined'){say('Pustaka Excel gagal dimuat; unduh Excel tidak tersedia.',1);return 0}return 1};
$('dx').onclick=()=>need()&&save('Data_Retensi_Panen_KSA1G.xlsx',xl(buildWB(D,0)));
$('dc').onclick=()=>{if(!LAST.length){say('Tidak ada baris untuk diunduh pada filter ini.',1);return}
 const rows=LAST.map(rowP),h=Object.keys(rows[0]),q=v=>{const s=String(v);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
 save('Pemanen_Berisiko_Terfilter.csv','\ufeff'+[h.map(q).join(',')].concat(rows.map(r=>h.map(k=>q(r[k])).join(','))).join('\r\n'))};

// ===== v2: animasi, penyimpanan permanen, template =====
let TMISS=0;const clone=o=>JSON.parse(JSON.stringify(o));
const tv=(r,i,j)=>r[i]&&r[i][j]!==undefined?r[i][j]:'';
const TRS=r=>{const A=[num(pick(r,['pendapatanaktualrp','pendapatanbulanactualrp'])),num(pick(r,['outputaktual','outputbulanactual','output'])),num(pick(r,['hkeaktual','hkeactual','hke']))];
 const t=(p,a)=>{const g=n=>{const v=pick(r,[p+'m'+n,p+'bulanm'+n,p+'min'+n,p+'bulanmin'+n]);return v===''?null:num(v)},x=g(2),y=g(1);if(x===null&&y===null){TMISS++;return[a,a,a]}return[x===null?y:x,y===null?x:y,a]};
 return[t('pendapatan',A[0]),t('output',A[1]),t('hke',A[2])]};
// penyimpanan (IndexedDB, cadangan localStorage)
const idb=(mode,fn)=>new Promise((res,rej)=>{const q=indexedDB.open('ksa1g_retensi',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onerror=()=>rej(q.error);q.onsuccess=()=>{const t=q.result.transaction('kv',mode),r=fn(t.objectStore('kv'));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error)}});
const kvGet=async k=>{try{return await idb('readonly',s=>s.get(k))}catch(e){try{return JSON.parse(localStorage.getItem('ksa1g_v2_'+k)||'null')}catch(_){return null}}};
const kvSet=async(k,v)=>{try{await idb('readwrite',s=>s.put(v,k))}catch(e){try{localStorage.setItem('ksa1g_v2_'+k,JSON.stringify(v))}catch(_){}}};
let CUR=EMB;
const metaTxt=m=>m&&m.ts?fmtUpload(new Date(m.ts))+' · '+m.name:'Data awal (bawaan file ini)';
async function persist(nd,name,old){try{await kvSet('prev',{d:old,meta:CUR});CUR={ts:Date.now(),name};await kvSet('cur',{d:nd,meta:CUR})}catch(e){}}
async function restoreSaved(){const sv=await kvGet('cur');
 if(sv&&sv.d&&sv.meta&&sv.meta.ts>EMB.ts){try{setM(sv.d);CUR=sv.meta;st.m=-1;fillPeriod();go();showLastUpload(metaTxt(sv.meta));say('Memakai data tersimpan di browser ini: "'+sv.meta.name+'".')}catch(e){setM(clone(D0));fillPeriod();go()}}
 else if(EMB.ts)showLastUpload(metaTxt(EMB))}
$('du').onclick=async()=>{const p=await kvGet('prev');if(!p||!p.d){say('Tidak ada update sebelumnya untuk diurungkan.',1);return}
 setM(p.d);CUR=p.meta;st.m=-1;fillPeriod();go();await kvSet('cur',{d:p.d,meta:p.meta});await kvSet('prev',null);showLastUpload(metaTxt(p.meta));say('Update dibatalkan; kembali ke: '+metaTxt(p.meta)+'.')};
$('dr').onclick=async()=>{await kvSet('prev',{d:D,meta:CUR});setM(clone(D0));CUR=EMB;st.m=-1;fillPeriod();go();await kvSet('cur',null);showLastUpload(metaTxt(EMB));say('Dikembalikan ke data awal bawaan file ini. Klik "Urungkan update" untuk membatalkan.')};
$('ds').onclick=()=>{const h=document.documentElement.outerHTML,a=h.indexOf('const EMB='),b=h.indexOf(';\nconst F=');if(a<0||b<a){say('Gagal menyiapkan file HTML.',1);return}
 const m=CUR.ts?CUR:{ts:Date.now(),name:'Data tersimpan'};
 save('Dashboard_Retensi_Pemanen_KSA1G_'+new Date().toISOString().slice(0,10)+'.html',new Blob(['<!doctype html>\n'+h.slice(0,a)+'const EMB='+JSON.stringify(m)+';\nconst D0='+JSON.stringify(D)+h.slice(b)],{type:'text/html;charset=utf-8'}))};
// template
const GUIDE=[['PETUNJUK UPDATE DATA – Dashboard Retensi Pemanen KSA1G',''],['',''],
['CARA UPDATE',''],['1','Isi template ini (atau pakai tombol "Unduh data (Excel)" sebagai dasar, lalu tambahkan data baru).'],['2','Di dashboard klik "Unggah data" atau seret file ke area Data. Dashboard langsung berubah tanpa dibuat ulang.'],['3','Hasil unggahan tersimpan otomatis di browser. Klik "Simpan dashboard (HTML)" untuk mendapat file dashboard dengan data terbaru yang bisa dibagikan.'],['4','Salah unggah? Klik "Urungkan update".'],['',''],
['ATURAN UMUM',''],['-','Sheet yang dihapus/dikosongkan tidak mengubah data lama (update parsial diperbolehkan). Nama sheet dan judul kolom jangan diubah.'],['-','Baris contoh ("Contoh Nama" / NIK 0000000) otomatis diabaikan.'],['-','Afdeling: Afd 01 … Afd 10 | Kontrak: Akad / Non-Akad | Status: CPL / SGL | Kategori: TINGGI / SEDANG / RENDAH.'],['-','Kolom flag (Pend < 3,5jt, HKE < 18, dst) berisi 1 (ya) atau 0 (tidak). % TO boleh pecahan (0,038) atau persen (3,8).'],['',''],
['ISI SHEET',''],
['Pemanen','NIK, Nama, Afdeling, Status, Kontrak, Skor, Kategori, Pendapatan Aktual (Rp), HKE Aktual, Output Aktual, Pend < 3,5jt, HKE < 18, Pend turun ≥10%, Output < 880, Output turun ≥10%, Pendapatan M-2, Pendapatan M-1, Output M-2, Output M-1, HKE M-2, HKE M-1 (M-1 = 1 bulan sebelum bulan aktual)'],
['Resign_Gaji','Nama, NIK, Afdeling, Status, Kontrak, Gaji Rata-rata (Rp), Rentang Gaji (0-2Juta, 2-3Juta, 3-4Juta, 4-5Juta, 5-6Juta, >6Juta, Tidak Pernah Ada Gaji)'],
['Resign_Skor','Nama, NIK, Afdeling, Status, Kontrak, Skor, Kategori, Keterangan (Countable / Uncountable)'],
['Afdeling','Afdeling, Luas Tanam (Ha), Kebutuhan Pemanen (org), TK Masuk, TK Keluar, Kebutuhan Pintu, Pintu Tersedia, Pintu Dihuni, Pintu Kosong'],
['Bulanan','Bulan, % TO, Akad (akhir bulan), Non-Akad (akhir bulan)'],
['Tersedia_Afd','Afdeling, Bulan (no), CPL, SGL  (wajib 10 afdeling x semua bulan)'],
['Keluar_Afd','Afdeling + satu kolom per bulan (nama kolom = nama bulan di sheet Bulanan)'],['',''],
['SINKRON GOOGLE SPREADSHEET',''],['1','Salin sheet-sheet template ini ke Google Spreadsheet dengan nama tab yang sama (File > Impor).'],['2','Bagikan spreadsheet: "Siapa saja yang memiliki tautan" - peran Pelihat.'],['3','Di dashboard: tempel tautan spreadsheet lalu klik "Sync Spreadsheet". Sync menimpa tab yang terbaca; tab lain tetap memakai data lama (sama seperti unggah Excel).'],['',''],
['MENAMBAH BULAN BARU',''],['1','Sheet Bulanan: tambah 1 baris untuk bulan baru.'],['2','Sheet Tersedia_Afd: tambah 10 baris (Afd 01–10) dengan Bulan (no) = nomor urut bulan baru.'],['3','Sheet Keluar_Afd: tambah 1 kolom bulan baru. Perbarui juga sheet Pemanen bila ada.'],['-','Nilai di sheet Afdeling/Bulanan/Tersedia_Afd/Keluar_Afd pada template ini adalah data saat ini (sebagai contoh); sheet Pemanen/Resign hanya berisi 1 baris contoh.']];
const _bw=buildWB;
buildWB=function(d,t){const wb=_bw(d,t);if(t)wb.Sheets['Petunjuk']=XLSX.utils.aoa_to_sheet(GUIDE);
 wb.SheetNames.forEach(n=>{const ws=wb.Sheets[n],w=[];XLSX.utils.sheet_to_json(ws,{header:1,defval:''}).slice(0,40).forEach(r=>r.forEach((v,j)=>{w[j]=Math.max(w[j]||8,Math.min(n=='Petunjuk'&&j==1?120:34,String(v).length+2))}));ws['!cols']=w.map(x=>({wch:x}))});return wb};
$('dt').onclick=()=>need()&&save('Template_Update_Data_Retensi_KSA1G.xlsx',xl(buildWB(D,1)));
// toast
let tT;const toast=(m,b)=>{const t=$('toast');t.textContent=m;t.className='on'+(b?' bad':'');clearTimeout(tT);tT=setTimeout(()=>t.className='',4500)};
const _say=say;say=function(m,b){_say(m,b);toast(m,b)};
// ---- pengambil URL tangguh: langsung, lalu proxy cadangan bila terblokir CORS/jaringan
async function fetchSmart(url){
 try{const r=await fetch(url,{redirect:'follow'});if(r.ok)return r;
  if(/^HTTP 4/.test(String(r.status))){}else throw new Error('HTTP '+r.status);return r}
 catch(e){
  if(/^HTTP 4/.test(String(e&&e.message)))throw e;
  const r2=await fetch('https://api.allorigins.win/raw?url='+encodeURIComponent(url));
  if(!r2.ok)throw new Error('HTTP '+r2.status);return r2}
}

// ---- overlay memuat (didefinisikan ui.js; aman bila tak ada)
function showLoadSafe(t){try{showLoad(t)}catch(e){}}
function hideLoadSafe(){try{hideLoad()}catch(e){}}

// ===== v3: sync Google Spreadsheet + PWA =====
const GURL_KEY='ksa1g_gsheet_url',GAUTO_KEY='ksa1g_gsheet_auto';
const sheetId=v=>{const s=String(v||'').trim();if(/^[A-Za-z0-9_-]{20,}$/.test(s))return s;const m=s.match(/\/spreadsheets\/d\/([A-Za-z0-9_-]+)/);return m?m[1]:null};
const gHome=id=>'https://docs.google.com/spreadsheets/d/'+id+'/edit';
const gset=(t,bad)=>{const el=$('gsst');if(el){el.textContent=t;el.style.color=bad?'var(--r)':'var(--mu)'}};
let gBusy=false;
function rowsFromGviz(j){const cols=(j.table&&j.table.cols||[]).map(c=>c&&c.label||'');const rs=(j.table&&j.table.rows||[]).map(r=>(r.c||[]).map(c=>c?(c.v!==undefined&&c.v!==null?c.v:(c.f||'')):''));return [cols].concat(rs)}
async function fetchWbFromGviz(id){
 const CAND=['Pemanen','Resign_Gaji','Resign_Skor','Afdeling','Bulanan','Tersedia_Afd','Keluar_Afd','Skor Resiko Resign','Skor Risiko Resign','Gaji Karyawan Resign','Skor Actual Resign','Kebutuhan TK Panen','Kebutuhan TK panen','Turn Over','Turnover','Ketersediaan Rumah'];
 const one=async nm=>{const u='https://docs.google.com/spreadsheets/d/'+id+'/gviz/tq?tqx=out:json;responseHandler:gsCb&headers=0&sheet='+encodeURIComponent(nm);
  const res=await fetchSmart(u);if(!res.ok)throw new Error('HTTP '+res.status);
  const txt=await res.text(),a=txt.indexOf('('),b=txt.lastIndexOf(')');if(a<0||b<a)throw new Error('format');
  const j=JSON.parse(txt.slice(a+1,b+1)),aoa=rowsFromGviz(j);if(aoa.length<2)throw new Error('kosong');return[nm,aoa]};
 const rs=await Promise.allSettled(CAND.map(one)),wb=XLSX.utils.book_new();let n=0;
 rs.forEach(r=>{if(r.status==='fulfilled'){XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(r.value[1]),r.value[0]);n++}});
 if(!n)throw new Error('tidak ada tab yang terbaca dari spreadsheet');return wb}
async function syncSheet(silent){
 if(typeof XLSX=='undefined'){gset('Pustaka Excel belum siap; coba lagi beberapa detik.',1);return false}
 const raw=(($('gurl')||{}).value)||'',id=sheetId(raw);
 if(!id){if(!silent)gset('Tautan tidak valid. Tempel URL Google Spreadsheet, contoh: https://docs.google.com/spreadsheets/d/…/edit',1);return false}
 if(gBusy)return false;gBusy=true;const bgs=$('gs');if(bgs)bgs.disabled=true;showLoadSafe('Menyinkronkan dari Google Spreadsheet…');
 try{
  try{localStorage.setItem(GURL_KEY,raw.trim())}catch(e){}
  if(!silent)gset('Mengambil data dari Google Spreadsheet…');
  let wb=null,cara='';
  try{
   const res=await fetchSmart('https://docs.google.com/spreadsheets/d/'+id+'/export?format=xlsx');
   if(res.ok){const ab=await res.arrayBuffer(),u=new Uint8Array(ab);
    if(u.length>4&&u[0]===0x50&&u[1]===0x4b){const w0=XLSX.read(ab,{type:'array',bookSheets:true}),want=wantNames(w0);
     wb=XLSX.read(ab,want.length?{type:'array',sheets:want,cellFormula:false,cellHTML:false,cellStyles:false,cellNF:false}:{type:'array',cellFormula:false,cellHTML:false,cellStyles:false,cellNF:false});cara='excel'}}}catch(e){}
  if(!wb){wb=await fetchWbFromGviz(id);cara='cadangan'}
  const r=applyWB(wb),old=D;
  setM(r.nd);st.m=-1;fillPeriod();st.all=0;go();
  persist(r.nd,'Google Spreadsheet',old);
  saveLastUpload('Sync Google Spreadsheet');
  const gop=$('gopen');if(gop){gop.href=gHome(id);gop.hidden=false}
  const msg='Sinkron ('+(cara==='excel'?'unduh Excel':'mode cadangan')+'): '+r.rep.join(', ')+'. Tersimpan otomatis di browser ini.'+(r.warn.length?' Perhatian: '+r.warn.join('; ')+'.':'');
  gset(msg,r.warn.length);say(msg,r.warn.length);return true
 }catch(err){
  const m='Sync gagal: '+(err&&err.message?err.message:'tidak diketahui')+'. Pastikan spreadsheet dibagikan "Siapa saja yang memiliki tautan – Pelihat" dan nama tab sesuai template, atau gunakan unggah Excel manual.';
  gset(m,1);if(!silent)say(m,1);return false
 }finally{gBusy=false;if(bgs)bgs.disabled=false;hideLoadSafe()}}
function initSync(){/* dipanggil dari ui.js */
 const gurl=$('gurl');if(!gurl)return;
 let saved='';try{saved=localStorage.getItem(GURL_KEY)||''}catch(e){}
 if(saved){gurl.value=saved;const id=sheetId(saved),gop=$('gopen');if(id&&gop){gop.href=gHome(id);gop.hidden=false}}
 const gauto=$('gauto');try{gauto.checked=localStorage.getItem(GAUTO_KEY)==='1'}catch(e){}
 gauto.onchange=e=>{try{localStorage.setItem(GAUTO_KEY,e.target.checked?'1':'0')}catch(_){}};
 $('gs').onclick=()=>syncSheet(false);
 gurl.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();syncSheet(false)}});
 if(saved&&gauto.checked)setTimeout(()=>syncSheet(true),1200)}