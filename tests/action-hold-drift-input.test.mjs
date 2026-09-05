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

function setup(){
  const canvas=new FakeCanvas();
  const input=new InputState(canvas);
  return {canvas,input};
}

test('phase 1227 spell hold releases after pointer drifts beyond leash but preserves the initial press',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(1,1188,724));
  assert.equal(input.consumePressed('spell1'),true);
  assert.equal(input.isHeld('spell1'),true);
  canvas.dispatch('pointermove',pointEvent(1,1290,724));
  assert.equal(input.isHeld('spell1'),false);
  input.destroy();
});

test('phase 1231 small jitter inside the leash keeps spell hold active',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(1,1188,724));
  canvas.dispatch('pointermove',pointEvent(1,1260,724));
  assert.equal(input.isHeld('spell1'),true);
  input.destroy();
});

test('phase 1234 re-entering with the same pointer does not reactivate a released hold',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(1,1188,724));
  canvas.dispatch('pointermove',pointEvent(1,1290,724));
  canvas.dispatch('pointermove',pointEvent(1,1188,724));
  assert.equal(input.isHeld('spell1'),false);
  input.destroy();
});

test('phase 1240 lost pointer capture clears a held spell without waiting for pointerup',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(1,1188,724));
  assert.equal(input.isHeld('spell1'),true);
  canvas.dispatch('lostpointercapture',pointEvent(1,1188,724));
  assert.equal(input.isHeld('spell1'),false);
  input.destroy();
});

test('phase 1248 one drifting pointer does not clear another pointer holding the same spell',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(1,1188,724));
  canvas.dispatch('pointerdown',pointEvent(2,1188,724));
  canvas.dispatch('pointermove',pointEvent(1,1290,724));
  assert.equal(input.isHeld('spell1'),true);
  canvas.dispatch('pointermove',pointEvent(2,1290,724));
  assert.equal(input.isHeld('spell1'),false);
  input.destroy();
});

test('phase 1251 keyboard hold remains active regardless of pointer leash behavior',()=>{
  const {canvas,input}=setup();
  fakeWindow.dispatch('keydown',keyEvent('1'));
  canvas.dispatch('pointerdown',pointEvent(1,1188,724));
  canvas.dispatch('pointermove',pointEvent(1,1290,724));
  assert.equal(input.isHeld('spell1'),true);
  fakeWindow.dispatch('keyup',keyEvent('1'));
  assert.equal(input.isHeld('spell1'),false);
  input.destroy();
});

test('phase 1239 pointerup and pointercancel both clear held spell state',()=>{
  for(const type of ['pointerup','pointercancel']){
    const {canvas,input}=setup();
    canvas.dispatch('pointerdown',pointEvent(10,1188,724));
    assert.equal(input.isHeld('spell1'),true);
    canvas.dispatch(type,pointEvent(10,1188,724));
    assert.equal(input.isHeld('spell1'),false);
    input.destroy();
  }
});

test('phase 1249 different spell pointers remain isolated when one drifts out',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(11,1188,724));
  canvas.dispatch('pointerdown',pointEvent(12,1308,648));
  canvas.dispatch('pointermove',pointEvent(11,1290,724));
  assert.equal(input.isHeld('spell1'),false);
  assert.equal(input.isHeld('spell2'),true);
  input.destroy();
});

test('phase 1252 ultimate pointer behavior is unchanged by spell hold leash',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(13,1480,558));
  canvas.dispatch('pointermove',pointEvent(13,900,100));
  assert.equal(input.isHeld('ultimate1'),true);
  canvas.dispatch('pointerup',pointEvent(13,900,100));
  assert.equal(input.isHeld('ultimate1'),false);
  input.destroy();
});
