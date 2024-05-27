const axios = require('axios');

class FetchData{
    
    async getCurrentTransaction(req, res) {
        try {
            const mapKeyStatus = await axios.get("https://firms.modaps.eosdis.nasa.gov/mapserver/mapkey_status/?MAP_KEY=6ebaa525eb5f78cb9d68576f8599d93e");
            const currentTransaction = mapKeyStatus.data.current_transactions;
    
            res.json({ currentTransaction });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async requestFireData(req, res){
        try{
            const fireData = await axios.get(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/6ebaa525eb5f78cb9d68576f8599d93e/MODIS_NRT/PHL/1`);

            res.json({ fireData: fireData.data, mapKeyStatus: mapKeyStatus.data });
        }
        catch(error){
            console.error(error);
            res.status(500).json({error: error.message});
        }
    }

    async getFireData(req, res) {
        try{
            /* Get date today */
            let currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1 < 10) ? '0' + (currentDate.getMonth() + 1) : currentDate.getMonth() + 1;
            const day = (currentDate.getDate() < 10) ? '0' + currentDate.getDate() : currentDate.getDate();

            currentDate = `${year}-${month}-${day}`;
            
            const { instrument, date, range } = req.params;
            // console.log(req.params);
            if(date !== currentDate){
                const response = await axios.get(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/c1cfea789591c42cfe9feb7c959d5719/${instrument}/PHL/${range}/${date}`);
                // const response = await axios.get(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/6ebaa525eb5f78cb9d68576f8599d93e/${instrument}/PHL/${range}/${date}`);
                res.json(response.data);
                // console.log(response.data);
                // console.log("Date selected: ", req.params); 
            }
            else if(date === currentDate){
                const response = await axios.get(`https://firms.modaps.eosdis.nasa.gov/api/country/csv/c1cfea789591c42cfe9feb7c959d5719/${instrument}/PHL/${range}`);
                res.json(response.data);
                // console.log(response.data);
                // console.log("Date today: ", req.params)
            }
            
        }
        catch(error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new FetchData;