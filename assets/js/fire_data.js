$(document).ready( async function(){
    
    let coordinatesBoundary;

    /* Cavite Boundary */
    async function fetchCaviteBoundary() {
        try{
            const res = await fetch(`../geo_json/cavite/cavite.geojson`);
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
    await fetchCaviteBoundary(); /* Wait for fetchJSONData to complete before proceeding */

    /* Center of the map */
    let latitude = coordinatesBoundary.center[0];
    let longitude = coordinatesBoundary.center[1];
    let zoom = coordinatesBoundary.zoom;

    let map = L.map('map').setView([latitude, longitude], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    L.geoJson(coordinatesBoundary, {
        style: {
            fill: false, // Disable fill color
            color: 'red', // Border color
            weight: 2,    // Border thickness
            opacity: 0.8  // Border opacity
        }
    }).addTo(map);

    let low;
    let moderate;
    let high;
    $.ajax({
        url: "/api/fire_risk_level",
        type: "GET",
        success: async function(response){
            low = response[0].low_risk_threshold;
            moderate = response[0].moderate_risk_threshold;
            high = response[0].high_risk_threshold;
            // console.log(response)
            let getColor = (d) => {
                return  d > high  ? '#BD0026' :
                        d > moderate  ? '#E31A1C' :
                        d > low ? '#FC4E2A' :
                                '#FFEDA0';
            }
            let legend = L.control({position: 'bottomright'});

            legend.onAdd = function (map) {

                var div = L.DomUtil.create('div', 'info legend'),
                    grades = [low, moderate, high],
                    labels = ["Low Risk", "Moderate Risk", "High Risk"];

                // loop through our density intervals and generate a label with a colored square for each interval
                for (var i = 0; i < grades.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + getColor(grades[i]) + '"></i> ' +
                        labels[i] + "<br/>";
                }

                return div;
            };

            legend.addTo(map);

            let lguBoundary = {
                "type": "FeatureCollection",
                "features": []
            }

            let lgu = ["Alfonso","Amadeo","Bacoor","Carmona","Cavite City","Dasmarinas","General Emilio Aguinaldo","General Mariano Alvarez","General Trias","Imus","Indang","Kawit","Magallanes","Maragondon","Mendez","Naic","Noveleta","Rosario","Silang","Tagaytay","Tanza","Ternate","Trece Martires"];
            // let lguBoundary = [];
            async function fetchLguBoundary(lgu) {
                try{
                    const res = await fetch(`../geo_json/lgu/${lgu}.geojson`);
                    // const res = await fetch(`../geo_json/cavite/cavite.geojson`);
                    if(!res.ok){
                        throw new Error(`HTTP error! Status: ${res.status}`);
                    }
                    lguBoundary.features.push(await res.json());
                }
                catch (error) {
                    console.error("Unable to fetch data:", error);
                }
            }
            for(let i = 0; i < lgu.length; i++){
                await fetchLguBoundary(lgu[i]); /* Wait for fetchJSONData to complete before proceeding */
            }
            // console.log(coordinatesBoundary)
            //  console.log(lguBoundary)
            for (let j = 0; j < lguBoundary.features.length; j++) {
                let found = false;
                for (let k = 0; k < response.length; k++) {
                    if (lguBoundary.features[j].name === response[k].lgu) {
                        lguBoundary.features[j]['frequency'] = response[k].frequency;
                        lguBoundary.features[j]['risk_level'] = response[k].risk_level;
                        found = true;
                        break; // Once found, no need to continue searching
                    }
                }
                if (!found) {
                    lguBoundary.features[j]['frequency'] = 0;
                    lguBoundary.features[j]['risk_level'] = "low";
                }
            }
            // console.log(lguBoundary)

            let info = L.control();

            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                this.update();
                return this._div;
            };

            // method that we will use to update the control based on feature properties passed
            info.update = function (props) {
                this._div.innerHTML = '<h4>Cavite Fire Assessment</h4>' + 
                                    (props ? 
                                    '<b> LGU: ' + props.name + '</b><br/>' + 
                                    'Risk level: '+ props.risk_level + '<br/>' 
                                    : 'Hover over a LGU');
            };
            info.addTo(map);
            
            function style(feature) {
                // console.log(feature)
                return {
                    fillColor: getColor(feature.frequency),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }
            /* Interaction with the map */
            function highlightFeature(e) {
                var layer = e.target;
                
                // console.log(layer)
                layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });
            
                layer.bringToFront();
                info.update(layer.feature);
            }
            
            /* Add the boundary GeoJSON data as a GeoJSON layer to the map */
            let geojson = L.geoJson(lguBoundary, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);

            function resetHighlight(e) {
                geojson.resetStyle(e.target);
                info.update();
            }

            function zoomToFeature(e) {
                map.fitBounds(e.target.getBounds());
            }

            /* onEachFeature option to add the listeners to state layers */
            function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: zoomToFeature
                });
            }

            map.attributionControl.addAttribution('Fire data &copy; <a href="https://firms.modaps.eosdis.nasa.gov/">NASA FIRMS</a>');
        },
        error: function(error){
            console.error(error);
        }
    });
    
    
});