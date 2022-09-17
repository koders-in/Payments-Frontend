import { sendPayload } from "../helper/api";

export interface FormPayload {
  apiKey: string;
  projectIdentifier: string;
}

export interface mileStoneDataType {
  title: string;
  status: string;
  mileStoneId: number;
}

const makeMileStoneData = (obj: any) => {
  const  arr = Array<mileStoneDataType>()
  const items = Object.keys(obj);
  if (items.length === 0) return null;
  items.forEach((title) => {
    arr.push({ title, ...obj[title] });
  });
  return arr;
};

export const useFormSubmitHook = () => {
  const submitForm = async (payload: FormPayload) => {
    try {
      const { data, status } = await sendPayload({
        endpoint: "/milestones",
        payload,
      });
      if (status === 200) {
        const { data: response } = data;
        return makeMileStoneData(response)
      } else return null
    } catch (err: any) {
      console.log(
        `Something went wrong while submitting form :->${err.message}`
      );
    }
  };
  return submitForm;
};