import { withIronSessionApiRoute } from "iron-session/next";

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: number;
    };
  }
}

const cookieOption = {
  cookieName: "carrotsession",
  password: process.env.COOKIE_PASSWORD!,
};

/**Iron Session 재사용을 위한 축약 */
export function withApiSession(fn: any) {
  return withIronSessionApiRoute(fn, cookieOption);
}
