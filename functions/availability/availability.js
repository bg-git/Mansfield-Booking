const moment = require('moment');
const momentTimezone = require('moment-timezone');

const clientPromise = require('../mongodb-client');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Content-Type': 'application/json'
};

// Docs on event and context https://www.netlify.com/docs/functions/#the-handler-method
const handler = async (event) => {
    try {
        if (event.httpMethod == 'GET') {
            let duration = 20; //minutes
            let bufferAfter = 10; //minutes
            const maxBookableDays = 90;
            const availabilities = [];
            const appointments = [];
            const disabled = [];
            const disabledDates = [];
            const days = [];
            const client = await clientPromise;
            const database = client.db();
            const availabilitiesCollection = database.collection('availabilities');
            const appointmentsCollection = database.collection('appointments');
            const settingsCollection = database.collection('settings');

            const availabilitiesDbData = await availabilitiesCollection.find({}, { sort: { order: 1 } });
            const appointmentsDbData = await appointmentsCollection.find();
            const setting = await settingsCollection.findOne({ id: 'setting' });
            duration = parseInt(setting.duration);
            bufferAfter = parseInt(setting.buffer);

            // console.log('[duration]', duration, bufferAfter);
            
            let index = 0;
            await availabilitiesDbData.forEach((val) => {
                if((!val.available || val.slots === 0) && val.type === 'dow') disabled.push(index);
                else if (val.type === 'date' && !val.available) disabledDates.push(val.dow);
                
                availabilities.push(val);
                index++;
            });

            await appointmentsDbData.forEach((val) => {
                appointments.push(val);
            });

            // console.log('[availabilities]', availabilities)

            for(let i = 0; i < maxBookableDays; i++) {
                const spots = [];
                const date = moment().add(i, 'day').format('YYYY-MM-DD');
                const dow = (moment().add(i, 'day').format('dddd')).toLowerCase();
                console.log('[dow]', dow, date)

                let startTime;
                let endTime;
                let slots;
                let available = false;

                availabilities.forEach(availability => {
                    if (availability.type === 'date' && availability.dow === date) {
                        startTime = moment(moment(new Date()).format('YYYY-MM-DD') + ' ' + availability.start_time);
                        endTime = moment(moment(new Date()).format('YYYY-MM-DD') + ' ' + availability.end_time);
                        slots = parseInt(availability.slots);
                        available = availability.available;
                    }
                    else if (availability.type === 'dow' && availability.dow === dow) {
                        startTime = moment(moment(new Date()).format('YYYY-MM-DD') + ' ' + availability.start_time);
                        endTime = moment(moment(new Date()).format('YYYY-MM-DD') + ' ' + availability.end_time);
                        slots = parseInt(availability.slots);
                        available = availability.available;
                    }
                })

                // console.log('[flag]', startTime, endTime)

                const totalDuration = moment.duration(endTime.diff(startTime)).asMinutes();
                const timeForSpot = duration + bufferAfter;
                const numberOfAvailableSpots = parseInt(totalDuration / timeForSpot);
                const cursorDayAppointments = [];

                appointments.forEach((val) => {
                    const appointmentDate = moment(val.dateTime).format('YYYY-MM-DD');
                    const appointmentTime = moment(val.dateTime).format('hh:mm A');
                    if(date === appointmentDate) {
                        cursorDayAppointments.push({ time: appointmentTime, qty: val.qty });
                    }
                });
    
                index = 0;
                while(index < numberOfAvailableSpots) {
                    const newStartTimeObj = moment(moment(new Date()).format('YYYY-MM-DD') + ' ' + startTime.format('HH:mm'))
                                        .add( timeForSpot * index, 'minutes' );
                    const newStartTime = newStartTimeObj.format('hh:mmA');
                    const newEndTime = moment(moment(new Date()).format('YYYY-MM-DD') + ' ' + startTime.format('HH:mm'))
                                        .add( (timeForSpot * index + duration), 'minutes' ).format('hh:mmA');
                    let slotsTemp = slots;
                    cursorDayAppointments.forEach((val) => {
                        if(val.time === newStartTime) slotsTemp = slotsTemp - parseInt(val.qty);
                    });

                    if(moment(new Date()).format('YYYY-MM-DD') == date) {
                        const ukNow = moment(momentTimezone.tz('Europe/London').format('YYYY-MM-DD hh:mmA'), 'YYYY-MM-DD hh:mmA');
                        const diff = moment.duration(newStartTimeObj.diff(ukNow));

                        // console.log('[diff]', diff.asHours(), newStartTimeObj.format('hh:mmA'), ukNow.format('hh:mmA'));

                        if (diff.asHours() < 1) {
                            index++;
                            continue;
                        }
                    }
                    
                    spots.push({
                        start_time: newStartTime,
                        end_time: newEndTime,
                        slots: slotsTemp
                    });
    
                    index++;
                }

                const day = {
                    date: date,
                    available: available,
                    spots: spots
                }
                days.push(day);
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    disabled: disabled,
                    disabledDates: disabledDates,
                    days: days
                })
            };
        } else {
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ status: 'POST method is not allowed' })
            };
        }
    } catch (error) {
        console.log('[error]', error);
        return {
            statusCode: 500,
            headers,
            body: error.toString()
        };
    }
};

module.exports = { handler };
