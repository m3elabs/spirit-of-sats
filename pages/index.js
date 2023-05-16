import styles from "../styles/Page.module.css";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode.react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["100", "200", "300", "700"],
  subsets: ["latin"],
});


function Lightning({ address }) {
  return (
    <div className={styles.popup}>
      <QRCode value={address} size={256} key={address} />
      <p>Scan this with your lightning wallet to login</p>
      <p
        style={{
          color: "white",
          opacity: "0.4",
          textAlign: "center",
          maxWidth: "70%",
          margin: "auto",
          fontSize: "11px",
        }}
      >
        Need a lightning wallet? <br />
        <br />
        Check out{" "}
        <a
          style={{ fontWeight: "bold", color: "white", opacity: "0.4" }}
          href="google.com"
        >
          Phoenix,{" "}
        </a>
        <a
          style={{ fontWeight: "bold", color: "white", opacity: "0.4" }}
          href="google.com"
        >
          Muun
        </a>{" "}
        or{" "}
        <a
          style={{ fontWeight: "bold", color: "white", opacity: "0.4" }}
          href="google.com"
        >
          Wallet of Satoshi
        </a>
      </p>
    </div>
  );
}

export default function Home() {
  const [registerState, setRegisterState] = useState("default");
  const [qrCodeString, setQrCodeString] = useState("");
  const [selectedLogin, setSelectedLogin] = useState("email");
  const router = useRouter();

  useEffect(() => {}, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://api-dev.spiritofsatoshi.ai/v1/account/lnurl/login"
      );
      const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      setQrCodeString(response.data["lnAddress"]);
      setCookie("lnAddressId", response.data["lnAddressId"], {
        expires: oneYearFromNow,
      });
      return;
    } catch (error) {
      return console.log(error);
    }
  };

  const checkLogin = async () => {
    try {
      const response = await axios.post(
        "https://api-dev.spiritofsatoshi.ai/v1/account/lnurl/login/check",
        {
          lnAddressId: getCookie("lnAddressId"),
        }
      );
      const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      console.log(response.data);
      if (response.data["token"]) {
        setCookie("token", response.data["token"], { expires: oneYearFromNow });
        router.push("/chat");
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  async function handleLightning() {
    await fetchData();
    setSelectedLogin("lightning");
    setInterval(() => checkLogin(), 5000);
  }

  const createAnon = async () => {
    try {
      const response = await axios.post(
        "https://api-dev.spiritofsatoshi.ai/v1/account/anonymous"
      );
      const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      if (response.data["token"]) {
        setCookie("token", response.data["token"], { expires: oneYearFromNow });
        return router.push("/chat");
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  return (
  <>
   <div className={styles.bg}> </div>
      <main className={styles.main}>
 
        {registerState === "default" ? (
          <span className={styles.titleModal}>
            <img className={styles.logo} alt="logo" src="/spiritLogo.svg" />
            <span className={styles.buttonContainer}>
              <button
                onClick={() => createAnon()}
                className={styles.enterButton}
              >
                Enter
              </button>
              <button
                onClick={() => setRegisterState("login")}
                className={styles.loginButton}
              >
                Log In
              </button>
            </span>
          </span>
        ) : (
          <>
            <img className={styles.logo2} alt="logo" src="/spiritLogo2.svg" />
            <span className={styles.titleModal}>
              <button
                onClick={() => setRegisterState("default")}
                style={{
                  padding: "0px",
                  background: "transparent",
                  border: "none",
                  position: "absolute",
                  top: "5%",
                  right: "7%",
                  marginBottom: "4%",
                }}
              >
                <img alt="close" height="100%" src="/x.svg" />
              </button>
              <div className={styles.btcLogins}>
                <button
                  onClick={() => setSelectedLogin("email")}
                  className={
                    selectedLogin === "email"
                      ? styles.selected
                      : styles.unselected
                  }
                >
                  Email
                </button>
                <button
                  onClick={() => handleLightning()}
                  className={
                    selectedLogin === "lightning"
                      ? styles.selected
                      : styles.unselected
                  }
                >
                  Lightning
                </button>
                <button
                  onClick={() => setSelectedLogin("nostr")}
                  className={
                    selectedLogin === "nostr"
                      ? styles.selected
                      : styles.unselected
                  }
                >
                  Nostr
                </button>
              </div>
              {selectedLogin === "email" ? (
                <form className={styles.registerInputContainer}>
                  <input
                    placeholder="Email Address"
                    className={styles.registerInput}
                  />

                  <button onClick={() => {}} className={styles.registerButton}>
                    Register
                  </button>
                </form>
              ) : selectedLogin === "lightning" ? (
                <Lightning address={qrCodeString} />
              ) : (
                <form className={styles.registerInputContainer}>
                  <input
                    placeholder="NIP-05"
                    className={styles.registerInput}
                  />
                  <input placeholder="npub" className={styles.registerInput} />

                  <input placeholder="Relay" className={styles.registerInput} />

                  <button onClick={() => {}} className={styles.registerButton}>
                    Register
                  </button>
                  <p
                    style={{
                      color: "white",
                      textAlign: "center",
                      maxWidth: "70%",
                      margin: "auto",
                      fontSize: "11px",
                    }}
                  >
                    We will send you a code via DM to your Nostr account
                  </p>
                </form>
              )}
            </span>
          </>
        )}

       
      </main>
      </>

   


  );
}
