const express = require('express');
const request = require('request');

/**
 *
 * @param app {express.application}
 */
module.exports = (app) => {
    app.post('/command/summarize-pls', (req, res) => {
        const text = req.body.text;
        const summDetails = getSummarizationType(text);
        res.send({
            "response_type": 'ephemeral',
            "text": summDetails.detail
        });

        const responseURL = req.body.response_url;
        constructLongFormResponse(responseURL, summDetails, text);
    });
};

function getSummarizationType(text) {
    let result = {
        detail: "Ok! I'll get to it!\n",
        type: 'text',
        channel: null,
        user: null,
    };

    // users get 30 characters to tell us what they want... if it includes a keyword we follow it
    // otherwise
    let usefulCrossection = text.slice(0, 30);

    if (usefulCrossection.includes('#')) {
        const channelName = getChannelName(text);
        result.detail = result.detail + 'I\'m going to summarize all of the messages in <' + channelName
            +'> from today. :calendar:';
        result.type = 'day-channel';
        result.channel = channelName;
    } else if (usefulCrossection.includes('@')) {
        const userName = getUserName(text);
        result.detail = result.detail + 'I\'m going to summarize your messages with <'
            + userName + '> today. :calendar:';
        result.type = 'day-user';
        result.user = userName;
    } else if (usefulCrossection.includes('today')) {
        result.detail = result.detail + 'I\'m going to summarize all of the messages in this channel from today. :calendar:';
        result.type = 'day';
    } else if (usefulCrossection.includes('yesterday')) {
        result.detail = result.detail + 'I\'m going to summarize all of the messages in this channel from yesterday. :calendar:';
        result.type = 'yesterday';
    } else if (usefulCrossection.includes('this week')) {
        result.detail = result.detail + 'I\'m going to summarize all of the messages in this channel from this week. :spiral_calendar_pad: ';
        result.type = 'yesterday';
    } else if (usefulCrossection.includes('last week')) {
        result.detail = result.detail + 'I\'m going to summarize all of the messages in this channel from the last week. :spiral_calendar_pad: '
    } else if (usefulCrossection.includes('month')) {
        result.detail = result.detail + 'I\'m going to summarize all of the messages in this channel from the last month. :spiral_calendar_pad: '
    } else {
        result.detail = result.detail + 'I\'m going to summarize all of the text you just sent.'
    }

    result.detail = result.detail + '\nGive me a few seconds...';
    return result;
}

function getChannelName(text) {
    const matches = text.match(/#[\w\-]*/);
    return matches ? matches[0] : 'ERROR:';
}

function getUserName(text) {
    const matches = text.match(/@\w*-/);
    return matches ? matches[0] : 'ERROR:';
}

/**
 *
 * @param url {string}
 * @param details {object}
 * @param text {string}
 */
function constructLongFormResponse(url, details, text) {
    if (details.type === 'text' && text.length < 100) {
        request.post(url, {
            response_type: 'in_channel',
            contentType: 'application/json',
            json: {
                text: "You sent a short enough article that we decided it couldn't be shortened",
                attachments: [
                    text
                ]
            }
        });
    }
}
