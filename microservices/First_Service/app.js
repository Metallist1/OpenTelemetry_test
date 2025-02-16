/*app.js*/
const { context, propagation, trace } = require('@opentelemetry/api');
const express = require('express');
const { rollTheDice } = require('./dice.js');

const tracer = trace.getTracer('dice-server', '0.1.0');

const PORT = parseInt(process.env.PORT || '8080');
const app = express();
app.use(express.json());

app.get('/rolldice', (req, res) => {
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  res.send(JSON.stringify(rollTheDice(rolls, 1, 6)));
});

//Propogation example. This is a end point of trace.
app.post('/propogate', (req, res) => {
  console.log(req.body)
  const rolls = req.query.rolls ? parseInt(req.query.rolls.toString()) : NaN;
  if (isNaN(rolls)) {
    res
      .status(400)
      .send("Request parameter 'rolls' is missing or not a number.");
    return;
  }
  const json = req.body;
  let activeContext = context.active();
  let span = tracer.startSpan('receive', { kind: 1 }, activeContext);
  if (json._meta) {
    console.log(json._meta)
    activeContext = propagation.extract(context.active(), json._meta);
    delete json._meta;
  }

  trace.setSpan(activeContext, span);
  let roll = JSON.stringify(rollTheDice(rolls, 1, 6));
  span.end();
  res.send(roll);
  
});


app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
