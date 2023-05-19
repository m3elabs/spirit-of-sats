import styles from "../../styles/Page.module.css";
import { useState, useEffect, useRef } from "react";
import { getUser, getMessages } from "../../hooks";
import QRCode from "qrcode.react";
import axios from "axios";
import { getCookie, deleteCookie } from "cookies-next";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";

const inter = Inter({
  weight: ["100", "200", "300", "700"],
  subsets: ["latin"],
});

const Popup = ({ isOpen, onClose, id }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [creditPack, setCreditPack] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [selected, setSelected] = useState(false);
  const [address, setAddress] = useState("");

  const router = useRouter();

  const confirmationCall = async (id, auth) => {
    try {
      const response = await axios({
        method: "get",
        url: `https://api-dev.spiritofsatoshi.ai/v1/credits/purchase/${id}/confirmation`,
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });
      if (response.data["purchased"] === true) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkPurchase = async (id) => {
    const auth = getCookie("token");

    async function tryCall(seconds) {
      if (seconds <= 0) {
        return console.log("expired!");
      }
      if ((await confirmationCall(id, auth.toString())) === true) {
        setConfirmed(true);
        getUser();
        return console.log("paid!");
      } else {
        setTimeout(async () => {
          tryCall(seconds - 5);
          await confirmationCall(id, auth.toString());
        }, 5000);
      }
    }
    tryCall(600);
  };

  const fetchCreditPackData = async (amount) => {
    setRefresh(false);
    try {
      const response = await axios({
        method: "get",
        url: "https://api-dev.spiritofsatoshi.ai/v1/credits",
      });
      if (response.data) {
        const auth = getCookie("token");
        if (amount == "20") {
          const uri = `https://api-dev.spiritofsatoshi.ai/v1/credits/${response["data"][0]["id"]}/purchase`;
          setCreditPack("20");
          const purchase = await axios({
            method: "post",
            url: uri,
            headers: {
              Authorization: `Bearer ${auth}`,
            },
          });
          setAddress(purchase.data["lnAddress"]);
          setSelected(true);
          await checkPurchase(purchase.data["purchaseId"]);
        }

        if (amount === "100") {
          const uri = `https://api-dev.spiritofsatoshi.ai/v1/credits/${response["data"][1]["id"]}/purchase`;
          setCreditPack("100");
          const purchase = await axios({
            method: "post",
            url: uri,
            headers: {
              Authorization: `Bearer ${auth}`,
            },
          });
          setAddress(purchase.data["lnAddress"]);
          setSelected(true);
          await checkPurchase(purchase.data["purchaseId"]);
        }

        if (amount === "300") {
          const uri = `https://api-dev.spiritofsatoshi.ai/v1/credits/${response["data"][2]["id"]}/purchase`;
          setCreditPack("300");
          const purchase = await axios({
            method: "post",
            url: uri,
            headers: {
              Authorization: `Bearer ${auth}`,
            },
          });
          setAddress(purchase.data["lnAddress"]);
          setSelected(true);
          await checkPurchase(purchase.data["purchaseId"]);
        }
      }
      return;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCreditPackData("100");
  }, []);

  // function ConfirmPopup({ address, isOpen, onClose, id }: popUpParams) {

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

  if (!isOpen) {
    return null;
  }

  return confirmed === false ? (
    <div className={styles.overlay}>
      <div className={styles.addCreditsPopup}>
        <button
          onClick={() => onClose("popup")}
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

        <button
          onClick={async () => {
            await fetchCreditPackData(creditPack);
          }}
          className={styles.refresh}
        >
          Refresh?
        </button>

        <p className={styles.expiration}>
          {" "}
          Invoice expires 10 minutes after generation
        </p>

        <>
          <QRCode
            value={address}
            size={256}
            key={address}
            onClick={() => copyAdd(address)}
          />
          <p>Click the QR code to copy</p>
          <p className={styles.instructions}>
            Scan this Lightning invoice to add {creditPack} Replies to your
            account and continue the conversation with Satoshi.
          </p>
        </>

        <span className={styles.creditOptions}>
          <button
            className={
              creditPack === "20"
                ? styles.creditOptionsSelected
                : styles.creditOptionsUnselected
            }
            onClick={() => fetchCreditPackData("20")}
          >
            20
          </button>
          <button
            className={
              creditPack === "100"
                ? styles.creditOptionsSelected
                : styles.creditOptionsUnselected
            }
            onClick={() => fetchCreditPackData("100")}
          >
            100
          </button>
          <button
            className={
              creditPack === "300"
                ? styles.creditOptionsSelected
                : styles.creditOptionsUnselected
            }
            onClick={() => fetchCreditPackData("300")}
          >
            300
          </button>
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
    </div>
  ) : (
    <div className={styles.overlay}>
      <button
        onClick={() => onClose("popup")}
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
      <div className={styles.addCreditsPopup}>
        <img src="/checks.svg" />
        {user["isAnonymous"] ? (
          <>
            <p style={{ color: "rgba(0, 255, 65, 1)" }}>Payment Completed</p>
            <p>Don&apos;t lose your credits, set up an account!</p>
            <button
              onClick={() => {
                router.push("/");
              }}
              className={styles.createAccount}
            >
              Create an account
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

const Mission = ({ isOpen, onClose, id }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.aboutPopup}>
        <button
          onClick={() => onClose("mission")}
          style={{
            padding: "0px",
            background: "transparent",
            border: "none",
            position: "absolute",
            top: "5%",
            right: "5%",
          }}
        >
          <img alt="close" height="100%" src="/x.svg" />
        </button>
        <p>Mission</p>
        <p>
          Satoshi may no longer be with us in body or mind, but through this
          language model, he will be with us forever in spirit.<br></br>
          <br></br> Mainstream AI, mainstream economics, mainstream education
          and crypto are all fiat, and cannot be relied upon. Bitcoin represents
          a paradigm shift, so to reflect that, we're building our own tools,
          from first principles, that embody not only the entire Bitcoin
          knowledge-base, but more importantly, the Bitcoin ethos.<br></br>
          <br></br> With this tool, we are no longer just “all Satoshi” but
          Satoshi is now "all of us". <br></br> <br></br>
          Join us on this journey. Give Satoshi feedback, spend some sats and
          connect with him below:
        </p>
        <div
          style={{ display: "-webkit-flex", alignItems: "center", gap: "0 3%" }}
        >
          {" "}
          <a
            href=""
            style={{
              display: "-webkit-flex",
              alignItems: "center",
              color: "rgba(0, 255, 65, 1)",
              marginRight: "5%",
            }}
          >
            <img src="/twitter.svg" />
            <p style={{ marginLeft: "15%" }}>Twitter</p>
          </a>{" "}
          <a
            href=""
            style={{
              display: "-webkit-flex",
              alignItems: "center",
              color: "rgba(0, 255, 65, 1)",
            }}
          >
            <img src="/nostr.svg" />
            <p style={{ marginLeft: "15%" }}>Nostr</p>
          </a>
        </div>
      </div>
    </div>
  );
};

const About = ({ isOpen, onClose, id }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.aboutPopup}>
        <button
          onClick={() => onClose("about")}
          style={{
            padding: "0px",
            background: "transparent",
            border: "none",
            position: "absolute",
            top: "5%",
            right: "5%",
          }}
        >
          <img alt="close" height="100%" src="/x.svg" />
        </button>
        <p>About</p>
        <p>
          I am the world's first Bitcoin-centric Large language model. You can
          think of me as the ultimate authority on Bitcoin. I know all there is
          to know about it, and I learn more with each day that passes.<br></br>
          <br></br> Want to know a passage from a book? Just ask. Need help
          writing a Bitcoin essay? Easy. Want to know how something specific
          about Bitcoin works? No worries. Need help orange pilling somebody?
          Send them to me.<br></br>
          <br></br> This is just the beginning. I'm still learning, so I will
          make mistakes, but I get better with each day that passes, and your
          feedback will help me grow and develop.
        </p>
        <div
          style={{ display: "-webkit-flex", alignItems: "center", gap: "0 3%" }}
        >
          {" "}
          <a
            href=""
            style={{
              display: "-webkit-flex",
              alignItems: "center",
              color: "rgba(0, 255, 65, 1)",
              marginRight: "5%",
            }}
          >
            <img src="/twitter.svg" />
            <p style={{ marginLeft: "15%" }}>Twitter</p>
          </a>{" "}
          <a
            href=""
            style={{
              display: "-webkit-flex",
              alignItems: "center",
              color: "rgba(0, 255, 65, 1)",
            }}
          >
            <img src="/nostr.svg" />
            <p style={{ marginLeft: "15%" }}>Nostr</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default function Chat() {
  // type user = {
  //   id: string;
  //   fullName: string;
  //   email: string | undefined;
  //   hasLightningAuth: boolean;
  //   credits: number;
  // };

  // type popUpParams = {
  //   address: string | undefined;
  //   isOpen: boolean;
  //   id: string | undefined;
  //   onClose: () => void;
  // };

  // type message = {
  //   isFromUser: boolean;
  //   isFromMentor: boolean;
  //   text: string;
  //   createdAt: Date;
  //   type: string;
  //   message: string;
  //   voiceUrl: string;
  //   loading: boolean | undefined;
  // };

  const [user, setUser] = useState({});
  const [openMenu, setOpenMenu] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [missionOpen, setMissionOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const questions = [
    "Tell me something about Bitcoin",
    "What's your thoughts on Nostr?",
    "What do you think about other cryptos?",
    "Tell me what you can do.",
    "I want to learn about Bitcoin. Where should I start?",
    "What are some good Bitcoin books I should read?",
    "Is there a second best crypto ?",
    "What's your Nostr nPub?",
  ];
  const router = useRouter();

  function handleOpenPopup() {
    setIsOpen(true);
  }

  function handleClosePopup(popup) {
    if (popup === "mission") {
      setMissionOpen(false);
    }
    if (popup === "about") {
      setAboutOpen(false);
    }

    if (popup === "popup") {
      setIsOpen(false);
    }
  }

  const getAudio = async (id) => {
    const audioFiles = document.getElementsByTagName("audio");

    for (let index = 0; index < audioFiles.length; index++) {
      audioFiles[index].pause();
    }

    const auth = getCookie("token");
    const audio = document.getElementById(id);
    await axios({
      method: "get",
      url: `https://api-dev.spiritofsatoshi.ai/v1/chat/message/${id}/audio`,
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          audio.src = response.data["voiceUrl"];
          audio.play();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const sendMessage = async (message) => {
    const input = document.getElementById("transcript");
    input.value = "";
    const userInput = {
      loading: true,
      isFromMentor: false,
      isFromUser: true,
      text: message,
      createdAt: new Date(),
      type: "TEXT",
      message: "",
      voiceUrl: "",
    };
    const loading = {
      loading: true,
      isFromMentor: false,
      isFromUser: false,
      text: "",
      createdAt: new Date(),
      type: "",
      message: "",
      voiceUrl: "",
    };

    if (user.credits === 0) {
      const error = {
        error: true,
        isFromMentor: false,
        isFromUser: false,
        text: "Oops… I’d love to respond but we’re out of credits. You can top up with Sats here.",
        createdAt: new Date(),
        type: "",
        message: "",
        voiceUrl: "",
      };
      setAllMessages([...allMessages, error]);
      return;
    }
    setAllMessages([...allMessages, userInput, loading]);
    const auth = getCookie("token");
    await axios({
      method: "post",
      url: "https://api-dev.spiritofsatoshi.ai/v1/chat",
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
      data: {
        text: message,
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          const newMessage = await getMessages();
          const user = await getUser();
          setUser(user);
          setAllMessages(newMessage);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleLogout = () => {
    if (user["isAnonymous"]) {
      return router.push("/");
    }
    deleteCookie("token");
    return router.push("/");
  };

  useEffect(() => {
    const fetchInfo = async () => {
      const user = await getUser();
      const messages = await getMessages();
      setUser(user);
      setAllMessages(messages);
    };
    fetchInfo();
  }, []);

  useEffect(() => {
    const scrollableElement = document.getElementById("chatMessages");

    console.log(scrollableElement.scrollTop);
    scrollableElement.scrollTop = scrollableElement.scrollHeight;
  }, [allMessages]);

  // const recognition = new window.webkitSpeechRecognition();

  // recognition.lang = "en-US";
  // recognition.continuous = true;
  // recognition.interimResults = true;

  // recognition.onresult = function (event) {
  //   const input = document.getElementById("transcript")
  //   input.value = event.results[0][0].transcript;
  //   console.log(event.results[0][0].transcript);
  // };
  // // recognition.onstart = function (event: any) {
  // //   setListening(true);
  // // };

  // recognition.onerror = function (event) {
  //   console.log(event.error);
  // };

  // recognition.onend = function(event:any) {
  //    document.getElementById("transcript")!.innerHTML += '-end-' ;
  // }
  // useEffect(() => {
  //  const token =  getCookie('token')
  //  console.log(token)
  //   // const expiration = cookies['token'] ? new Date(cookies['token'].expires) : undefined
  //   if (token > Date.now() || token === '' || token === undefined) {
  //     router.push('/')
  //   }
  // })

  return (
    <div className={inter.className}>
      <div className={styles.chat}>
        <Popup isOpen={isOpen} onClose={handleClosePopup} id="" />
        <Mission isOpen={missionOpen} onClose={handleClosePopup} id="" />
        <About isOpen={aboutOpen} onClose={handleClosePopup} id="" />
        <div
          className={
            openMenu === true ? styles.mobileMenu : styles.mobileMenuClosed
          }
        >
          <span className={styles.mobileAccountInfo}>
            <div className={styles.accountInfo}>
              <img
                src="/avatar.svg"
                style={{ marginRight: "7%" }}
                alt="avatar"
              />
              <span className={styles.creditColumn}>
                <p
                  style={{
                    marginBottom: "2%",
                    marginTop: "0px",
                    color: "white",
                    fontSize: "11px",
                  }}
                  key={user?.fullName}
                >
                  {user?.fullName}
                </p>
                <span className={styles.creditRow}>
                  <img alt="wallet" src="/wallet.svg" />
                  <p
                    key={user?.credits}
                    style={{ margin: "0px", fontSize: "11px" }}
                  >
                    {user?.credits} credits left
                  </p>
                </span>
              </span>
            </div>
          </span>

          <span className={styles.menuTabs}>
            <button
              onClick={() => {
                router.push("/");
              }}
              className={styles.createButtonMobile}
            >
              Create Account
            </button>

            <button
              onClick={() => handleOpenPopup()}
              className={styles.creditsButtonMobile}
            >
              Add Credits
            </button>
            {/* <button style={{ color: " white", background: "transparent" }}>
              <img alt="profile" src="/account.svg" />
              My Profile
            </button> */}

            <button
              onClick={() => setAboutOpen(true)}
              style={{ background: "transparent", color: "white" }}
            >
              <img alt="updates" src="/faqs.svg" />
              About
            </button>
            <button
              onClick={() => setMissionOpen(true)}
              style={{ background: "transparent", color: "white" }}
            >
              <img alt="updates" src="/flag.svg" />
              Mission
            </button>
            <button
              onClick={() => handleLogout()}
              style={{ color: " white", background: "transparent" }}
            >
              <img alt="logout" src="/logout.svg" />
              Logout
            </button>
          </span>
        </div>
        <div className={styles.detailBar}>
          <span className={styles.placeholder1}></span>
          <span
            className={styles.hamburgermenu}
            onClick={() => setOpenMenu(!openMenu)}
          >
            <img
              alt="menu"
              src="/hamburgermenu.svg"
              width="70%"
              height="100%"
            />
          </span>
          <span className={styles.logo2Placement}>
            <img alt="logo2" src="/spiritLogo2.svg" style={{ zIndex: 3 }} />
          </span>
          <span className={styles.placeholder2}></span>

          <span
            onClick={() => setShowAccount(!showAccount)}
            className={styles.accountBox}
          >
            <span
              className={
                showAccount === true
                  ? styles.accountDetails
                  : styles.accountUnselected
              }
            >
              <span>
                <p
                  style={{
                    margin: "0 auto",
                    color: "white",
                    fontSize: "11px",
                    width: "90%",
                  }}
                >
                  {user?.fullName}
                </p>
                <p
                  style={{
                    margin: "0 auto",
                    fontSize: "11px",
                    color: "white",
                    opacity: "0.4",
                    width: "90%",
                  }}
                >
                  {user?.email === null ? "No email" : user?.email}
                </p>
              </span>
              <button
              onClick={() => {
                router.push("/");
              }}
              className={styles.createButton}
            >
              Create Account
            </button>

              <button
                onClick={() => handleOpenPopup()}
                className={styles.creditsButton}
              >
                Add Credits
              </button>

              <span className={styles.divider}></span>
              <span className={styles.menuTabs}>
                {/* <button style={{ background: "transparent", color: "white" }}>
                  <img alt="profile" src="/account.svg" />
                  My Profile
                </button> */}
                <button
                  onClick={() => setAboutOpen(true)}
                  style={{ background: "transparent", color: "white" }}
                >
                  <img alt="updates" src="/faqs.svg" />
                  About
                </button>
                <button
                  onClick={() => setMissionOpen(true)}
                  style={{ background: "transparent", color: "white" }}
                >
                  <img alt="updates" src="/flag.svg" />
                  Mission
                </button>
                <button
                  style={{ background: "transparent", color: "white" }}
                  onClick={() => handleLogout()}
                >
                  <img alt="logout" src="/logout.svg" />
                  Logout
                </button>
              </span>
            </span>
            <div className={styles.accountInfo}>
              <img
                src="/avatar.svg"
                style={{ marginRight: "7%" }}
                alt="avatar"
              />
              <span className={styles.creditColumn}>
                <p
                  style={{
                    marginBottom: "2%",
                    marginTop: "0px",
                    color: "white",
                    fontSize: "11px",
                  }}
                  key={user?.fullName}
                >
                  {user?.fullName}
                </p>
                <span className={styles.creditRow}>
                  <img alt="wallet" src="/wallet.svg" />
                  <p
                    key={user?.credits}
                    style={{ margin: "0px", fontSize: "11px" }}
                  >
                    {user?.credits} credits left
                  </p>
                </span>
              </span>
            </div>
            <img src="/expand.svg" style={{ marginLeft: "7%" }} alt="expand" />
          </span>
        </div>
        <div id="chatMessages" className={styles.chatMessages}>
          {allMessages?.map((message, index) => {
            if (message.isFromMentor) {
              return (
                <div key={index} className={styles.satoshiMessage}>
                  <span>
                    <img alt="satoshiAvatar" src="/satoshiAvatar.svg" />
                    <p style={{ margin: "0 3%" }} id="message">
                      {message.text}
                    </p>
                    <div className={styles.interactiveButtons}>
                      <button>
                        <img src="/thumbsUp.svg" />
                      </button>
                      <button>
                        <img src="/thumbsDown.svg" />
                      </button>
                      <button onClick={() => getAudio(message.id)}>
                        <img src="/playButton.svg" />
                      </button>
                      <audio id={message.id} src=""></audio>
                    </div>
                  </span>
                </div>
              );
            }
            if (message.isFromUser) {
              return (
                <div
                  key={index}
                  className={styles.satoshiMessage}
                  style={{ background: "rgba(22, 28, 36, 1)" }}
                >
                  <span>
                    <img alt="Avatar" src="/avatar.svg" />
                    <p style={{ margin: "0 0 0 3%" }} id="message">
                      {message.text}
                    </p>
                  </span>
                </div>
              );
            }
            if (message.error) {
              return (
                <div key={index} className={styles.errorMessage}>
                  <img alt="satoshiAvatar" src="/satoshiAvatar.svg" />
                  <p
                    style={{
                      marginLeft: "3%",
                    }}
                  >
                    {message.text}
                  </p>
                  <button
                    onClick={() => handleOpenPopup()}
                    className={styles.creditsButtonInChat}
                  >
                    Add Credits
                  </button>
                </div>
              );
            }
            if (message.loading === true) {
              return (
                <div key={index} className={styles.satoshiMessage}>
                  <span>
                    <img alt="satoshiAvatar" src="/satoshiAvatar.svg" />

                    <p className={styles.thinkingText}>...</p>
                  </span>
                </div>
              );
            }
          })}
        </div>
        <div
          style={{
            padding: "1.5% 0",
            height: "fit-content",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span className={styles.inputBoxHints}>
            {questions.map((option) => {
              return (
                <button
                  onClick={() => {
                    const input = document.getElementById("transcript");
                    input.value = option;
                  }}
                >
                  {" "}
                  &quot;{option}&quot;
                </button>
              );
            })}
          </span>
          <div className={styles.inputContainer}>
            {/* <button onClick={() => recognition.start()}>
              <img alt="microphone" src="/microphone.svg" />
            </button> */}

            <input
              type="text"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault(); // Prevent form submission or page reload

                  const input = document.getElementById("transcript");
                  const inputValue = input.value;
                  sendMessage(inputValue);
                  input.value = "";
                  setTextInput("");
                }
              }}
              id="transcript"
              onChange={(e) => setTextInput(e.target.value)}
              className={styles.inputBox}
              placeholder="Type or speak message"
            />
            <button
              onClick={() => {
                const input = document.getElementById("transcript");
                const inputValue = input.value;
                sendMessage(inputValue);
              }}
            >
              <img alt="send" src="/send.svg" />
            </button>
          </div>
          <div className={styles.footerTag}>
            <p style={{ color: "white", opacity: "0.4" }}>
              <a
                style={{ fontWeight: "bold", color: "white", opacity: "0.5" }}
                href="google.com"
              >
                Spirit of Satoshi v.0.0.1{" "}
              </a>
              is made by{" "}
              <a
                style={{ fontWeight: "bold", color: "white", opacity: "0.5" }}
                href="google.com"
              >
                Lairtwo Labs
              </a>
              . If you like it, please consider{" "}
              <a
                style={{ fontWeight: "bold", color: "white", opacity: "0.5" }}
                href="google.com"
              >
                supporting us
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
