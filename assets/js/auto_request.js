$(document).ready(function(){

    let autoRequest = setInterval(function(){
        $.ajax({
            url: "/request",
            type: "GET",
            success: function(response){
                console.log("Running... Auto-Requesting fire data from FIRMS");
                if(response){
                    // location.reload();
                }
            },
            error: function(error){
                console.error(error);
                if(error){
                    clearInterval(autoRequest);
                }
            }
        });
        // console.log("Running... Auto-Requesting fire data from FIRMS");
    }, 60000);
});