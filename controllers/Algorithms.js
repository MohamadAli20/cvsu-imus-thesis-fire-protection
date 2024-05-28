const model = require("../models/ApiRequest");
const riskAssessment = require("./RiskAssessment");

class Algorithms{
    async index(req, res){
        try{
            const year = 2024;
            let obj = {
                year: year,
            };

            const firedata = await new Promise((resolve, reject) => {
                model.select_by_year(obj, (error, row) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row);
                    }
                });
            });

            const convertTime = (time) => {
                time = time.toString();
                while (time.length < 4) {
                    time = '0' + time;
                }
                let hours = time.slice(0, 2);
                let minutes = time.slice(2, 4);
                return `${hours}:${minutes}`;
            };

            const now = new Date();
            const result = [];

            for (let i = 0; i < firedata.length; i++) {
                let time = convertTime(firedata[i].acq_time);
                let date = firedata[i].acq_date;
                let dateTimeString = `${date}T${time}:00`;
                let fireDateTime = new Date(dateTimeString);
                let hoursDifference = (now - fireDateTime) / (1000 * 60 * 60);

                if (hoursDifference <= 24 && hoursDifference >= 1) {
                    firedata[i].time_ago_since_detected = Math.floor(hoursDifference);

                    /* Get the latest data */
                    const row = await new Promise((resolve, reject) => {
                        model.select_all_frequency((error, row) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(row);
                            }
                        });
                    });

                    const assessment = await riskAssessment.risk_assessment(firedata[i].name_of_place, row);
                    firedata[i].risk_level = assessment.riskLevel;
                    firedata[i].low_risk_threshold = assessment.lowRiskThreshold;
                    firedata[i].moderate_risk_threshold = assessment.moderateRiskThreshold;
                    firedata[i].high_risk_threshold = assessment.highRiskThreshold;

                    result.push(firedata[i]);
                }
            }

            res.json(result);
        }
        catch(error){
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = new Algorithms();
