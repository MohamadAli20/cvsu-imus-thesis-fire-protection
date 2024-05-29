// const { name } = require("ejs");
const model = require("../models/ApiRequest");
// const axios = require('axios');
// const model = require("../models/ApiRequest");
const riskAssessment = require("./RiskAssessment");

class ApiRequests{

    get_cavite_firedata(req, res){
        const lgu = req.query.lgu;
        const instrument = req.query.instrument;
        const confidence = req.query.confidence;

        let obj = {
            lgu: lgu,
            instrument: instrument,
            confidence: confidence
        }

        model.select_cavite_firedata(obj, (error, row) => {
            if(error){
                console.error(error);
            }
            if(row){
                res.json(row);
            }
        })
    }
    get_by_year(req, res){
        const year = req.params.year;
        const lgu = req.query.lgu;
        const instrument = req.query.instrument;
        const confidence = req.query.confidence;
        let obj = {
            year: year,
            lgu: lgu,
            instrument: instrument,
            confidence: confidence
        }

        model.select_by_year(obj, (error, row) => {
            if(error){
                console.error(error);
            }
            if(row){
                res.json(row);
            }
        })
    }
    async detect_fire(req, res){
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
    get_fire_frequency(req, res){
        model.select_all_frequency((error, row) => {
            if(error){
                console.error(error);
            }
            if(row){
                res.json(row);
            }
        })
    }
    get_risk_level(req, res){
        model.select_all_frequency( async(error, row) => {
            if(error){
                console.error(error);
            } 
            if(row){
                let result = [];
                for(let i = 0; i < row.length; i++){
                    // console.log(row[i].lgu)
                    const assessment = await riskAssessment.risk_assessment(row[i].lgu, row);
                    row[i].risk_level = assessment.riskLevel;
                    row[i].low_risk_threshold = assessment.lowRiskThreshold;
                    row[i].moderate_risk_threshold = assessment.moderateRiskThreshold;
                    row[i].high_risk_threshold = assessment.highRiskThreshold;

                    result.push(row[i]);
                }
                res.json(result);
            }
        });
    }
}

module.exports = new ApiRequests();