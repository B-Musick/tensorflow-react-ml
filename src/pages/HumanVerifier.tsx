import { useState, useRef } from 'react'
import '../App.css'
import LoadingWheel from '../components/LoadingWheel'
import BoundingBox from '../components/BoundingBox';

import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { toPixels } from '../helpers';

function HumanVerifier() {
  const webcam = useRef(null)
  const webcamButton = useRef(null)
  const liveView = useRef(null)

  const [enabledWebcamListener, setEnabledWebcamListener] = useState(false);
  const [model, setModel] = useState(undefined);
  const [children, setChildren] = useState([]);

  cocoSsd.load().then(function(loadedModel){
    setModel(loadedModel);
  });

  function getUserMediaSupported() {
    // Cast to boolean value (!!)
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  /**
   * 
   * @param counter this is passed into recursive function to set the boolean eventually to determine its a human
   */
  function predictWebcam(counter:number, invalidCounter: number) {
    let validHuman = false;

    if(enabledWebcamListener){
      // Now let's start classifying a frame in the stream.
      model.detect(webcam.current).then(function(predictions){
        // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) { liveView.current.removeChild(children[i]); }

        children.splice(0);
        
        for (let n = 0; n < predictions.length; n++) {
          let {class:objectPredicted, score, bbox} = predictions[n];
          let [boundingBoxX ,boundingBoxY, boundingBoxWidth, boundingBoxHeight] = bbox;

          if(counter >= 10) validHuman = true;
          
          
          if (score > 0.66) {
            // Draw box if 66% sure its a match
            invalidCounter = 0;
            
            let loadingWheelStyle = {
              left: toPixels(boundingBoxX + (boundingBoxWidth/2 - 35)), 
              top:  toPixels(boundingBoxY + (boundingBoxHeight/2 - 35))
            }

            const loadingWheel = validHuman ? <IoIosCheckmarkCircleOutline className="absolute w-20 h-20 text-green-500" style={loadingWheelStyle} />: <LoadingWheel loadingWheelStyle={loadingWheelStyle} />

            setChildren([<BoundingBox bbox={bbox} objectPredicted={objectPredicted} score={score}/>, loadingWheel])
          } else {
            invalidCounter++;

            if(invalidCounter > 5) counter--;
          }

          objectPredicted != 'person' ? invalidCounter++ : counter++;
        }

        counter < 20 ? window.requestAnimationFrame(()=>predictWebcam(counter, invalidCounter)) : setChildren([]);
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
        <section className={model ? "":"invisible"}>          
          <div ref={liveView} className="camView">
            {children}
            
            <button ref={webcamButton} onClick={enableWebcam}>Enable Webcam</button>
            <video onLoadedData={()=>predictWebcam(0)} ref={webcam} autoPlay muted width="640" height="480"></video>
          </div>
        </section>
      </div>
    </>
  )
}

export default HumanVerifier
