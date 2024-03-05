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

  const exists = await client.wondering.findFirst({
    where: {
      userId: user?.id,
      postId: +id?.toString()!,
    },
    select: {
      id: true,
    },
  });

  if (exists) {
    await client.wondering.delete({
      where: {
        id: exists.id,
      },
    });
  } else {
    await client.wondering.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          },
        },

        post: {
          connect: {
            id: +id?.toString()!,
          },
        },
      },
    });
  }

  res.json({
    ok: true,
  });
}
/**함수를 반환하는 함수 실행시 withHandler에서 반환된 함수를 NextJS에서 실행*/
export default withApiSession(withHandler({ methods: ["POST"], handler }));

//("get", fn, false)의 형식보다 가독성을 높이기 위해
//withHandler 함수에서 interface로 인자를 묶어 이름을 지정하여 인자값을 보냄
