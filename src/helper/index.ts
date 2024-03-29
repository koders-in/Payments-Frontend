import { client } from "./api";

export const fetchData = async (project: string, apiKey: string) => {
  try {
    const res = await client.post("invoice", {
      data: { project, apiKey },
    });
    if (res.status === 200) return res.data;
    else return null;
  } catch (error) {
    return null;
  }
};

export const fetchProjectStatusData = async () => {
  try {
    const res = await client.get("status");
    if (res.status === 200) return res.data;
    else return null;
  } catch (error) {
    console.log("Something went wrong while fetching project status data");
    return null;
  }
};

export interface Props {
  pdfData: any;
}

export const currency_symbols: { [key: string]: string } = {
  USD: "$", // US Dollar
  EUR: "€", // Euro
  CRC: "₡", // Costa Rican Colón
  GBP: "£", // British Pound Sterling
  ILS: "₪", // Israeli New Sheqel
  INR: "₹", // Indian Rupee
  JPY: "¥", // Japanese Yen
  KRW: "₩", // South Korean Won
  NGN: "₦", // Nigerian Naira
  PHP: "₱", // Philippine Peso
  PLN: "zł", // Polish Zloty
  PYG: "₲", // Paraguayan Guarani
  THB: "฿", // Thai Baht
  UAH: "₴", // Ukrainian Hryvnia
  VND: "₫", // Vietnamese Dong
};
