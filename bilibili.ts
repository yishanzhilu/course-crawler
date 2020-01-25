import { Crawler, PageConfig, Selector } from './crawler';

const c = new Crawler('https://search.bilibili.com');

const childConfig: PageConfig = {
  childHrefSelect: '.video-item a.title',
  name: 'video-detail',
  // waitUntil: 'load',
  // preEval: () => {
  //   window.scrollTo({ top: 1800, behavior: 'smooth' });
  // },
  waitFor: 2000,
  selectors: [
    {
      name: 'detail',
      evalSelector: 'div#app',
      evalHandler: elements => {
        if (!elements || !elements[0]) {
          return {};
        }
        const e = elements[0];
        const title = (<HTMLElement>e.querySelector('h1.video-title')).title;
        const collect = (<HTMLElement>e.querySelector('span.collect'))
          .innerText;
        const tags = (<HTMLElement>(
          e.querySelector('ul.tag-area')
        )).innerText.split('\n');
        return {
          title,
          collect,
          tags,
        };
      },
    },
  ],
  // waitForResponses: [
  //   {
  //     predicate: resp => resp.url().indexOf('x/web-interface/view') >= 0,
  //     resHandler: async res => {
  //       try {
  //         const json = await res.json();
  //         return json['data'];
  //       } catch (error) {
  //         return await res.text();
  //       }
  //     },
  //   },
  // ],
};

const selectors: Selector[] = [
  {
    name: 'courses',
    evalSelector: '.video-item',
    evalHandler: elements => {
      return elements.map(e => {
        const href = (<HTMLLinkElement>e.querySelector('.img-anchor')).href;
        const aid = /av(\d+)\?/g.exec(href)[1];
        return {
          aid,
        };
      });
    },
  },
];
const preEval = () => {
  window.scrollTo({ top: 1800, behavior: 'smooth' });
};

const baseConfig = {
  childConfig,
  selectors,
  // preEval,
};
try {
  c.crawl({
    name: 'bilibili',
    options: {
      executablePath: '/usr/bin/google-chrome-stable',
    },
    pageConfigs: [
      {
        name: 'algorithm',
        href: 'video?keyword=算法',
        ...baseConfig,
      },
      {
        name: 'nlp',
        href: 'video?keyword=自然语言处理',
        ...baseConfig,
      },
      {
        name: 'cv',
        href: 'video?keyword=图像识别',
        ...baseConfig,
      },
      {
        name: 'probability',
        href: 'video?keyword=概率论#/',
        ...baseConfig,
      },
      {
        name: 'machine-learning',
        href: 'video?keyword=机器学习',
        ...baseConfig,
      },
      {
        name: 'deep-learning',
        href: 'video?keyword=深度学习',
        ...baseConfig,
      },
    ],
  });
} catch (error) {
  console.error(error);
}
