/*dice.js*/
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');

function rollOnce(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function rollTheDice(rolls, min, max) {
    // Create a span. A span must be closed.
    return tracer.startActiveSpan('rollTheDice', (span) => {
      const result = [];
      for (let i = 0; i < rolls; i++) {
        result.push(rollOnce(min, max));
      }
      // Be sure to end the span!
      span.end();
      return result;
    });
  }

module.exports = { rollTheDice };
