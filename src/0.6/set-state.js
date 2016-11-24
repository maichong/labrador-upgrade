/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */


/* eslint new-cap:0 */

import Debug from 'debug';
import path from 'path';
import fs from 'fs';
import type { Project } from '../project';

const debug = Debug('set-state');

export default async function setState(file: string, project: Project) {
  let fileRelative = path.relative(project.workDir, file);
  debug(`将JS文件 ${fileRelative} setData 更新为 setState`);

  let data = fs.readFileSync(file, 'utf8');

  data = data.replace(/(\w+)\.setData/g, (matchs, val) => {
    return val + '.setState';
  }).replace(/([^\n]*)data\s*=([^\n]*)/g, (matchs, before, after) => {
    let r = before + 'state =' + after;
    debug(`'${matchs}' -> '${r}'`);
    return r;
  }).replace(/(\w*)\.data\.(\w*)/g, (matchs, before, after) => {
    let r = before + '.state.' + after;
    debug(`'${matchs}' -> '${r}'`);
    return r;
  });

  debug(`更新文件 ${fileRelative}`);

  fs.writeFileSync(file, data);
}
