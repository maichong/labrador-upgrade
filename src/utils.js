/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */

// @flow
import fs from 'fs';
// $Flow
import JSON5 from 'json5';
// $Flow
import read from 'read-promise';

/**
 * @param src
 * @param target
 * @param replaces
 */
export function copyAndReplace(src: string, target: string, replaces?: Object) {
  let data = fs.readFileSync(src, 'utf8');
  if (replaces) {
    for (let key in replaces) {
      data = data.replace(new RegExp(exports.escapeRegExp(key), 'g'), replaces[key]);
    }
  }
  fs.writeFileSync(target, data);
}

/**
 * 判断指定路径是否是文件
 * @param path
 * @returns {boolean}
 */
export function isFile(path: string): boolean {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

/**
 * 判断指定路径是否是文件夹
 * @param path
 * @returns {boolean}
 */
export function isDirectory(path: string): boolean {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

/**
 * 读取JSON文件数据
 * @param file
 */
export function readJSON(file: string): Object {
  let data = fs.readFileSync(file, 'utf8');
  return JSON.parse(data);
}

/**
 * 写入JSON数据
 * @param file
 * @param data
 */
export function writeJSON(file: string, data: Object) {
  return fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/**
 * 读取JSON5文件
 * @param file
 */
export function readJSON5(file: string): Object {
  let data = fs.readFileSync(file, 'utf8');
  return JSON5.parse(data);
}

/**
 * 写入JSON5文件
 * @param file
 */
export function writeJSON5(file: string, data: Object) {
  return fs.writeFileSync(file, JSON5.stringify(data, null, 2));
}

/**
 * @param options
 * @param checker
 * @returns {*}
 */
export async function readValue(options: Object, checker?: Function): any {
  let value = await read(options);
  if (!checker) {
    checker = function (v) {
      return v;
    };
  }
  if (checker(value)) {
    return value;
  }
  return await readValue(options, checker);
}

/**
 * @param options
 * @param def
 */
export async function readBool(options: Object|string, def?: boolean|string): Promise<boolean> {
  if (typeof options === 'string') {
    options = {
      prompt: options
    };
  }
  if (def !== undefined) {
    // $Flow
    options.default = (def === true || def === 'yes' || def === 'y') ? 'yes' : 'no';
  }
  let value = await read(options);
  if (['yes', 'y'].indexOf(value) > -1) {
    return true;
  }
  if (['no', 'n'].indexOf(value) > -1) {
    return false;
  }
  return await readBool(options);
}
