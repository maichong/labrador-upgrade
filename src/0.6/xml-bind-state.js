/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */

/* eslint new-cap:0 */

import Debug from 'debug';
import path from 'path';
import fs from 'fs';
import xmldom from 'xmldom';
import type { Project } from '../project';

const debug = Debug('xml-bind-state');
const DOMParser = xmldom.DOMParser;

/**
 * 判断字符串中指定的位置是否是被包含在引号中
 * @param string
 * @param n
 * @returns {boolean}
 */
function inText(string, n) {
  let firstIndex = string.search(/"|'/);
  if (firstIndex === -1 || firstIndex > n) return false;
  let char = '';
  let last = '';
  for (let i = 0; i < n; i++) {
    let c = string[i];
    if (c === '"' || c === "'") {
      if (!char) {
        char = c;
      } else if (char === c && last !== '\\') {
        char = '';
      }
    }
    last = c;
  }
  return char !== '';
}

/**
 * 检查绑定字符串
 * @param {string} string  字符串
 * @param {Object} ignores 忽略的变量列表
 * @returns {string}
 */
function checkString(string, ignores) {
  // 替换字符串中 {{}} 包含的表达式

  // 获取类似 a.b.c 表达式中第一个有效变量名 a
  function getFirstWord(word) {
    return word.match(/[a-z_][\w\d]*/i)[0];
  }

  // 检查类似 a.b.c 格式表达式是否忽略绑定
  function shouldIgnore(word, matchs, n) {
    if (word[0] === '"' || word[0] === "'") return true;
    let w = getFirstWord(word);
    return ignores[w] || w === 'state' || w === 'props' || (matchs && inText(matchs, n));
  }

  return string.replace(/\{\{([^}]+)\}\}/ig, (matchs, words) => {
    // matchs 是{{xxxxx}}格式的字符串
    // words  是{{}}中间的表达式

    // ...foo
    if (/^\s*\.\.\.[\w_][\w\d\-_.\[\]]*\s*$/.test(words)) {
      let word = words.match(/\s*\.\.\.([\w_][\w\d\-_.\[\]]*)/)[1].trim();
      if (shouldIgnore(word)) {
        return matchs;
      }
      debug(`简单对象展开语法 '...${word}' -> '...state.${word}'`);
      return `{{...state.${word}}}`;
    }
    let isArray = /{{\s*\[/.test(matchs);
    if (!isArray) {
      //支持对象简写
      let arrays = words.split(',');
      if (arrays.length > 1) {
        let isObject = true;
        let props = arrays.map((str) => {
          if (!isObject) return null;
          // str 为对象中的一个属性， 可能为 a:b / a / ...a / ...a.b
          str = str.trim();
          let arr = str.split(':');
          //console.log('arr', arr);
          if (arr.length === 1) {
            // 如果属性表达式中不包含冒号
            //console.log('str', str);

            // 如果为简写属性表达式，例如 {foo}
            if (/^[a-z_][\w\d]*$/i.test(str)) {
              if (ignores[str]) {
                return str + ':' + str;
              }
              let r = str + ':state.' + str;
              debug(`简写属性表达式 ${str} -> ${r}`);
              return r;
            }

            // 属性展开表达式 ...foo
            if (/^\.{3}[a-z_][\w\d.\[\]]*$/i.test(str)) {
              let word = str.substr(3);
              if (shouldIgnore(word)) {
                return str;
              }
              let r = '...state.' + word;
              debug(`属性展开表达式 ${str} -> ${r}`);
              return r;
            }

            debug(`判定 ${matchs} 不为对象表达式`);

            isObject = false;
            return null;
          }

          // 存在冒号的对象属性表达式

          let word = arr[1].trim();
          // foo:2.3
          if (/^[\d.]+$/.test(word)) {
            return arr[0] + ':' + word;
          }

          // foo:bar
          // 'foo':bar
          if (shouldIgnore(word)) {
            return str;
          }
          let r = arr[0] + ':state.' + word;
          debug(`对象属性表达式 ${str} -> ${r}`);
          return r;
        });
        if (isObject) {
          let r = '{{' + props.join(',') + '}}';
          debug(`判定 ${matchs} 为对象表达式 --> ${r}`);
          return r;
        }
      }
    }

    return matchs.replace(/[^\.\w'"]([a-z_\$][\w\d\._\$]*)/ig, function (match, word, n) {
      if (shouldIgnore(word, matchs, n)) {
        return match;
      }
      debug(`赋值表达式 ${word} -> state.${word}`);
      return match[0] + 'state.' + word;
    });
  });
}

export function bind(node, ignores) {
  ignores = Object.assign({
    true: true,
    false: true,
    null: true,
    undefined: true
  }, ignores);

  //处理节点属性
  let attributes = node.attributes;
  for (let i in attributes) {
    if (!/^\d+$/.test(i)) continue;
    let attr = attributes[i];

    //处理属性值
    if (attr.value.indexOf('{') > -1) {
      attr.value = checkString(attr.value, ignores);
    }

    //如果是循环标签,则在子标签中忽略循环索引和值变量
    if (attr.name === 'wx:for') {
      let index = node.getAttribute('wx:for-index') || 'index';
      let item = node.getAttribute('wx:for-item') || 'item';
      ignores[index] = true;
      ignores[item] = true;
    }
  }

  //如果节点为文本
  if (node.nodeName === '#text') {
    let data = node.data;
    if (data && data.indexOf('{') > -1) {
      node.replaceData(0, data.length, checkString(data, ignores));
    }
  }

  //递归处理子节点
  for (let i in node.childNodes) {
    if (!/^\d+$/.test(i)) continue;
    let n = node.childNodes[i];
    // 不转换template 定义
    if (n.nodeName === 'template' && n.getAttribute('name')) {
      continue;
    }
    bind(n, ignores);
  }
}

export default async function xmlBindState(file: string, project: Project) {
  let fileRelative = path.relative(project.workDir, file);
  debug(`将XML文件 ${fileRelative} 变量自动绑定 "state" 域`);

  let data = fs.readFileSync(file, 'utf8');
  let doc = new DOMParser().parseFromString(data);

  bind(doc, {});

  let xml = doc.toString().trim().replace(/\{\{([^}]+)\}\}/ig, (matchs) => {
    return matchs.replace(/&amp;/g, '&').replace(/&lt;/g, '<');
  });
  debug(`更新文件 ${fileRelative}`);

  fs.writeFileSync(file, xml);
}
