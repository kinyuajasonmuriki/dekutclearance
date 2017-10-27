$('.submit').click(function(){
$.ajax({
data: {"username":"JasonMury", "password":"jason254", "email":"jasonmury254@gmail.com", "phone":706959881},
url: "http://jsofthustle.com/beyondzerodekut/controller/request_handler.php",
dataType: 'json',
method: "POST",
contentType: 'application/x-www-form-urlencoded',
success: function(response){
console.log(response);
alert("Request Successful");
},
error: function(error){
console.log(error);
alert("Request Error");
},
fail: function(error){
console.log(error);
alert("Request Failed Permanentley");
}
});
});
