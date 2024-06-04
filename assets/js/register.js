$(document).ready(function(){
    
    $("#btn-register").click(function(){
        const username = $("input[name='register_username']").val();
        const email = $("input[name='register_email']").val();
        const code = $("input[name='code']").val();
        const password = $("input[name='register_password']").val();
        const confirmPasssword = $("input[name='register_confirm_password']").val();

        $.ajax({
            url: "/account_register",
            type: "POST",
            data: { username: username, email: email, code: code, password: password, confirmPassword: confirmPasssword },
            success: function(response){
                $(".register-alert-container").remove();
                if(response.length > 0){
                    let alertContainer = document.createElement("div");
                    alertContainer.className = "col-lg-5 register-alert-container vibrate";
                    for(let i = 0; i < response.length; i++){
                        let pAlert = document.createElement("p");
                        pAlert.style.border = "2px solid #FFD800";
                        pAlert.style.padding = "5px 0"; 
                        pAlert.style.textAlign = "center";
                        pAlert.style.color = "#FFD800"
                        pAlert.textContent = response[i];
                        alertContainer.append(pAlert);
                    }
                    $(".form-container").prepend(alertContainer);
                }
                else{
                    let successContainer = document.createElement("div");
                    successContainer.className = "col-lg-5 register-alert-container";
                    let pSuccess = document.createElement("p");
                    pSuccess.style.border = "2px solid #22bb33";
                    pSuccess.style.padding = "5px 0"; 
                    pSuccess.style.textAlign = "center";
                    pSuccess.style.color = "#22bb33"
                    pSuccess.textContent = "Successfully registered";
                    successContainer.append(pSuccess);
                    $(".form-container").prepend(successContainer);
                
                    // clear
                    $("input[name='register_username']").val("");
                    $("input[name='register_email']").val("");
                    $("input[name='code']").val("");
                    $("input[name='register_password']").val("");
                    $("input[name='register_confirm_password']").val("");
                }
            },
            error: function(error){
                console.error(error);
            }
        });
    });
})