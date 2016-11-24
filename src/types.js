/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-24
 * @author Liang <liang@maichong.it>
 */

export type Component = {
  js: string,
  xml: string,
  less?: string,
  sass?: string,
  scss?: string,
  isPage: boolean,
  isComponent: boolean,
};
