import "./App.css";
import WebcamVideo from "./components/Webcam";
import LoginButton from "./components/LoginButton";

function App() {
  return (
    <div>
      <LoginButton />
      <WebcamVideo />
    </div>
  );
}

export default App;
