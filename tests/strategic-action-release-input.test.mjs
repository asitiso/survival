import test from 'node:test';
import assert from 'node:assert/strict';

class FakeEventTarget {
  constructor(){ this.listeners=new Map(); }
  addEventListener(type,fn){ const list=this.listeners.get(type)??[]; list.push(fn); this.listeners.set(type,list); }
  removeEventListener(type,fn){ const list=this.listeners.get(type)??[]; this.listeners.set(type,list.filter((entry)=>entry!==fn)); }
  dispatch(type,event){ for(const fn of this.listeners.get(type)??[]) fn(event); }
}
class FakeCanvas extends FakeEventTarget {
  getBoundingClientRect(){ return {left:0,top:0,width:1600,height:900}; }
  setPointerCapture(){}
}
const fakeWindow=new FakeEventTarget();
globalThis.window=fakeWindow;
const { InputState }=await import('../dist/core/input.js');
const pointEvent=(pointerId,x,y)=>({pointerId,clientX:x,clientY:y,preventDefault(){}});
const keyEvent=(key,{repeat=false}={})=>({key,repeat,preventDefault(){}});
function setup(){ const canvas=new FakeCanvas(); return {canvas,input:new InputState(canvas)}; }

test('phase 1305 shop touch arms on pointerdown and commits only on pointerup',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(1,1090,510));
  assert.equal(input.consumePressed('shop'),false);
  assert.equal(input.isHeld('shop'),true);
  canvas.dispatch('pointerup',pointEvent(1,1090,510));
  assert.equal(input.consumePressed('shop'),true);
  assert.equal(input.consumePressed('shop'),false);
  assert.equal(input.isHeld('shop'),false);
  input.destroy();
});

test('phase 1307 auto touch also commits on release instead of pointerdown',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(2,1060,724));
  assert.equal(input.consumePressed('auto'),false);
  canvas.dispatch('pointerup',pointEvent(2,1060,724));
  assert.equal(input.consumePressed('auto'),true);
  input.destroy();
});

test('phase 1313 sliding outside the strategic release boundary cancels and reentry does not rearm',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(3,1060,724));
  canvas.dispatch('pointermove',pointEvent(3,1140,724));
  canvas.dispatch('pointermove',pointEvent(3,1060,724));
  canvas.dispatch('pointerup',pointEvent(3,1060,724));
  assert.equal(input.consumePressed('auto'),false);
  assert.equal(input.isHeld('auto'),false);
  input.destroy();
});

test('phase 1321 a second pointer on the same strategic action cannot double commit',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(4,1060,724));
  canvas.dispatch('pointerdown',pointEvent(5,1060,724));
  canvas.dispatch('pointerup',pointEvent(5,1060,724));
  assert.equal(input.consumePressed('auto'),false);
  canvas.dispatch('pointerup',pointEvent(4,1060,724));
  assert.equal(input.consumePressed('auto'),true);
  assert.equal(input.consumePressed('auto'),false);
  input.destroy();
});

test('phase 1323 shop and auto owner pointers remain independent',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(6,1090,510));
  canvas.dispatch('pointerdown',pointEvent(7,1060,724));
  canvas.dispatch('pointerup',pointEvent(6,1090,510));
  canvas.dispatch('pointerup',pointEvent(7,1060,724));
  assert.equal(input.consumePressed('shop'),true);
  assert.equal(input.consumePressed('auto'),true);
  input.destroy();
});

test('phase 1329 pointercancel and lostpointercapture cancel strategic actions without committing',()=>{
  for(const type of ['pointercancel','lostpointercapture']){
    const {canvas,input}=setup();
    canvas.dispatch('pointerdown',pointEvent(8,1090,510));
    canvas.dispatch(type,pointEvent(8,1090,510));
    assert.equal(input.consumePressed('shop'),false,type);
    assert.equal(input.isHeld('shop'),false,type);
    input.destroy();
  }
});

test('phase 1331 resetTransient discards an armed strategic action',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(9,1060,724));
  input.resetTransient();
  canvas.dispatch('pointerup',pointEvent(9,1060,724));
  assert.equal(input.consumePressed('auto'),false);
  input.destroy();
});

test('phase 1308 spell ultimate and potion touch latency remains immediate',()=>{
  const cases=[['spell1',1188,724],['ultimate1',1480,558],['potion',1080,616]];
  for(const [action,x,y] of cases){
    const {canvas,input}=setup();
    canvas.dispatch('pointerdown',pointEvent(10,x,y));
    assert.equal(input.consumePressed(action),true,action);
    input.destroy();
  }
});

test('phase 1309 keyboard B and R remain immediate strategic inputs',()=>{
  const {input}=setup();
  fakeWindow.dispatch('keydown',keyEvent('b'));
  assert.equal(input.consumePressed('shop'),true);
  fakeWindow.dispatch('keyup',keyEvent('b'));
  fakeWindow.dispatch('keydown',keyEvent('r'));
  assert.equal(input.consumePressed('auto'),true);
  fakeWindow.dispatch('keyup',keyEvent('r'));
  input.destroy();
});

test('phase 1332 explicit strategic-arm reset clears shop and auto without disturbing later pointerup',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(11,1090,510));
  canvas.dispatch('pointerdown',pointEvent(12,1060,724));
  input.clearStrategicActionArms();
  assert.equal(input.isHeld('shop'),false);
  assert.equal(input.isHeld('auto'),false);
  canvas.dispatch('pointerup',pointEvent(11,1090,510));
  canvas.dispatch('pointerup',pointEvent(12,1060,724));
  assert.equal(input.consumePressed('shop'),false);
  assert.equal(input.consumePressed('auto'),false);
  input.destroy();
});
