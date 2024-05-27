$(document).ready(function(){

    /* 
    * Set interval to automatically request fire data from FIRMS API
    */
    setInterval(function(){
       
    }, 2400);

    let convertToTime = (time) => {
        let timeStr = time.toString();
        let hour = timeStr.slice(0, 2);
        let minute = timeStr.slice(2, 4);
        return `${hour}:${minute}`;
    }

    let addTableRow = (response) => {
        if($(".row-content")[0] !== undefined){
            $(".row-content").remove();
        }

        for(let i = 0; i < response.length; i++){
            let row = document.createElement("tr");
            row.className = "row-content";

            let lgu = document.createElement("td");
            lgu.textContent = response[i].name_of_place;
            
            let lat = document.createElement("td");
            lat.textContent = response[i].latitude;

            let long = document.createElement("td");
            long.textContent = response[i].longitude;

            let acquiredDate = document.createElement("td");
            acquiredDate.textContent = response[i].acq_date;

            let acquiredTime = document.createElement("td");
            acquiredTime.textContent = convertToTime(response[i].acq_time);

            let instrument = document.createElement("td");
            instrument.textContent = response[i].instrument;

            let confidence = document.createElement("td");
            confidence.textContent = response[i].confidence;

            row.append(lgu);
            row.append(lat);
            row.append(long);
            row.append(acquiredDate);
            row.append(acquiredTime);
            row.append(instrument);
            row.append(confidence);

            $(".table-content").append(row);
        }
    }

    let retrieveFireData = () => {
    
        let municipalityCity = $("select[name='municipality_city']").val();
        let instrument = $("select[name='instrument']").val();
        let year = $("select[name='year']").val();
        let confidence = $("input[name='confidence']").val();

        $.ajax({
            url: "/retrieve_firedata",
            type: "POST",
            data: { municipalityCity, instrument, year, confidence },
            success: function(response){
                addTableRow(response);
            },
            error: function(error){
                console.error(error);
            }
        });
    }
    retrieveFireData();
    /* Update table every time the form changed */
    $("input[type='date']").change(function(){
        retrieveFireData();
    });
    $("input[type='number']").on('input', function(){
        /* if the text field is empty or blank should 0 */
        retrieveFireData();
    });
    $("select").change(function(){
        retrieveFireData();
    });

    /* retrieve map key status */
    let checkMapKey = () => {
        $.ajax({
            url: "/check_mapkey",
            type: "GET",
            success: function(response){
                $(".transaction_limit").text(response.transaction_limit);
                $(".current_transactions").text(response.current_transactions);
                $(".transaction_interval").text(response.transaction_interval);
                $(".map_key").text(response.mapKey);

                $("input[name='map-key']").val(response.mapKey);
            },
            error: function(error){
                console.error(error);
            }
        })
    }
    checkMapKey();

    $("#openStatus").click(function(e){
        e.preventDefault();
        $(".modalBackground").css({
            "display": "block"
        })
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        $("#date").val(today);
    });
    $("#btnClose").click(function(e){
        e.preventDefault();
        $(".modalBackground").css({
            "display": "none"
        })
    });


    /*
    * Request fire data from FIRMS API
    */
   $("#btnRequest").click(function(){
        const mapKey = $("input[name='map-key']").val();
        const date = $("input[name='date']").val();
        const range = $("input[name='range']").val();
        const instrument = $('#satellite_data').val();

        // let endPoint = `/${mapKey}/${instrument}/PHL/${range}/${date}`;
        
        $.ajax({
            url: "/request",
            type: "POST",
            data: { mapKey: mapKey, date: date, range: range, instrument: instrument },
            success: function(response){
               
            },
            error: function(error){
                console.error(error);
            }
        })
        location.reload();
   })
});