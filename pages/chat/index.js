import styles from "../../styles/Page.module.css";
import { useState, useEffect, useRef } from "react";
import { getUser, getMessages } from "../../hooks";
import QRCode from "qrcode.react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["100", "200", "300", "700"],
  subsets: ["latin"],
});



const Popup =  ({ isOpen, onClose, id }) =>  {

  const [confirmed, setConfirmed] = useState(false);
  const [creditPack, setCreditPack] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [selected, setSelected] = useState(false);
  const [address, setAddress] = useState("");


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
    fetchCreditPackData('100')
  },[])

  // function ConfirmPopup({ address, isOpen, onClose, id }: popUpParams) {
    if (!isOpen) {
      return null;
    }


    

  //   return (
  //     <div className={styles.overlay}>
  //       <button
  //         onClick={() => onClose()}
  //         style={{
  //           padding: "0px",
  //           background: "transparent",
  //           border: "none",
  //           position: "absolute",
  //           top: "5%",
  //           right: "7%",
  //           marginBottom: "4%",
  //         }}
  //       >
  //         <img alt="close" height="100%" src="/x.svg" />
  //       </button>
  //       <div className={styles.addCreditspPopup}>
  //         <img src="/checks.svg" />
  //         <p style={{ color: "rgba(0, 255, 65, 1)" }}>Payment Completed</p>
  //         <p>Don&apos;t lose your credits, set up an account!</p>
  //         <button className={styles.createAccount}>Create an account</button>
  //       </div>
  //     </div>
  //   );
  // }


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
      tryCall(30);
    };

   

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

  
    return confirmed === false ? (
      <div className={styles.overlay}>
      
        <div className={styles.addCreditsPopup}>
        <button
          onClick={() => onClose()}
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
  
            <p
             className={styles.expiration}
            > Invoice expires 10 minutes after generation</p>
     
              <>
              <QRCode
                value={address}
                size={256}
                key={address}
                onClick={() => copyAdd(address)}
              />
              <p>Click to copy</p>
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
          onClick={() => onClose}
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
          <p style={{ color: "rgba(0, 255, 65, 1)" }}>Payment Completed</p>
          <p>Don&apos;t lose your credits, set up an account!</p>
          <button className={styles.createAccount}>Create an account</button>
        </div>
      </div>
    );
  

}


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

  function handleOpenPopup() {
    setIsOpen(true);
  }

  function handleClosePopup() {
    setIsOpen(false);
  }

  const sendMessage = async (message) => {
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
      }).then(async (response) => {
      
        if (response.status === 200) {
         const newMessage = await getMessages();
         setAllMessages(newMessage);
        }
      }).catch((error) => {
      console.log(error);
    })
  }
  


  useEffect(() => {
   const fetchInfo = async () => {
      const user = await getUser()
      const messages = await getMessages();
      setUser(user);
      setAllMessages(messages);
    }
    fetchInfo();
   
  }, []);

  useEffect(() => {
    const scrollableElement = document.getElementById(
      "chatMessages"
    )

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

    return (
    
      <div className={inter.className}>
       
        <div className={styles.chat} >
          <Popup
            isOpen={isOpen}
            onClose={handleClosePopup}
            id=""
          />
          <div className={openMenu === true ? styles.mobileMenu : styles.mobileMenuClosed}>
          <span className={styles.mobileAccountInfo}>
          <div className={styles.accountInfo}>
                <img
                  src="/Avatar.png"
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
                  onClick={() => handleOpenPopup()}
                  className={styles.creditsButton}
                >
                  Add Credits
                </button>
                  <div>
                    <img alt="profile" src="/account.svg" />
                    My Profile
                  </div>
                  <div>
                    <img alt="updates" src="/faqs.svg" />
                    Updates & FAQs
                  </div>
                  <div>
                    <img alt="logout" src="/logout.svg" />
                    Logout
                  </div>
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
                width="100%"
                height="100%"
              />
            </span>
            <span className={styles.logo2Placement}>
              <img
                alt="logo2"
                src="/spiritLogo2.svg"
                style={{zIndex:3}}
              />
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
                    satoshi@gmx.com
                  </p>
                </span>
                <button
                  onClick={() => handleOpenPopup()}
                  className={styles.creditsButton}
                >
                  Add Credits
                </button>

                <span className={styles.divider}></span>
                <span className={styles.menuTabs}>
                  <div>
                    <img alt="profile" src="/account.svg" />
                    My Profile
                  </div>
                  <div>
                    <img alt="updates" src="/faqs.svg" />
                    Updates & FAQs
                  </div>
                  <div>
                    <img alt="logout" src="/logout.svg" />
                    Logout
                  </div>
                </span>
              </span>
              <div className={styles.accountInfo}>
                <img
                  src="/Avatar.png"
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
              <img
                src="/expand.svg"
                style={{ marginLeft: "7%" }}
                alt="expand"
              />
            </span>
          </div>
          <div id="chatMessages" className={styles.chatMessages}>
            {allMessages?.map((message, index) => {
              if (message.isFromMentor) {
                return (
                  <div key={index} className={styles.satoshiMessage}>
                    <span>
                      <img alt="satoshiAvatar" src="/satoshiAvatar.svg" />
                      <p id="message">{message.text}</p>
                      <button className={styles.playButton}>
                        <img src="/playButton.svg" />
                      </button>
                    </span>
                  </div>
                );
              }
              if (message.isFromUser) {
                return (
                  <div key={index} className={styles.userMessage}>
                    <span>
                      <img alt="userAvatar" src="/Avatar.png" />
                      {message.text}
                    </span>
                  </div>
                );
              }
              if (message.loading === true) {
                return (
                  <div key={index} className={styles.satoshiMessage}>
                    <span>
                      <img alt="satoshiAvatar" src="/satoshiAvatar.svg" />
                      <div className={styles.thinkingWrapper}>
                        <p className={styles.thinkingText}>...</p>
                      </div>
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
              <button
                onClick={() => {
                  const input = document.getElementById(
                    "transcript"
                  )
                  input.value = "What inspired you to create Bitcoin?";
                }}
              >
                {" "}
                &quot;What inspired you to create Bitcoin?&quot;
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById(
                    "transcript"
                  ) 
                  input.value = "What inspired you to create Bitcoin?";
                }}
              >
                {" "}
                &quot;What inspired you to create Bitcoin?&quot;
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById(
                    "transcript"
                  ) 
                  input.value = "What inspired you to create Bitcoin?";
                }}
              >
                {" "}
                &quot;What inspired you to create Bitcoin?&quot;
              </button>
            </span>
            <div className={styles.inputContainer}>
              <button onClick={() => recognition.start()}>
                <img alt="microphone" src="/microphone.svg" />
              </button>

              <input
                type="text"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault(); // Prevent form submission or page reload

                    const input = document.getElementById(
                      "transcript"
                    ) 
                    const inputValue = input.value;
                    input.value = "";
                    setTextInput("");
                    sendMessage(inputValue);
                  }
                }}
                id="transcript"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className={styles.inputBox}
                placeholder="Type or speak message"
              />
              <button onClick={() => sendMessage(textInput)}>
                <img alt="send" src="/send.svg" />
              </button>
            </div>
            <div className={styles.footerTag}>
              <p style={{ color: "white", opacity: "0.4"}}>
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
