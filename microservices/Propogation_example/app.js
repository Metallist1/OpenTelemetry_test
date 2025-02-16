/*app.js*/
const { trace, propagation, context } = require('@opentelemetry/api');
const express = require('express');
const http = require('http');
const tracer = trace.getTracer('dice-server3', '0.1.3');

const PORT = parseInt(process.env.PORT || '8083');
const app = express();

app.get('/call', (req, res) => {
  const span1 = tracer.startSpan('work-1');
  span1.end();
  let span = tracer.startActiveSpan('send', { kind: 1 }, (span) => {
    const output = {};
    propagation.inject(context.active(), output);
    const { traceparent, tracestate } = output;

    const objToSend = { key: 'value' };

    if (traceparent) {
      objToSend._meta = { traceparent, tracestate };
    }

    console.log(objToSend)

    let data = '';
    const options = {
      hostname: '127.0.0.1',
      path: '/propogate?rolls=12',
      port: '8080',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const request = http.request(options, (response) => {
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        console.log("end");
        console.log(data);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    // Inject data into the request body
    request.write(JSON.stringify(objToSend));
    span.end();
    request.end();
  });
  res.send("Done!!!!");
});


app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
