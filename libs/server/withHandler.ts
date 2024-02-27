import { NextApiRequest, NextApiResponse } from "next";

export interface ResponseType {
  ok: boolean;
  [key: string]: any;
}

export default function withHandler(
  method: "GET" | "POST" | "DELETE",
  fn: (req: NextApiRequest, res: NextApiResponse) => void
) {
  //nextJS가 실행할 함수
  return async function (req: NextApiRequest, res: NextApiResponse) {
    /**요청한 메소드와 다를시 필터링 */
    if (req.method !== method) {
      return res.status(405).end();
    }
    try {
      await fn(req, res); //handler 함수 실행
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  };
}