import * as fs from 'fs';
import { Client } from '@line/bot-sdk';
import { SSM } from 'aws-sdk';

const main = async () => {
  const ssm = new SSM({ region: 'ap-southeast-1' });

  const res = await ssm
    .getParameter({ Name: `alrescha-${process.argv[2]}-line-token` })
    .promise();
  const liffId =
    (
      await ssm
        .getParameter({ Name: `alrescha-${process.argv[2]}-liff` })
        .promise()
    ).Parameter?.Value ?? 'xx';

  const client = new Client({
    channelAccessToken: res.Parameter?.Value ?? 'xx',
  });

  // delete existing richmenu
  const old = await client.getRichMenuList();
  for (const r of old) await client.deleteRichMenu(r.richMenuId);

  // create new richmenu
  const id = await client.createRichMenu({
    size: {
      width: 1200,
      height: 400,
    },
    selected: true,
    name: 'default',
    chatBarText: '選單',
    areas: [
      {
        bounds: {
          x: 0,
          y: 0,
          width: 400,
          height: 400,
        },
        action: {
          type: 'uri',
          uri: `https://liff.line.me/${liffId}/upload`,
        },
      },
      {
        bounds: {
          x: 400,
          y: 0,
          width: 400,
          height: 400,
        },
        action: {
          type: 'uri',
          uri: `https://liff.line.me/${liffId}/preview`,
        },
      },
      {
        bounds: {
          x: 800,
          y: 0,
          width: 400,
          height: 400,
        },
        action: {
          type: 'postback',
          data: 'faq',
          text: '常見問題',
        },
      },
    ],
  });
  await client.setRichMenuImage(
    id,
    fs.createReadStream('./src/richmenu/menu.png')
  );
  await client.setDefaultRichMenu(id);
};

main();
