import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { selectPairs, shuffle, buildDeck, getBoardLayout } from "../src/lib/game.ts";
const pool = Array.from({length:30}, (_, index) => ({id:String(index), left:{name:"L"+index,image:"/L"+index}, right:{name:"R"+index,image:"/R"+index}}));
test("10–30 animal pairs can be filled randomly without duplicates",()=>{ for(let n=10;n<=30;n++){const result=selectPairs(pool,["2","7"],n);assert.equal(result.length,n);assert.equal(new Set(result.map(p=>p.id)).size,n);assert.ok(result.some(p=>p.id==="2"));assert.ok(result.some(p=>p.id==="7"));}});
test("all selected pairs remain in exact-size deck",()=>assert.deepEqual(new Set(selectPairs(pool,["2","3","4"],3).map(p=>p.id)),new Set(["2","3","4"])));
test("reject unknown selected pairs and count overflow",()=>{assert.throws(()=>selectPairs(pool,["missing"],10));assert.throws(()=>selectPairs(pool,["1","2"],1));assert.throws(()=>selectPairs(pool,[],31));assert.throws(()=>selectPairs(pool,[],1.5));});
test("Fisher–Yates does not mutate input",()=>{const source=[1,2,3,4];const result=shuffle(source,()=>0);assert.deepEqual(source,[1,2,3,4]);assert.deepEqual([...result].sort(),source);assert.notDeepEqual(result,source);});
test("related faces match by pair ID, not their different image URLs",()=>{const result=buildDeck(pool.slice(0,15));assert.equal(result.length,30);for(const pair of pool.slice(0,15)){const faces=result.filter(c=>c.pairId===pair.id);assert.equal(faces.length,2);assert.notEqual(faces[0].image,faces[1].image);}assert.equal(new Set(result.map(c=>c.id)).size,30);});
test("custom duplicate image faces remain a single unique pair",()=>{const face={name:"사진",image:"data:image/png;base64,example"};const deck=buildDeck([{id:"custom-1",left:face,right:face}]);assert.equal(deck.length,2);assert.equal(deck[0].pairId,deck[1].pairId);assert.notEqual(deck[0].id,deck[1].id);});
test("duplicate pair IDs rejected",()=>assert.throws(()=>buildDeck([pool[0],pool[0]])));
test("board dimensions cover every selected card and keep mobile within 6 columns",()=>{for(let count=4;count<=60;count+=2){const layout=getBoardLayout(count);assert.ok(layout.desktopColumns*layout.desktopRows>=count);assert.ok(layout.mobileColumns*layout.mobileRows>=count);assert.ok(layout.mobileColumns>=2&&layout.mobileColumns<=6);}assert.equal(getBoardLayout(20).desktopColumns,5);assert.equal(getBoardLayout(60).desktopColumns,10);});
test("theme catalog and image production plan describe exactly 105 valid pairs",()=>{
  const catalog=JSON.parse(readFileSync(new URL("../assets/theme-catalog.json",import.meta.url),"utf8"));
  const plan=JSON.parse(readFileSync(new URL("../assets/card-plan.json",import.meta.url),"utf8"));
  assert.deepEqual(Object.fromEntries(catalog.map(theme=>[theme.id,theme.pairs.length])),{animals:30,food:30,world:15,timeline:15,jobs:15});
  const faces=new Set();
  for(const theme of catalog){
    assert.equal(new Set(theme.pairs.map(pair=>pair.id)).size,theme.pairs.length);
    for(const pair of theme.pairs){
      for(const face of [pair.left,pair.right]){assert.ok(face.name.length>0);assert.ok(face.image.startsWith("/cards/"));faces.add(face.image);}
      assert.equal(pair.left.image===pair.right.image,theme.kind==="same");
    }
  }
  assert.equal(faces.size,150);
  const planned=new Set(plan.items.map(item=>"/cards/"+item.theme+"/"+item.id+".webp"));
  assert.equal(planned.size,135);
  assert.deepEqual(planned,new Set([...faces].filter(path=>path.endsWith(".webp"))));
});
