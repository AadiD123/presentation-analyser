import { useAuth0 } from "@auth0/auth0-react";
import "./App.css";
import Navbar from "./components/Navbar";
import VideoPlayer from "./components/VideoPlayer";
import WebcamVideo from "./components/Webcam";
import { useEffect } from "react";
import axios from "axios"

function App() {
  const videoSrc = "./src/assets/T-Pain.mp4";
  const {isAuthenticated, user, error, isLoading} = useAuth0()
  useEffect(() => {
    console.log("user", user)
    if (user) {
      // send post req
       axios
        .post(`http://localhost:3000/login/${user.email}`)
        .then((res) => {
          console.log(res);
        });
    }
  }, [user])
  return (
    <>
      <div className="dotted-background">
        <Navbar />
        <WebcamVideo />
      </div>
      <script src="webgazer.js" type="text/javascript" />
    </>
  );
}

export default App;
