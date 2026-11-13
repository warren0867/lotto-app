// Execute actual marking functions against isolated fixtures. No GitHub/network writes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0];
const source=js.slice(js.indexOf('const MK='),js.indexOf("$('markPapers').addEventListener"));
const clone=x=>structuredClone(x);
const lines=(n,start=0)=>Array.from({length:n},(_,i)=>Array.from({length:6},(_,j)=>(start+i+j)%45+1));
function fixture(){
 const G=[{t:'기존 고정',online:true,l:lines(5)},{t:'클로드 고정',online:false,l:lines(5,5)},{t:'지표 고정',online:false,l:lines(5,10)},{t:'계산식 15',online:false,l:lines(15,15)},{t:'흐름픽 5',online:false,l:lines(5,30)}];
 const memory=new Map(),elements=new Map(),classes=new Set(),copied=[],messages=[];
 const $=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',querySelectorAll:()=>[],scrollIntoView(){},focus(){}});return elements.get(id)};
 const c={NEXT:1250,PNEXT:342,NEXT_DATE:new Date('2026-11-14'),ROUNDS:{1249:{g:clone(G.slice(0,3))},1250:{g:G,purchaseBasis:'standing',bought:true}},F:{rounds:{1250:{groups:G,bought:true,purchaseBasis:'standing'}},pension_fixed:{tickets:[{n:'001234',jo:[1,2,3,4,5]}]}},$,
  markGroups:()=>({g:c.ROUNDS[1250].g}),lEditDirty:true,ls:{get:k=>memory.get(k)||null,set:(k,v)=>memory.set(k,v)},esc:s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),won:String,p2:n=>String(n).padStart(2,'0'),md:()=>'',pTickets:()=>c.F.pension_fixed.tickets,
  document:{body:{classList:{remove:n=>classes.delete(n),toggle:(n,v)=>{v?classes.add(n):classes.delete(n)}}}},navigator:{clipboard:{writeText:async s=>copied.push(s)}},message:s=>messages.push(s),renderWeek:()=>{},renderPWeek:()=>{c.pRenders=(c.pRenders||0)+1}};
 vm.createContext(c);vm.runInContext(source+';this.a={MK,mkKey,reuseReference,markingModel,markLedger,markCursor,markMove,renderMark,markSessionLeave,mkTap,markCheck,markPaper,view:()=>mkView,session:()=>markSession};',c);
 const a=c.a,model=()=>a.markingModel(1250,c.ROUNDS[1250].g);
 const tap=(dataset,store='L1250')=>{const target={dataset,closest(selector){return selector.split(',').some(s=>{const m=s.trim().match(/^\[data-([^\]]+)\]$/);return m&&Object.prototype.hasOwnProperty.call(dataset,m[1].replace(/-([a-z])/g,(_,x)=>x.toUpperCase()))})?this:null}};return a.mkTap({target,detail:1},store,'mkProg')};
 return {c,a,memory,$,model,tap,copied,classes};
}
(async()=>{
 let f=fixture(),{a}=f,m=f.model();
 assert.equal(m.fresh.length,4);assert.equal(m.rows.length,20);assert.equal(m.reuse.length,2);assert.equal(m.reuse.flatMap(p=>p.rows).length,10);assert.equal(m.onlineRows.length,5);
 assert.equal(m.fresh[0].rows.map(r=>r.slot).join(''),'ABCDE');assert.equal(m.fresh[3].no,4);
 f.c.ROUNDS[1250].g[1].l[0]=[35,36,37,38,39,40];m=f.model();assert.equal(m.fresh.length,5);assert.equal(m.reuse.length,1);assert.equal(m.fresh[0].g.t,'클로드 고정');
 delete f.c.ROUNDS[1249];assert.equal(f.model().reuse.length,0);assert.equal(f.model().fresh.length,6);
 // Keys discriminate occurrences, purchase channels, and changed content.
 f=fixture();a=f.a;const same=[1,2,3,4,5,6];f.c.ROUNDS[1250].g=[{t:'묶음',online:false,l:[same,same]},{t:'묶음',online:false,l:[same]},{t:'묶음',online:true,l:[same]}];m=f.model();assert.equal(new Set([...m.rows,...m.onlineRows].map(r=>r.key)).size,4);
 const before=JSON.stringify(f.c.F);f.tap({mk:m.rows[0].key});assert.equal(a.MK.get('L1250').size,1);assert.equal(a.MK.get('L1250').has(m.rows[1].key),false);assert.equal(JSON.stringify(f.c.F),before);
 const originalKey=m.rows[0].key;f.c.ROUNDS[1250].g[0].l[0]=[7,8,9,10,11,12];assert.notEqual(f.model().rows[0].key,originalKey);
 // Focus navigation never implicitly changes purchase or marks skipped steps.
 f=fixture();a=f.a;m=f.model();const purchase=JSON.stringify(f.c.F);a.renderMark();assert.match(f.$('markPapers').innerHTML,/새 용지 1\/4/);assert.match(f.$('markPapers').innerHTML,/온라인 5줄/);assert.match(f.$('markPapers').innerHTML,/role="checkbox"/);
 f.tap({page:'1'});assert.equal(a.markCursor(1250,m.rows,a.MK.get('L1250')),5);assert.equal(a.MK.get('L1250').size,0);
 f.tap({step:'-1'});assert.equal(a.markCursor(1250,m.rows,a.MK.get('L1250')),4);
 f.tap({cursor:m.rows[0].key});f.tap({advance:m.rows[0].key});assert.equal(a.MK.get('L1250').has(m.rows[0].key),true);assert.equal(a.markCursor(1250,m.rows,a.MK.get('L1250')),1);
 f.tap({advance:m.rows.at(-1).key});assert.equal(a.markCursor(1250,m.rows,a.MK.get('L1250')),1);assert.doesNotMatch(f.$('markPapers').innerHTML,/id="mkAdvance"[^>]* disabled/);f.tap({advance:m.rows.at(-1).key});assert.equal(a.MK.get('L1250').size,2);
 const resumed=fixture();resumed.memory.set('gz-mk-pos-L1250',m.rows[8].key);assert.equal(resumed.a.markCursor(1250,resumed.model().rows,new Set()),8);
 resumed.memory.set('gz-mk-pos-L1250','outdated-content');const done=new Set([resumed.model().rows[0].key]);assert.equal(resumed.a.markCursor(1250,resumed.model().rows,done),1);
 f.tap({mv:'num'});assert.equal(a.view(),'num');assert.equal(f.memory.get('gz-markview-v2'),'num');assert.match(f.$('markPapers').innerHTML,/class="game mk-row is-marked"/);assert.doesNotMatch(f.$('markPapers').innerHTML,/class="(?:game|slip-g)[^"]*\bdone\b/);
 f.tap({mv:'slip'});assert.equal(a.view(),'slip');f.tap({session:'start'});assert.equal(a.session(),true);assert.equal(f.classes.has('marking'),true);f.tap({session:'end'});assert.equal(a.session(),false);f.tap({session:'start'});a.markSessionLeave();assert.equal(a.session(),false);assert.equal(f.classes.has('marking'),false);assert.match(f.$('markPapers').innerHTML,/data-session="start"/);
 f.tap({reset:'1'});assert.equal(a.MK.get('L1250').size,2);assert.match(f.$('markPapers').innerHTML,/한 번 더 누르면 체크 초기화/);f.tap({reset:'1'});assert.equal(a.MK.get('L1250').size,0);assert.equal(f.memory.get('gz-mk-pos-L1250'),'');assert.equal(JSON.stringify(f.c.F),purchase);
 // Completion is shown only when every row is marked, regardless of physical order.
 f=fixture();a=f.a;m=f.model();a.MK.set('L1250',new Set(m.rows.slice(0,-1).map(r=>r.key)));f.tap({advance:m.rows.at(-1).key});assert.equal(a.MK.get('L1250').size,20);assert.match(f.$('markPapers').innerHTML,/id="mkAdvance"[^>]* disabled[^>]*>새 용지 마킹 완료/);
 // Reset confirmation belongs to one round and is cancelled by another action.
 f=fixture();a=f.a;m=f.model();a.MK.set('L1250',new Set([m.rows[0].key]));const nextModel=a.markingModel(1251,f.c.ROUNDS[1250].g);a.MK.set('L1251',new Set([nextModel.rows[0].key]));f.tap({reset:'1'});f.c.NEXT=1251;f.tap({reset:'1'},'L1251');assert.equal(a.MK.get('L1251').size,1);assert.equal(a.MK.get('L1250').size,1);f.tap({reset:'1'},'L1251');assert.equal(a.MK.get('L1251').size,0);assert.equal(a.MK.get('L1250').size,1);
 f.c.NEXT=1250;f.tap({reset:'1'});f.tap({mv:'num'});f.tap({reset:'1'});assert.equal(a.MK.get('L1250').size,1);f.tap({reset:'1'});assert.equal(a.MK.get('L1250').size,0);
 // A known reuse slip can be explicitly put back into the marking queue.
 f=fixture();a=f.a;const reuseRow=f.model().reuse[0].rows[0];a.MK.set('L1250',new Set([reuseRow.key,reuseRow.legacy]));f.tap({force:'1'});assert.equal(a.MK.get('L1250').has(reuseRow.key),false);assert.equal(a.MK.get('L1250').has(reuseRow.legacy),false);assert.equal(f.model().fresh.length,5);assert.equal(f.model().reuse.length,1);f.tap({unforce:'1'});assert.equal(f.model().fresh.length,4);assert.equal(f.model().reuse.length,2);
 // Copy keeps leading zeroes and does not mark the row or change purchases.
 f.tap({copyPension:'0'},'P342');await Promise.resolve();assert.equal(f.copied.at(-1),'001234');assert.equal(a.MK.get('P342').size,0);
 // Legacy progress migrates only unambiguous rows, and cannot revive after unchecking.
 f=fixture();a=f.a;m=f.model();const first=m.rows[0];a.MK.set('L1250',new Set([first.legacy]));let migrated=a.markLedger('L1250',m.rows.concat(m.onlineRows));assert.equal(migrated.has(first.key),true);assert.equal(migrated.has(first.legacy),false);
 f.tap({mk:first.key});migrated=a.markLedger('L1250',m.rows.concat(m.onlineRows));assert.equal(migrated.has(first.key),false);
 f.c.ROUNDS[1250].g=[{t:'중복',online:false,l:[same,same]}];m=f.model();a.MK.set('L1250',new Set([a.mkKey(same)]));migrated=a.markLedger('L1250',m.rows);assert.equal(m.rows.some(r=>migrated.has(r.key)),false);
 // Reuse rows also make old combination-only progress ambiguous.
 f=fixture();a=f.a;const fixedDuplicate={t:'원본 고정',online:false,l:[same]};f.c.ROUNDS[1249].g=[clone(fixedDuplicate)];f.c.ROUNDS[1250].g=[fixedDuplicate,{t:'새 번호',online:false,l:[same]}];m=f.model();a.MK.set('L1250',new Set([a.mkKey(same)]));a.renderMark();assert.equal(a.MK.get('L1250').has(m.rows[0].key),false);assert.equal(a.MK.get('L1250').has(a.mkKey(same)),false);
 assert.match(html,/\.is-marked\{/);assert.doesNotMatch(html,/\[data-mk\]\.done/);
 console.log('PASS marking: 4 fresh/2 reuse/5 online, changed fixed detection, occurrence keys, purchase isolation, page/game navigation, next/wrap/true completion/resume, mode/session, round-scoped reset confirmation, copy leading zero, legacy migration/no revival, accessible checkboxes, independent marked styling');
})().catch(e=>{console.error(e);process.exitCode=1});
