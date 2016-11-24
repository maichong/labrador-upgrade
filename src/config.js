/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */

// @flow

import path from 'path';

const config = {
  workDir: process.cwd() + '/',
  relative: './'
};

export function setOptions(options: Object) {
  if (options.workDir) {
    if (path.isAbsolute(options.workDir)) {
      config.workDir = path.normalize(options.workDir) + '/';
    } else {
      config.workDir = path.join(process.cwd(), options.workDir) + '/';
    }
    config.relative = path.relative(process.cwd(), config.workDir);
  }
}

export default config;
