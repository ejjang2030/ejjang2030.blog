import {
  // getAuth,
  signInWithEmailAndPassword,
  // signInWithRedirect,
  // linkWithRedirect,
  // getRedirectResult,
  // OAuthProvider,
  // Auth,
  // UserCredential,
} from "firebase/auth";
import {auth} from "firebaseApp";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {useState} from "react";

export default function LoginForm() {
  // const provider = new OAuthProvider("oidc.kakao");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: {name, value},
    } = e;
    if (name === "email") {
      setEmail(value);

      const validRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!value?.match(validRegex)) {
        setError("이메일 형식이 올바르지 않습니다.");
      } else {
        setError("");
      }
    }
    if (name === "password") {
      setPassword(value);

      if (value?.length < 8) {
        setError("비밀번호는 8자리 이상으로 입력해주세요.");
      } else {
        setError("");
      }
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("로그인되었습니다.");
      navigate("/");
    } catch (e: any) {
      toast.error("로그인에 실패하였습니다.");
    }
  };

  // const getKakaoAccessToken = async (authCode: string) => {
  //   const restApiKey = process.env.REACT_APP_REST_API_KEY;
  //   const grantType = "authorizaition_code";
  //   const redirectUri =
  //     "https://ejjang2030-blog.firebaseapp.com/__/auth/handler";
  //   const requestUri = `https://kauth.kakao.com/oauth/token?grant_type=${grantType}&client_id=${restApiKey}&redirect_uri=${redirectUri}&code=${authCode}`;
  //   const {data} = await post(requestUri, {
  //     headers: {
  //       "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
  //     },
  //   });
  //   // 서버에 accessToken 전송
  //   if (!!data) {
  //     const accessToken = data.access_token;
  //     toast.success("accessToken : " + accessToken);
  //   }
  // };

  // const handleKakaoToFirebase = async (auth: Auth, accessToken: string) => {
  //   signInWithPopup(auth, provider)
  //     .then(result => {
  //       if (!!result) {
  //         toast.success("오케이!");
  //         const credential = OAuthProvider.credentialFromResult(result);
  //         // const accessToken = credential?.accessToken;
  //         const idToken = credential?.idToken;
  //         // console.log("accessToken : " + accessToken);
  //         // console.log("idToken : " + idToken);
  //         // toast.success("카카오로 로그인 되었습니다.");
  //         // navigate("/");
  //       }
  //     })
  //     .catch(error => {
  //       toast.error("카카오 로그인에 실패하였습니다.");
  //     });
  // };

  // const onKakaoLogin = async () => {
  //   provider.setCustomParameters({
  //     // client_id: `${process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY}`,
  //     prompt: "consent",
  //     response_type: "code",
  //     scope: "openid profile email",
  //     redirect_uri: "http://localhost:3000/oauth/kakao",
  //   });
  //   await signInWithRedirect(auth, provider);
  // };

  const kakaoLogin = () => {
    window.Kakao.Auth.authorize({
      redirectUri: "http://localhost:3000/oauth/kakao",
      scope: "openid account_email",
      nonce: "sdfsdfs",
    });
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className='form form--lg'>
        <h1 className='form__title'>로그인</h1>
        <div className='form__block'>
          <label htmlFor='email'>아이디</label>
          <input
            type='email'
            name='email'
            id='email'
            required
            onChange={onChange}
            value={email}
          />
        </div>
        <div className='form__block'>
          <label htmlFor='password'>비밀번호</label>
          <input
            type='password'
            name='password'
            id='password'
            required
            onChange={onChange}
            value={password}
          />
        </div>
        {error?.length > 0 && (
          <div className='form__block'>
            <div className='form__error'>{error}</div>
          </div>
        )}
        <div className='form__block'>
          계정이 없으신가요?
          <Link
            to='/signup'
            className='form__link'>
            회원가입하기
          </Link>
        </div>
        <div className='form__block'>
          <input
            type='submit'
            value='로그인'
            className='form__btn--submit'
            disabled={error?.length > 0}
          />
        </div>
        <button
          onClick={kakaoLogin}
          id='kakao-login-btn'>
          <img
            src='https://k.kakaocdn.net/14/dn/btroDszwNrM/I6efHub1SN5KCJqLm1Ovx1/o.jpg'
            width='222'
            alt='카카오 로그인 버튼'
          />
        </button>
      </form>
    </>
  );
}
