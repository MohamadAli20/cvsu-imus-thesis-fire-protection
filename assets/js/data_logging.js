$(document).ready(function(){

    let convertToTime = (time) => {
        let timeStr = time.toString().padStart(4, '0');
        let hours = timeStr.slice(0, 2);
        let minutes = timeStr.slice(2);
        return `${hours}:${minutes}`;
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
                for(let i = 0; i < response.length; i++){
                    if(response[i].current_transactions < 500){
                        // console.log(response[i]);
                        $(".transaction_limit").text(response[i].transaction_limit);
                        $(".current_transactions").text(response[i].current_transactions);
                        $(".transaction_interval").text(response[i].transaction_interval);
                        $(".map_key").text(response[i].mapKey);

                        $("input[name='map-key']").val(response[i].mapKey);
                        break;
                    }
                }
            },
            error: function(error){
                console.error(error);
            }
        })
    }
    checkMapKey();

    /*
    * Manual Request fire data from FIRMS API
    */
    $("#btn-request").click(function(){
        console.log("Manual requesting fire data from FIRMS.");
        const mapkey = $("input[name='mapkey']").val();
        const date = $("input[name='date']").val();
        const range = $("input[name='range']").val();

        $(".alert-container").remove();
        let alertContainer = document.createElement("div");
        alertContainer.className = "col-lg-12 alert-container vibrate";

        let pLoading = document.createElement("p");
        pLoading.className = "loading d-flex justify-content-center align-items-center";
        pLoading.style.border = "2px solid #FFD800";
        pLoading.style.padding = "5px 0"; 
        pLoading.style.textAlign = "center";
        pLoading.style.color = "#FFD800"
        pLoading.textContent = "Loading . . . ";

        let divSpinner = document.createElement("div");
        divSpinner.className = "spinner-border";
        divSpinner.setAttribute("role", "status");

        let spanSpinner = document.createElement("span");
        spanSpinner.className = "sr-only";
        divSpinner.append(spanSpinner);
        pLoading.append(divSpinner);
        alertContainer.append(pLoading)
        // alertContainer.append(divSpinner);
        $(".modal-dialog").prepend(alertContainer);
        $.ajax({
            url: "/request",
            type: "POST",
            data: { mapkey: mapkey, date: date, range: range },
            success: function(response){
                
                let alertContainer = document.createElement("div");
                alertContainer.className = "col-lg-12 alert-container vibrate";

                if(response.length > 0){
                    $(".loading").remove();
                    let pAlert = document.createElement("p");
                    pAlert.style.border = "2px solid #FFD800";
                    pAlert.style.padding = "5px 0"; 
                    pAlert.style.textAlign = "center";
                    pAlert.style.color = "#FFD800"
                    pAlert.textContent = "Data Available"
                    alertContainer.append(pAlert);
                    $(".modal-dialog").prepend(alertContainer);
                }
                else{
                    $(".loading").remove();
                    let pAlert = document.createElement("p");
                    pAlert.style.border = "2px solid #FFD800";
                    pAlert.style.padding = "5px 0"; 
                    pAlert.style.textAlign = "center";
                    pAlert.style.color = "#FFD800"
                    pAlert.textContent = "No Data Available"
                    alertContainer.append(pAlert);
                    $(".modal-dialog").prepend(alertContainer);
                }
                // location.reload();
            },
            error: function(error){
                console.error(error);
            }
        });
        
    });
    
});