import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  if (req.method === "POST") {
    const {
      body: { question, latitude, longitude },
      session: { user },
      query,
    } = req;

    const post = await client.post.create({
      data: {
        question,
        latitude,
        longitude,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });
    res.json({
      ok: true,
      post,
    });
  }

  if (req.method === "GET") {
    const {
      query: { latitude, longitude },
    } = req;

    const parsedLatitude = parseFloat(latitude!.toString());
    const parsedLongitude = parseFloat(longitude!.toString());

    const posts = await client.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            wondering: true,
            answers: true,
          },
        },
      },
      where: {
        //위도 경도 조건으로 작성된 게시글만 표시
        latitude: {
          gte: parsedLatitude - 0.01,
          lte: parsedLatitude + 0.01,
        },
        longitude: {
          gte: parsedLongitude - 0.01,
          lte: parsedLongitude + 0.01,
        },
      },
    });

    res.json({
      ok: true,
      posts,
    });
  }
}
/**함수를 반환하는 함수 실행시 withHandler에서 반환된 함수를 NextJS에서 실행*/
export default withApiSession(
  withHandler({ methods: ["GET", "POST"], handler })
);

//("get", fn, false)의 형식보다 가독성을 높이기 위해
//withHandler 함수에서 interface로 인자를 묶어 이름을 지정하여 인자값을 보냄
