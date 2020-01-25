import { readFileSync, writeFileSync } from 'fs';

const res = readFileSync('./results/bilibili/algorithm/result.json', 'utf8');
const res2 = readFileSync('./results/bilibili2/algorithm/result.json', 'utf8');
const json = JSON.parse(res);
const json2 = JSON.parse(res2);
const result = new Map();

const imgMap = new Map();
json2.courses.forEach(e => {
  imgMap.set(e.title, e.image);
});
for (let i = 0; i < 20; i++) {
  const video = json['video-detail-' + i].detail;

  result.set(video.title, {
    title: video.title,
    viewCount: video.viewCount,
    imgUrl: imgMap.get(video.title),
    collect:
      Number.parseInt(video.collect) *
      (video.collect.indexOf('万') >= 0 ? 10000 : 1),
  });
}

writeFileSync(
  './csvs/algorithm/bilibili.json',
  JSON.stringify(Array.from(result.values()), null, '  '),
);
