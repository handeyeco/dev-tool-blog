import { useState } from "react";
import Counter from "./Counter";

import "./App.css";

function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  return (
    <div className="App">
      <p>Exercise 1 count: {count1}</p>
      <Counter count={count1} onChange={setCount1} name="exercise-1" />
      <p>Exercise 2 count: {count2}</p>
      <Counter count={count2} onChange={setCount2} name="exercise-2" />
    </div>
  );
}

export default App;
