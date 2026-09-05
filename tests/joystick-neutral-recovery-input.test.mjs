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

function setup(){
  const canvas=new FakeCanvas();
  return {canvas,input:new InputState(canvas)};
}

test('phase 1272 returning to the original joystick home after a long soft-follow drag snaps movement to neutral',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(1,180,720));
  canvas.dispatch('pointermove',pointEvent(1,400,720));
  assert.ok(input.move.x>.9);
  canvas.dispatch('pointermove',pointEvent(1,180,720));
  assert.deepEqual(input.move,{x:0,y:0});
  assert.deepEqual(input.joystickBase,{x:180,y:720});
  assert.deepEqual(input.joystickThumb,{x:180,y:720});
  input.destroy();
});

test('phase 1280 after a neutral catch the same pointer can immediately move in the reverse direction',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(2,180,720));
  canvas.dispatch('pointermove',pointEvent(2,400,720));
  canvas.dispatch('pointermove',pointEvent(2,180,720));
  canvas.dispatch('pointermove',pointEvent(2,110,720));
  assert.ok(input.move.x<-.5);
  input.destroy();
});

test('phase 1282 small jitter around the recentered home stays neutral through the existing deadzone',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(3,180,720));
  canvas.dispatch('pointermove',pointEvent(3,400,720));
  canvas.dispatch('pointermove',pointEvent(3,180,720));
  canvas.dispatch('pointermove',pointEvent(3,188,724));
  assert.deepEqual(input.move,{x:0,y:0});
  input.destroy();
});

test('phase 1288 pointer loss clears recovery state so a new joystick press starts from its own home',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(4,180,720));
  canvas.dispatch('pointermove',pointEvent(4,400,720));
  canvas.dispatch('lostpointercapture',pointEvent(4,400,720));
  canvas.dispatch('pointerdown',pointEvent(5,250,700));
  assert.deepEqual(input.joystickBase,{x:250,y:700});
  assert.deepEqual(input.move,{x:0,y:0});
  input.destroy();
});

test('phase 1291 lifecycle transient reset clears the joystick home anchor',()=>{
  const {canvas,input}=setup();
  canvas.dispatch('pointerdown',pointEvent(6,180,720));
  canvas.dispatch('pointermove',pointEvent(6,400,720));
  assert.notEqual(input.joystickHome,null);
  input.resetTransient();
  assert.equal(input.joystickHome,null);
  assert.deepEqual(input.move,{x:0,y:0});
  input.destroy();
});
