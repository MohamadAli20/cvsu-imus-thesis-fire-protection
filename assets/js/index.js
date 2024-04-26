$(document).ready(function(){
    
    /* Fire Data */
    let fireDataPh = [];
    let imusFireData = [];

    /* Center of the map */
    let latitude = 14.399411;
    let longitude = 120.945548;
    let zoom = 13;

    let area = "cavite_firedata";
    let city = "Imus";
    /* Request information*/
    let instrument = "MODIS_NRT";
    let date = "2024-04-26";
    let range = 10;

    /* Initialization */
    let map = L.map('map').setView([latitude, longitude], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    /* Get the default fire data */
    $.get("/firedata", function(dataString){
        getFireData(dataString);
    }, 'json');

    $("select[name='instrument']").on("input", function() {
        console.log($("select[name='instrument']").val());
    });

    let dataRange = $("input[name='get_firedata']");
    dataRange.change('input', function(){
        for(let i = 0; i < dataRange.length; i++){
            if(dataRange[i].checked){
                dataRange[i].checked = "true";
                // area = dataRange[i].value; /*reassign area value*/
                // console.log(dataRange[i]);
            }
        }
    });
    $("input[name='date']").on("input", function(){
        console.log($("input[name='date']").val());
    })
    $("select[name='range']").on('input', function(){
        console.log($("select[name='range']").val());
    });

    /* Call to display the default map */
    

    /* Focus on the PH map */
    let focusPhMap = () => {
        latitude = 12.104372 
        longitude = 122.870847
        zoom = 5;
       
        map.setView([latitude, longitude], zoom);

        $.get("/firedata", function(dataString){
            getFireData(dataString);
        }, 'json');
    }
    /* Focus on the Cavite map */
    let focusImusMap = () => {
        latitude = 14.399411;
        longitude = 120.945548;
        zoom = 13;

        map.setView([latitude, longitude], zoom);
        // settingUpMap();
    }

    /* Watch if radio button changes */
    let fireDataArea = $("input[name='area']");
    fireDataArea.change('input', function(){
        for(let i = 0; i < fireDataArea.length; i++){
            if(fireDataArea[i].checked){
                fireDataArea[i].checked = "true";
                area = fireDataArea[i].value; /*reassign area value*/
            }
        }
        if(area === "ph_firedata"){
            focusPhMap();
        }
        if(area === "cavite_firedata"){
            focusImusMap();
        }
    })
    
    /* Add fire icon on the map */
    let addMark = () => {
        console.log(fireDataPh)
        var fireIcon = L.icon({
            iconUrl: '/images/fire.svg',
            iconSize: [40, 40], /* Size of the icon */
            iconAnchor: [20, 40], /* Point of the icon which will correspond to marker's location */
        });
        for(let i = 0; i < fireDataPh.length; i++){
            let latitude = parseFloat(fireDataPh[i].latitude);
            let longitude = parseFloat(fireDataPh[i].longitude);
            let brightness = parseFloat(fireDataPh[i].brightness);
            let confidence = parseFloat(fireDataPh[i].confidence);
            let instrument = fireDataPh[i].instrument;

            let marker = L.marker([latitude, longitude], {icon: fireIcon}).addTo(map);
            let information = "Latitude: " + latitude +
                            "<br>Longitude: " + longitude +
                            "<br>Brightness: " + brightness +
                            "<br>Confidence: " + confidence +
                            "<br>Instrument: " + instrument;

            marker.bindPopup(information);
        }
    }
    /* Convert JSON string into JavaScript Object and push to the array */
    let getFireData = (dataString) => {
        const rows = dataString.split('\n');
        const keys = rows[0].split(',');

        for(let i = 1; i < rows.length; i++){
            const values = rows[i].split(',');
            const obj = {};
            let validObject = true;
            for(let j = 0; j < keys.length; j++) {
                /* Check if the value is undefined */
                if (values[j] === undefined) {
                    validObject = false;
                    break;
                }
                obj[keys[j]] = values[j];
            }
            /* If valid push to the array */
            if(validObject) {
                fireDataPh.push(obj);
            }
        }
        addMark();
    }
    // /* Get PH fire data */

    /* Get the firedata in the inside the four direction points */
    // let getImusFireData = () => {
    //     /* Assign the center of the Imus City*/
    //     latitude = 14.399411;
    //     longitude = 120.945548;
        
    //     /* Kawit, Bacoor (North West Point) - coordinates < 14.440432 AND coordinates > 120.903751 */ 
    //     const northWestLatitude = 14.440432;
    //     const northwestLongitude = 120.903751;
    //     /* San Nicolas I, Bacoor (North East Point) - coordinates < 14.440432 AND coordinates < 120.969294 */
    //     const northEastLatitude = 14.440432;
    //     const northEastLongitude = 120.969294;
    //     /* Santiago, GenTri (South West Point) - coordinates > 14.344069 AND coordinates > 120.903751 */
    //     const southWestLatitude = 14.344069;
    //     const southWestLongitude = 120.903751;
    //     /* Salawag, Dasma (South East Point) - coordinates > 14.344069 AND coordinates < 120.969294 */
    //     const southEastLatitude =  14.344069;
    //     const southEastLongitude = 120.969294;

    //     // 14.443423,120.917212

    //     for(let i = 0; i < fireDataPh.length; i++){
    //         let latitudeLocation = parseFloat(fireDataPh[i].latitude);
    //         let longitudeLocation = parseFloat(fireDataPh[i].longitude);

    //         if( (latitudeLocation < northWestLatitude && longitudeLocation > northwestLongitude) &&
    //             (latitudeLocation < northEastLatitude && longitudeLocation < northEastLongitude) &&
    //             (latitudeLocation > southWestLatitude && longitudeLocation > southWestLongitude) &&
    //             (latitudeLocation > southEastLatitude && longitudeLocation < southEastLongitude)){
    //                 imusFireData.push(fireDataPh[i]);
    //         }
    //     }
    //     addMark();
    // }
    
    // let addMark = () => {
    //     var fireIcon = L.icon({
    //         iconUrl: '/images/fire.svg',
    //         iconSize: [40, 40], // Size of the icon
    //         iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
    //     });
    //     for(let i = 0; i < imusFireData.length; i++){
    //         let latitude = parseFloat(imusFireData[i].latitude);
    //         let longitude = parseFloat(imusFireData[i].longitude);
    //         let brightness = parseFloat(imusFireData[i].brightness);
    //         let confidence = parseFloat(imusFireData[i].confidence);
    //         let instrument = imusFireData[i].instrument;

    //         let marker = L.marker([latitude, longitude], {icon: fireIcon}).addTo(map);
    //         let information = "Latitude: " + latitude +
    //                         "<br>Longitude: " + longitude +
    //                         "<br>Brightness: " + brightness +
    //                         "<br>Confidence: " + confidence +
    //                         "<br>Instrument: " + instrument;

    //         marker.bindPopup(information);
    //     }
    // }
})