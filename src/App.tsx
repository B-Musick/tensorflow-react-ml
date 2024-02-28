import { useState, useRef, createElement } from 'react'
import './App.css'

function App() {
  const webcam = useRef(null)
  const webcamButton = useRef(null)
  const liveView = useRef(null)

  const [enabledWebcamListener, setEnabledWebcamListener] = useState(false);
  const [model, setModel] = useState(undefined);
  const [children, setChildren] = useState([])
  // Before we can use COCO-SSD class we must wait for it to finish
  // loading. Machine Learning models can be large and take a moment 
  // to get everything needed to run.
  // Note: cocoSsd is an external object loaded from our index.html
  // script tag import so ignore any warning in Glitch.
  cocoSsd.load().then(function(loadedModel){
    setModel(loadedModel);
  });


  function getUserMediaSupported() {
    // Cast to boolean value (!!)
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  function predictWebcam() {
    if(enabledWebcamListener){
      // Now let's start classifying a frame in the stream.
      model.detect(webcam.current).then(function(predictions){
        console.log('predictWebcam')

        // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) {
          liveView.current.removeChild(children[i]);
        }
        children.splice(0);
        
        // Now lets loop through predictions and draw them to the live view if
        // they have a high confidence score.
        for (let n = 0; n < predictions.length; n++) {
          // If we are over 66% sure we are sure we classified it right, draw it!
          if (predictions[n].score > 0.66) {
            let innerText = predictions[n].class  + ' - with ' 
                + Math.round(parseFloat(predictions[n].score) * 100) 
                + '% confidence.';

            let style = {
              marginLeft: predictions[n].bbox[0] + 'px', 
              marginTop: predictions[n].bbox[1] - 10 + 'px', 
              width: '100px', 
              top: 0,
              left: 0
            }

            const p = <p style={style}>{innerText}</p>;

            let highlighterStyle = {
              left: predictions[n].bbox[0] + 'px', 
              top: predictions[n].bbox[1] + 'px', 
              width: predictions[n].bbox[2] + 'px', 
              height: predictions[n].bbox[3] + 'px'
            }

            const highlighter = <div className="highlighter" key={n} style={highlighterStyle}></div>;
            console.log(highlighter)
 
            setChildren([...children, p, highlighter])
          }
        }
  
        // Call this function again to keep predicting when the browser is ready.
        window.requestAnimationFrame(predictWebcam);
      });
    }
  }

  function enableWebcam(e:Event) {
    if(getUserMediaSupported()) {
      // Only continue if the COCO-SSD has finished loading.
      if (!model) {
        return;
      }

      // TODO: implement
      // e.target.classList.add('removed')
      // getUsermedia parameters to force video but not audio.
      const constraints = {
        video: true
      };

      // Activate the webcam stream.
      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        webcam.current.srcObject = stream;
        setEnabledWebcamListener(true);
      });
    } else {
      console.warn('Webcam is not supported!')
    }
  }

  return (
    <>
      <div>
        <p>Loaded TensorFlow.js - version:  {tf.version.tfjs}</p>
        <h1>Multiple object detection using pre trained model in TensorFlow.js</h1>

        <p>Wait for the model to load before clicking the button to enable the webcam - at which point it will become visible to use.</p>

        <section id="demos" className={model ? "":"invisible"}>

          <p>Hold some objects up close to your webcam to get a real-time classification! When ready click "enable webcam" below and accept access to the webcam when the browser asks (check the top left of your window)</p>
          
          <div ref={liveView} className="camView">
            {children}
            <button ref={webcamButton} onClick={enableWebcam}>Enable Webcam</button>
            <video onLoadedData={predictWebcam} ref={webcam} autoPlay muted width="640" height="480"></video>
          </div>
        </section>
      </div>
    </>
  )
}

export default App
