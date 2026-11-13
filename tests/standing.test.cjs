const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').split('<script>')[1].split('</script>')[0];
const part=(a,b)=>js.slice(js.indexOf(a),js.indexOf(b));
const fixed=[{t:'매주 고정',n:'001234',jo:[1,2,3,4,5]}],group=[{t:'고정',online:true,l:[[1,2,3,4,5,6]]}];
function fixture(){
 const el=new Map(),controls=Array.from({length:4},()=>({disabled:false})),messages=[];
 const $=id=>{if(!el.has(id))el.set(id,{innerHTML:'',textContent:'',open:false,querySelectorAll:()=>controls});return el.get(id)};
 const c={$ ,structuredClone,Date,PSYNC:{},ls:{get:()=>null,set:()=>{}},writing:false,message:t=>messages.push(t),esc:String,won:String,p2:n=>String(n).padStart(2,'0'),md:()=>'',mdhm:()=>'',ddayHtml:()=>'',ballHtml:()=>'',go:()=>{},F:{official:{1244:{date:'2026-10-03',n:[1,2,3,4,5,6],b:7},1245:{date:'2026-10-10',n:[1,2,3,4,5,6],b:7},1249:{date:'2026-11-07',n:[1,2,3,4,5,6],b:7}},rounds:{1244:{groups:structuredClone(group),bought:false},1245:{groups:structuredClone(group),bought:false,note:'미구매'},1250:{groups:structuredClone(group),bought:true,purchaseBasis:'standing',date:'2026-11-14'}},app_draws:[],purchases:{},pension_official:{341:{date:'2026-11-12',jo:3,n:'194929',b:'783820'}},pension_rounds:{341:{tickets:structuredClone(fixed),bought:false},342:{tickets:structuredClone(fixed),bought:true,purchaseBasis:'standing'}},pension_fixed:{tickets:structuredClone(fixed)},pension_draws:[]}};
 vm.createContext(c);vm.runInContext(part('const isBought=','const ready=')+part('const DRAW={},ROUNDS={}', 'const matchOf=')+part('function lBaseGroups(', '/* ── 기록 쓰기')+part('async function toggleUse(', 'const groupsJSON=')+part('let lEditRound=', '/* ── 소리')+part('const POFF={},PRD={};','function renderPPills()')+part('function renderMark(){',"$('goBtn').onclick=")+`;renderPWeek=()=>{};renderPEditor=()=>{};this.a={isBought,isLocked,recompute,precompute,ROUNDS,PRD,pTickets,pCount,markGroups,toggleUse,validateLGroups,saveLEditor,savePEditor,renderLEditor,renderMark,pExcluded,setL:(e,g,b=true)=>{lEditRound=e;lEditRows=g;lEditBought=b;lEditExpected=JSON.stringify(F.rounds[e]||null);lEditDirty=true},setP:(e,t,b=true)=>{pEditRound=e;pEditRows=t;pEditBought=b;pEditExpected=JSON.stringify(PRD[e]||null);pEditDirty=true}}`,c);
 c.a.recompute();c.a.precompute();let remote=structuredClone(c.F);
 c.write=async(n,mutate)=>{try{remote[n]=mutate(structuredClone(remote[n]));c.F[n]=structuredClone(remote[n]);c.a.recompute();c.a.precompute();return true}catch(e){messages.push(e.message);return false}};c.renderAll=()=>{c.a.recompute();c.a.precompute()};
 return {c,a:c.a,$,controls,messages,remote:()=>remote,change:(n,f)=>f(remote[n])};
}
(async()=>{
 let f=fixture(),a=f.a;
 assert.equal(a.isBought({bought:false}),true);assert.equal(a.isBought({skipped:true}),false);assert.equal(a.isLocked({bought:true,purchaseBasis:'standing'}),false);assert.equal(a.isLocked({bought:true,final:true,purchaseBasis:'standing'}),true);
 assert.equal(a.ROUNDS[1244].bought,true);assert.equal(a.ROUNDS[1245].bought,false);assert.equal(a.PRD[341].bought,false);assert.equal(a.isBought(a.PRD[341]),true);
 a.renderMark();assert.doesNotMatch(f.$('buyBox').innerHTML,/buyBtn|cancelBuy|구매 완료로 기록/);assert.match(f.$('buyBox').innerHTML,/전부 구매 기준/);
 const changed=[{t:'실제 다른 구매',online:false,l:[[7,8,9,10,11,12],[13,14,15,16,17,18]]}];a.setL(1250,changed);await a.saveLEditor();assert.equal(f.remote().rounds[1250].bought,true);assert.equal(f.remote().rounds[1250].skipped,false);assert.equal(f.remote().rounds[1250].purchase.amount,2000);assert.equal(f.remote().rounds[1250].boughtAt,undefined);
 a.setL(1250,changed,false);await a.saveLEditor();assert.equal(f.remote().rounds[1250].skipped,true);assert.equal(a.ROUNDS[1250].bought,false);assert.equal(f.remote().rounds[1250].purchase,undefined);
 a.setL(1250,changed);await a.saveLEditor();assert.equal(a.ROUNDS[1250].bought,true);
 // The remote round cannot be overwritten by stale editing.
 a.setL(1250,structuredClone(group));f.change('rounds',r=>r[1250].note='다른 기기');await a.saveLEditor();assert.equal(f.remote().rounds[1250].groups[0].t,'실제 다른 구매');assert.ok(f.messages.includes('stale'));
 for(const bad of [[{l:[[1,2,3,4,5,5]]}],[{l:[[0,2,3,4,5,6]]}],[{l:[[1,2,3,4,5,46]]}],[{l:[[1,2,3]]}]])assert.throws(()=>a.validateLGroups(bad));
 f=fixture();a=f.a;const corrected=[{t:'이번 회차만',n:'000007',jo:[2,5]}];a.setP(342,corrected);await a.savePEditor();assert.equal(f.remote().pension_rounds[342].bought,true);assert.equal(f.remote().pension_rounds[342].skipped,false);assert.equal(f.remote().pension_rounds[342].boughtAt,undefined);assert.equal(f.remote().pension_rounds[342].purchase.amount,2000);assert.deepEqual(f.remote().pension_fixed.tickets,fixed);
 // The following week starts from unchanged fixed numbers, never last week's correction.
 f.c.F.pension_official[342]={date:'2026-11-19',jo:2,n:'999999',b:'888888'};a.precompute();assert.equal(a.pTickets(343)[0].n,'001234');
 a.setP(342,corrected,false);await a.savePEditor();assert.equal(f.remote().pension_rounds[342].skipped,true);assert.equal(f.remote().pension_rounds[342].purchase,undefined);
 // Draft selection is still possible under standing purchase and updates one atomic document.
 f=fixture();a=f.a;f.c.F.app_draws=[{id:'trial',round:1250,use:false,nums:[7,8,9,10,11,12],at:1}];a.recompute();await a.toggleUse('trial');assert.equal(f.remote().rounds[1250].groups.length,2);assert.equal(f.remote().rounds[1250].purchase.amount,2000);await a.toggleUse('trial');assert.equal(f.remote().rounds[1250].groups.length,1);
 // Old use:true selections can be removed and stay excluded after edits.
 f=fixture();a=f.a;f.c.F.app_draws=[{id:'legacy',round:1250,use:true,nums:[7,8,9,10,11,12],at:1}];a.recompute();assert.equal(a.markGroups(1250).g.length,2);await a.toggleUse('legacy');assert.equal(a.markGroups(1250).g.length,1);a.setL(1250,structuredClone(group));await a.saveLEditor();assert.equal(a.markGroups(1250).g.length,1);
 console.log('PASS standing purchase: default bought without confirmation, explicit skipped/1245 preservation, standing vs final locks, lottery correction/quantity/skip/restore/conflict, pension round-only correction/fixed next week, no invented purchase timestamps, atomic draw selection');
})().catch(e=>{console.error(e);process.exitCode=1});
