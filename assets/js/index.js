$(document).ready(function(){
    let fireDataPh = [];
    let imusFireData = [];
    
    /*
    * Fetch Philippines fire data & filter to get the fire data in Imus City
    */
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

        // 14.443423,120.917212

        for(let i = 0; i < fireDataPh.length; i++){
            let latitudeLocation = parseFloat(fireDataPh[i].latitude);
            let longitudeLocation = parseFloat(fireDataPh[i].longitude);

            if( (latitudeLocation < northWestLatitude && longitudeLocation > northwestLongitude) &&
                (latitudeLocation < northEastLatitude && longitudeLocation < northEastLongitude) &&
                (latitudeLocation > southWestLatitude && longitudeLocation > southWestLongitude) &&
                (latitudeLocation > southEastLatitude && longitudeLocation < southEastLongitude)){
                    imusFireData.push(fireDataPh[i]);
            }
        }
        addMark();
    }

    /*
    * Setting up the map
    */
    var map = L.map('map').setView([14.387481, 120.945634], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var fireIcon = L.icon({
        iconUrl: '/images/fire.svg',
        iconSize: [40, 40], // Size of the icon
        iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
    });
    

    let addMark = () => {
        for(let i = 0; i < imusFireData.length; i++){
            let latitude = parseFloat(imusFireData[i].latitude);
            let longitude = parseFloat(imusFireData[i].longitude);

            let marker = L.marker([latitude, longitude], {icon: fireIcon}).addTo(map);
        }
    }
})