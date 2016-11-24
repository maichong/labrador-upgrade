/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */

// @flow
/* eslint new-cap:0 */

import Debug from 'debug';
import Project from './project';
import archiver from './archiver';
import config from './config';
import upgrade6 from './0.6';

const debug = Debug('upgrade');

export default async function upgrade() {
  debug('升级当前Labrador项目');

  let project = new Project(config.workDir);

  if (!project.isLabrador) {
    throw new Error('当前目录不是有效的Labrador项目目录');
  }

  await archiver(project);

  await upgrade6(project);
}
