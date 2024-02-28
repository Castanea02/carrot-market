import { NextApiRequest, NextApiResponse } from "next";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { token } = req.body; //토큰 값 입력 받기
  const foundToken = await client.token.findUnique({
    where: {
      payload: token, //입력되어 온 토큰 값을 기준으로 조건
    },
  });

  //해당 토큰 값이 존재하지 않다면 404 not found 반환
  if (!foundToken) return res.status(404).end();

  //토큰 값이 맞다면 해당 세션에 토큰의 userId를 req.session.user의 id에 넣기
  req.session.user = {
    id: foundToken.userId,
  };

  //세션을 저장후
  await req.session.save();
  //사용된 토큰은 파기
  await client.token.deleteMany({
    where: {
      userId: foundToken.userId,
    },
  });
  return res.json({ ok: true });
}

/**함수를 반환하는 함수 실행시 withHandler에서 반환된 함수를 NextJS에서 실행*/
export default withApiSession(withHandler("POST", handler));
