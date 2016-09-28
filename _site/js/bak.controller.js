/**********************************************
Global Variable
**********************************************/
var globalVar = {
	merchantCode: "DELE88",
	customerId: null,
	accountType: 0,
	gameUrl: "",
	gameName: "",
	remoteUrl: "http://www.8jbt8.com",
	pageArg: undefined,
	getAddressResult: null,
	availableWallet: ["SAFE_BOX","PVP","RNG"],
	walletListObj: {
		SAFE_BOX: {
			label: "主钱包",
			balance: 0,
			id: null
		},
		PVP: {
			label: "棋牌",
			balance: 0,
			id: null
		},
		RNG: {
			label: "电子",
			balance: 0,
			id: null
		}
	}
};
var common = new common(),
	app = new app();

// Run Common Init If THe Page IS not Register and Mini Login and Cashier Login Page
if( !$("body#registerPage")[0] && !$("body#miniLoginPage")[0] && !$("body#cashierLoginPage")[0] ) common.init();

/**********************************************
Common Function
**********************************************/
function common(){
	this.init = function(){

		// Check Hash Code
		var hash=window.location.hash;
		if(hash==undefined||hash==null||hash==""){
			common.loadPage("home");
		}else{
			common.loadPage(hash.substring(1));
		}
		// Load Common Events
		common.events();
		
		var browserVersion = common.browserVersion();
		$("body").addClass(browserVersion);
	}
	this.loadPage = function(pageId){
		var currentPage = window.location.hash.substring(1);
		if(currentPage == pageId){
			globalVar.pageArg = undefined;
			loadPage(pageId);
		}else{
			window.location.hash=pageId;
		}
	}
	this.browserVersion = function(){
		var ua= navigator.userAgent, tem, 
		M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
		if(/trident/i.test(M[1])){
			tem=  /\brv[:]+(\d+)/g.exec(ua) || [];
			return 'IE'+(tem[1] || '');
		}
		if(M[1]=== 'Chrome'){
			tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
			if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
		}
		M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
		if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
		return M.join('');
	}
	this.marquee = function(id){
		$(id).marquee({
			allowCss3Support: true,
			duration: 30000,
			delayBeforeStart: 1000,
			gap: 20,
			direction: 'left',
			duplicated: true,
			pauseOnCycle: true,
			pauseOnHover: true,
			startVisible: true
		});
	}
	this.events = function(){
		// Open Pages 
		$(document).off("click", "[data-link]")
				   .on("click", "[data-link]", function(){
			var pageId=$(this).attr("data-link");
			if(pageId!==undefined){
				if( $(this).hasClass("disabled") ){
					openAlert({
						type: "warning", 
						message: "login_NoUsernamePassword",
						title: "温馨提醒"
					});
				}else{
					//common.stopAnnounceMarquee();
					common.loadPage(pageId);
				}
			}
		});

		// Open PopOver
		$(document).off("click", "[data-popover]")
				   .on("click", "[data-popover]", function(event){
			var url = $(this).attr("data-popoverURL"),
				width = hasAttr($(this), "data-popoverWidth") ? $(this).attr("data-popoverWidth") : 300,
				height = hasAttr($(this), "data-popoverHeight") ? $(this).attr("data-popoverHeight") : 300,
				title = $(this).attr("data-popoverTitle");
			TCG.Ajax({
				url: "./xml/" +url+ ".xml",
				dataType: "html"
			}, function(xml){
				TCG.Popover.show({
					text: xml,
					title: title,
					height: height,
					width: width
				})
			})
		});

		// Logout
		$(document).off("click", "#logout")
				   .on("click", "#logout", function(){
			TCG.Confirm("确定要登出吗？", "", function(ok){
				if(ok){
					app.logout(function(result){
						localStorage.clear();
						//common.stopAnnounceMarquee();
						common.loadPage("home");
					});
				}
			});
		});
	}
}


/**********************************************
Home Page Controller
**********************************************/
function home(){
	var homePage = this;
	this.init = function(){
		this.events();
		common.marquee("#marquee")
	}

	this.events = function(){
		
	}
	return this.init();
}