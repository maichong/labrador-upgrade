/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */

// @flow
/* eslint new-cap:0 */

import Debug from 'debug';
import path from 'path';
import _ from 'lodash';
import shelljs from 'shelljs';
import type Project from '../project';
import type { Component } from '../types';
import * as utils from '../utils';
import xmlBindState from './xml-bind-state';
import setState from './set-state';

const debug = Debug('upgrade-0.6');

export default async function upgrade6(project: Project) {
  debug('升级当前项目到0.6.x版本');
  if (project.labradorVersion === 0.6) {
    let confirm = await utils.readBool(
      `当前的项目已经是0.6.x版本了（package.json中依赖的labrador为${project.labradorVersionString}），您是否仍然需要升级？`,
      'no'
    );
    if (!confirm) {
      // 取消升级
      debug('已取消升级0.6.x');
      return;
    }
  }

  if (project.labradorVersion > 0.6) {
    debug(`当前的项目比0.6.x版本高（package.json中依赖的labrador为${project.labradorVersionString}），跳过升级。`);
    return;
  }

  debug('开始升级到0.6.x');

  debug('安装Flow');
  shelljs.exec(
    'npm install --save ' +
    'babel-plugin-syntax-flow ' +
    'babel-plugin-transform-flow-strip-types ' +
    'eslint-plugin-flowtype ' +
    'eslint-plugin-flowtype-errors ' +
    'flow-bin',
    {
      cwd: project.workDir
    }
  );

  if (!utils.isFile(project.flowConfigFile)) {
    debug('新建 .flowconfig');
    utils.copyAndReplace(path.join(__dirname, '.flowconfig'), project.flowConfigFile);
  }

  debug('升级 .babelrc');
  let babelConfig = project.babelConfig;
  babelConfig.plugins = _.union(babelConfig.plugins || [], ['syntax-flow', 'transform-flow-strip-types']);
  project.babelConfig = babelConfig;

  debug('升级 .eslintrc');
  let eslintConfig = project.eslintConfig;
  eslintConfig.plugins = _.union(eslintConfig.plugins || [], ['flowtype', 'flowtype-errors']);
  if (!eslintConfig.rules) {
    eslintConfig.rules = {};
  }
  eslintConfig.rules['flowtype/define-flow-type'] = 1;
  eslintConfig.rules['flowtype/use-flow-type'] = 1;
  eslintConfig.rules['flowtype-errors/show-errors'] = 2;
  project.eslintConfig = eslintConfig;

  let components: Array<Component> = project.findComponents();

  for (let component of components) {
    if (component.isComponent) {
      await xmlBindState(component.xml, project);
      await setState(component.js, project);
    }
  }

  debug('升级labrador');
  shelljs.exec(
    'npm install --save ' +
    'labrador ' +
    'labrador-test ' +
    'labrador-immutable',
    {
      cwd: project.workDir
    }
  );
}
