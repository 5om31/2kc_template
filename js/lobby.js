$(document).ready(function(){
	lobby.init();
});

var lobby = {
	init: function(){
		common.checkLogin(function(result){
			UI.header(result.status);
			if(result.status){
				UI.accountInfo();
				UI.topMenu();
				UI.modalLeftMenu();
				common.getUserInfo(result.result);
				common.getWalletBalance();
			}
			common.getAnnouncements();
			lobby.events();
			lobby.carousel();
		});
	},
	carousel: function(){
		$("#carousel").carouFredSel({
			circular: true,
			auto: {
				duration: 1000,
	            pauseOnHover: true,
	            width: "702px"
			},
			pagination: {
				pauseOnHover: true,
				container: "#sliderNav",
				anchorBuilder: function(nr, item) {
    				return "<a href='#"+nr+"' class='nav'>"+nr+"</a>";
				}
			}
		});
	},
	events: function(){
		// Submit Login Form
		$(document).on("click", "#loginForm .form-submit", function(){
			var form = $("#loginForm"),
				submitBtn = form.find(".form-submit"),
				username = form.find("[name='username']"),
				password = form.find("[name='password']");
			if( username.val() != "" && password.val() != "" ){
				if(!submitBtn.hasClass("processing")){
					var dataRSA = { values: common.encode([globalVar.merchantCode,username.val(),password.val(),11111]) };
					submitBtn.addClass("processing");
					common.login(dataRSA, function(isValid){
						if(!isValid){
							submitBtn.removeClass("processing");
						}
					});					
				}
			}else{
				TCG.Alert("errors",TCG.Prop("loginForm_usernamePassword_required"));
			}
		});
	}
}