import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id },
    session: { user },
  } = req;

  const product = await client.product.findUnique({
    where: {
      id: +id!.toString(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  const terms = product?.name.split(" ").map((word) => ({
    name: {
      contains: word,
    },
  }));
  console.log("🚀 ~ terms :", terms);

  //Similar Items => 단어를 조건문으로 넣어 확인
  //OR: 비슷한 제품 이름 조건
  //AND: 본인 제품은 포함 X
  const relatedProducts = await client.product.findMany({
    where: {
      OR: terms,
      AND: {
        id: {
          not: product?.id,
        },
      },
    },
  });
  console.log("🚀 ~ relatedProducts:", relatedProducts);
  /** 관심품목 여부 확인 true, false로 표현 */
  const isLiked = Boolean(
    await client.fav.findFirst({
      where: {
        productId: product?.id,
        userId: user?.id,
      },
      select: {
        id: true,
      },
    })
  );
  res.json({ ok: true, product, relatedProducts, isLiked });
}
/**함수를 반환하는 함수 실행시 withHandler에서 반환된 함수를 NextJS에서 실행*/
export default withApiSession(withHandler({ methods: ["GET"], handler }));

//("get", fn, false)의 형식보다 가독성을 높이기 위해
//withHandler 함수에서 interface로 인자를 묶어 이름을 지정하여 인자값을 보냄
