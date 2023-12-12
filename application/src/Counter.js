export default function Counter({ count, onChange, name }) {
  function handleChange(step) {
    if (!step) {
      return onChange(0);
    }

    return onChange(count + step);
  }

  return (
    <div id={`counter-${name}`}>
      <button onClick={() => handleChange(-1)}>Decrement</button>
      <button onClick={() => handleChange()}>Reset</button>
      <button onClick={() => handleChange(+1)}>Increment</button>
    </div>
  );
}
