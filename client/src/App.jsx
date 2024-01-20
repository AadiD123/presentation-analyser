import "./App.css";
import Navbar from "./components/Navbar";
import WebcamVideo from "./components/Webcam";

function App() {
  return (
    <div className="dotted-background">
      <Navbar />
      <WebcamVideo />
    </div>
  );
}

export default App;
