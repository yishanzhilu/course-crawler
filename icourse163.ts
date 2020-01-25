import { Crawler, PageConfig, Selector } from './crawler';

const c = new Crawler('https://www.icourse163.org/');
const selectors: Selector[] = [
  {
    name: 'courses',
    evalSelector: '.u-clist',
    evalHandler: e => {
      return e.map(e => {
        return {
          title: (<HTMLElement>(
            e.querySelector('.u-course-name')
          )).innerText.trim(),
          href: (<HTMLLinkElement>e.querySelector('.t1 > a')).href,
          image: (<HTMLImageElement>e.querySelector('.u-img > img')).src,
          enrollCount: Number(
            (<HTMLElement>e.querySelector('.hot')).innerText.match(/\d+/g)[0],
          ),
          teacher: (<HTMLElement>e.querySelector('.t2')).innerText.trim(),
        };
      });
    },
  },
];

const childConfig: PageConfig = {
  childHrefSelect: '.t1 > a:nth-child(1)',
  name: 'course-detail',
  selectors: [
    {
      name: 'detail',
      evalSelector: '#g-body',
      evalHandler: () => {
        const res = {};
        if ((window as any).chiefLector) {
          res['chiefLector'] = (window as any).chiefLector;
        }
        if ((window as any).courseDto) {
          res['courseDto'] = (window as any).courseDto;
        }
        if ((window as any).chiefLector) {
          res['chiefLector'] = (window as any).chiefLector;
        }
        if ((window as any).termDto) {
          res['termDto'] = (window as any).termDto;
        }
        return res;
      },
    },
  ],
  waitForResponses: [
    { predicate: resp => resp.url().indexOf('getEvaluateAvgAndCount') > 0 },
    {
      predicate: resp =>
        resp.url().indexOf('getCourseEvaluatePaginationByCourseIdOrTermId') > 0,
    },
  ],
};
try {
  c.crawl({
    name: 'course163',
    pageConfigs: [
      // {
      //   name: 'algorithm',
      //   href: 'search.htm?search=算法#/',
      //   selectors,
      //   childConfig,
      // },
      // {
      //   name: 'nlp',
      //   href: 'search.htm?search=自然语言处理#/',
      //   selectors,
      //   childConfig,
      // },
      // {
      //   name: 'cv',
      //   href: 'search.htm?search=图像识别#/',
      //   selectors,
      //   childConfig,
      // },
      {
        name: 'probability',
        href: 'search.htm?search=概率论#/',
        selectors,
        childConfig,
      },
      // {
      //   name: 'machine-learning',
      //   href: 'search.htm?search=机器学习#/',
      //   selectors,
      //   childConfig,
      // },
      // {
      //   name: 'deep-learning',
      //   href: 'search.htm?search=深度学习#/',
      //   selectors,
      //   childConfig,
      // },
    ],
  });
} catch (error) {
  console.error(error);
}
