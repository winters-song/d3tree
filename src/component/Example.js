import * as d3 from "d3";
import values from '../data/values.json'

class Example {
  constructor() {

  }

  getValue() {
    // return [d3.min(values), d3.median(values), d3.max(values)]
    return Float64Array.from({length: 2000}, d3.randomNormal(-5, 2))
  }


}
export default new Example()