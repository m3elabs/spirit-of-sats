import styles from "../styles/Page.module.css";
import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode.react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getCookie, setCookie, hasCookie } from "cookies-next";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["100", "200", "300", "700"],
  subsets: ["latin"],
});

function Lightning({ address }) {
  const copyAdd = (address) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        alert("copied");
      })
      .catch((error) => {
        console.error("Error copying text to clipboard:", error);
      });
  };

  return (
    <div className={styles.popup}>
      <QRCode
        value={address}
        size={256}
        key={address}
        onClick={() => copyAdd(address)}
      />
      <span style={{ marginTop: "4%", textAlign: "center" }}>
        Scan this with your lightning wallet to login <p>or</p>{" "}
        <p>Click the QR code to copy</p>
      </span>
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
          style={{ fontWeight: "bold", color: "rgba(0, 255, 65, 1)" }}
          href="https://phoenix.acinq.co/"
        >
          Phoenix,{" "}
        </a>{" "}
        <a
          style={{ fontWeight: "bold", color: "rgba(0, 255, 65, 1)" }}
          href="https://bitkit.to/"
        >
          BitKit
        </a>{" "}
        or{" "}
        <a
          style={{ fontWeight: "bold", color: "rgba(0, 255, 65, 1)" }}
          href="https://www.walletofsatoshi.com/"
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
  const [invalid, setInvalid] = useState(false);
  const [otpId, setOtpId] = useState("");
  const router = useRouter();

  useEffect(() => {}, []);

  useEffect(() => {
    const check = hasCookie("token");
    if (check == true) {
      const cookie = getCookie("token");
      console.log(cookie);
    }
    // const expiration = cookies['token'] ? new Date(cookies['token'].expires) : undefined
    // if (expiration !== undefined && getCookie('token') !== '') {
    //   router.push('/chat')
    // }
  });

  const fetchData = async () => {
    try {
      if (getCookie("token")) {
        const token = getCookie("token");
        const response = await axios({
          url: "https://api-dev.spiritofsatoshi.ai/v1/account/lnurl/login",
          method: "get",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        setQrCodeString(response.data["lnAddress"]);
        setCookie("lnAddressId", response.data["lnAddressId"], {
          expires: oneYearFromNow,
        });
        return;
      }
      const response = await axios({
        url: "https://api-dev.spiritofsatoshi.ai/v1/account/lnurl/login",
        method: "get",
      });
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

  const verifyOTP = async (e) => {
    e.preventDefault();
    try {
      const pin1 = document.getElementById("pin1").value;
      const pin2 = document.getElementById("pin2").value;
      const pin3 = document.getElementById("pin3").value;
      const pin4 = document.getElementById("pin4").value;
      const pin5 = document.getElementById("pin5").value;
      const pin6 = document.getElementById("pin6").value;

      const pin = pin1 + pin2 + pin3 + pin4 + pin5 + pin6;
      console.log(pin.toString());
      console.log(otpId.toString());
      const id = otpId.toString();
      const pinCode = pin.toString();
      const response = await axios.post(
        "https://api-dev.spiritofsatoshi.ai/v1/account/verify-otp",
        {
          otpId: id,
          code: pinCode,
        }
      );

      if (hasCookie("token")) {
        if (response.status === 200) {
          return router.push("/chat");
        }
        if (response.status === 400) {
          setInvalid(true);
          return;
        }
      }

      if (response.status === 200) {
        const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        setCookie("token", response.data["token"], {
          expires: oneYearFromNow,
        });
        return router.push("/chat");
      }
      if (response.status === 400) {
        setInvalid(true);
        return;
      }
    } catch (error) {
      if (error["response"]["status"] === 400) {
        setInvalid(true);
        return console.log(error);
      }

      return console.log(error);
    }
  };

  const emailSignUp = async (e) => {
    e.preventDefault();
    try {
      if (hasCookie("token")) {
        const token = getCookie("token");
        const email = document.getElementById("emailSignUp").value;
        const username = document.getElementById("usernameSignUp").value;
        const response = await axios({
          url: "https://api-dev.spiritofsatoshi.ai/v1/account/email/signup",
          data: {
            email: email,
            fullName: username,
          },
          method: "post",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data["otpId"]) {
          setOtpId(response.data["otpId"]);
          setRegisterState("verify");
          return;
        }
        if (response.status === 400) {
          return alert("Email already exists, try loggin in");
        }
      }
      const email = document.getElementById("emailSignUp").value;
      const username = document.getElementById("usernameSignUp").value;
      const response = await axios({
        url: "https://api-dev.spiritofsatoshi.ai/v1/account/email/signup",
        data: {
          email: email,
          fullName: username,
        },
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data["otpId"]) {
        setOtpId(response.data["otpId"]);
        setRegisterState("verify");
        return;
      }
      if (response.status === 400) {
        alert("Email already exists, try loggin in");
      }
    } catch (error) {
      return console.log(error);
    }
  };

  const nostrLogin = async (e) => {
    e.preventDefault();
    try {
      if (hasCookie("token")) {
        const token = getCookie("token");
        const npub = document.getElementById("npub").value;
        const relay = document.getElementById("relay").value;
        const response = await axios({
          url: "https://api-dev.spiritofsatoshi.ai/v1/account/nostr/login",
          data: {
            nPub: npub,
            relay: relay,
          },
          method: "post",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data["otpId"]) {
          setOtpId(response.data["otpId"]);
          setRegisterState("verify");
          return;
        }
        if (response.status === 400) {
          return alert("Email already exists, try logging in");
        }
      }
      const npub = document.getElementById("npub").value;
      const relay = document.getElementById("relay").value;
      const response = await axios({
        url: "https://api-dev.spiritofsatoshi.ai/v1/account/nostr/login",
        data: {
          nPub: npub,
          relay: relay,
        },
        method: "post",
      });
      if (response.data["otpId"]) {
        setOtpId(response.data["otpId"]);
        setRegisterState("verify");
        return;
      }
      if (response.status === 400) {
        return alert("Email already exists, try loggin in");
      }
    } catch (error) {
      return console.log(error);
    }
  };

  const emailLogin = async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById("email").value;
      const username = document.getElementById("username").value;
      const response = await axios.post(
        "https://api-dev.spiritofsatoshi.ai/v1/account/email/login",
        {
          email: email,
          fullName: username,
        }
      );
      if (response.data["otpId"]) {
        setOtpId(response.data["otpId"]);
        setRegisterState("verify");
        return;
      }
      if (response.status === 400) {
        alert("Email already exists");
      }
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
      const token = getCookie("token");
      if (token === undefined) {
        const response = await axios.post(
          "https://api-dev.spiritofsatoshi.ai/v1/account/anonymous"
        );
        const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        if (response.data["token"]) {
          setCookie("token", response.data["token"], {
            expires: oneYearFromNow,
          });
          return router.push("/chat");
        }
      }
      return router.push("/chat");
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
                onClick={() => setRegisterState("signup")}
                className={styles.loginButton}
              >
                Sign Up
              </button>
              <button
                onClick={() => setRegisterState("login")}
                className={styles.loginButton}
              >
                Log In
              </button>
            </span>
          </span>
        ) : registerState === "login" ? (
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
                    id="emailLogin"
                    placeholder="Email Address"
                    className={styles.registerInput}
                  />

                  <button
                    onClick={(event) => emailLogin(event)}
                    className={styles.registerButton}
                  >
                    Login
                  </button>
                </form>
              ) : selectedLogin === "lightning" ? (
                <Lightning address={qrCodeString} />
              ) : (
                <div className={styles.registerInputContainer}>
              
                  <input
                    id="npubLogin"
                    placeholder="npub"
                    className={styles.registerInput}
                  />

                  <input
                    id="relayLogin"
                    placeholder="Relay"
                    className={styles.registerInput}
                  />

                  <button onClick={(event) => nostrLogin(event)} className={styles.registerButton}>
                    Login
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
                </div>
              )}
            </span>
          </>
        ) : registerState === "signup" ? (
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
                    id="usernameSignUp"
                    placeholder="Username"
                    className={styles.registerInput}
                  />
                  <input
                    id="emailSignUp"
                    placeholder="Email Address"
                    className={styles.registerInput}
                  />

                  <button
                    onClick={(event) => emailSignUp(event)}
                    className={styles.registerButton}
                  >
                    Sign Up
                  </button>
                </form>
              ) : selectedLogin === "lightning" ? (
                <Lightning address={qrCodeString} />
              ) : (
                <div className={styles.registerInputContainer}>
                  <input
                    id="npub"
                    placeholder="npub"
                    className={styles.registerInput}
                  />

                  <input
                    id="relay"
                    placeholder="Relay"
                    className={styles.registerInput}
                  />

                  <button onClick={(event) => nostrLogin(event)}  className={styles.registerButton}>
                    Sign Up
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
                </div>
              )}
            </span>
          </>
        ) : (
          <>
            <img className={styles.logo2} alt="logo" src="/spiritLogo2.svg" />
            <span className={styles.titleModal} style={{ padding: "3%" }}>
              <div>
                <p
                  style={{
                    color: "white",
                    textAlign: "center",
                    maxWidth: "100%",
                    margin: "0 auto 10% auto",
                    fontSize: "11px",
                  }}
                >
                  Enter the 6-digit pin you recieved via email
                </p>
                <span className={styles.verifyInputContainer}>
                  <input
                    onChange={(event) => {
                      const pin2 = document?.getElementById("pin2");
                      const inputValue = event.target.value;
                      if (inputValue.length === 1) {
                        pin2.focus();
                      }
                    }}
                    maxLength="1"
                    id="pin1"
                    className={styles.verifyInput}
                  />
                  <input
                    onChange={(event) => {
                      const pin3 = document?.getElementById("pin3");
                      const pin1 = document?.getElementById("pin1");
                      const inputValue = event.target.value;
                      if (inputValue.length === 1) {
                        pin3.focus();
                      }
                      if (inputValue.length === 0) {
                        pin1.focus();
                      }
                    }}
                    maxLength="1"
                    id="pin2"
                    className={styles.verifyInput}
                  />

                  <input
                    onChange={(event) => {
                      const pin2 = document?.getElementById("pin2");
                      const pin4 = document?.getElementById("pin4");
                      const inputValue = event.target.value;
                      if (inputValue.length === 1) {
                        pin4.focus();
                      }
                      if (inputValue.length === 0) {
                        pin2.focus();
                      }
                    }}
                    maxLength="1"
                    id="pin3"
                    className={styles.verifyInput}
                  />

                  <input
                    onChange={(event) => {
                      const pin5 = document?.getElementById("pin5");
                      const pin3 = document?.getElementById("pin3");
                      const inputValue = event.target.value;
                      if (inputValue.length === 1) {
                        pin5.focus();
                      }
                      if (inputValue.length === 0) {
                        pin3.focus();
                      }
                    }}
                    maxLength="1"
                    id="pin4"
                    className={styles.verifyInput}
                  />
                  <input
                    onChange={(event) => {
                      const pin6 = document?.getElementById("pin6");
                      const pin4 = document?.getElementById("pin4");
                      const inputValue = event.target.value;
                      if (inputValue.length === 1) {
                        pin6.focus();
                      }
                      if (inputValue.length === 0) {
                        pin4.focus();
                      }
                    }}
                    maxLength="1"
                    id="pin5"
                    className={styles.verifyInput}
                  />

                  <input
                    onChange={(event) => {
                      const pin5 = document?.getElementById("pin5");
                      const inputValue = event.target.value;
                      if (inputValue.length === 0) {
                        pin5.focus();
                      }
                    }}
                    maxLength="1"
                    id="pin6"
                    className={styles.verifyInput}
                  />
                </span>
                {invalid === true ? (
                  <span
                    style={{
                      color: "red",
                      textAlign: "center",
                      margin: "0 auto 3vh auto",
                      fontSize: "11px",
                    }}
                  >
                    Incorrect Pin Number
                  </span>
                ) : null}
                <button
                  onClick={(event) => verifyOTP(event)}
                  className={styles.registerButton}
                >
                  Submit
                </button>
              </div>
              <span
                style={{
                  color: "white",
                  textAlign: "center",
                  maxWidth: "100%",
                  margin: "3% auto 0 auto",
                  fontSize: "11px",
                  outline: "none",
                  border: "none",
                  background: "none",
                }}
              >
                Didn't receieve your code?{" "}
                <button
                  style={{
                    fontSize: "11px",
                    outline: "none",
                    border: "none",
                    background: "none",
                    color: "#00FF41",
                  }}
                  onClick={() => resendOTP()}
                >
                  Resend
                </button>
              </span>
            </span>
          </>
        )}
      </main>
    </>
  );
}
