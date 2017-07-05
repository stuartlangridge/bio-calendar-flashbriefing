A simple Amazon Alexa skill to read out upcoming tech events in Birmingham, UK, sourced from the [Birmingham.IO tech events calendar](https://calendar.birmingham.io), as part of your Flash Briefing.

To add these to your Flash Briefing, search for "Birmingham.IO" in the Skills section of the Alexa app, or enable this skill in the [online Alexa Skills Store](https://www.amazon.co.uk/dp/B073PF3RKK/ref=sr_1_1?s=digital-skills&ie=UTF8&qid=1499242293&sr=1-1&keywords=birmingham.io).

> _Alexa, what's new?_

`Here's your Flash Briefing. From the Birmingham.IO calendar, the upcoming events are: Brum.JS, today at 6pm at Talis (bleep)...`

## Technical setup

This is designed to be run out of cron once an hour. It fetches the Birmingham.IO calendar feed, finds events in it for the next couple of days, builds an [Alexa Flash Briefing API Feed](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/flash-briefing-skill-api-feed-reference) of the events, and stashes it in the `site/` directory. It then calls `surge` to upload that to a previously existing surge.sh website.

So, to set this up, you need to create the `site/` directory first, and use `surge` to push it to a surge.sh site of your choice, and add a `site/CNAME` file so that `surge site/` will push the site without user interaction. After that, just call `node index.js` from cron.
