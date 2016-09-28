$(document).ready(function(){
	control.init();
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

	}
}
