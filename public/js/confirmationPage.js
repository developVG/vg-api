$(document).ready(function () {
    console.log("READY");
    var tableMarginTop = Math.round(($(window).height() - $("#wrapID").height()) / 2);
    $('#wrapID').css('margin-top', tableMarginTop/2);    
    $('#wrapID').css('margin-bottom', tableMarginTop/2);    
    $('#goToHomePage').click(function(){
        window.location.href = 'http://10.10.1.207:3000/'
    });
});

