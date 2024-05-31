$(document).ready(function(){
    let isOpen = false;
    $(".navbar-toggler").click(function() {
        if(isOpen === false){
            $("#map").css("z-index", "-1");
            isOpen = true;
        }
        else{
            setTimeout(function(){
                $("#map").css("z-index", "0");
                isOpen = false;
            }, 1000);
        }
    });
    
});