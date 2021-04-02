import React, {useRef, useEffect} from 'react';
import TreeView from './component/TreeView'
import Example from "./component/Example";
import './App.css'

const data = {
  name: "双打吃视频解说blabla1",
  id: 1,
  children: [{
    name:  "2",
    id: 2,
    children: [{
      name:  "3",
      id: 3,
    },{
      name:  "4",
      id: 12,
    }]
  }]
}

function App() {
  const wrapperRef = useRef()

  useEffect(() => {
    let wrapper = wrapperRef.current

    TreeView.init(wrapper, {
      data
    })

    console.log(Example.getValue())

  }, [wrapperRef])

  return (
    <div className="App" ref={wrapperRef}>
    </div>
  );
}

export default App;
