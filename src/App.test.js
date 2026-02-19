import { maskRechargeCode } from "./utils/rechargeHistory";

test("masque les codes en conservant les 4 derniers caracteres", () => {
  expect(maskRechargeCode("ABCDE-12345")).toBe("*****-*2345");
  expect(maskRechargeCode("1234")).toBe("1234");
});
