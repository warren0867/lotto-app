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
const purchase=js.slice(js.indexOf('const groupsJSON='),js.indexOf('/* ── 소리'));
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
 console.log('PASS: application syntax, ranks 0–5, known net calculation, purchase failure recovery, partial mirror, stale-group protection, success snapshot');
})().catch(e=>{console.error(e);process.exitCode=1});
