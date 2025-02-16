/*dice.js*/
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');

function rollOnce(i, min, max) {
  //Nested span example. RollTheDice will have rollOnce{i} in the trace.
  return tracer.startActiveSpan(`rollOnce:${i}`, (span) => {
    const result = Math.floor(Math.random() * (max - min + 1) + min);
    span.setAttribute('rolled', result);
    span.end();
    return result;
  });
}

function rollTheDice(rolls, min, max) {
  // startActiveSpan is used for callbacks
  return tracer.startActiveSpan('rollTheDice', (parentSpan) => {
    const result = [];
    for (let i = 0; i < rolls; i++) {
      result.push(rollOnce(i, min, max));
    }
    // Attach a custom atribute
    parentSpan.setAttribute('dicelib.rolled', result.toString());
    parentSpan.end();
    return result;
  });
}

module.exports = { rollTheDice };
