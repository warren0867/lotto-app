// Result privacy is tested through the application's actual renderers and click handlers.
// The DOM shim only stores markup and wires explicit button events; no network writes occur.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').split('<script>')[1].split('</script>')[0];
function part(a,b){const i=source.indexOf(a),j=source.indexOf(b,i);assert.ok(i>=0&&j>i,`Missing app section ${a}`);return source.slice(i,j)}
function fixture(){
 const els=new Map();
 function node(id){return {id,innerHTML:'',textContent:'',hidden:false,disabled:false,value:'',dataset:{},className:'',classList:{toggle(){},add(){},remove(){}},setAttribute(){},removeAttribute(){},scrollIntoView(){},focus(){},click(){if(!this.disabled)return this.onclick?.({currentTarget:this})},querySelectorAll(selector){
   const all=[];for(const m of this.innerHTML.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)){
    const attrs=m[1],key=id+':'+m.index;let b=els.get(key);if(!b){b=node(key);els.set(key,b)}b.dataset={};
    for(const d of attrs.matchAll(/data-([\w-]+)="([^"]*)"/g))b.dataset[d[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=d[2];
    b.textContent=m[2].replace(/<[^>]*>/g,'');b.disabled=/\bdisabled\b/.test(attrs);
    const selects=selector.split(',').some(s=>{s=s.trim();if(s==='button')return true;const at=s.match(/^\[([^\]]+)\]$/);if(at)return attrs.includes(at[1]+'=');return false});if(selects)all.push(b);
   }return all;
  }};
 }
 const $=id=>{if(!els.has(id))els.set(id,node(id));return els.get(id)};
 const G=[{t:'테스트 고정',l:[[1,2,3,4,5,6]],online:false}];
 const tickets=[{t:'테스트 고정',n:'123456',jo:[1]}];
 const F={official:{1250:{date:'2026-11-14',n:[1,2,3,4,5,6],b:7,prize:[10000000,1000000,100000,50000,5000]},1251:{date:'2026-11-21',n:[2,4,6,8,10,12],b:14,prize:[10000000,1000000,100000,50000,5000]}},rounds:{1250:{groups:structuredClone(G),bought:true,purchaseBasis:'standing'},1251:{groups:structuredClone(G),bought:true,purchaseBasis:'standing'},1252:{groups:structuredClone(G),bought:true,purchaseBasis:'standing',date:'2026-11-28'}},app_draws:[],purchases:{},pension_official:{341:{date:'2026-11-12',jo:1,n:'123456',b:'654321'},342:{date:'2026-11-19',jo:2,n:'987654',b:'456789'}},pension_rounds:{341:{tickets:structuredClone(tickets),bought:true,purchaseBasis:'standing'},342:{tickets:structuredClone(tickets),bought:true,purchaseBasis:'standing'},343:{tickets:structuredClone(tickets),bought:true,purchaseBasis:'standing'}},pension_fixed:{tickets:structuredClone(tickets)},pension_draws:[]};
 const c={F,$,Date,structuredClone,writing:false,PSYNC:{},ls:{get:()=>null,set:()=>{}},esc:String,won:n=>Number(n).toLocaleString('ko-KR'),md:()=>'',mdhm:()=>'',ddayHtml:()=>'',p2:n=>String(n).padStart(2,'0'),colOf:()=>'',ballHtml:n=>`<ball>${n}</ball>`,pBallHtml:k=>`<pball>${k}</pball>`,markingModel:()=>({rows:[],fresh:[],reuse:[],onlineRows:[]}),markLedger:()=>new Set(),markCheck:()=>'',markSessionSet(){},renderSync(){},newRun:()=>({stop:false}),resetBalls(){},setHum(){},setStage(){},renderPLog(){},document:{querySelectorAll:()=>[]},status:t=>{$('status').textContent=t},trayEmpty:()=>{$('tray').innerHTML=''},pTrayEmpty:()=>{$('tray').innerHTML='';$('tray2').innerHTML=''},trayShow:(n,b)=>{$('tray').innerHTML=n.map(x=>`<ball>${x}</ball>`).join('')+`<ball>${b}</ball>`},pTrayShow:x=>{$('tray').innerHTML=x.n;$('tray2').innerHTML=x.b},renderLEditor(){},message(){},airT:0,air:0,FAST:false,soundOn:false};
 vm.createContext(c);
 const code=[
  part('const isBought=','const ready='),
  part('const DRAW={},ROUNDS={}','function lBaseGroups('),
  part('function lBaseGroups(','/* ── 기록 쓰기'),
  "let mode='draw',rvRound=null,shown=new Set(),busy=false,cancelArm=false,manualReveal=null;",
  part('function setMode(m){','/* ── 실제 구매 번호와 분리한'),
  part('function renderWeek(){','function renderSync(){'),
  part('const POFF={},PRD={};','function renderPPills(){'),
  part('function renderPPills(){','// 연금 앱 추첨 기록'),
  part('function renderPStats(){','function pAnnuityItems(){'),
  part('function renderTotals(){','/* ── 화면 전환:'),
  "pEditDirty=true;this.a={recompute,precompute,renderWeek,renderDash,renderPWeek,renderPStats,renderPHealth,renderTotals,renderPills,renderPPills,renderPReview,setMode,resultSeen,revealResult,bindResultButtons,resultButtons,resultSignature,state:()=>({mode,rvRound,pRv,manual:manualReveal&&structuredClone(manualReveal)}),select:(game,e)=>{if(game==='lotto')rvRound=e;else pRv=e},setBusy:x=>busy=x};"
 ].join('\n');
 // go() records the destination. The real handler still selects/setMode/reviewNow.
 c.go=(g,t)=>{c.route={g,t}};
 vm.runInContext(code,c);
 c.a.recompute();c.a.precompute();
 const render=()=>{c.a.recompute();c.a.precompute();c.a.renderWeek();c.a.renderDash();c.a.renderPWeek();c.a.renderPStats();c.a.renderTotals();c.a.renderPills();c.a.renderPPills()};
 render();
 return {c,a:c.a,$,render,click:(el,attr,value)=>{const b=$(el).querySelectorAll('['+attr+']').find(x=>x.dataset[attr.slice(5).replace(/-([a-z])/g,(_,z)=>z.toUpperCase())]===value);assert.ok(b,`Missing ${attr}=${value} in ${el}`);return b.click()},allMarkup:()=>[...els.values()].filter(x=>!x.id.includes(':')).map(x=>x.innerHTML).join('\n')};
}

