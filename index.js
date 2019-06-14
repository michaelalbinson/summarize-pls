const express = require('express');
const bp = require('body-parser');
const morgan = require('morgan');

// const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const port = process.env.PORT || 3030;

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
const app = express();

app.use(bp.urlencoded());
app.use(morgan('tiny'));

require('./routes/command')(app);

app.use((req, res) => {
    res.send(':wrench: We\'re having some issues right now, try again in a second! :wrench:');
});

app.listen(port, () => {
    console.log('Listening on PORT: ' + port);
});
