/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */

/* eslint max-len:0 */

'use strict';

process.env.DEBUG = '*';

const assert = require('assert');
const DOMParser = require('xmldom').DOMParser;
const bind = require('../lib/0.6/xml-bind-state').bind;

function convent(input) {
  let doc = new DOMParser().parseFromString(input);
  bind(doc, {});
  return doc.toString().trim().replace(/\{\{([^}]+)\}\}/ig, (matchs, words) => {
    return matchs.replace(/&amp;/g, '&').replace(/&lt;/g, '<');
  });
}

function test(index, input, output) {
  output = output.trim();
  let res1 = convent(input);
  let res2 = convent(res1);
  let passed = res1 === output;
  console.log(`+++++++++++++++++++++++++++\n\n\n\n${index}:\n${input}\n-------->\n${output}\n---------\n${res1}\n---------\n${res2}\n\n\n\n\n\n+++++++++++++++++++++++++++`);
  assert(passed, '第一次转换失败');
  assert(res2 === output, '第二次转换失败');
}

`
++++++++++++++++++++++++++0

<view class="a-{{b}} c" wx:if="{{true}}">{{a}}:{{item}}{{state.a}}{{props.a}}</view>
--------------------------
<view class="a-{{state.b}} c" wx:if="{{true}}">{{state.a}}:{{state.item}}{{state.a}}{{props.a}}</view>



++++++++++++++++++++++++++1


<view wx:for="{{x}}">{{index}}:{{i}},{{item.title}}{{...a}}</view>
--------------------------
<view wx:for="{{state.x}}">{{index}}:{{state.i}},{{item.title}}{{...state.a}}</view>

++++++++++++++++++++++++++2


<view wx:for="{{x}}" wx:for-index="i">{{index}}:{{i}},{{item.title}}{{...a}}</view>
--------------------------
<view wx:for="{{state.x}}" wx:for-index="i">{{state.index}}:{{i}},{{item.title}}{{...state.a}}</view>


++++++++++++++++++++++++++3


<view wx:for="{{x}}" wx:for-index="i" wx:for-item="_">{{index}}:{{i}},{{item.title}}{{...a}}</view>
--------------------------
<view wx:for="{{state.x}}" wx:for-index="i" wx:for-item="_">{{state.index}}:{{i}},{{state.item.title}}{{...state.a}}</view>


++++++++++++++++++++++++++4


<view wx:for="{{x}}"><text wx:for="{{y}}">{{index}}{{item.title}},{{...item}}</text></view>
--------------------------
<view wx:for="{{state.x}}"><text wx:for="{{state.y}}">{{index}}{{item.title}},{{...item}}</text></view>

++++++++++++++++++++++++++5


<view wx:for="{{x}}" wx:for-item="y"><text wx:for="{{y}}">{{index}}{{item.title}},{{...item}},{{item.a?true:0}}</text></view>
--------------------------
<view wx:for="{{state.x}}" wx:for-item="y"><text wx:for="{{y}}">{{index}}{{item.title}},{{...item}},{{item.a?true:0}}</text></view>

++++++++++++++++++++++++++6


<view wx:for="{{x}}" wx:for-item="y"><text wx:for="{{y}}" wx:for-item="z">{{index}}{{item.title}},{{...item}},{{item.a?true:0}}</text></view>
--------------------------
<view wx:for="{{state.x}}" wx:for-item="y"><text wx:for="{{y}}" wx:for-item="z">{{index}}{{state.item.title}},{{...state.item}},{{state.item.a?true:0}}</text></view>


++++++++++++++++++++++++++7


<template data="{{[1,2,3,4]}}"/>
--------------------------
<template data="{{[1,2,3,4]}}"/>


++++++++++++++++++++++++++8


<template data="{{[1,2,3,4,a,item]}}"/>
--------------------------
<template data="{{[1,2,3,4,state.a,state.item]}}"/>


++++++++++++++++++++++++++9


<view wx:for="{{x}}"><template data="{{[1,2,3,4,a,b,c,item]}}"/></view>
--------------------------
<view wx:for="{{state.x}}"><template data="{{[1,2,3,4,state.a,state.b,state.c,item]}}"/></view>



++++++++++++++++++++++++++10
<view wx:if="{{length > 5}}"> 1 </view>
<view wx:elif="{{length > 2}}"> 2 </view>
<view wx:else> 3 </view>
--------------------------
<view wx:if="{{state.length > 5}}"> 1 </view>
<view wx:elif="{{state.length > 2}}"> 2 </view>
<view wx:else="wx:else"> 3 </view>


++++++++++++++++++++++++++11



<view> {{a + b}} + {{c+"hello"}} + d <template is="objectCombine" data="{{...obj1, ...obj2, a, c: 6}}"></template></view>
--------------------------
<view> {{state.a + state.b}} + {{state.c+"hello"}} + d <template is="objectCombine" data="{{...state.obj1,...state.obj2,a:state.a,c:6}}"/></view>


++++++++++++++++++++++++++12



<view>{{object.key}} {{...array[0].c}} <template is="objectCombine" data="{{foo, bar:'aaa'}}"></template></view>
--------------------------
<view>{{state.object.key}} {{...state.array[0].c}} <template is="objectCombine" data="{{foo:state.foo,bar:'aaa'}}"/></view>


++++++++++++++++++++++++++13



<view wx:for="{{x}}" wx:for-item="d">{{a,d}} <template is="objectCombine" data="{{...obj1, ...obj2, e: 5}}"/></view>
--------------------------
<view wx:for="{{state.x}}" wx:for-item="d">{{a:state.a,d:d}} <template is="objectCombine" data="{{...state.obj1,...state.obj2,e:5}}"/></view>


++++++++++++++++++++++++++14



<view wx:for="{{[zero, 1, 2, 3]}}"> {{item}} <template is="objectCombine" data="{{for: a, bar: b}}"/></view>
--------------------------
<view wx:for="{{[state.zero, 1, 2, 3]}}"> {{item}} <template is="objectCombine" data="{{for:state.a,bar:state.b}}"/></view>



++++++++++++++++++++++++++15



<view wx:for="{{[1, 2, 3, 4, 5, 6, 7, 8, 9]}}" wx:for-item="i">
  <view wx:for="{{[1, 2, 3, 4, 5, 6, 7, 8, 9]}}" wx:for-item="j">
    <view wx:if="{{i <= j}}">
      {{i}} * {{j}} = {{i * j}}
    </view>
  </view>
</view>
--------------------------
<view wx:for="{{[1, 2, 3, 4, 5, 6, 7, 8, 9]}}" wx:for-item="i">
  <view wx:for="{{[1, 2, 3, 4, 5, 6, 7, 8, 9]}}" wx:for-item="j">
    <view wx:if="{{i <= j}}">
      {{i}} * {{j}} = {{i * j}}
    </view>
  </view>
</view>



++++++++++++++++++++++++++14


<block wx:for="{{[1, 2, 3, 4, foo]}}">
    <template is="{{item % 2 == 0 ? 'even' : odd}}"/>
</block>
--------------------------
<block wx:for="{{[1, 2, 3, 4, state.foo]}}">
    <template is="{{item % 2 == 0 ? 'even' : state.odd}}"/>
</block>

++++++++++++++++++++++++++14


<template name="foo">
  <view>{{bar}}</view>
</template>
--------------------------
<template name="foo">
  <view>{{bar}}</view>
</template>



`.split(/\n[\+\d]+/).map(function (code) {
  let arr = code.split(/\n\-+/);
  if (!arr || arr.length !== 2) {
    return null;
  }
  return arr;
}).filter(c => c).forEach((c, index) => {
  test(index, c[0], c[1]);
});

console.log('\n\n\n\n\n\nall passed\n\n\n');
