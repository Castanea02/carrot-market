import { NextApiRequest, NextApiResponse } from "next";

export interface ResponseType {
  ok: boolean;
  [key: string]: any;
}

type method = "GET" | "POST" | "DELETE";
interface ConfigType {
  methods: method[];
  handler: (req: NextApiRequest, res: NextApiResponse) => void;
  isPrivate?: boolean;
} //인자를 묶어서 전달하기 위한 인터페이스 설정

/**method, handler, isPrivate 인자를 전달 받아 해당 메소드에 */
export default function withHandler({
  methods,
  handler,
  isPrivate = true,
}: ConfigType) {
  //nextJS가 실행할 함수
  return async function (req: NextApiRequest, res: NextApiResponse) {
    /**요청한 메소드와 다를시 필터링 */
    if (req.method && !methods.includes(req.method as any)) {
      return res.status(405).end();
    }

    /**isPrivate 인자가 true이고 req.session.user가 존재하지 않으면 Unauthrization 접근제어 */
    if (isPrivate && !req.session.user) {
      return res.status(401).json({ ok: false, error: "Login First" });
    }

    try {
      await handler(req, res); //인자로 넘어온 handler 함수 실행
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  };
}
