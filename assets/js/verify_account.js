$(document).ready(function(){
    $("#btn-login").click(function(){
        const username = $("input[name='username']").val();
        const password = $("input[name='password']").val();
        $.ajax({
            url: "/account_login",
            type: "POST",
            data: { username: username, password: password },
            success: function(response){
                $(".register-alert-container").remove();
                $(".alert-container").remove();
                if(response.length > 0){
                    let alertContainer = document.createElement("div");
                    alertContainer.className = "col-lg-12 alert-container vibrate";
                    for(let i = 0; i < response.length; i++){
                        let pAlert = document.createElement("p");
                        pAlert.style.border = "2px solid #FFD800";
                        pAlert.style.padding = "5px 0"; 
                        pAlert.style.textAlign = "center";
                        pAlert.style.color = "#FFD800"
                        pAlert.textContent = response[i];
                        alertContainer.append(pAlert);
                    }
                    $(".modal-dialog").prepend(alertContainer);
                }
                else{
                    localStorage.setItem("username", response.username);
                    location.reload();
                }
            },
            error: function(error){
                console.error(error);
            }
        })
    })
    
})