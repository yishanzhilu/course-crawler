const url = require('url');
const path = require('path');
const PromisePool = require('es6-promise-pool')
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import * as puppeteer from 'puppeteer';
export interface Selector {
  evalSelector: string;
  // will be executed in chrome
  evalHandler: (elements: Element[]) => any;
  name: string;
}

interface Site {
  name: string;
  options?: puppeteer.LaunchOptions;
  pageConfigs: PageConfig[];
}

interface waitForResponse {
  predicate: (res: puppeteer.Response) => boolean;
  resHandler?: (res: puppeteer.Response) => any;
  timeout?: number;
}
export interface PageConfig {
  waitForResponses?: waitForResponse[];
  waitFor?: number;
  waitUntil?:
    | 'domcontentloaded'
    | 'load'
    | 'networkidle0'
    | 'networkidle2'
    | puppeteer.LoadEvent[];
  name: string;
  href?: string;
  preEval?: any;
  // 页面
  selectors?: Selector[];
  childConfig?: PageConfig;
  childHrefSelect?: string;
}

const sleep = (timeout: number) =>
  new Promise(res => {
    setTimeout(() => {
      res();
    }, timeout);
  });

export class Crawler {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  crawl(site: Site) {
    (async () => {
      // Wait for browser launching.
      let options: puppeteer.LaunchOptions = {
        ...site.options,
      };
      if (process.env.DEBUG) {
        options = { ...options, devtools: true, headless: false };
      }
      const browser = await puppeteer.launch(options);

      for (const p of site.pageConfigs) {
        await this.crawlPage(
          browser,
          p,
          path.resolve(__dirname, 'results', site.name),
          true,
        );
      }

      browser.close();
    })();
  }

  async crawlPage(
    browser: puppeteer.Browser,
    config: PageConfig,
    dir: string,
    writeFile: boolean = false,
  ) {
    const page = await browser.newPage();
    console.log(
      '\n\n\nstart crawlPage',
      'path',
      config.href,
      'name',
      config.name,
      'result dir',
      dir,
    );
    const pageUrl = url.resolve(this.baseUrl, config.href);
    const result = {
      pageUrl,
    };

    await page.goto(pageUrl, {
      waitUntil: config.waitUntil || 'domcontentloaded',
    });
    await page.waitFor(config.waitFor || 500);
    // await sleep(config.waitFor || 500)

    if (config.preEval) await page.evaluate(config.preEval);
    // await page.waitFor(config.waitFor || 500);
    // await sleep(config.waitFor || 500)

    if (config.waitForResponses && config.waitForResponses.length > 0) {
      try {
        const resp = await Promise.all(
          config.waitForResponses.map(async wp => {
            const defaultResHandler = async (res: puppeteer.Response) => {
              try {
                return res.json();
              } catch (error) {
                return res.text();
              }
            };
            const resHandler = wp.resHandler || defaultResHandler;
            const res = await page.waitForResponse(wp.predicate, {
              timeout: wp.timeout || 3000,
            });
            return resHandler(res);
          }),
        );
        result['resp'] = resp;
      } catch (error) {
        console.error('wait page resp catch error:', error);
      }
    }
    const curDir = path.resolve(dir, config.name);

    const element = await page.$('body');
    if (config.selectors && config.selectors.length > 0) {
      console.log('start eval page selectors');
      for (const s of config.selectors) {
        console.log(
          'start eval page with name',
          s.name,
          'selector',
          s.evalSelector,
        );

        const sRest = await element.$$eval(s.evalSelector, s.evalHandler);
        result[s.name] = sRest;
        if (sRest.length === 0) {
          console.error('config.selector eval got length 0');
        }
        console.log('finish eval page selector', s.name);
      }
      console.log('finish eval page selectors');
    } else {
      console.log('no page selector to eval');
    }

    if (config.childConfig) {
      console.log('start craw child pages', config.childConfig.childHrefSelect);
      const hrefList = await element.$$eval(
        config.childConfig.childHrefSelect,
        eleList => {
          return eleList.map(e => {
            return (<HTMLLinkElement>e).href;
          });
        },
      );
      console.log('page child href list', hrefList);

      const promiseProducer = () => {
      }


      const pool = new PromisePool(promiseProducer, 3);

      for (let i = 0; i + 2 < hrefList.length; i += 2) {
        const href = hrefList[i];
        console.log('start child', href);
        const childConfig = {
          ...config.childConfig,
          href,
          name: config.childConfig.name + '-' + i,
        };
        const childRes = await this.crawlPage(browser, childConfig, curDir);
        result[childConfig.name] = childRes;
      }
    }
    if (writeFile) {
      if (!existsSync(curDir)) {
        mkdirSync(curDir, { recursive: true });
      }
      const filename = path.resolve(curDir, `result.json`);
      writeFileSync(filename, JSON.stringify(result, null, '  '));
      console.log('finish write file', filename);
    }
    await page.close()
    return result;
  }
}
