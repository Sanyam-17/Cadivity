import "server-only";
import arcjet, {
 detectBot,
 fixedWindow,
 protectSignup,
 sensitiveInfo,
 shield,
 slidingWindow
} from "@arcjet/next";
import { env } from "../env";

export {
 detectBot,
 fixedWindow,
 protectSignup,
 sensitiveInfo,
 shield,
 slidingWindow
};

export default arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["fingerprint"],
  rules: [
    shield({
      mode: "LIVE",
    }),
  ],
});

export const withRateLimit = (max: number, windowSec: number = 60) => {
  return arcjet({
    key: env.ARCJET_KEY,
    characteristics: ["ip.src"], // Rate limit by IP
    rules: [
      slidingWindow({
        mode: "LIVE",
        interval: `${windowSec}s`,
        max,
      }),
    ],
  });
};
