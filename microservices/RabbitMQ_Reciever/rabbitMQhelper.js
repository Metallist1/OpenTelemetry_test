var amqp = require('amqplib/callback_api');

const listenForMessages = async function listenForMessages(consume) {
    amqp.connect('amqp://guest:guest@host.docker.internal', function(error0, connection) {
        if (error0) {
          throw error0;
        }
        // create a channel and prefetch 1 message at a time
        let channel = connection.createChannel();
        var queue = 'hello';

        channel.assertQueue(queue, {
            durable: false
        });
        channel.prefetch(1);

        // create a second channel to send back the results
        let resultsChannel = connection.createConfirmChannel();

        // start consuming messages
        consume({ connection, channel, resultsChannel });
    });
}

module.exports = { listenForMessages };