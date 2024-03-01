import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "GET") {
    const products = await client.product.findMany({});
    return res.json({
      ok: true,
      products,
    });
  }
  if (req.method === "POST") {
    //   const { name, price, description } = req.body;
    //   const { user } = req.session;
    // ES6 문법으로 아래처럼 축약 가능
    const {
      body: { name, price, description },
      session: { user },
    } = req;

    const product = await client.product.create({
      data: {
        name,
        price: +price,
        description,
        image:
          "https://i.namu.wiki/i/7FMNWt9idzzJV3CfhrLYMuL16byiucbJTvlAy7LT9qklg-vCSIpmUqIFuE9r_bec0Xoj3M89jw0ar7XI3n99VuRxQKpYvqNVZS8XNq_WTCYBrTysa9x1PWkoKtshZvUHGQLSbvaJibhJNfy2R9k6LQ.webp",
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });

    res.json({
      ok: true,
      product,
    });
  }
}
/**함수를 반환하는 함수 실행시 withHandler에서 반환된 함수를 NextJS에서 실행*/
export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handler })
);

//("get", fn, false)의 형식보다 가독성을 높이기 위해
//withHandler 함수에서 interface로 인자를 묶어 이름을 지정하여 인자값을 보냄
