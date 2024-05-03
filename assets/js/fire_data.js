    // let boundary;
    let lgu = "Imus";

    /* Center of the map */
    let latitude = 14.399411;
    let longitude = 120.945548;
    let zoom = 13;

    let map = L.map('map').setView([latitude, longitude], zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    console.log(lguBoundary)
    L.geoJson(lguBoundary, {
        style: {
            fill: false, // Disable fill color
            color: 'red', // Border color
            weight: 2,    // Border thickness
            opacity: 0.8  // Border opacity
        }
    }).addTo(map);
    
    // control that shows state info on hover
    let info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>Imus Fire Assessment</h4>' +  (props ? 
            '<b>' + props.name + '</b><br/>' + props.tags.population
            : 'Hover over a barangay');
    };

    info.addTo(map);
    
    function getColor(d) {
        return  d > 25000  ? '#BD0026' :
                d > 15000  ? '#E31A1C' :
                d > 10000  ? '#FC4E2A' :
                d > 5000   ? '#FD8D3C' :
                d > 3000   ? '#FEB24C' :
                d > 1000   ? '#FED976' :
                           '#FFEDA0';
    }
    function style(feature) {
        return {
            fillColor: getColor(feature.properties.tags.population),
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
    
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
    
        layer.bringToFront();
        info.update(layer.feature.properties);
    }
    
    /* Add the boundary GeoJSON data as a GeoJSON layer to the map */
    let geojson = L.geoJson(imusBarangays, {
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


    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [20000, 15000, 10000],
            labels = ["High Risk", "Moderate Risk", "Low Risk"];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i]) + '"></i> ' +
                labels[i] + "<br/>";
        }

        return div;
    };

    legend.addTo(map);
