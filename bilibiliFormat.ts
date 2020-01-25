import { readFileSync, writeFileSync } from 'fs';
import axios from 'axios';

const result = new Map();
async function main(aid: string, topic: string) {
  const res = await axios.get(
    'https://api.bilibili.com/x/web-interface/view?aid=' + aid,
  );

  const data = res.data.data;
  result.set(aid, {
    title: data.title,
    url:'https://www.bilibili.com/video/av'+aid,
    topic,
    duration: data.duration,
    viewCount: data.stat.view,
    // imgUrl: imgMap.get(detail.title),
    // collect:
    //   Number.parseInt(detail.collect) *
    //   (detail.collect.indexOf('万') >= 0 ? 10000 : 1),
  });
}

// main();