// Initial cached data and repeated sync-render must never reveal official balls,
// result summaries, winning dots or aggregate amounts before a deliberate action.
let h=fixture();
for(let i=0;i<2;i++){
 h.render();
 assert.match(h.$('lastCard').innerHTML,/결과 준비됨/);assert.doesNotMatch(h.$('lastCard').innerHTML,/<ball>|전부 낙첨|세후/);
 assert.match(h.$('pLastCard').innerHTML,/결과 준비됨/);assert.doesNotMatch(h.$('pLastCard').innerHTML,/pres-row|win.*조|전부 낙첨/);
 assert.doesNotMatch(h.$('pOfficial').innerHTML,/pres-row|dg sm/);
 assert.doesNotMatch(h.$('rvPills').innerHTML,/aria-label="당첨"/);assert.doesNotMatch(h.$('pPills').innerHTML,/aria-label="당첨"/);
 assert.match(h.$('lAll').innerHTML,/가려/);assert.match(h.$('pAll').innerHTML,/가려/);
 assert.equal(h.$('grpTbl').innerHTML,'');assert.equal(h.$('pAnnuities').innerHTML,'');
}
// Slow CTA opens the chosen round but neither starts animation nor opens results.
h.click('lastCard','data-result-slow','lotto:1251');
assert.deepEqual(h.c.route,{g:'lotto',t:'review'});assert.equal(h.a.state().rvRound,1251);assert.equal(h.a.resultSeen('lotto',1251),false);assert.equal(h.$('rvSum').innerHTML,'');assert.equal(h.$('tray').innerHTML,'');
// A past round's quick CTA really displays that round, even while other rounds stay hidden.
h.click('roundTbl','data-result-now','lotto:1250');
assert.equal(h.a.state().rvRound,1250);assert.equal(h.a.resultSeen('lotto',1250),true);assert.match(h.$('rvSum').innerHTML,/세후/);assert.ok(h.$('tray').innerHTML.includes('<ball>7</ball>'));assert.equal(h.a.resultSeen('lotto',1251),false);assert.equal(h.a.resultSeen('pension',341),false);
h.click('pTbl','data-result-now','pension:341');assert.equal(h.a.state().pRv,341);assert.equal(h.a.resultSeen('pension',341),true);assert.match(h.$('pResult').innerHTML,/월 700만원|1등/);assert.equal(h.$('tray').innerHTML,'123456');
// Seven presses reveal one lottery ball per press; final summary is withheld until bonus.
h=fixture();h.a.select('lotto',1251);h.a.setMode('review');
for(let step=1;step<=7;step++){
 h.$('reviewNext').click();assert.equal((h.$('tray').innerHTML.match(/<ball>/g)||[]).length,step);assert.equal(h.a.resultSeen('lotto',1251),step===7);if(step<7)assert.equal(h.$('rvSum').innerHTML,'');
}
assert.match(h.$('rvSum').innerHTML,/구매/);assert.equal(h.a.resultSeen('pension',342),false);
// Thirteen pension presses reveal jo, six digits, then six bonus digits. Mid-flow
// sync redraw must retain exactly the already shown progress, not reveal the rest.
h=fixture();h.a.select('pension',342);h.a.setMode('preview');
for(let step=1;step<=13;step++){
 h.$('reviewNext').click();assert.equal((h.$('tray').innerHTML.match(/<pball>/g)||[]).length+(h.$('tray2').innerHTML.match(/<pball>/g)||[]).length,step);
 assert.equal(h.a.resultSeen('pension',342),step===13);
 if(step<13){assert.doesNotMatch(h.$('pResult').innerHTML,/class="sum/);if(step===4){const before=h.$('pResult').innerHTML;h.a.renderPReview();assert.equal(h.$('pResult').innerHTML,before);assert.equal(h.a.state().manual.step,4)}}
}
assert.match(h.$('pResult').innerHTML,/class="sum/);assert.equal(h.a.resultSeen('lotto',1251),false);
// Round/game switches clear manual progress. Starting a new app session never
// inherits reveal flags; corrected official data invalidates the old permission.
h.a.select('lotto',1251);h.a.setMode('review');assert.equal(h.a.state().manual,null);assert.equal(h.$('rvSum').innerHTML,'');
h.a.revealResult('lotto',1251);assert.equal(h.a.resultSeen('lotto',1251),true);h.c.F.official[1251].b=45;h.render();assert.equal(h.a.resultSeen('lotto',1251),false);assert.doesNotMatch(h.$('lastCard').innerHTML,/<ball>/);
h=fixture();assert.equal(h.a.resultSeen('lotto',1251),false);assert.equal(h.a.resultSeen('pension',342),false);
// A changed result during a partial pension replay resets on the next manual click.
h.a.select('pension',342);h.a.setMode('preview');h.$('reviewNext').click();h.$('reviewNext').click();assert.equal(h.a.state().manual.step,2);h.c.F.pension_official[342].n='000001';h.a.precompute();h.a.renderPReview();h.$('reviewNext').click();assert.equal(h.a.state().manual.step,1);assert.equal(h.a.resultSeen('pension',342),false);
console.log('PASS spoiler: cached/sync hidden, pills/totals hidden, old-round quick reveal, slow CTA no auto reveal, lottery7/pension13 steps, partial redraw preserved, per-game/session isolation, corrected official re-hidden/reset');
