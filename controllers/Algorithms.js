const model = require("../models/ApiRequest");
const test = require("./Test");
class Algorithms{

    index(req, res){
        
        const year = 2024;
        // const lgu = req.query.lgu;
        // const instrument = req.query.instrument;
        // const confidence = req.query.confidence;
        let obj = {
            year: year,
            // lgu: lgu,
            // instrument: instrument,
            // confidence: confidence
        }
        
        model.select_by_year(obj, (error, row) => {
            if(error){
                console.error(error);
            }
            if(row){
                /*
                * Can notify when a fire is detected in real time.
                * Display how many hours ago the fire was detected.
                * Can calculate the risk level of a LGU based on historical data, considering the square kilometers of the barangay.
                * Can calculate how far the fire incident is from the fire station.
                */
                let result = [];
                
                // test.test("djdjf");

                let convertTime = (time) => {
                    /* convert the time to a string in case it is passed as a number */
                    time = time.toString();
                
                    // Ensure the time string is 4 characters long
                    while (time.length < 4) {
                        time = '0' + time;
                    }
                
                    // Extract the hours and minutes
                    let hours = time.slice(0, 2);
                    let minutes = time.slice(2, 4);
                
                    // Format the time as HH:MM
                    return `${hours}:${minutes}`;
                }
    
                let checkHoursAgo = (firedata) => {
                    let now = new Date();
                    
                    /* For testing */
                    // let nowString = "Tue May 24 2024 19:05:26 GMT+0800 (Singapore Standard Time)";
                    // let now = new Date(nowString);

                    for(let i = 0; i < firedata.length; i++){
                        let time = convertTime(firedata[i].acq_time)            
                        let date = firedata[i].acq_date
                        
                        let dateTimeString = `${date}T${time}:00`;

                        // Convert the dateTimeString to a Date object
                        let fireDateTime = new Date(dateTimeString);

                        // Calculate the difference in hours between the current time and the fire incident time
                        let hoursDifference = (now - fireDateTime) / (1000 * 60 * 60);

                        // Check if the difference is within 24 hours
                        if (hoursDifference <= 24 && hoursDifference >= 1) {
                            firedata[i].time_ago_since_detected = Math.floor(hoursDifference);
                            firedata[i].risk_level = test.test(firedata[i].name_of_place);
                            result.push(firedata[i]);
                            // console.log();
                        }
                    }
                    res.json(result)
                }
                checkHoursAgo(row);                          
            }
        })
    }

}

module.exports = new Algorithms();