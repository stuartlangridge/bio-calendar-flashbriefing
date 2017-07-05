const ical = require("ical");
const moment = require("moment");
const fs = require("fs");
const exec = require('child_process').exec;

console.log("Start by fetching the calendar ICS file...");
const BIO = "https://calendar.google.com/calendar/ical/movdt8poi0t3gfedfd80u1kcak%40group.calendar.google.com/public/basic.ics";
ical.fromURL(BIO, {}, (err, data) => {
    if (err) { console.error(err); process.exit(1); }
    let out = [];
    console.log("Got the calendar ICS file");
    let allEvents = 0;
    for (let k in data) {
        if (data.hasOwnProperty(k)) {
            let ev = data[k];
            if (!ev.start) continue;
            allEvents += 1;

            /* get all events which are today or tomorrow */
            let today = moment(), tomorrow = moment(), endTomorrow = moment();
            today.startOf("day");
            tomorrow.endOf("day");
            endTomorrow.endOf("day").add(1, "days");
            let todayUnix = today.unix();
            let tomorrowUnix = tomorrow.unix();
            let endTomorrowUnix = endTomorrow.unix();
            let thisStart = ev.start.getTime() / 1000;
            if (thisStart < todayUnix || thisStart > endTomorrowUnix) continue;
            let dayName = "today";
            if (thisStart > tomorrowUnix) { dayName = "tomorrow"; }
            let eventM = moment(ev.start);
            let timeDesc = eventM.format("h:mma") + " " + dayName;

            /* sanitise the event summary and location a bit */
            let sansummary = ev.summary.replace(/\(.*\)/g, '').trim();
            if (sansummary == '') {
                // if the whole summary is in brackets, bring it back
                sansummary = ev.summary;
            }
            let atloc = '';
            let sanloc = ev.location
                .replace(/,? ?Birmingham/g, '')
                .replace(/,? ?United Kingdom/g, '')
                .replace(/\bB[0-9][0-9]? ?[0-9][A-Z][A-Z]\b/gi, '')
                .trim();
            if (sanloc != '') {
                // don't add a location if it's blank
                atloc = ", at " + sanloc;
            }
            out.push({
                titleText: ev.summary,
                mainText: "At " + timeDesc + ", " + sansummary + atloc,
                uid: ev.uid,
                updateDate: eventM.format("YYYY-MM-DDTHH:mm:ss") + ".0Z",
                redirectionUrl: "https://calendar.birmingham.io/",
                fetchedAt: moment()
            })
        }
    }

    /* write the events as JSON, and upload them to surge.sh */
    out.sort((a,b) => a.updateDate.localeCompare(b.updateDate));
    console.log("Finished processing " + allEvents + " events and found " + out.length + " upcoming.");
    let output = JSON.stringify(out, null, 2);
    fs.writeFile(__dirname + "/site/bio.json", output, {encoding: "utf-8"}, err => {
        if (err) { console.error(err); process.exit(2); }
        console.log("Output JSON written.");
        exec(__dirname + "/node_modules/.bin/surge " + __dirname + "/site/", (err, stdout, stderr) => {
            if (err) { console.error(err); process.exit(3); }
            console.log("Output JSON deployed to surge.sh. Done.");
        })
    });
});