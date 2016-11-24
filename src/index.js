/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */

import program from 'commander';
import updateNotifier from 'update-notifier';
import { setOptions } from './config';

const pkg = require('../package.json');

const notifier = updateNotifier({
  pkg,
  callback: function (error, update) {
    if (update && ['major', 'minor', 'patch'].indexOf(update.type) > -1) {
      notifier.update = update;
      notifier.notify({
        defer: false
      });
    }
  }
});

program
  .version(pkg.version);

program
  .command('convent')
  .description('将原始的微信小程序项目转换为Labrador项目')
  .action((options) => {
    setOptions(options);
    console.log('转换命令正在开发中');
  });

program
  .command('upgrade')
  .description('升级当前Labrador项目')
  .action((options) => {
    setOptions(options);
    require('./upgrade').default().then(() => {
      console.log('升级完成');
    }, (error) => {
      console.error('升级失败：\n' + error.stack);
    });
  });

program.parse(process.argv);

if (!program.args.length) program.help();
