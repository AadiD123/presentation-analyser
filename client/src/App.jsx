import "./App.css";
import WebcamVideo from "./components/Webcam";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import Profile from "./components/Profile";

function App() {
  return (
    <div>
      <LoginButton />
      <LogoutButton />
      <Profile />
      <WebcamVideo />
    </div>
  );
}

export default App;
