$(document).ready(function(){
    let fireDataPh = [];
    let imusFireData = [];

    $("button").click(function(){
        $.get("/firedata", function(dataString){
            getFireData(dataString);
        }, 'json');
    })

    /* convert JSON string into JavaScript Object and push to the array*/
    let getFireData = (dataString) => {
        const rows = dataString.split('\n');
        const keys = rows[0].split(',');

        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(',');
            const obj = {};
            for (let j = 0; j < keys.length; j++) {
                obj[keys[j]] = values[j];
            }
            fireDataPh.push(obj);
        }
        // console.log(fireDataPh);
        getImusFireData();
    }
    /* Get the firedata in the inside the four direction points */
    let getImusFireData = () => {
        /* Kawit, Bacoor (North West Point) - coordinates < 14.440432 AND coordinates > 120.903751 */ 
        const northWestLatitude = 14.440432;
        const northwestLongitude = 120.903751;
        /* San Nicolas I, Bacoor (North East Point) - coordinates < 14.440432 AND coordinates < 120.969294 */
        const northEastLatitude = 14.440432;
        const northEastLongitude = 120.969294;
        /* Santiago, GenTri (South West Point) - coordinates > 14.344069 AND coordinates > 120.903751 */
        const southWestLatitude = 14.344069;
        const southWestLongitude = 120.903751;
        /* Salawag, Dasma (South East Point) - coordinates > 14.344069 AND coordinates < 120.969294 */
        const southEastLatitude =  14.344069;
        const southEastLongitude = 120.969294;

        // 14°26'36.3"N 120°55'02.0"E

        for(let i = 0; i < fireDataPh.length; i++){
            let latitudeLocation = parseFloat(fireDataPh[i].latitude);
            let longitudeLocation = parseFloat(fireDataPh[i].longitude);

            if( (latitudeLocation < northWestLatitude && longitudeLocation > northwestLongitude) &&
                (latitudeLocation < northEastLatitude && longitudeLocation < northEastLongitude) &&
                (latitudeLocation > southWestLatitude && longitudeLocation > southWestLongitude) &&
                (latitudeLocation > southEastLatitude && longitudeLocation < southEastLongitude)){
                    // imusFireData.push(fireDataPh[i]);
                    console.log(fireDataPh[i]);
            }
            // console.log(fireDataPh[i]);
        }
        // console.log(imusFireData);
    }
    
})