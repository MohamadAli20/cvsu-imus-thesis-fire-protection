$(document).ready(function(){

    /*
    * Can notify when a fire is detected in near real time.
    * Display how many hours ago the fire was detected.
    * Can calculate the risk level of a LGU based on historical data, considering the square kilometers of the barangay.
    * Can calculate how far the fire incident is from the fire station.
    */

    function convertTime(time) {
        // Convert the time to a string in case it is passed as a number
        time = time.toString();
    
        // Ensure the time string is 4 characters long
        while (time.length < 4) {
            time = '0' + time;
        }
    
        // Extract the hours and minutes
        let hours = time.slice(0, 2);
        let minutes = time.slice(2, 4);
    
        // Format the time as HH:MM
        return `${hours}:${minutes}`;
    }
    
    // Example usage
    // let time = 0453;
    // let formattedTime = convertTime(time);
    // console.log(formattedTime); // Output: "04:53"
    
    let checkHoursAgo = (firedata) => {
        // let now = new Date();
        // console.log(now);
        
        /* For testing */
        let nowString = "Tue May 24 2024 19:05:26 GMT+0800 (Singapore Standard Time)";
        let now = new Date(nowString);

        for(let i = 0; i < firedata.length; i++){
            let time = convertTime(firedata[i].acq_time)            
            let date = firedata[i].acq_date
            
            let dateTimeString = `${date}T${time}:00`;

            // Convert the dateTimeString to a Date object
            let fireDateTime = new Date(dateTimeString);

            // Calculate the difference in hours between the current time and the fire incident time
            let hoursDifference = (now - fireDateTime) / (1000 * 60 * 60);

            console.log("Shdshd")
            // Check if the difference is within 24 hours
            if (hoursDifference <= 24 && hoursDifference >= 1) {
                console.log(`Fire detected ${hoursDifference.toFixed(2)} hours ago`);
            }
        }
    }

    // let attempt = 0;
    let fetchData = setInterval(function(){

        /* 
        * Real time monitoring of fire data
        * Fetch fire data every 5 seconds from year 2024
        * */ 
        $.ajax({
            url: "/api/2024",
            type: "GET",
            success: function(response){
                // console.log(response);
                checkHoursAgo(response);
            },
            error: function(error){
                console.error(error);
            }
        })

        /* For testing */
        // attempt++;
        // if(attempt === 1){
        //     clearInterval(fetchData)
        // }

    }, 5000);

})