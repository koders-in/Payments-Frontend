import { sendPayload } from "../helper/api";
import { showToaster } from "../helper/toast";

interface ICouponCode {
  apiKey: string;
  issues: any;
  coupon: string;
}

export const useCouponCodeHook = () => {
  const code = async (
    payload: ICouponCode
  ): Promise<string | undefined | null> => {
    try {
      const { data, status } = await sendPayload({
        endpoint: "/coupon",
        payload,
      });
      if (status === 200) {
        if (data.msg === "Budget amount") return data.data;
        showToaster(data.msg, "error");
      }
      return null;
    } catch (e: any) {
      console.log(
        `Something went wrong while  applying coupon. Reason-${e.message}`
      );
    }
  };
  return code;
};
