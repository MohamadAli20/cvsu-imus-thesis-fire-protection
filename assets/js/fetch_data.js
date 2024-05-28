$(document).ready(function(){

    // setInterval(function(){
        $.ajax({
            url: "/api/fire_monitor",
            type: "GET",
            success: function(response){
                console.log(response);
            },
            error: function(error){
                console.error(error);
            }
        })
    // }, 3000);


    // $.

})