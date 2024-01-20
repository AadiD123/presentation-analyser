import "./App.css";
import Navbar from "./components/Navbar";
import WebcamVideo from "./components/Webcam";
import LoginButton from "./components/LoginButton";
// import LogoutButton from "./components/LogoutButton";
import Profile from "./components/Profile";

function App() {
  return (
    <div>
      <Navbar />
      <WebcamVideo />
    </div>
  );
}

export default App;
