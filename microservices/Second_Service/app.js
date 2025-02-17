/*app.js*/
const { trace, SpanStatusCode } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');
const PORT = parseInt(process.env.PORT || '8081');
const app = express();

const tracer = trace.getTracer('example-server', '0.1.1');

// Use http://localhost:8081/rolldice?rolls=12
app.get('/rolldice', (req, res) => {
  // Nested Span example
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res.status(400).send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

//http://localhost:8081/sibling
app.get('/sibling', (req, res) => {
  // Create independent spans
  // Span event
  const span1 = tracer.startSpan('work-1');
  span1.addEvent('Doing something');

  // Span event with attributes. Specifically error.
  const span2 = tracer.startSpan('work-2');
  span2.addEvent('some log', {
    'log.severity': 'error',
    'log.message': 'Data not found',
    'request.id': "Second event span",
  });

  // Span error attribute
  const span3 = tracer.startSpan('work-3');
  span3.setStatus({
    code: SpanStatusCode.ERROR,
    message: 'Error',
  }); 

  span1.end();
  span2.end();
  span3.end();
  res.send("Done");
});

//http://localhost:8081/exception
app.get('/exception', (req, res) => {
  //Span recording exception example
  const span = tracer.startSpan('throw-exception');

  try {
    null.toString();
  } catch (ex) {
    if (ex instanceof Error) {
      span.recordException(ex);
    }
    span.setStatus({ code: SpanStatusCode.ERROR });
  }

  span.end();
  res.send("Thrown exception");
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
