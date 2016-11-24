/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */

// @flow
/* eslint new-cap:0 */

import Debug from 'debug';
import fs from 'fs';
// $Flow
import moment from 'moment';
// $Flow
import archiverPromise from 'archiver-promise';
import type Project from './project';
import * as utils from './utils';

const debug = Debug('archiver');

export default async function archiver(project: Project) {
  debug('备份当前项目');
  let fileName = 'archiver-' + moment().format('YYYY-MM-DD HH-mm-ss') + '.zip';
  let archive = archiverPromise(project.workDir + fileName, {
    store: true
  });

  let files = fs.readdirSync(project.workDir);
  for (let file of files) {
    if (file === 'node_modules' || file === project.distRelative || file === project.tempRelative) continue;
    if (/\.zip$/.test(file)) continue;
    let filePath = project.workDir + file;
    if (utils.isDirectory(filePath)) {
      archive.directory(filePath, file);
    } else {
      archive.file(filePath, {
        name: file
      });
    }
  }
  await archive.finalize();
  debug('备份完成，已保存至 ' + fileName);
}
