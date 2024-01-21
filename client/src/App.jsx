import "./App.css";
import Navbar from "./components/Navbar";
import WebcamVideo from "./components/Webcam";

function App() {
  return (<>
    <div className="dotted-background">
      <Navbar />
      <WebcamVideo />
    </div>
    <script src="webgazer.js" type="text/javascript" />
      </>
  );
}

export default App;
