// src/RedirectHandler.js
import React, {useContext, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {
  // getAuth,
  // signInWithEmailAndPassword,
  // OAuthProvider,
  // signInWithCustomToken,
  signInWithRedirect,
  getRedirectResult,
  // getIdTokenResult,
  createUserWithEmailAndPassword,
  // signInWithCredential,
  // signInWithPopup,
} from "firebase/auth";
import {auth, db, kakaoProvider} from "firebaseApp";
import post from "axios";
import {toast} from "react-toastify";
import {doc, setDoc} from "firebase/firestore";
import AuthContext from "context/AuthContext";

const KakaoRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {user} = useContext(AuthContext);
  const getKakaoAccessToken = async (authCode: string) => {
    try {
      const restApiKey = `${process.env.REACT_APP_KAKAO_REST_API_KEY}`;
      const grantType = "authorization_code";
      const redirectUri = "http://localhost:3000/oauth/kakao";
      //   "https://ejjang2030-blog.firebaseapp.com/__/auth/handler";
      const requestUri = "https://kauth.kakao.com/oauth/token";
      const {data} = await post(requestUri, {
        params: {
          grant_type: grantType,
          client_id: restApiKey,
          redirect_uri: redirectUri,
          code: authCode,
        },
        headers: {
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });
      // 서버에 accessToken 전송
      if (!!data) {
        const accessToken = data.access_token;
        // const idToken = data.id_token;
        const userRes = await post("https://kapi.kakao.com/v2/user/me", {
          params: {
            property_keys: ["kakao_account.email", "kakao_account.profile"],
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
          },
        });
        const userData = userRes.data;
        if (userData) {
          const userEmail = userData.kakao_account.email;
          if (userEmail) {
            if (!user?.uid) {
              try {
                await createUserWithEmailAndPassword(
                  auth,
                  userEmail,
                  accessToken
                );
              } catch (errr: any) {
                kakaoProvider.setCustomParameters({
                  redirect_uri: "http://localhost:3000/oauth/kakao",
                  code: authCode,
                });
                await signInWithRedirect(auth, kakaoProvider).then(result => {
                  console.log(result);
                });
                toast.success("로그인되었습니다.");
                navigate("/");
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  /* eslint-disable */
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const authCode = urlParams.get("code");
    if (authCode) {
      getKakaoAccessToken(authCode);
    }
  }, [location]);

  useEffect(() => {
    getRedirectResult(auth)
      .then(result => {
        if (result) {
          const user = result.user;
          console.log("User information:", user);

          // Firestore에 사용자 정보 저장
          const userRef = doc(db, "users", user.uid);
          setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            providerId: user.providerData[0].providerId,
            lastLogin: new Date(),
          })
            .then(() => {
              console.log("User data saved to Firestore");
            })
            .catch(error => {
              console.error("Error saving user data to Firestore:", error);
            });
        } else {
          console.log("No redirect result");
        }
      })
      .catch(error => {
        console.error(
          "Error during sign-in:",
          error.code,
          error.message,
          error.a
        );
      });
  }, []);

  return <div>리디렉션 처리 중...</div>;
};

export default KakaoRedirectHandler;
