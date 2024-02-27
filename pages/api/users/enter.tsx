import twilio from "twilio";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import smtpTransport from "@libs/server/email";

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { phone, email } = req.body;
  //어떤 데이터가 오는지에 따라 payload 결정
  const user = phone ? { phone: +phone } : email ? { email } : null;
  if (!user) return res.status(400).json({ ok: false });

  const payload = Math.floor(100000 + Math.random() * 90000) + ""; //토큰값 난수로 생성

  //로그인 토큰 생성
  //토큰 생성 데이터
  //connect = 새로운 토큰을 이미 존재하는 유저와 연결
  //create = 새로운 토큰을 만들면서 새로운 유저도 만듦
  //connectOrCreate = 유저를 찾으면 이미 존재하는 유저와 연결 유저가 없으면 새로운 유저도 만들면서 토큰 부여
  // ==> upsert를 사용하지 않아도 될 이유
  /**토큰을 생성할 때는 위에서 받아온 user의 정보로 토큰을 생성 */
  const token = await client.token.create({
    data: {
      payload, //payload:payload
      user: {
        connectOrCreate: {
          //조건
          where: {
            ...user,
          }, //조건 만족하면 토큰과 연결, 맞지 않으면 Create하면서 토큰과 연결
          create: {
            name: "Anonymous",
            ...user,
          },
        },
      },
    },
  });

  console.log(token);

  // //User return ==> upsert 사용
  // const user = await client.user.upsert({
  //   where: {
  //     //조건
  //     ...payload,
  //   }, //조건에 맞지 않으면 생성 ==> upsert
  //   create: {
  //     name: "Anonymous",
  //     ...payload,
  //   },
  //   update: {},
  // });

  // if (email) {
  //   //이메일이 존재하면 ==> User나 null을 반환
  //   user = await client.user.findUnique({
  //     where: { email },
  //   });
  //   if (user) console.log("Found It");
  //   if (!user) {
  //     console.log("Did not find will create.!!!");
  //     user = await client.user.create({
  //       data: {
  //         name: "Anonymous",
  //         email,
  //       },
  //     });
  //   }

  //   console.log(user);
  // }

  // if (phone) {
  //   //폰번호가 존재하면 ==> User나 null을 반환
  //   user = await client.user.findUnique({
  //     where: { phone: +phone },
  //   });
  //   if (user) console.log("Found It");
  //   if (!user) {
  //     console.log("Did not find will create.!!!");
  //     user = await client.user.create({
  //       data: {
  //         name: "Anonymous",
  //         phone: +phone,
  //       },
  //     });
  //   }

  //   console.log(user);
  // }

  //twilio API 사용
  if (phone) {
    const message = await twilioClient.messages.create({
      messagingServiceSid: process.env.SERVICES_SID,
      to: process.env.PHONE_NUMBER!, //실제로는 들어온 데이터로 해야함 phone
      body: `Your Login Token is ${payload}`,
    });
    console.log("🚀 ~ message:", message);
  }

  if (email) {
    const mailOptions = {
      from: process.env.MAIL_ID,
      to: email,
      subject: "Nomad Carrot Authentication Email",
      text: `Authentication Code : ${payload}`,
    };
    const result = await smtpTransport.sendMail(
      mailOptions,
      (error: any, responses: any) => {
        if (error) {
          console.log(error);
          return null;
        } else {
          console.log(responses);
          return null;
        }
      }
    );
    smtpTransport.close();
    console.log(result);
  }
  return res.json({ ok: true });
}

/**함수를 반환하는 함수 실행시 withHandler에서 반환된 함수를 NextJS에서 실행*/
export default withHandler("POST", handler);
