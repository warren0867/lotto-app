const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=readFileSync(join(__dirname,'../index.html'),'utf8');
const js=html.split('<script>')[1].split('</script>')[0];
new vm.Script(js); // full application syntax
const scoring=js.slice(js.indexOf('const matchOf='),js.indexOf('const CAT='));
const ctx={PRIZE:{1:[1000000000,45087397,1500000,50000,5000]}};vm.createContext(ctx);
vm.runInContext(scoring+';this.rank=rankOf;this.net=netOf',ctx);
const d={n:[1,2,3,4,5,6],b:7};
for(const [nums,r] of [[[1,2,3,4,5,6],1],[[1,2,3,4,5,7],2],[[1,2,3,4,5,8],3],[[1,2,3,4,8,9],4],[[1,2,3,8,9,10],5],[[1,2,8,9,10,11],0]])assert.equal(ctx.rank(nums,d),r);
assert.equal(ctx.net(5000),5000);assert.equal(ctx.net(45087397),35168390);

// 연금복권: 끝자리 일치 등수, 조 구분(1·2등), 보너스, 현금 당첨금
const pension=js.slice(js.indexOf('const sufOf='),js.indexOf('const pName='));
const pc={};vm.createContext(pc);vm.runInContext(pension+';this.rank=pRank;this.suf=sufOf;this.cash=P_CASH',pc);
const pd={jo:3,n:'194929',b:'783820'};
for(const [n,jo,r] of [['194929',3,1],['194929',1,2],['783820',2,'B'],['094929',1,3],['004929',5,4],['000929',1,5],['000029',1,6],['000009',1,7],['271943',1,0],['386492',5,0]])assert.equal(pc.rank(n,jo,pd),r,`${n} ${jo}조`);
assert.equal(pc.rank('386492',5,{jo:4,n:'194892',b:'288615'}),6); // 340회 5조 386492 = 6등(끝 2자리)
assert.equal(pc.suf('208597','194929'),0);assert.equal(pc.cash[6],5000);
const purchase=js.slice(js.indexOf('const groupsJSON='),js.indexOf('/* ── 실제 구매 내용 수정'));
async function scenario({fail='',stale=false}={}){
 const old=[{t:'고정',l:[[1,2,3,4,5,6]],online:true}],remote={1250:{groups:structuredClone(old),bought:false}},messages=[];
 if(stale)remote[1250].groups[0].l=[[7,8,9,10,11,12]];
 const c={writing:false,F:{rounds:{1250:{groups:old}}},Date,message:t=>messages.push(t),renders:0,renderMark:()=>c.renders++};
 c.write=async(name,mutate)=>{if(fail===name)return false;try{if(name==='rounds')mutate(remote);else mutate({});return true}catch{return false}};
 vm.createContext(c);vm.runInContext(purchase+';this.save=savePurchase',c);await c.save(1250,old);
 return {c,remote,messages};
}
(async()=>{
 let x=await scenario({fail:'rounds'});assert.equal(x.remote[1250].bought,false);assert.equal(x.c.writing,false);assert.equal(x.c.renders,1);
 x=await scenario({fail:'purchases'});assert.equal(x.remote[1250].bought,true);assert.equal(x.remote[1250].purchase.amount,1000);assert.match(x.messages.at(-1),/보조 기록/);
 x=await scenario({stale:true});assert.equal(x.remote[1250].bought,false);assert.equal(x.remote[1250].groups[0].l[0][0],7);
 x=await scenario();assert.equal(x.remote[1250].bought,true);assert.equal(x.remote[1250].purchase.lines,1);
 console.log('PASS: application syntax, ranks 0–5, known net calculation, purchase failure recovery, partial mirror, stale-group protection, success snapshot, pension ranks 1–7·bonus');
})().catch(e=>{console.error(e);process.exitCode=1});
