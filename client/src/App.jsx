import "./App.css";
import Navbar from "./components/Navbar";
import WebcamVideo from "./components/Webcam";
import LoginButton from "./components/LoginButton";

function App() {
  return (
    <div>
      <Navbar class="place-content-start" />
      <WebcamVideo />
      <LoginButton />
    </div>
  );
}

export default App;
