import { toPixels } from "../helpers";

export default function BoundingBox({bbox, objectPredicted, score}){
    let [boundingBoxX ,boundingBoxY, boundingBoxWidth, boundingBoxHeight] = bbox;

    let highlighterStyle = {
      left: toPixels(boundingBoxX), 
      top: toPixels(boundingBoxY), 
      width: toPixels(boundingBoxWidth), 
      height: toPixels(boundingBoxHeight)
    }

    return (
        <div className="highlighter" style={highlighterStyle}>
            <p className="flex justify-center w-24 h-24 text-1xl p-2 items-center rounded-full top-[-35px] left-[-35px]">
                <span>{`${objectPredicted}: ${Math.round(parseFloat(score) * 100)}`}</span>
            </p>
        </div>
    )
}