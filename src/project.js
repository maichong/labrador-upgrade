/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */

// @flow

import path from 'path';
import fs from 'fs';
import * as utils from './utils';
import type { Component } from './types';

export default class Project {

  workDir: string;

  constructor(workDir: string) {
    this.workDir = workDir;
  }

  get srcRelative(): string {
    let labradorConfig = this.labradorConfig;
    return labradorConfig.srcDir || 'src';
  }

  get srcDir(): string {
    return path.join(this.workDir, this.srcRelative);
  }

  get distRelative(): string {
    let labradorConfig = this.labradorConfig;
    return labradorConfig.distDir || 'dist';
  }

  get distDir(): string {
    return path.join(this.workDir, this.distRelative);
  }

  get tempRelative(): string {
    let labradorConfig = this.labradorConfig;
    return labradorConfig.tempDir || '.build';
  }

  get tempDir(): string {
    return path.join(this.workDir, this.tempRelative);
  }

  get isNpm(): boolean {
    return utils.isFile(this.pkgFile);
  }

  get isLabrador(): boolean {
    return this.isNpm && utils.isFile(this.workDir + '.labrador');
  }

  get pkgFile(): string {
    return path.join(this.workDir, 'package.json');
  }

  get pkgData(): Object {
    if (!this.isNpm) {
      return {};
    }
    return utils.readJSON(this.pkgFile);
  }

  set pkgData(data: Object) {
    utils.writeJSON(this.pkgFile, data);
  }

  get labradorVersionString(): string {
    let pkgData = this.pkgData;
    if (pkgData.dependencies && pkgData.dependencies.labrador) {
      return pkgData.dependencies.labrador;
    }
    return '';
  }

  get labradorVersion(): number {
    return parseFloat((this.labradorVersionString.match(/\d+\.\d+/) || [])[0] || 0);
  }

  get labradorConfigFile(): string {
    return path.join(this.workDir, '.labrador');
  }

  get labradorConfig(): Object {
    let file = this.labradorConfigFile;
    if (!utils.isFile(file)) {
      return {};
    }
    return utils.readJSON5(file);
  }

  set labradorConfig(data: Object) {
    utils.writeJSON5(this.labradorConfigFile, data);
  }

  get babelConfigFile(): string {
    return path.join(this.workDir, '.babelrc');
  }

  get babelConfig(): Object {
    let file = this.babelConfigFile;
    if (!utils.isFile(file)) {
      return {};
    }
    return utils.readJSON5(file);
  }

  set babelConfig(data: Object) {
    utils.writeJSON5(this.babelConfigFile, data);
  }

  get eslintConfigFile(): string {
    return path.join(this.workDir, '.eslintrc');
  }

  get eslintConfig(): Object {
    let file = this.eslintConfigFile;
    if (!utils.isFile(file)) {
      return {};
    }
    return utils.readJSON(file);
  }

  set eslintConfig(data: Object) {
    utils.writeJSON(this.eslintConfigFile, data);
  }

  get flowConfigFile(): string {
    return path.join(this.workDir, '.flowconfig');
  }

  findComponents(dir?: string): Array<Component> {
    dir = dir || this.srcDir;
    let result: Array<Component> = [];
    let map: {[key:string]:Component} = {};
    let files = fs.readdirSync(dir);
    let isPage = path.relative(path.join(this.srcDir, 'pages'), dir)[0] !== '.';
    for (let file of files) {
      let filePath = path.join(dir, file);
      if (utils.isDirectory(filePath)) {
        result = result.concat(this.findComponents(filePath));
      } else {
        let info = path.parse(filePath);
        if (info.ext === '.json') continue;
        if (info.name.match(/\.test$/)) continue;
        let key = info.dir + info.name;
        let type = info.ext.substr(1);
        if (!map[key]) {
          map[key] = {
            isPage
          };
        }
        map[key][type] = filePath;
      }
    }
    return result.concat(Object.values(map).map((com: Component) => {
      com.isComponent = !!(com.js && com.xml);
      return com;
    }));
  }
}
