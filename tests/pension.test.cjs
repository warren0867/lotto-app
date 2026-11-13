process.env.TZ='Asia/Seoul';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8').split('<script>')[1].split('</script>')[0];
const section=(a,b)=>js.slice(js.indexOf(a),js.indexOf(b));
const clone=x=>structuredClone(x);
class TestDate extends Date{constructor(...args){super(...(args.length?args:['2026-11-13T10:00:00+09:00']))}static now(){return Date.parse('2026-11-13T10:00:00+09:00')}}
const fixed={t:'고정',n:'001234',jo:[1,2,3,4,5],alt:['101234','201234']};
function harness(){
 const elements=new Map(),fields=Array.from({length:5},()=>({disabled:false})),messages=[];
 const $=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',disabled:false,value:'',querySelectorAll(selector){if(id==='pAnnuities'&&selector.startsWith('[data-claim')){const discard=selector.includes('discard'),attr=discard?'claimDiscard':'claim',pattern=discard?/data-claim-discard="(\d+)"/g:/data-claim="(\d+)"/g;return [...this.innerHTML.matchAll(pattern)].map(m=>{const b=$(attr+m[1]);b.dataset={[attr]:m[1]};return b})}return fields}});return elements.get(id)};
 const c={F:{pension_official:{341:{date:'2026-11-12',jo:3,n:'194929',b:'783820'}},pension_rounds:{342:{tickets:[clone(fixed)],bought:false}},pension_fixed:{tickets:[clone(fixed)]},pension_draws:[]},ls:{get:()=>null,set:()=>{}},Date:TestDate,structuredClone,PSYNC:{},writing:false,$,message:x=>messages.push(x),won:x=>x.toLocaleString('ko-KR'),esc:x=>String(x),mdhm:String,go:()=>{}};
 vm.createContext(c);vm.runInContext(section('const POFF={},PRD={};','function renderPPills()')+section('function pAnnuityItems(){','function renderTotals(){')+`;renderPWeek=()=>{};renderPEditor=()=>{};this.a={precompute,pDateString,pDateOf,pBaseTickets,pTickets,pCount,pRoundState,validatePTickets,pFingerprint,savePension,cancelPension,savePEditor,pAnnuityItems,renderPAnnuities,pClaimDrafts,pScore,PRD,POFF,setAlt:x=>PALT=x,setEditor:(e,rows,bought)=>{pEditRound=e;pEditRows=rows;pEditBought=bought;pEditExpected=JSON.stringify(PRD[e]||null);pEditDirty=true},dirty:()=>pEditDirty};`,c);
 c.a.precompute();c.renderAll=()=>c.a.precompute();
 let remote=clone(c.F.pension_rounds);
 c.write=async(n,mutate)=>{try{remote=mutate(clone(remote));c.F[n]=clone(remote);c.a.precompute();return true}catch(e){messages.push(e.message);return false}};
 return {c,a:c.a,$,fields,messages,remote:()=>remote,setRemote:r=>remote=clone(r)};
}
(async()=>{
 let h=harness(),a=h.a;
 assert.equal(a.pDateString(342),'2026-11-19');assert.equal(a.pDateOf(342).getDay(),4);
 for(const [time,label,open] of [['2026-11-12T21:59:59+09:00','다음 회차 판매 대기',false],['2026-11-12T22:00:00+09:00','판매 중',true],['2026-11-19T16:59:59+09:00','판매 중',true],['2026-11-19T17:00:00+09:00','인터넷 판매 마감 · 결과 대기',false],['2026-11-19T19:05:00+09:00','결과 발표·수집 대기',false],['2026-11-20T10:00:00+09:00','결과 갱신 지연',false]]){const s=a.pRoundState(342,Date.parse(time));assert.equal(s.label,label);assert.equal(s.open,open)}
 assert.equal(a.pRoundState(341).open,false);
 a.validatePTickets([{t:'부분',n:'000001',jo:[2,5]}]);
 for(const ts of [[{n:'12345',jo:[1]}],[{n:123456,jo:[1]}],[{n:'123456',jo:[]}],[{n:'123456',jo:[6]}],[{n:'123456',jo:[1,1]}],[{n:'123456',jo:[1]},{n:'123456',jo:[1]}]])assert.throws(()=>a.validatePTickets(ts));
 h.c.F.pension_draws=[{id:'d1',round:342,n:'456789',use:true,at:1}];
 let ts=a.pTickets(342);assert.equal(a.pCount(ts),10);
 await a.savePension(342,ts);assert.equal(h.remote()[342].date,'2026-11-19');assert.equal(h.remote()[342].purchase.count,10);
 assert.deepEqual(clone(h.remote()[342].tickets[0].alt),['101234','201234']);
 await a.cancelPension(342);assert.equal(a.pCount(a.pTickets(342)),10);
 // Legacy purchase snapshot without sourceId must not re-add legacy use:true records.
 h.c.F.pension_rounds[342]={bought:false,tickets:[{t:'추첨기',n:'456789',jo:[1,2,3,4,5]}]};a.precompute();assert.equal(a.pCount(a.pTickets(342)),5);
 // A replacement stays selected after cancellation; reset returns the true original.
 h=harness();a=h.a;a.setAlt({0:0});await a.savePension(342,a.pTickets(342));a.setAlt({});await a.cancelPension(342);
 assert.equal(a.pTickets(342)[0].n,'101234');a.setAlt({0:1});assert.equal(a.pTickets(342)[0].n,'201234');a.setAlt({0:-1});assert.equal(a.pTickets(342)[0].n,'001234');assert.equal(a.pTickets(342)[0].orig,undefined);
 h.c.F.pension_rounds[342].final=true;a.precompute();a.setAlt({0:1});assert.equal(a.pTickets(342)[0].n,'101234');
 // Remote changes must never be silently overwritten.
 h=harness();a=h.a;ts=a.pTickets(342);h.setRemote({342:{tickets:[{...clone(fixed),n:'999999'}],bought:false}});await a.savePension(342,ts);assert.equal(h.remote()[342].tickets[0].n,'999999');assert.equal(h.remote()[342].bought,false);assert.ok(h.messages.includes('stale'));
 // Purchase cancellation protects simultaneous edits, too.
 h=harness();a=h.a;await a.savePension(342,a.pTickets(342));const changed=clone(h.remote());changed[342].note='다른 기기';h.setRemote(changed);await a.cancelPension(342);assert.equal(h.remote()[342].bought,true);
 // Past records: preserve leading zero and selected groups, recompute cost.
 h=harness();a=h.a;a.setEditor(338,[{t:'실제 구매',n:'000009',jo:[2,5]}],true);await a.savePEditor();assert.equal(h.remote()[338].tickets[0].n,'000009');assert.equal(h.remote()[338].purchase.amount,2000);assert.equal(h.remote()[338].date,'2026-10-22');
 a.setEditor(338,[],false);await a.savePEditor();assert.equal(h.remote()[338].tickets.length,0);assert.equal(h.remote()[338].bought,false);
 a.setEditor(338,[],true);await a.savePEditor();assert.equal(h.remote()[338].bought,false);
 // All editor controls are locked for the entire pending write.
 h=harness();a=h.a;a.setEditor(342,[clone(fixed)],false);let finish;const originalWrite=h.c.write;h.c.write=(...args)=>new Promise(resolve=>{finish=async()=>resolve(await originalWrite(...args))});const pending=a.savePEditor();assert.ok(h.fields.every(x=>x.disabled));await finish();await pending;assert.ok(h.fields.every(x=>!x.disabled));
 // A full winning set is 1 first prize plus four second prizes, not cash income.
 h=harness();a=h.a;h.c.F.pension_rounds[341]={bought:true,tickets:[{n:'194929',jo:[1,2,3,4,5]}]};a.precompute();h.setRemote(h.c.F.pension_rounds);const ann=a.pAnnuityItems();assert.equal(ann.length,5);assert.equal(ann.filter(x=>x.months===240).length,1);assert.equal(ann.reduce((s,x)=>s+x.gross,0),11000000);assert.equal(a.pScore(341).prize,0);
 // Receipt drafts survive refresh and another receipt save; all fields lock during write.
 a.renderPAnnuities();h.$('pClaimCount0').value='2';h.$('pClaimMonth0').value='';h.$('pClaimCount0').oninput();h.$('pClaimCount1').value='3';h.$('pClaimMonth1').value='';h.$('pClaimCount1').oninput();a.renderPAnnuities();assert.match(h.$('pAnnuities').innerHTML,/id="pClaimCount1" value="3"/);
 let finishClaim;const writeClaim=h.c.write;h.c.write=(...args)=>new Promise(resolve=>{finishClaim=async()=>resolve(await writeClaim(...args))});const savingClaim=h.$('claim0').onclick();assert.ok(h.fields.every(x=>x.disabled));await finishClaim();await savingClaim;assert.equal(Object.values(h.remote()[341].claims)[0].receivedMonths,2);assert.equal(a.pClaimDrafts.size,1);assert.match(h.$('pAnnuities').innerHTML,/id="pClaimCount1" value="3"/);h.c.write=writeClaim;
 // Every pension failure must result in partial sync and its own failure state.
 const q={TOKEN:'test',writing:false,busy:false,PSYNC:{},ghGet:async n=>{if(n.startsWith('pension'))throw new Error('500');return true},cache:()=>{},renderAll:()=>{},showSetup:()=>{},renderSync:()=>{},Date};vm.createContext(q);vm.runInContext("let syncState='',lastSync=0;"+section('async function syncAll(){','async function write(')+';this.sync=syncAll;this.state=()=>syncState',q);await q.sync();assert.equal(q.state(),'partial');assert.equal(Object.values(q.PSYNC).filter(x=>x.ok===false).length,4);
 // Lottery draw rows still use their own use flag.
 const r={hm:()=>'',ballHtml:()=>'',esc:String,mdhm:String};vm.createContext(r);vm.runInContext(section('function drawRow(','function renderLog(')+';this.row=drawRow',r);assert.match(r.row({id:'l1',nums:[1,2,3,4,5,6],bonus:7,at:1,use:true},null,true),/aria-pressed="true"/);
 console.log('PASS pension: KST dates, deadline transitions, partial/invalid/duplicate tickets, purchase/cancel/legacy dedup, alternate reset, stale purchase/cancel protection, historical edits, leading zero, empty unpurchase, editor write lock, annuities, partial sync, lottery row regression');
})().catch(e=>{console.error(e);process.exitCode=1});
