import Router from "components/Router";
import {app, auth, checkUserRegistration, saveUserData} from "firebaseApp";
import {useState, useEffect} from "react";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "components/Loader";

declare global {
  interface Window {
    Kakao: any;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!auth?.currentUser
  );
  const [init, setInit] = useState<boolean>(false);

  useEffect(() => {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY);
    }
    onAuthStateChanged(auth, user => {
      if (user) {
        if (!checkUserRegistration(user.uid)) {
          console.log("사용자 생성");
          saveUserData(user);
        } else {
          console.log("사용자 생성 no");
        }
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setInit(true);
    });
  }, [auth]);

  return (
    <>
      <ToastContainer />
      {init ? <Router isAuthenticated={isAuthenticated} /> : <Loader />}
    </>
  );
}

export default App;
