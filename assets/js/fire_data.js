$(document).ready(async function(){
    
    let coordinatesBoundary;
    let lgu = "Imus";

    /* Draw the boundary of selected LGU and Barangay */

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
    
    /* Center of the map */
    let latitude = 14.399411;
    let longitude = 120.945548;
    let zoom = 13;

    let map = L.map('map').setView([latitude, longitude], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    /* Add the boundary GeoJSON data as a GeoJSON layer to the map */
    let geojson = L.geoJSON(coordinatesBoundary, {
        style: {
            fill: false, // Disable fill color
            color: 'red', // Border color
            weight: 2,    // Border thickness
            opacity: 0.8  // Border opacity
        }
    }).addTo(map);

    function getColor(d) {
        return d === "High risk" ? '#800026' :
               d === "Moderate risk"  ? '#FC4E2A' :
                          '#FFEDA0';
    }

    function style(feature) {
        return {
            fillColor: getColor(10),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }
    
    L.geoJson(coordinatesBoundary, {style: style}).addTo(map);

    /* Interact with map */
    function highlightFeature(e) {
        var layer = e.target;
    
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
    
        layer.bringToFront();
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }
    
    geojson = L.geoJson(coordinatesBoundary, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>Cavite Fire Assessment</h4>' +  (props ?
            '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
            : 'Hover over a state');
    };

    info.addTo(map);

    function highlightFeature(e) {
        // ...
        info.update(lgu);
    }
    
    function resetHighlight(e) {
        // ...
        info.update();
    }

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = ["High risk", "Moderate risk", "Low risk"],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i]) + '"></i> ' +
                grades[i] + "<br/>";
        }

        return div;
    };

    legend.addTo(map);

})