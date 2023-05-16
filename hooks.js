import { getCookie } from "cookies-next";
import axios from "axios";

export const getUser = async () => {
    try {
      const auth = getCookie("token");
      const response = await axios({
        method: "get",
        url: "https://api-dev.spiritofsatoshi.ai/v1/account/me",
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });
      if (response.data) {
        console.log(response.data);
        return response.data;
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

 export const getMessages = async () => {
    try {
      const auth = getCookie("token");
      const response = await axios({
        method: "get",
        url: "https://api-dev.spiritofsatoshi.ai/v1/chat",
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });
      if (response.data) {
        console.log(response.data);
        return response.data;
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };