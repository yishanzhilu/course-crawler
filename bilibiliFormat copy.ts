import { readFileSync, writeFileSync } from 'fs';
import axios from 'axios';


axios.get('https://api.bilibili.com/x/web-interface/view?aid=' + 7134874)
const result = new Map();
function getTopic(topic: string) {
  const res = readFileSync(`./results/bilibili/${topic}/result.json`, 'utf8');
  const res2 = readFileSync(`./results/bilibili2/${topic}/result.json`, 'utf8');
  const json = JSON.parse(res);
  const json2 = JSON.parse(res2);

  const imgMap = new Map();
  json2.courses.forEach(e => {
    imgMap.set(e.title, e.image);
  });
  for (let i = 0; i < 20; i++) {
    const video = json['video-detail-' + i];
    const detail = video.detail;
    const imgUrl = imgMap.get(detail.title);
    if (!imgUrl || imgUrl.indexOf('webp') < 0) {
      console.log('not imgUrl', detail.title);
    }

    result.set(detail.title, {
      title: detail.title,
      url: video.pageUrl,
      topic,
      viewCount: detail.viewCount,
      imgUrl: imgMap.get(detail.title),
      collect:
        Number.parseInt(detail.collect) *
        (detail.collect.indexOf('万') >= 0 ? 10000 : 1),
    });
  }
}

['algorithm', 'nlp', 'cv', 'probability', 'deep-learning'].forEach(topic => {
  getTopic(topic);
});

writeFileSync(
  './csvs/bilibili.json',
  JSON.stringify(Array.from(result.values()), null, '  '),
);
