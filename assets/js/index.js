$(document).ready(async function(){

    let coordinatesBoundary;
    let boundaryPath = "lgu/Imus";

    /*
    * Draw the boundary of selected LGU and Barangay
    */

    /* LGU Boundary (By Default it is set to Imus) */
    async function fetchLGUBoundary() {
        try{
            const res = await fetch(`../geo_json/${boundaryPath}.geojson`);
            // const res = await fetch(`../geo_json/cavite/cavite.geojson`);
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

    /* Coordinates of Cavite and center */
    // let latitude = 14.269827;
    // let longitude = 120.852260;
    // let zoom = 10;

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

    /* Add Fire Station Marker on the map*/
    let stationIcon = L.icon({
        iconUrl: '/images/firetruck.svg',
        iconSize: [30, 30], /* Size of the icon */
        iconAnchor: [20, 40], /* Point of the icon which will correspond to marker's location */
    });
    // Imus
    L.marker([14.423045833800078, 120.9415753715421], {icon: stationIcon}).addTo(map);
    L.marker([14.428671953873291, 120.9459966654402], {icon: stationIcon}).addTo(map);
    // Bacoor
    L.marker([14.459627000308023, 120.957817102018], {icon: stationIcon}).addTo(map);    
    L.marker([14.430587099443615, 120.96835547055544], {icon: stationIcon}).addTo(map);    
    // Dasma
    L.marker([14.322265366122872, 120.94415801816322], {icon: stationIcon}).addTo(map);
    L.marker([14.290882235736571, 120.93304548032707], {icon: stationIcon}).addTo(map);
    // General Trias
    L.marker([14.38674955268442, 120.88018412755886], {icon: stationIcon}).addTo(map);

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
            url: `/api/fire_monitor`,
            type: "GET",
            success: function(response){
                getFireData(response);
                // console.log(response)
            },
            error: function(xhr, status, error){
                console.error(error);
            }
        })
    }
    setInterval(function(){
        sendRequest();
    }, 5000);
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
        boundaryPath = "lgu/"+$("select[name='city']").val();
        
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
    let focusCaviteMap = async () => {
        boundaryPath = "cavite/cavite";
        
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

    }
    /* 
    * Focus on the Cavite map
    */
    let focusImusMap = async () => {
        boundaryPath = "lgu/Imus";
        
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
            focusCaviteMap();
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
        fireDataPh = dataString; /* Clear fire data */
        // fireDataPh = []; /*for testing*/
        // [{"id":444,"latitude":14.36718,"longitude":120.93541,"name_of_place":"Imus","acq_date":"2024-05-28","acq_time":"0544","track":0.53,"brightness":334.56,"satellite":"N","instrument":"VIIRS","confidence":0,"daynight":"D","version":"2.0NRT","bright_t31":299.26,"scan":0.61,"frp":3.89,"created_at":"2024-05-26T08:51:49.000Z","updated_at":null,"time_ago_since_detected":20,"risk_level":"high","low_risk_threshold":9,"moderate_risk_threshold":50.5,"high_risk_threshold":108.5}]
        // console.log(JSON.stringify(dataString))
        $(".fire-details").empty();
        if(fireDataPh.length > 0){
            for(let i = 0; i < dataString.length; i++){
                // console.log(dataString[i].name_of_place)
            
                let div = document.createElement("div");
                div.className = "detect-fire";

                let lgu = document.createElement("p");
                lgu.textContent = "Location: " + dataString[i].name_of_place;
                
                let riskLevel = document.createElement("p");
                riskLevel.textContent  = "Risk level: " + dataString[i].risk_level;

                let instrument = document.createElement("p");
                instrument.textContent  = "Instrument: " + dataString[i].instrument;

                let time = document.createElement("p");
                time.textContent = "Detected " + dataString[i].time_ago_since_detected + " hours ago";

                div.append(lgu);
                div.append(riskLevel);
                div.append(instrument);
                div.append(time);

                $(".fire-details").append(div);
            }
        }
        else{
            let noData = document.createElement("p");
            noData.className = "no-data-label"
            noData.textContent  = "No fire data available";
            $(".fire-details").append(noData);

        }
        addMark();
    }

    /* Check if coordinates (longitude, latitude) is inside the boundary polygon */
    var pt = turf.point([120.898896, 14.395086]);
    var poly = turf.polygon(coordinatesBoundary.geometry.coordinates);

    let result = turf.booleanPointInPolygon(pt, poly);
    // console.log(result);


})