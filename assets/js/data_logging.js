$(document).ready(function(){

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
                console.log(response);
                addTableRow(response);
            },
            error: function(error){
                console.error(error);
            }
        });
    }
    retrieveFireData();
    $("input[type='date']").change(function(){
        // console.log($(this).val());
        retrieveFireData();
    });
    $("input[type='number']").on('input', function(){
        /* if the text field is empty or blank should 0 */
        // console.log($(this).val());
        retrieveFireData();
    });
    $("select").change(function(){
        // console.log($(this).val());
        retrieveFireData();
    })

});