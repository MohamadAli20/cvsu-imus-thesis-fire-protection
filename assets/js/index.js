$(document).ready(async function(){

    let coordinatesBoundary;
    let lgu = "Imus";

    /*
    * Draw the boundary of selected LGU and Barangay
    */

    /* LGU Boundary (By Default it is set to Imus) */
    async function fetchLGUBoundary() {
        try{
            const res = await fetch(`../geo_json/lgu/${lgu}.geojson`);
            if(!res.ok){
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            coordinatesBoundary = await res.json();
        }
        catch (error) {
            console.error("Unable to fetch data:", error);
        }
    }
    await fetchLGUBoundary(); /* Wait for fetchJSONData to complete before proceeding */
    
    /* Get date today */
    let currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1 < 10) ? '0' + (currentDate.getMonth() + 1) : currentDate.getMonth() + 1;
    const day = (currentDate.getDate() < 10) ? '0' + currentDate.getDate() : currentDate.getDate();

    currentDate = `${year}-${month}-${day}`;

    /* Fire Data */
    let fireDataPh = [];
    let imusFireData = [];

    /* Center of the map */
    let latitude = 14.399411;
    let longitude = 120.945548;
    let zoom = 13;

    let area = "cavite_firedata";
    
    /* Default requestion information */
    let instrument = "VIIRS_NOAA21_NRT";
    let date = currentDate;
    let range = 1;
    
    /*
    * Initialize the map
    * Set the default view and zoom level
    */

    let map = L.map('map').setView([latitude, longitude], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    /* Add the boundary GeoJSON data as a GeoJSON layer to the map */
    let boundary = L.geoJSON(coordinatesBoundary, {
        style: {
            fill: false, // Disable fill color
            color: 'red', // Border color
            weight: 2,    // Border thickness
            opacity: 0.8  // Border opacity
        }
    }).addTo(map);

    let sendRequest = () => {
        $.ajax({
            url: `/${instrument}/${date}/${range}`,
            type: "GET",
            success: function(response){
                getFireData(response);
            },
            error: function(xhr, status, error){
                console.error(error);
            }
        })
    }
    sendRequest();
    
    /* 
    * Watch the instrument, date and range changes
    * Reassignt the variables if changed
    */
    $("select[name='instrument']").on("input", function(){ /* Instrument */
        instrument = $("select[name='instrument']").val();
        sendRequest();
    });
    $("input[name='date']").on("input", function(){ /* Date */
        date = $("input[name='date']").val();
        sendRequest();
    })
    $("select[name='range']").on("input", function(){ /* Range */
        range = $("select[name='range']").val();
        sendRequest();
    });
    $("select[name='city']").on("input", async function(){
        lgu = $("select[name='city']").val();
        
        await fetchLGUBoundary();

        map.setView(coordinatesBoundary.center, coordinatesBoundary.zoom)
        map.removeLayer(boundary);
        boundary = L.geoJSON(coordinatesBoundary, {
            style: {
                fill: false, // Disable fill color
                color: 'red', // Border color
                weight: 2,    // Border thickness
                opacity: 0.8  // Border opacity
            }
        }).addTo(map);
        // console.log(lgu);
    });
    
    /*
    * Focus on the PH map
    */
    let focusPhMap = () => {
        latitude = 12.104372 
        longitude = 122.870847
        zoom = 5;
        width = 20;
        height = 20;
        
        map.setView([latitude, longitude], zoom); /* Zoom out to show the whole map of the Philippines */
        map.removeLayer(boundary); /* Remove the boundary */
    }
    /* 
    * Focus on the Cavite map
    */
    let focusImusMap = () => {
        latitude = 14.399411;
        longitude = 120.945548;
        zoom = 13;

        map.setView([latitude, longitude], zoom); /* Zoom in to show the map of the Imus City */
        // Add the boundary GeoJSON data as a GeoJSON layer to the map
        boundary.addTo(map);
    }

    /* 
    * Watch if radio button changes 
    */
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

    let time = $("input[name='get_firedata']");
    time.change('input', function(){
        let selectedDate = "today";
        for(let i = 0; i < time.length; i++){
            if(time[i].checked){
                time[i].checked = "true";
                selectedDate = $(time[i]).val();
            }
        }
        if(selectedDate === "today"){
            $("input[name='date']").css("opacity", "0.5");
        }
        if(selectedDate === "by_range"){
            $("input[name='date']").css("opacity", "1");
        }
    })
    
    /* Define active fire icon */
    let fireIcon = L.icon({
        iconUrl: '/images/fire.svg',
        iconSize: [40, 40], /* Size of the icon */
        iconAnchor: [20, 40], /* Point of the icon which will correspond to marker's location */
    });
    /* Define non-active fire icon */
    let nonActiveFire = L.icon({
        iconUrl: '/images/non_active_fire.svg',
        iconSize: [40, 40], /* Size of the icon */
        iconAnchor: [20, 40], /* Point of the icon which will correspond to marker's location */
    });

    function changeMarkerIcon(index, status) {
        let marker = fireMarkers[index];
        if (status === 'resolved') {
            marker.setIcon(nonActiveFire);
        } else if (status === 'active') {
            marker.setIcon(fireIcon);
        }
    }
    
    /* Define an array to store markers */
    let fireMarkers = [];

    /* Add fire icon on the map */
    let addMark = () => {
        /* Remove existing fire markers from the map */
        for (let i = 0; i < fireMarkers.length; i++) {
            map.removeLayer(fireMarkers[i]);
        }
        /* Clear the array */
        fireMarkers = [];

        for (let i = 0; i < fireDataPh.length; i++) {
            let latitude = parseFloat(fireDataPh[i].latitude);
            let longitude = parseFloat(fireDataPh[i].longitude);
            let brightness = parseFloat(fireDataPh[i].brightness);
            let confidence = parseFloat(fireDataPh[i].confidence);
            let satellite = fireDataPh[i].satellite;
            let instrument = fireDataPh[i].instrument;
            let date = fireDataPh[i].acq_date;

            let marker = L.marker([latitude, longitude], { icon: fireIcon }).addTo(map);
            let information = 
                "Latitude: " + latitude +
                "<br>Longitude: " + longitude +
                "<br>Brightness: " + brightness +
                "<br>Confidence: " + confidence +
                "<br>Instrument: " + instrument +
                "<br>Satellite:" + satellite +
                "<br>Acquired Date: " + date;

            marker.bindPopup(information);
    
            /* Add click event to each marker */
            // marker.on('click', function() {
            //     /* Change the icon to water icon */
            //     marker.setIcon(nonActiveFire);
            //     // alert("Change the icon");
            // });

            /* Add the marker to the array */
            fireMarkers.push(marker);
        }
    }
    
    /* Convert JSON string into JavaScript Object and push to the array */
    let getFireData = (dataString) => {
        fireDataPh = []; /* Clear fire data */
        
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
        // console.log(fireDataPh);
        addMark();
    }

    /* Check if coordinates (longitude, latitude) is inside the boundary polygon */
    var pt = turf.point([120.898896, 14.395086]);
    var poly = turf.polygon(coordinatesBoundary.geometry.coordinates);

    let result = turf.booleanPointInPolygon(pt, poly);
    console.log(result);


    /* Get PH fire data */

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