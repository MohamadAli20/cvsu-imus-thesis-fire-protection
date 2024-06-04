$(document).ready(function(){
    let isLoggedIn = localStorage.getItem("username");
    if(isLoggedIn){
        $(".btn-login a").css("display", "none");
        $("#openStatus").css("display", "block");
        let pName = document.createElement("p");
        pName.className = "nav-link m-0 d-inline-block p-username";
        pName.textContent = isLoggedIn;

        let btnLogout = document.createElement("span");
        btnLogout.className = "d-inline-block btn-logout"
        btnLogout.setAttribute("data-bs-toggle", "modal");
        btnLogout.setAttribute("data-bs-target","#logoutModal");
        btnLogout.textContent = "Logout";

        $(".btn-login").append(pName);
        $(".btn-login").append(btnLogout);

    }
    if(!isLoggedIn){
        $(".btn-login a").css("display", "block");
        $(".p-username").remove();
        $(".btn-logout").remove();
    }

    $("#btn-logout").click(function(){
        localStorage.removeItem("username");
        location.reload();
    })

});