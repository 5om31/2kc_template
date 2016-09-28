/*******************************
Global Variable
******************************/
var globalVar = {
	merchantCode: "2000cai",
	defaultAgent: "",
	getAddressResult: null,
	lottBetTimer:[],
	syncRate:1,
	quotaObj:[],
	globeRebate:[],
	currentLottery:{},
	hotGameCount:8,
	activity:[],
	headers: {
	  	"Merchant": "2000cai",
  		"Authorization": sessionStorage.getItem("token")
	},
	bankCardLengh: 0,
	BANK_CARD_MAX_LIMIT: 5,
	cid:""
};
/*******************************
Controller
******************************/
var control = {
	init:function(){
		window.sessionStorage.setItem("isLogin",false);
		control.checkLogin(true);
		control.form(); //
	},
	formatDateFull: function (old_date, pattern) {

	if (pattern == null) {
		pattern = "yyyy-MM-dd hh:mm:ss";
	}

	var date = new Date(old_date);
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();

	month = month < 10 ? "0" + month : month;
	day = day < 10 ? "0" + day : day;
	hour = hour < 10 ? "0" + hour : hour;
	minute = minute < 10 ? "0" + minute : minute;
	second = second < 10 ? "0" + second : second;

	var formatedDate = pattern;
	// Mon Sep 17 2012 15:44:16 GMT+0800 (CST) to 2012-09-17 15:44:16
	formatedDate = formatedDate.replace("yyyy", year);
	formatedDate = formatedDate.replace("MM", month);
	formatedDate = formatedDate.replace("dd", day);
	formatedDate = formatedDate.replace("hh", hour);
	formatedDate = formatedDate.replace("mm", minute);
	formatedDate = formatedDate.replace("ss", second);

	return formatedDate;
	},
	setAgentNickName:function(nickname) {
		$("#agentName").text(nickname);
	},
	checkLogin:function(isFirst){
		var hash=window.location.hash==''?'#lobby':window.location.hash;
		TCG.Ajax({url:'memberinfo'},function(rs){
			if(rs.status){
				window.sessionStorage.setItem("isLogin",true);
				window.sessionStorage.setItem("isAgent",rs.result.type);
				window.sessionStorage.setItem("nickname",rs.result.nickname);
				var obj={account: rs.result.account,nickname:rs.result.nickname,totalAmount:(rs.result.safeBalance==undefined?"0.00":rs.result.safeBalance),lastLoginTimes:rs.result.lastlogin};
				UI.header(true,obj);
				globalVar.headers = {
				  	"Merchant": globalVar.merchantCode,
			  		"Authorization": rs.result.token
				};

				if((!isFirst)&&hash=='#lobby'){
					UI.afterLogin(obj);
					UI.lotteryMenus();
				}
				if(isFirst){//the first check login need load xml
					if(hash=='#lobby'){
						UI.loadLobbyPage(true,obj);
					}
					if(hash=='#lottery') {
						UI.loadLotteryPage();
					}
				}
				// Listener Topic

				im.connect(rs.result.customerId);
				im.subscribeUserChannel(rs.result.customerId);


			}else{
				window.sessionStorage.setItem("isLogin",false);
				UI.header(false);
				if(hash=='#lottery'){
					TCG.Alert("alerts",TCG.Prop("check_login_failed"),"XS",function(){
						window.location.href='index.html';
						//UI.loadLobbyPage(false,null);
					});
					return;
				}
				if(hash=='#lobby'){
					UI.loadLobbyPage(false,null);
					if(rs.description=="login.change.pw.required"){
						UI.firstTimeLogins();
					}
				}
			}
		});
	},
	login:function(){
		$(document).off("click", "#loginBtn").on("click", "#loginBtn", function(){
			var username=$("input[name='username']").val();
			var password=$("input[name='password']").val();
			var checkUserName = /^\w{6,14}$/.test(username);
			var checkPassword = /^\w{6,16}$/.test(password);
			if(username==""&&password==""){
				TCG.Alert("errors",TCG.Prop("login_userNamePassword_required"),"XS",function(){$("input[name='username']").focus();});
				return;
			}
			if(username==""){
				TCG.Alert("errors",TCG.Prop("login_userName_required"),"XS",function(){$("input[name='username']").focus();});
				return;
			}
			if(password==""){
				TCG.Alert("errors",TCG.Prop("login_password_required"),"XS",function(){$("input[name='password']").focus();});
				return;
			}
			if (!checkUserName) {
				TCG.Alert("errors",TCG.Prop("login_userName_invalid"),"XS",function(){$("input[name='username']").focus();});
				return;
			}
			if (!checkPassword) {
				TCG.Alert("errors",TCG.Prop("login_password_invalid"),"XS",function(){$("input[name='password']").focus();});
				return;
			}
			if(!$("#loginBtn").hasClass("processing")){
				$("#loginBtn").addClass("processing").attr("value","正在登录");
				var dataRSA = { values: control.encode([globalVar.merchantCode,username,password,11111]) };
				TCG.Ajax({url: "./login", data: dataRSA, type: "POST"},function(rs){
					if(rs.status){
						window.sessionStorage.setItem("username",rs.result.userName);
						window.sessionStorage.setItem("token",rs.result.token);
						 if(rs.result.passwordExpired){//if user is first time login,need change password.
							 window.sessionStorage.setItem("oldPwd",password);
							 window.sessionStorage.setItem("isLogin",false);
						 	 control.firstTimeLogins();
						 }else{
							control.checkLogin(false);
						 }
					}else{
						TCG.Alert("errors",TCG.Prop(rs.description));
						$("#loginBtn").removeClass("processing").attr("value","立即登录");
					}
				});
			}
		});
	},
	headerWalletList:function(){
		TCG.Ajax({url: "./getAllWalletBal"},function(rs){
			if(rs.status){
				var wallets=rs.result.value.balances;
				var totalBalance=0.0;
				if(wallets.length>0){
					for(var i=0;i<wallets.length;i++){
						totalBalance=totalBalance*1.0+wallets[i]["availBalance"]*1.0;
						switch (wallets[i]["accountName"]){
							case "PVP":
								$("#PVPWallet").html(control.customCurrencyFormat(wallets[i]["availBalance"], 4));
								break;
							case "SAFE_BOX":
								$("#safeBoxWallet").html(control.customCurrencyFormat(wallets[i]["availBalance"], 4));
								break;
							case "RNG":
								$("#RNGWallet").html(control.customCurrencyFormat(wallets[i]["availBalance"], 4));
								break;
							case "LOTT":
								$("#LOTTWallet").html(control.customCurrencyFormat(wallets[i]["availBalance"], 4));
								break;
						}
					}
					$("#afterLoginBalance").text(control.currencyFormat(totalBalance,2));
				}
			}else{
				TCG.Alert("errors",TCG.Prop("walletList_failed"));
			}
		});
		control.walletDropdown("li.money-amount p.show");
	},
	refreshWallet:function(){
		$(document).off("click", ".rs-refresh").on("click", ".rs-refresh", function(){
			control.headerWalletList();
		});
	},
	firstTimeLogins:function(){
		control.userAgreement();
		TCG.Ajax({url:'xml/firstTimeLogin.xml',dataType:'html'},function(txt){
			TCG.WinOpen({text:txt,transparent:true,width:'460px',height:'445px'},function(){
				$("#firstLoginUser").html(window.sessionStorage.getItem("username"));
				$("#popup_close").hide();
				$(document).off("click","#firstLoginSubmit").on("click","#firstLoginSubmit",function(){
					var newPwd=$("input[name='firstLoginNewPwd']").val();
					var confirmPwd=$("input[name='firstLoginConfirmPwd']").val();

					if(!/^\w{6,16}$/.test(newPwd)){
						TCG.Alert("errors",TCG.Prop("firstTimeLogins_newPwd_invalid"),"XS",function(){$("input[name='firstLoginNewPwd']").focus();});
						return;
					}
					if(!/^\w{6,16}$/.test(confirmPwd)){
						TCG.Alert("errors",TCG.Prop("firstTimeLogins_confNewPwd_invalid"),"XS",function(){$("input[name='firstLoginConfirmPwd']").focus();});
						return;
					}
					if (newPwd != confirmPwd) {
						TCG.Alert("errors",TCG.Prop("firstTimeLogins_confPwdNewPwd_notmatch"),"XS",function(){$("input[name='firstLoginConfirmPwd']").focus();});
						return;
					}
					if(!$("#firstLoginSubmit").hasClass("processing")){
						$("#firstLoginSubmit").addClass("processing");

						var dataRSA = { values: control.encode([window.sessionStorage.getItem("oldPwd"),newPwd,confirmPwd]) };
						TCG.Ajax({url: "modifyPassword", data: dataRSA, type: "POST"},function(rs){
							if(rs.status){
								TCG.hideLoading();
								control.checkLogin(false);
							}else{
								TCG.Alert("errors",TCG.Prop(rs.description));
								$("#firstLoginSubmit").removeClass("processing");
							}
						});
					}
				});
			});
		});
	},

	userAgreement:function(){
		$(document).off("click", "#userAgreement").on("click", "#userAgreement", function(){
			TCG.Ajax({url:'xml/userAgreement.xml',dataType:'html'},function(txt){
				TCG.WinOpen({text:txt,transparent:true,width:'560px',height:'580px'},function(){
				$("#popup_close").hide();

				$(document).off("click", "#closeUserAgreement").on("click", "#closeUserAgreement", function(){
							control.firstTimeLogins();
						});

				});
			});
		});
	},

	logout: function(){
		// Logout
		$(document).off("click", "#logout").on("click", "#logout", function(){
			TCG.Confirm(TCG.Prop("logout"), "XL", function(ok){
				if(ok){
					TCG.Ajax({ url: "./logout"}, function(result){
						if(result.status){
							sessionStorage.clear();
							window.location = "index.html"; //index.html#lobby
						}else{
							TCG.Alert("errors",TCG.Prop(result.description));
						}
					});
				}
			});
		});
	},
	pageMenu:function(selector){
		$(document).off("click", selector).on("click", selector, function(){
			var modal=$(this).attr("data-modal");
			if(modal!=undefined&&modal!=null&&modal!=''){
				var tmp=modal.split("/");
				if(tmp[0]=='customerservice'){
					control.customerService();
					return;
				}
				var txt=UI.popupsModel(tmp[0]);
				window.sessionStorage.setItem("mainMenu",tmp[0]);
				TCG.WinOpen({text:txt,width:'1274px',height:'600px'},function(){
					UI.checkUserType();
					control.popupsModelMenu();
					control.popupSubMenu();
					if(tmp.length>1){
						$('.model_child_menus li[data-submenu="'+tmp[1]+'"]').trigger('click');
					}else{
						$('.model_child_menus li:first-child').trigger('click');
					}
					control.closePopOnESC("on");
				},function(){
					control.closePopOnESC("off");
					window.sessionStorage.removeItem("mainMenu");
					window.sessionStorage.removeItem("childMenu");
				});
			}
		});
	},
	popupsModelMenu:function(){
		$(document).off("click",".model_main_menus dt,.model_main_menus dd").on("click",".model_main_menus dt,.model_main_menus dd",function(){
			var model=$(this).attr("data-modal");
			if(model==window.sessionStorage.getItem("mainMenu")){
				return;
			}
			window.sessionStorage.setItem("mainMenu",model);
			if(model!=undefined&&model!=null&&model!=''){
				if(window.sessionStorage.getItem("isLogin")=='false'&&model!='customerservice'&&model!='help'&&model!='activity'){
					TCG.Alert("alerts",TCG.Prop("login_failed"));
					return;
				}
				if(model=='customerservice'){
					control.customerService();
					return;
				}
				$(".model_child_menus").html(UI.modalSubMenu(model));
				control.popupSubMenu();
				$('.model_child_menus li:first-child').trigger('click');
			}
		});
	},
	popupSubMenu:function(){
		$(document).off("click",".model_child_menus li").on("click",".model_child_menus li",function(){
			var submenu=$(this).attr("data-submenu");
			if(submenu==window.sessionStorage.getItem("childMenu")){
				return;
			}
			window.sessionStorage.setItem("childMenu",submenu);
			$(".model_child_menus li").removeClass("sub-act");
			// Activate Clicked Submenu
			$('.model_child_menus li[data-submenu="'+submenu+'"]').addClass("sub-act");
			if(submenu!=undefined&&submenu!=null&&submenu!=''){
				TCG.Ajax({id:".model_child_content",url:"xml/"+submenu+".xml",dataType:'html'},function(){
					var functions=new Function('return control.'+submenu+'();');
					functions();
				});
			}
		});
	},
	closePopOnESC: function(type){
		if(type == "on"){
			$(document).on("keyup", function(e){
				if(e.keyCode == 27){
					//TCG.hideLoading();
					$("#popup_close").click();
				}
			});
		}else{
			$(document).off("keyup");
		}
	},
	forgetPassword:function(){
		$(document).off("click","#forgetPasswords").on("click","#forgetPasswords",function(){
			UI.forgotPassword();
		});
	},
	findPasswordByEmail: function(){
		TCG.Ajax({url:"xml/forgotPasswordForm.xml",dataType:'html'},function(txt){
			TCG.WinOpen({text:txt,width:'489px',height:'405px',transparent:true},function(){
				$(document).off("click","input[name='forgetSubmit']").on("click","input[name='forgetSubmit']",function(){
					var account=$('input[name="forgetUsername"]').val();
					var email=$('input[name="forgetEmail"]').val();
					if(!/^\w{6,14}$/.test(account)){
						TCG.Alert("errors",TCG.Prop("forgot_password_username_invalid"),"XS",function(){$("input[name='forgetUsername']").focus();});
						return;
					}
					var step1=/\w+\@\w+\.\w{2,}/.test(email);
					var step2=/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(email);
					if(!(step1||step2)){
						TCG.Alert("errors",TCG.Prop("forgot_password_email_invalid"),"XS",function(){$("input[name='forgetEmail']").focus();});
						return;
					}
					var _data={ values: control.encode([globalVar.merchantCode,account, email])};
					TCG.Ajax({url:"/findPwdByEmail",data: _data,type : 'POST'},function(obj){
						if(obj.status){
							TCG.Alert("success",TCG.Prop("forgot_password_password_sent"),"XS",function(){
								TCG.hideLoading();//修改成功后关闭窗口
							});
						}else{
							TCG.Alert("errors",TCG.Prop(obj.description));
						}
					});
				});
				$(document).off("click","input[name='forgetCancel']").on("click","input[name='forgetCancel']",function(){
					TCG.hideLoading();
					UI.forgotPassword();
				});
			});
		});
	},
	switchBalance: function(){
		// Show Balance
		$(document).off("click", "#isCheckBalance").on("click", "#isCheckBalance", function(){
			var flag=$(this).attr("identify");
			if(flag=='hide'){
				$(this).attr("identify","show").text("显示");
				$("#showBalance").hide();
				$(".rs-refresh").hide();
				$("#hideBalance").show();
			}
			if(flag=='show'){
				control.headerWalletList();//show balance refresh amount
				$(this).attr("identify","hide").text("隐藏");
				$("#hideBalance").hide();
				$("#showBalance").show();
				$(".rs-refresh").show();
				control.walletDropdown("li.money-amount p.show");
			}
		});
	},
	customerService: function(){
		var cServiceURL = 'http://f18.livechatvalue.com/chat/chatClient/chatbox.jsp?companyID=688455&configID=61607&jid=9040258761';
	   // Fixes dual-screen position                         Most browsers      Firefox
	   var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
	   var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

	   var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
	   var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

	   var left = ((width / 2) - (800 / 2)) + dualScreenLeft;
	   var top = ((height / 2) - (560 / 2)) + dualScreenTop;
	   var newWindow = window.open(cServiceURL, "CustomerService", 'resizable= no, menubar=no, status=no, toolbar=no, scrollbars=no, width=800, height=560, top=' + top + ', left=' + left);

	   // Puts focus on the newWindow
	   if (window.focus) {
		   newWindow.focus();
	   }
	},
	hotGamesTimer:function(){
		if(globalVar.syncRate%31==0){
			UI.refreshHotGames(true);
			globalVar.syncRate=1;
		}else{
			var status=true;
			$("em[lott-numero]").each(function(b){
				var lott=$(this).attr("lott-numero");
				var numero=$("em[lott-numero='"+lott+"']").attr("numero");
				$("em[lott-numero='"+lott+"']").text("距离"+numero+"期开奖");
				var bet_times=$("span[lott-bet-times='"+lott+"']").attr("bet-times");
				if(bet_times*1==-1&&status){
					status=false;
					UI.refreshHotGames(true);
					globalVar.syncRate=1;
				}else{
					$("span[lott-bet-times='"+lott+"']").text(UI.fmtTimeTohhmmss(bet_times*1,"hh:mm:ss"));
					bet_times--;
					$("span[lott-bet-times='"+lott+"']").attr("bet-times",bet_times);
				}
			});
		}
		globalVar.syncRate++;
	},
	betTimer:function(){
		if(globalVar.syncRate%31==0){
			UI.lottBetTimes(false);
			globalVar.syncRate=1;
		}else{
			var numero=$('span[bet-timer="currNumero"]').attr("numero");
			$('span[bet-timer="currNumero"]').text(numero);
			var bet_times=$('p[bet-timer="bet-times"]').attr("bet-times");
			var lock_times=$('p[bet-timer="bet-times"]').attr("lock-times");
			if(bet_times*1-lock_times*1<=-1){
				$('span[bet-timer="words"]').text("开奖锁定");
				$('p[bet-timer="bet-times"]').css({color:'#ff8282'});
				$('p[bet-timer="bet-times"]').text(UI.fmtTimeTohhmmss(bet_times*1,"hh:mm:ss"));
				if(bet_times*1==-1) {
					UI.lottBetTimes(false);
					globalVar.syncRate = 1;
					UI.showDrawUI();
				}
			}else{
				$('span[bet-timer="words"]').text("投注剩余");
				$('p[bet-timer="bet-times"]').css({color:'#608df1'});
				$('p[bet-timer="bet-times"]').text(UI.fmtTimeTohhmmss(bet_times*1-lock_times*1,"hh:mm:ss"));
			}
			bet_times--;
			$('p[bet-timer="bet-times"]').attr("bet-times",bet_times);
		}
		globalVar.syncRate++;
	},
	clearLottBetTimer:function(){
		if(globalVar.lottBetTimer.length>0){
			for(var i=0;i<globalVar.lottBetTimer.length;i++){
				window.clearInterval(globalVar.lottBetTimer[i]);
			}
		}
		globalVar.syncRate=1;
	},
	indexAnnouncement:function(){
		TCG.Ajax({url:'getListAnnouncement',data:{merchantCode:globalVar.merchantCode,type:'M'}},function(rs){
			if(rs.status){
				var html='';
				globalVar.activity=rs.result;
				if(rs.result.length>0){
					var len=rs.result.length>7?7:rs.result.length;
					for(var i=0;i<len;i++){
						var subType=rs.result[i].category=="P"?"activityInfo":"announcement";
						html+='<dl class="news-content" data-modal="activity/'+subType+'" data-content="'+rs.result[i].id+'">';
						html+='<dt class="news-title">'+control.strSub(rs.result[i].title,28)+'...</dt>';
						html+='<dd class="news-date">'+rs.result[i].createtime+'</dd>';
						html+='</dl>';
					}
				}
				$(".news-wrp").html(html);
				$(document).off("click",".news-wrp dl").on("click",".news-wrp dl",function(){
					var modal=$(this).attr("data-modal");
					var content=$(this).attr("data-content");
					window.sessionStorage.setItem("activity",content);
					var tmp=modal.split("/");
					var txt=UI.popupsModel(tmp[0]);
					TCG.WinOpen({text:txt,width:'1274px',height:'600px'},function(){
						UI.checkUserType();
						control.popupsModelMenu();
						control.popupSubMenu();
						window.sessionStorage.setItem("childMenu","");
						if(tmp.length>=1){						
							$('.model_child_menus li[data-submenu="'+tmp[1]+'"]').trigger('click');
						}else{
							$('.model_child_menus li:first-child').trigger('click');
						}
					});
				});
			}
		});
	},
	strSub:function(s,len){
		if (s == null){
			return 0;
		}
		var totalLength = 0;
		var i;
		var charCode;
		var retStr="";
		for (i = 0; i < s.length; i++) {
			charCode = s.charCodeAt(i);
			retStr+=s.charAt(i);
			if (charCode < 0x007f) {
				totalLength = totalLength + 1;
			} else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
				totalLength += 2;
			} else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
				totalLength += 2;
			}
			if(totalLength==len*1){break;}
		}
		return retStr;
	},
	announcement:function(){
		control.activityPopup("N");
	},
	activityInfo:function(){
		control.activityPopup("P");
	},
	activityPopup:function(category){
		var activity=window.sessionStorage.getItem("activity");
		control.showActivityList(category);
		$(document).off("click",".rs-an-list>ul>li").on("click",".rs-an-list>ul>li",function(){
			$(".rs-an-list>ul>li").removeClass("hlt-blue");
			$(this).addClass("hlt-blue");
			var dt=$(this).attr("data-content");
			control.showActivityContent(dt);
		});
		if(activity==null){
			$('.rs-an-list>ul>li:first-child').trigger('click');
		}else{
			window.sessionStorage.removeItem("activity");
			$('.rs-an-list>ul>li[data-content="'+category+'/'+activity+'"]').trigger('click');
		}
	},
	showActivityList:function(category){
		for(var i=0;i<globalVar.activity.length;i++){
			if(globalVar.activity[i].category==category){
				var _html='';
				_html+='<li class="clearfix" data-content="'+category+'/'+globalVar.activity[i].id+'">';
				_html+='<span class="list-line"></span>';
				_html+='<p class="rs-date">';
				var _date=globalVar.activity[i].createtime.substring(0,10).split("-");
				_html+='<span class="rs-month">'+_date[1]+'月</span>';
				_html+='<span class="rs-day">'+_date[2]+'</span>';
				_html+='</p>';
				_html+='<div class="list-exerpt">';
				_html+='<h2>'+control.strSub(globalVar.activity[i].title,20)+'</h2>';
				_html+='<p></p>';
				_html+='</div>';
				_html+='<div class="clearfix"></div>';
				_html+='</li>';
				$(".rs-an-list>ul").append(_html);
			}
		}
	},
	showActivityContent:function(dt){
		var t=dt.split("/");
		for(var i=0;i<globalVar.activity.length;i++){
			if(globalVar.activity[i].category==t[0]&&globalVar.activity[i].id==t[1]){
				var _html='';
				_html+='<div class="an-title-date">';
				_html+='<h1>'+globalVar.activity[i].title+'</h1>';
				_html+='<span>'+globalVar.activity[i].createtime+'</span>';
				_html+='</div>';
				_html+='<div class="an-the-message">'+globalVar.activity[i].content+'</div>';
				$(".rs-an-content").html(_html);
			}
		}
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
	/**************************************
	Common FUnction
	***************************************/
	form: function(){
		// Submit Form On Enter
		$(document).off("keyup", "form .form-control").on("keyup", "form .form-control", function(e){
			if(e.which == 13){
				$(this).parents("form").find(".form-submit").click();
			}
		});
	},
	// Copy to Clipboard
	copyClipboard: function(elem){
		var e = elem || $("[data-clipboard]");
		ZeroClipboard.setDefaults({
			moviePath: "./js/lib/ZeroClipboard.swf"
		});
		var clip = new ZeroClipboard(e);

		return clip;
	},
	// limit to 2 decimal
	limitTwoDecimal: function(input){
		$(document).off("keyup", input)
				   .on("keyup", input, function(){
			var thisInput = $(input).val(),
				decimal = thisInput.substr(thisInput.indexOf(".") + 1);

			if(thisInput.indexOf(".") > 0){
				if(decimal.length > 2){
					$(input).val(thisInput.slice(0,-1));
				}
			}
		});
	},
	/*
	* return a date time format
	* @param time {Number}
	* @param type {String} - input: date return YYYY-MM-DD, dateTime return YYYY-MM-DD hh:mm:ss, MonthDateTime MM-DD hh:mm:ss 
	* @return {String}
	*/
	timeToDateFormat: function(time, type){
		var type = type || "date",
			date = new Date(time),
			month = (date.getMonth()+1) < 10 ? "0"+(date.getMonth()+1) : date.getMonth()+1,
			day = date.getDate() < 10 ? "0"+date.getDate() : date.getDate(),
			seconds = date.getSeconds(),
			minutes = date.getMinutes(),
			hour = date.getHours();
		switch(type){
			case "date":
				newDateFormat = date.getFullYear() + "-" + month + "-" + day;
				break;
			case "dateTime":
				newDateFormat = date.getFullYear() + "-" + month + "-" + day + " " + hour +":"+ minutes +":"+ seconds;
				break;
			case "MonthDateTime":	
				newDateFormat = month + "-" + day + " " + hour +":"+ minutes +":"+ seconds;
				break;
			default:
		}
		return newDateFormat;
	},
	amountSetMinMax: function(input, min, max){
		var amount = parseInt(input);

		if(amount < min){
			TCG.Alert("errors", TCG.Prop("amountSetMinMax_amount_greater_required")+min);
			return true;
		} else if(amount > max){
			TCG.Alert("errors", TCG.Prop("amountSetMinMax_amount_lesser_required")+max);
			return true;
		}
	},
	numberWithCommas: function(x) {
	    var parts = x.toString().split(".");
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    return parts.join(".");
	},
	// Custom Select
	customSelect: function(id){
		var prop = {
			"width": "100%",
			"disable_search": true
		};
		$(id).chosen(prop).on("chosen:showing_dropdown", function(){
			$(this).parents("div").addClass("red-up");
		}).on("chosen:hiding_dropdown", function(){
			$(this).parents("div").removeClass("red-up");
		});
	},
	resetCustomSelect: function(form){
		form.find(".selected-red").removeClass("selected-red");
		setTimeout(function(){ form.find("select").trigger("chosen:updated"); }, 100);
	},
	getWalletList: function(id, callback){
		TCG.Ajax({ url: "./getWalletList" }, function(result){
			if(result.status){
				UI.loadWalletList(id, result.result.value, callback);
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		});
	},
	maskData: function(data, start){
		var newData = data.substring(0,start);
		for(var i=0; i<data.length; i++){
			if( i >= start ){
				newData += "*";
			}
		}
		return newData;
	},
	// Encode And Encrypt Data
	encode: function(arr){
		var encodedData = [];
		for( var i=0; i<arr.length; i++ ){
			encodedData.push( encodeURI(arr[i]) );
		}
		return getEncryptedText(encodedData);
	},
	// Get Wallet List And Balance
	getWalletBalance: function(callback){
		TCG.Ajax({ url: "./getAllWalletBal" }, function(result){
			if(result.status){
				var wallets=result.result.value.balances,
					totalBalance = 0;
				if(wallets.length>0){
					for(var i=0;i<wallets.length;i++){
						if( wallets[i].accountName != "FROZEN_ACCOUNT" ) totalBalance += wallets[i]["availBalance"];
						switch (wallets[i]["accountName"]){
							case "PVP":
								$("#transferPVPWallet").html( control.customCurrencyFormat( wallets[i]["availBalance"], 4) );
								$("#PVPWallet").html( control.customCurrencyFormat(wallets[i]["availBalance"],4) );
								break;
							case "SAFE_BOX":
								$("#transferSafeBoxWallet").html( control.customCurrencyFormat( wallets[i]["availBalance"], 4) );
								$("#safeBoxWallet").html( control.customCurrencyFormat(wallets[i]["availBalance"],4) );
								break;
							case "RNG":
								$("#transferRNGWallet").html( control.customCurrencyFormat( wallets[i]["availBalance"], 4) );
								$("#RNGWallet").html( control.customCurrencyFormat(wallets[i]["availBalance"],4) );
								break;
							case "LOTT":
								$("#transferLOTTWallet").html( control.customCurrencyFormat( wallets[i]["availBalance"], 4) );
								$("#LOTTWallet").html( control.customCurrencyFormat(wallets[i]["availBalance"],4) );
								break;
						}
					}
					$("[data-walletbalance='ALL']").text( control.currencyFormat( totalBalance, 2) );
					sessionStorage.walletBalance = totalBalance;
					if( callback ) callback(result.result);
				}
			}else{
				TCG.Alert("errors",TCG.Prop(result.description));
			}
		});
	},
	// Get user Info
	getUserInfo: function(callback){
		TCG.Ajax({ url: "./memberinfo" }, function(result){
			if(result.status){
				UI.loadUserInfo(result.result);
			}
			callback(result);
		});
	},
	currencyFormat: function(amount, decimalNum){
		if(isNaN(amount)){
			return "NaN";
		}else{
			var format = amount.toString().replace("-","").split("."),
				currency,
				operator = amount.toString()[0] == "-" ? "-" : "",
				decimal = function(decimalNum){
					var d = "",
						decimalNum = decimalNum == undefined && format[1] != undefined ? format[1].length : decimalNum;
					if( decimalNum > 0 ){
						d += ".";
						if( format[1] == undefined ){
							for(var i=0; i<decimalNum; i++){
								d+="0";
							}
						}else{
							for(var i=0; i<decimalNum; i++){
								d+= i<format[1].length ? format[1][i] : "0";
							}
						}

					}
					return d;
				};
			currency = format[0].replace(/./g, function(c, i, a) {
			    return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
			});
			return operator+currency+decimal(decimalNum);
		}
	},
	customCurrencyFormat: function(amount, decimal){
		if( decimal != undefined ){
			var format = control.currencyFormat(amount,decimal).toString().split("."),
				decimal = format[1].replace(",",""),
				currency = format[0] + ".<span class='tblDec'>" +decimal+ "</span>";
		}else{
			var format = control.currencyFormat(amount).toString().split("."),
				currency = format[0];
		}
		return currency;
	},
	datepickerStartEnd: function(start, end, defaultStartDate){
		var defaultStartDate = defaultStartDate == undefined ? "-30" : defaultStartDate.toString();
		start.datepicker({
			dateFormat: "yy-mm-dd",
			maxDate: 0,
			onSelect: function(selectedDate){
				end.datepicker("option","minDate",selectedDate);
			}
		}).datepicker("setDate", defaultStartDate);

		end.datepicker({
			dateFormat: "yy-mm-dd",
			minDate: defaultStartDate,
			maxDate: 0,
			setDate: 0,
			onSelect: function(selectedDate){
				start.datepicker("option","maxDate",selectedDate);
			},
			beforeShow: function(input, inst) {       
			    window.setTimeout(function(){
			    	$(inst.dpDiv).find('.ui-state-highlight').removeClass('ui-state-highlight')      
				},0)     
			}			
		}).datepicker("setDate", "0");
	},
	// Pagination Events
	goToPageNo: function(type, currentPage, pageTotal, id){
		// Pagination - GoTo Page No.
		var id = id || "#pagination";

		$(document).off("click", id+" [name='goToPage']").on("click", id+" [name='goToPage']", function(){
			var pageNo = $(id+" [name='inputPageNo']");
			if(regExPattern("numberOnly", pageNo.val())){
				if( pageNo.val() > 0 && pageNo.val() <= pageTotal ){
					switch(type){
						case "transactionDetails":
							$("#changeAccountForm [name='pageNo']").val(pageNo.val());
							$("#changeAccountForm .form-submit").click();
							break;
						case "lottoGameHistory":
							$("#lottoGameHistoryForm [name='pageNo']").val(pageNo.val());
							$("#lottoGameHistoryForm .form-submit").click();
							break;
						case "pvpGameHistory":
							$("#pvpGameHistoryForm [name='pageNo']").val(pageNo.val());
							$("#pvpGameHistoryForm .form-submit").click();
							break;
						case "memberManagementForm":
							$("#"+type+" [name='pageNo']").val(pageNo.val());
							control.getMemberManagement(false);
							break;
						case "agentPvpGameHistory":
							$("#agentPvpGameHistoryForm [name='pageNo']").val(pageNo.val());
							$("#agentPvpGameHistoryForm .form-submit").click();
							break;
						case "linkManager":
							$("#linkManagerForm [name='pageNo']").val(pageNo.val());
							control.viewAffiliateUrls();
							break;
						case "lottoTeamBetting":
							$("#lottoTeamBettingForm [name='pageNo']").val(pageNo.val());
							$("#lottoTeamBettingForm .form-submit").click();
							break;
						case "pvpTeamBetting":
							$("#pvpTeamBettingForm [name='pageNo']").val(pageNo.val());
							$("#pvpTeamBettingForm .form-submit").click();
							break;
						case "revenueReport":
							$("#revenueReportForm [name='pageNo']").val(pageNo.val());
							$("#revenueReportForm .form-submit").click();
							break;
						default:
							$("#"+type+" [name='pageNo']").val(pageNo.val());
							$("#"+type+" .form-submit").click();

					}
				}else{
					pageNo.val(currentPage);
				}
			}
	    });
	},
	pageNav: function(type, currentPage, pageTotal,id){
		// Pagination - Next/Prev
		var id = id || "#pagination";
		$(document).off("click", id+" [data-pageNav]").on("click", id+" [data-pageNav]", function(){
			var pageNav = $(this).attr("data-pageNav"),
				pageNo = pageNav == "next" ? (currentPage*1) + 1 : (currentPage*1) - 1;
			if( pageNo > 0 && pageNo <= pageTotal ){
				switch(type){
					case "transactionDetails":
						$("#changeAccountForm [name='pageNo']").val(pageNo);
						$("#changeAccountForm .form-submit").click();
						break;
					case "lottoGameHistory":
						$("#lottoGameHistoryForm [name='pageNo']").val(pageNo);
						$("#lottoGameHistoryForm .form-submit").click();
						break;
					case "pvpGameHistory":
						$("#pvpGameHistoryForm [name='pageNo']").val(pageNo);
						$("#pvpGameHistoryForm .form-submit").click();
						break;
					case "memberManagementForm":
						$("#memberManagementForm [name='pageNo']").val(pageNo);
						control.getMemberManagement(false);
						break;
					case "agentPvpGameHistory":
						$("#agentPvpGameHistoryForm [name='pageNo']").val(pageNo);
						$("#agentPvpGameHistoryForm .form-submit").click();
						break;						
					case "linkManager":
						$("#linkManagerForm [name='pageNo']").val(pageNo);
						control.viewAffiliateUrls();
						break;
					case "lottoTeamBetting":
						$("#lottoTeamBettingForm [name='pageNo']").val(pageNo);
						$("#lottoTeamBettingForm .form-submit").click();
						break;
					case "pvpTeamBetting":
						$("#pvpTeamBettingForm [name='pageNo']").val(pageNo);
						$("#pvpTeamBettingForm .form-submit").click();
						break;
					case "revenueReport":
						$("#revenueReportForm [name='pageNo']").val(pageNo);
						$("#revenueReportForm .form-submit").click();
						break;
					default:
						$("#"+type+" [name='pageNo']").val(pageNo);
						$("#"+type+" .form-submit").click();
				}
			}
	    });
	},
	clickPageNo: function(type, currentPage, pageTotal, id){
		// Pagination - Next/Prev
		var id = id || "#pagination";
		$(document).off("click", id+" [data-pageNo]").on("click", id+" [data-pageNo]", function(){
			var pageNo = $(this).attr("data-pageNo")*1;
			if( pageNo > 0 && pageNo <= pageTotal ){
				switch(type){
					case "transactionDetails":
						$("#changeAccountForm [name='pageNo']").val(pageNo);
						$("#changeAccountForm .form-submit").click();
						break;
					case "lottoGameHistory":
						$("#lottoGameHistoryForm [name='pageNo']").val(pageNo);
						$("#lottoGameHistoryForm .form-submit").click();
						break;
					case "pvpGameHistory":
						$("#pvpGameHistoryForm [name='pageNo']").val(pageNo);
						$("#pvpGameHistoryForm .form-submit").click();
						break;						
					case "memberManagementForm":
						$("#memberManagementForm [name='pageNo']").val(pageNo);
						control.getMemberManagement(false);
						break;
					case "agentPvpGameHistory":
						$("#agentPvpGameHistoryForm [name='pageNo']").val(pageNo);
						$("#agentPvpGameHistoryForm .form-submit").click();
						break;						
					case "linkManager":
						$("#linkManagerForm [name='pageNo']").val(pageNo);
						control.viewAffiliateUrls();
						break;
					case "lottoTeamBetting":
						$("#lottoTeamBettingForm [name='pageNo']").val(pageNo);
						$("#lottoTeamBettingForm .form-submit").click();
						break;
					case "pvpTeamBetting":
						$("#pvpTeamBettingForm [name='pageNo']").val(pageNo);
						$("#pvpTeamBettingForm .form-submit").click();
						break;
					case "revenueReport":
						$("#revenueReportForm [name='pageNo']").val(pageNo);
						$("#revenueReportForm .form-submit").click();
						break;
					default:
						$("#"+type+" [name='pageNo']").val(pageNo);
						$("#"+type+" .form-submit").click();
				}
			}
	    });
	},
	switchDecimal: function(id){
		var id = id || "#switchDecimal";
		$(document).off("click", id).on("click", id, function(){
			$("[data-switchDecimal]").each(function(){
				var decimal = $(this).attr("data-switchDecimal") == 2 ? 4 : 2,
					value = $(this).attr("data-value");
				$(this).attr("data-switchDecimal", decimal);
				$(this).html( control.customCurrencyFormat(value, decimal) );
			});
		});
	},
	getProvinceList: function(callback){
		if( globalVar.getAddressResult !== null ){
			var xml = globalVar.getAddressResult,
				parentNode = xml.getElementsByTagName("string");
			globalVar.getAddressResult = xml;
		    callback(UI.loadProvinceList(parentNode));
		}else{
			TCG.Ajax({ url: "./resource/province_city_zh-CN.xml", dataType: "xml" }, function(xml){
				var parentNode = xml.getElementsByTagName("string");
				globalVar.getAddressResult = xml;
			    callback(UI.loadProvinceList(parentNode));
			});
		}
	},
	getCityList: function(province, callback){
		var xml = globalVar.getAddressResult,
			cityElement = "city_"+province,
			cityList = xml.getElementsByTagName(cityElement)[0],
			CNode = cityList.getElementsByTagName("item");
		callback(UI.loadCityList(CNode));
	},
	selectProvince: function(provinceID, cityID){
		$(document).off("change", provinceID).on("change", provinceID, function(){
			var provinceVal = $(this).val(),
				province = $(this).find("option[value='" +provinceVal+ "']"),
				city = $(cityID);
			if( province.attr("data-englishName") == "" ){
				city.html("<option value=''>市</option>").trigger("chosen:updated");
			}else{
				control.getCityList(province.attr("data-englishName"), function(cityList){
					$(cityID).html(cityList).trigger("chosen:updated");
				});
			}
	    });
	},
	getBankCards: function(type){
		TCG.Ajax({ url: "./withdraw/getCard" }, function(result){
			if(result.status){
				UI.loadBankCards(type, result.result);
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		});
	},
	//Hover Effect Dropdown
	walletDropdown: function(target){
		$(target).mouseenter(
			function() {
				$(target).nextAll('.sub-wallet-menu.hide').show();
			}
		);
		$('.sub-wallet-menu.hide').mouseleave(
			function() {
				$(target).nextAll('.sub-wallet-menu.hide').hide();
			}
		);
		$('body').click(
			function(){
				$('.sub-wallet-menu.hide').hide();
			}
		);
	},
	days_between: function(date1, date2) {
		// The number of milliseconds in one day
		var ONE_DAY = 1000 * 60 * 60 * 24;
		// Convert both dates to milliseconds
		var date1_ms = date1.getTime()==null?new Date():date1.getTime();
		var date2_ms = date2.getTime()==null?new Date():date2.getTime();

		// Calculate the difference in milliseconds
		var difference_ms = Math.abs(date1_ms - date2_ms);

		// Convert back to days and return
		return Math.round(difference_ms/ONE_DAY);
	},
	loadGlobalRebates: function() {
		TCG.Ajax({ url: "./agent/globalRebateSettings" }, function(result){
			if(result.status) {
				globalVar.globeRebate = result.result;
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		});
	},
	/***************************************************************
	// Deposit - Common
	***************************************************************/
	selectDepositAmount: function(targetId){
		// Click Amount List
		$(document).off("click", "#amountList .amount").on("click", "#amountList .amount", function(){
			var amount = parseInt( $(this).text() );
			$(targetId).val(amount);
			// Validate Form
			switch( $(this).parents("form").attr("id") ){
				case "onlinePaymentForm":
					control.validateOnlinePaymentForm();
					break;
				case "quickPaymentForm":
					control.validateQuickPaymentForm();
					break;
				case "conversionOfFundsForm":
					control.validateTransferBalanceForm();
					break;
			}
		});
	},
	incDecDepositAmount: function(btnId ,targetId, interval){
		// Increase/Decrease Amount
		var interval = interval || 100.00;
		$(document).off("click", btnId).on("click", btnId, function(){
			var amount = $(targetId),
				action = $(this).attr("data-changeAmount"),
				isValid = regExPattern("amount", amount.val()),
				newAmount;
			if(isValid){
				if( action == "increase" ){
					newAmount = parseFloat( amount.val() ) + parseFloat(interval);
				}else{
					newAmount = (parseInt(amount.val()) - parseFloat(interval) ) <= 0 ? amount.val() : parseFloat( amount.val() ) - parseFloat(interval);
				}
			}else{
				newAmount = interval;
			}
			if( newAmount >= 0.1)	$(targetId).val(newAmount);			
			// Validate Form
			switch( $(this).parents("form").attr("id") ){
				case "onlinePaymentForm":
					control.validateOnlinePaymentForm();
					break;
				case "quickPaymentForm":
					control.validateQuickPaymentForm();
					break;
				case "conversionOfFundsForm":
					control.validateTransferBalanceForm();
					break;
			}			
		});
	},
	getDepositBankList: function(type, targetId){
        TCG.Ajax({ url: "./getDepositBankList" }, function(result){
            if(result.status){
            	var banks;
            	switch(type){
            		case "onlinePayment":
	            		banks = result.result.pg_banks;
	            		break;
            		case "quickPayment":
	            		banks = result.result.manual_transfer_banks;
	            		break;
            		case "alipay":
	            		banks = result.result.qr_banks;
	            		break;
            		default:
            			console.log("No Deposit Bank Type!");
	            		return;
            	}
            	UI.loadDepositBankList(targetId, banks);
            }else{
            	TCG.Alert("errors", TCG.Prop(result.description));
            }
        });
	},
	selectDepositBank: function(targetId){
		// Select Bank
		$(document).off("click", targetId).on("click", targetId, function(){
			$(".bankRadioBtn").removeClass("selected-red");
			$(this).parent().find(".bankRadioBtn").addClass("selected-red");
			// Validate Form
			switch( $(this).parents("form").attr("id") ){
				case "onlinePaymentForm":
					control.validateOnlinePaymentForm();
					break;
				case "quickPaymentForm":
					control.validateQuickPaymentForm();
					break;
				case "conversionOfFundsForm":
					control.validateTransferBalanceForm();
					break;
			}	
		});
	},
	getDepositPromotions: function(targetId){
		// Select Deposit Winnings
		$(document).off("click", targetId).on("click", targetId, function(){
			$(".winningsRadioBtn").removeClass("selected-red");
			$(this).parents(".winningsRadioBtn").addClass("selected-red");
		});
	},
	/***************************************************************
	// Deposit - Online Payment
	***************************************************************/
	onlinePayment: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.form();
				control.getWalletBalance();
				control.selectDepositAmount("#onlinePaymentForm [name='amount']");
				control.incDecDepositAmount("#onlinePaymentForm [data-changeAmount]", "#onlinePaymentForm [name='amount']");
				control.getDepositBankList("onlinePayment", "#onlinePaymentForm [name='bankName']");
				control.getDepositPromotions("#onlinePaymentForm [name='winnings']");
				control.accordionTab();
				control.submitOnlinePayment(result.result.account);
				control.limitTwoDecimal("#onlinePaymentForm [name='amount']");
				control.validateOnlinePaymentInput();
			}else{
				window.location = "/";
			}
		});
	},
	accordionTab: function(){
		$(document).off("click", "#accordionTab .tabBtn").on("click", "#accordionTab .tabBtn", function(){
			var selectedTabBtn = $(this),
				tabBtn = $("#accordionTab .tabBtn"),
				tabContent = $("#accordionTab .tabContent"),
				selectedTabContent = $("#"+selectedTabBtn.attr("data-rel"));
			if( selectedTabContent.is(":hidden") ){
				tabContent.slideUp(200);
				tabBtn.removeClass("status-show").addClass("status-hide");
				selectedTabBtn.removeClass("status-hide").addClass("status-show");
				selectedTabContent.slideDown(200);
			}
		});
	},
	validateOnlinePaymentInput: function(){
		$(document).off("keyup", "#onlinePaymentForm [name='amount']").on("keyup", "#onlinePaymentForm [name='amount']", function(){
			control.validateOnlinePaymentForm();
		});
	},
	validateOnlinePaymentForm: function(){
		var form = $("#onlinePaymentForm"),
			amount = form.find("[name='amount']"),
			bankCode = form.find("[name='bankName']:checked");
		if( amount.val() == "" || !regExPattern("amount", amount.val()) || !bankCode[0] ){
			form.removeClass("enable");
		}else{
			form.addClass("enable");
		}
	},
	submitOnlinePayment: function(account){
		var accountName = account.split("@")[1];
		$(document).off("click", "#onlinePaymentForm .form-submit").on("click", "#onlinePaymentForm .form-submit", function(){
			var form = $("#onlinePaymentForm"),
				amount = form.find("[name='amount']"),
				bankCode = form.find("[name='bankName']:checked"),
				resetBtn = form.find(".form-reset"),
				submitBtn = form.find(".form-submit");

			if(form.hasClass("enable")){

				// Validate Amount
				if( amount.val() == "" ){
					TCG.Alert("errors", TCG.Prop("onlinePaymentForm_amount_required"));
					return;
				}
				if( !regExPattern("amount", amount.val()) ){
					TCG.Alert("errors", TCG.Prop("onlinePaymentForm_amount_invalid"));
					return;
				}

				// Validate BankCode
				if( !bankCode[0] ){
					TCG.Alert("errors", TCG.Prop("onlinePaymentForm_bankName_required"));
					return;
				}

				// Check Account Name
				if( accountName == undefined || accountName == null ){
					TCG.Alert("errors", TCG.Prop("No Account Name!"));
					return;
				}

				if( !submitBtn.hasClass("processing") ){
					submitBtn.addClass("processing");

					var dataRSA = { values: control.encode([ accountName, amount.val(), bankCode.val() ]) };
					TCG.Ajax({ url: "./depositPG", data: dataRSA }, function(result){
						if(result.status){
							TCG.Alert("success", TCG.Prop(result.description), null, function(){
								window.open(result.result.redirection_url,"Online Payment","_blank","width=1024,height=768")
								control.getWalletBalance();
								form.find(".bankRadioBtn").removeClass("selected-red");
								form.removeClass("enable");
							});
						}else{
							TCG.Alert("errors", TCG.Prop(result.description));
						}
						submitBtn.removeClass("processing");
					});
				}
			}
		});
	},
	/***************************************************************
	// Deposit - Quick Payment
	***************************************************************/
	quickPayment: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.form();
				control.getWalletBalance();
				control.selectDepositAmount("#quickPaymentForm [name='amount']");
				control.incDecDepositAmount("#quickPaymentForm [data-changeAmount]", "#quickPaymentForm [name='amount']");
				control.getDepositBankList("quickPayment", "#quickPaymentForm [name='bankName']");
				control.submitQuickPayment(result.result.account);
				control.limitTwoDecimal("#quickPaymentForm [name='amount']");
				control.validateQuickPaymentInput();
			}else{
				window.location = "/";
			}
		});
	},
	validateQuickPaymentInput: function(){
		$(document).off("keyup", "#quickPaymentForm [name='amount']").on("keyup", "#quickPaymentForm [name='amount']", function(){
			control.validateQuickPaymentForm();
		});
	},
	validateQuickPaymentForm: function(){
		var form = $("#quickPaymentForm"),
			amount = form.find("[name='amount']"),
			bankCode = form.find("[name='bankName']:checked");
		// Validate Amount And BankCode
		if( amount.val() == "" || !regExPattern("amount", amount.val()) || !bankCode[0] ){
			form.removeClass("enable");
		}else{
			form.addClass("enable");
		}
	},
	submitQuickPayment: function(account){
		var accountName = account.split("@")[1];
		$(document).off("click", "#quickPaymentForm .form-submit").on("click", "#quickPaymentForm .form-submit", function(){
			var form = $("#quickPaymentForm"),
				amount = form.find("[name='amount']"),
				bankCode = form.find("[name='bankName']:checked"),
				resetBtn = form.find(".form-reset"),
				submitBtn = form.find(".form-submit");

			if(form.hasClass("enable")){

				// Validate Amount
				if( amount.val() == "" ){
					TCG.Alert("errors", TCG.Prop("quickPaymentForm_amount_required"));
					return;
				}
				if( !regExPattern("amount", amount.val()) ){
					TCG.Alert("errors", TCG.Prop("quickPaymentForm_amount_invalid"));
					return;
				}

				// Validate BankCode
				if( !bankCode[0] ){
					TCG.Alert("errors", TCG.Prop("quickPaymentForm_bankName_required"));
					return;
				}

				// Check Account Name
				if( accountName == undefined || accountName == null ){
					TCG.Alert("errors", TCG.Prop("No Account Name!"));
					return;
				}

				if( !submitBtn.hasClass("processing") ){
					submitBtn.addClass("processing");
					var dataRSA = { values: control.encode([ accountName, amount.val(), bankCode.val() ]) };
					TCG.Ajax({ url: "./depositMT", data: dataRSA }, function(result){
						if(result.status){
							TCG.Alert("success", TCG.Prop(result.description));
							control.getWalletBalance();
							form.find(".bankRadioBtn").removeClass("selected-red");
							form.removeClass("enable");
							control.viewPostDeposit(result.result);
						}else{
							TCG.Alert("errors", TCG.Prop(result.description));
						}
						submitBtn.removeClass("processing");
					});
				}
			}

		});
	},
	viewPostDeposit: function(result){
		var depositForm = $("#quickPaymentDeposit"),
			depositDetails = $("#quickPaymentPostDeposit"),
			bankName = $("#copyBankName"),
			accountName = $("#copyAccountName"),
			email = $("#copyEmail"),
			amount = $("#copyAmount"),
			remarks = $("#copyPostScript");
		
		depositForm.hide();
		depositDetails.css("display", "inline-block");

		bankName.text(result.receiver_account);
		accountName.val(result.receiver_name);
		email.val(result.email);
		amount.val(control.numberWithCommas(result.amount.toFixed(2)));
		remarks.val(result.remarks);

		control.copyClipboard();

		$(document).off("click", "#goBackDeposit")
				   .on("click", "#goBackDeposit", function(){
			depositDetails.hide();
			depositForm.css("display", "inline-block");
		});
	},
	/***************************************************************
	// Deposit - Alipay
	***************************************************************/
	alipay: function(){
		control.getUserInfo(function(result){
			if(result.status){
				// control.form();
				control.getWalletBalance();
				// control.customSelect("#alipayForm select");
				// control.selectDepositAmount("#alipayForm [name='amount']");
				// UI.postDepositAlipay();
			}else{
				window.location = "/";
			}
		});
	},
	/***************************************************************
	// Deposit - Conversion of Funds
	***************************************************************/
	conversionOfFunds: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.form();
				control.incDecDepositAmount("#conversionOfFundsForm [data-changeAmount]", "#conversionOfFundsForm [name='amount']", 100);
				control.selectDepositAmount("#conversionOfFundsForm [name='amount']");
				control.getWalletBalance(function(result){
					UI.loadTransferWalletList(result.value.balances);
					control.getProportionOfFunds(result.value.balances);
				});
				control.refreshTransferBalance();
				control.submitTransferBalance();
				control.limitTwoDecimal("#conversionOfFundsForm [name='amount']");
				control.validateTransferBalanceInput();
			}else{
				window.location = "/";
			}
		});
	},
	refreshTransferBalance: function(){
		$(document).off("click", "#refreshTransferBalance").on("click", "#refreshTransferBalance", function(){
			control.getWalletBalance(function(result){
				control.getProportionOfFunds(result.value.balances);
			});
		});
	},
	getProportionOfFunds: function(walletList){
		var totalBalance = 0, PVP, RNG, SAFE_BOX, LOTT;
        for(var i=0; i<walletList.length; i++){
            if( walletList[i].accountName != "FROZEN_ACCOUNT" ){
				switch (walletList[i]["accountName"]){
					case "PVP":
						PVP = walletList[i]["availBalance"];
						break;
					case "SAFE_BOX":
						SAFE_BOX = walletList[i]["availBalance"];
						break;
					case "RNG":
						RNG = walletList[i]["availBalance"];
						break;
					case "LOTT":
						LOTT = walletList[i]["availBalance"];
						break;
				}
				totalBalance += walletList[i]["availBalance"];
			}
        }
        $("#percent_PVP").css({ width: ((PVP/totalBalance)*100) +"%" })
        $("#percent_SAFE_BOX").css({ width: ((SAFE_BOX/totalBalance)*100) +"%" })
        $("#percent_RNG").css({ width: ((RNG/totalBalance)*100) +"%" })
        $("#percent_LOTT").css({ width: ((LOTT/totalBalance)*100) +"%" })

	},
	selectTransferWallet: function(){
		$(document).off("change", "#conversionOfFundsForm .form-control.ctSelect").on("change", "#conversionOfFundsForm .form-control.ctSelect", function(e){
			e.preventDefault();
			var form = $("#conversionOfFundsForm"),
				transferFrom = form.find("[name='transferFrom']"),
				transferTo = form.find("[name='transferTo']"),
				amount = form.find("[name='amount']");
			if( $(this).attr("name") == "transferFrom" ){
				if( transferFrom.val() != "" && transferFrom.val() == transferTo.val() ){
					transferTo.find("option[value='']").prop("selected", true).trigger("chosen:updated");
				}
			}else{
				if( transferTo.val() != "" && transferTo.val() == transferFrom.val() ){
					transferFrom.find("option[value='']").prop("selected", true).trigger("chosen:updated");
				}
			}
			control.validateTransferBalanceForm();
		});
	},
	getTransferFromBalance: function(){
		$(document).off("click", "#getTransferFromBalance").on("click", "#getTransferFromBalance", function(){
			var transferFrom = $("#conversionOfFundsForm [name='transferFrom']"),
				balance = transferFrom.find("option[value='" +transferFrom.val()+ "']").attr("data-walletBalance");
			$("#conversionOfFundsForm [name='amount']").val(balance);
			control.validateTransferBalanceForm();
		});
	},
	validateTransferBalanceInput: function(){
		$(document).off("keyup", "#conversionOfFundsForm [name='amount']").on("keyup", "#conversionOfFundsForm [name='amount']", function(){
			control.validateTransferBalanceForm();
		});
	},
	validateTransferBalanceForm: function(){
		var form = $("#conversionOfFundsForm"),
			transferFrom = form.find("[name='transferFrom']"),
			transferTo = form.find("[name='transferTo']"),
			amount = form.find("[name='amount']");

		// Validate TransferFrom, TransferTo and Amount
		if( transferFrom.val() == "" || transferTo.val() == "" || amount.val() == "" || !regExPattern("amount", amount.val()) || amount.val() == 0){
			form.removeClass("enable");
		}else{
			form.addClass("enable");
		}
	},
	submitTransferBalance: function(){
		$(document).off("click", "#conversionOfFundsForm .form-submit").on("click", "#conversionOfFundsForm .form-submit", function(){
			var form = $("#conversionOfFundsForm"),
				transferFrom = form.find("[name='transferFrom']"),
				transferTo = form.find("[name='transferTo']"),
				amount = form.find("[name='amount']"),
				submitBtn = form.find(".form-submit");

			if( form.hasClass("enable") ){

				// Validate TransferFrom
				if( transferFrom.val() == "" ){
					TCG.Alert("errors", TCG.Prop("Please Select TransferFrom"));
					return;
				}

				// Validate TransferTo
				if( transferTo.val() == "" ){
					TCG.Alert("errors", TCG.Prop("Please Select TransferTo"));
					return;
				}

				// Validate Amount
				if( amount.val() == "" ){
					TCG.Alert("errors", TCG.Prop("Please Input Amount!"));
					return;
				}

				if( !regExPattern("amount", amount.val()) ){
					TCG.Alert("errors", TCG.Prop("Invalid Amount!"));
					return;
				}

				if( !submitBtn.hasClass("processing") ){
					// Transfer to main wallet
					if( transferTo.val() == 2 ){
						submitBtn.addClass("processing");
						TCG.Ajax({ url: "./checkLockTransStatus", data: { accountTypeId: transferFrom.val() } }, function(result){
							if(result.status){
								// Wallet is locked
								if(result.result.status == 1){
									TCG.Ajax({ url: "./checkLockStatusByType", data: { accountTypeId: transferFrom.val() } }, function(result){
										var totalToRequired = 0;
										for (var key in result) {
										    // skip loop if the property is from prototype
										    if (!result.hasOwnProperty(key)) continue;
										    var obj = result[key];
										    for (var prop in obj) {
										        // skip loop if the property is from prototype
										        if(!obj.hasOwnProperty(prop)) continue;
												if(obj[prop].lock_status == "1"){
												    totalToRequired += parseInt(obj[prop].current_to_required);
												}
										    }
										}
										TCG.Alert("success", "无法转账，流水还剩余  " + totalToRequired, "警报");
										submitBtn.removeClass("processing");
									});
								}else{
									control.transferWalletBalance("from_sub_to_main", form);
								}
							}else{
								TCG.Alert("errors", TCG.Prop(result.description));
								submitBtn.removeClass("processing");
							}
						});
					// Transfer From Main Wallet
					}else if( transferFrom.val() == 2 ){
						submitBtn.addClass("processing");
						var walletAccountId = transferTo.find("option[value='" +transferTo.val()+ "']").attr("data-walletAccountId");
						TCG.Ajax({ url: "./checkLockStatus", data: { accountId: walletAccountId } }, function(result){
							if(result.status){
								switch(result.result.lock_status){
									case 0:
									case "0":
										control.transferWalletBalance("from_main_to_sub", form);
										break;
									case 1:
									case "1":
										TCG.Confirm("确定要把钱转移到钱包内？一旦转入必须完成红利才能转出。", "", function(ok){
											if(ok){
												control.transferWalletBalance("from_main_to_sub", form);
											}else{
												submitBtn.removeClass("processing");
											}
										});
										break;
									default:
										submitBtn.removeClass("processing");
								}
							}else{
								TCG.Alert("errors", TCG.Prop(result.description));
								submitBtn.removeClass("processing");
							}
						});
					}else{
						control.transferWalletBalance("from_sub_to_sub", form);
					}
				}
			}
		});
	},
	transferWalletBalance: function(type, form){
		var transferFrom = form.find("[name='transferFrom']"),
			transferTo = form.find("[name='transferTo']"),
			amount = form.find("[name='amount']"),
			resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit");

		// Check Type
		var url, data = {};
		switch(type){
			case "from_main_to_sub":
				url = "./transferFromMainWallet";
				data = { accountTypeId: transferTo.val(), amount: amount.val() };
				break;
			case "from_sub_to_main":
				url = "./transferToMainWallet";
				data = { accountTypeId: transferFrom.val(), amount: amount.val() };
				break;
			case "from_sub_to_sub":
				url = "./transferSubToSubWallet";
				data = { fromAccountTypeId: transferFrom.val(), toAccountTypeId: transferTo.val(), amount: amount.val() };
				break;
			default:
				submitBtn.removeClass("processing");
				console.log("Invalid Type");
				return;
		}

		TCG.Ajax({ url: url, data: data }, function(result){
			if(result.status){
				TCG.Alert("success", TCG.Prop("transfer_success"));
				resetBtn.click();
				form.removeClass("enable");
				control.resetCustomSelect(form);
				control.getWalletBalance(function(result){
					UI.loadTransferWalletList(result.value.balances);
					control.getProportionOfFunds(result.value.balances);
				});
			}else{
				TCG.Alert("errors", TCG.Prop(result.description))
			}
			submitBtn.removeClass("processing");
		});
	},
	/***************************************************************
	// Deposit - Deposit Records
	***************************************************************/
	depositRecords: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.customSelect("#depositRecordsForm select");
				control.datepickerStartEnd( $("#depositRecordsForm [name='startTime']"), $("#depositRecordsForm [name='endTime']") );
				control.searchDepositRecords();
				$("#depositRecordsForm .form-submit").click();
			}else{
				window.location = "/";
			}
		});
	},
	searchDepositRecords: function(){
		$(document).off("click", "#depositRecordsForm .form-submit").on("click", "#depositRecordsForm .form-submit", function(){
			var form = $("#depositRecordsForm"),
				submitBtn = form.find(".form-submit"),
				status = form.find("[name='status']"),
				method = form.find("[name='method']"),
				startTime = form.find("[name='startTime']"),
				endTime = form.find("[name='endTime']");
			if(!submitBtn.hasClass("processing")){
				submitBtn.addClass("processing");
				var data = { state: status.val(), depositMode: method.val(), startDate: startTime.val() +" 00:00:00", endDate: endTime.val() +" 23:59:59" };
				TCG.Ajax({ url: "./getDepositTransaction", data: data }, function(result){
					if(result.status){
						UI.loadDepositRecords(result.result);
					}else{
						TCG.Alert("errors", TCG.Prop(result.description));
					}
					submitBtn.removeClass("processing");
				});
			}
		});
	},
	/***************************************************************
	// Withdraw - withdrawal Request
	***************************************************************/
	withdrawalRequest: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.form();
				control.goToBindCard();
				control.selectBank();
				control.getWalletBalance();
				control.getBankCards("withdrawalRequest");
				control.submitWithdrawRequest();
				control.limitTwoDecimal("#requestWithdrawForm [name='amount']");
				control.validateWithdrawRequestInput();
				// Fixed Auto Fillup/Remember Password
				setTimeout(function(){
					$("#requestWithdrawForm .form-reset").click();
					$("#requestWithdrawForm").removeClass("hide")
				}, 500);
			}else{
				window.location = "/";
			}
		});
	},
	goToBindCard: function(){
		$(document).off("click", "#goToBindCard").on("click", "#goToBindCard", function(){
			$(".model_child_menus li[data-submenu='bindCard']").click();
		});
	},
	selectBank: function(){
		$(document).off("click", "#bankCardList.withdrawalRequest .banks").on("click", "#bankCardList.withdrawalRequest .banks", function(){
			var selectedBank = $(this),
				banks = $("#bankCardList .banks");
			banks.removeClass("selected");
			selectedBank.addClass("selected");
			$("#bankInfo .bankCardHolder").text('持卡人: '+selectedBank.attr("data-bankCardHolder") );
			$("#bankInfo .bankProvince").text('省份： '+selectedBank.attr("data-bankProvince"));
			$("#bankInfo .bankName").text('开户银行： '+selectedBank.attr("data-bankName"));
			$("#bankInfo .bankCardNo").text('银行卡号： '+selectedBank.attr("data-bankCardNo"));
			control.submitWithdrawRequest( selectedBank.attr("data-bankId") );
			control.validateWithdrawRequestForm();
	    });
	},
	validateWithdrawRequestInput: function(){
		$(document).off("keyup", "#requestWithdrawForm .form-control").on("keyup", "#requestWithdrawForm .form-control", function(){
			control.validateWithdrawRequestForm();
		});
	},
	validateWithdrawRequestForm: function(){
		var form = $("#requestWithdrawForm"),
			bankCard = $("#bankCardList .banks.selected"),
			amount = form.find("[name='amount']"),
			withdrawalPass = form.find("[name='withdrawalPass']");

		// Validate BankCard, Amount and Withdrawal Password
		if( bankCard[0] == undefined || amount.val() == "" || !regExPattern("amount", amount.val()) || withdrawalPass.val() == "" ){
			form.removeClass("enable");
		}else{
			form.addClass("enable");
		}	
	},
	submitWithdrawRequest: function(bankId){
		var bankId = bankId || null;
		$(document).off("click", "#requestWithdrawForm .form-submit").on("click", "#requestWithdrawForm .form-submit", function(){
			var form = $("#requestWithdrawForm"),
				amount = form.find("[name='amount']"),
				withdrawalPass = form.find("[name='withdrawalPass']"),
				resetBtn = form.find(".form-reset"),
				submitBtn = form.find(".form-submit"),
				checkInvalidRange = control.amountSetMinMax(amount.val(), 20, 500000);

			if( form.hasClass("enable") ){

				// Validate Bank ID
				if( bankId == null ){
					TCG.Alert("errors", TCG.Prop("requestWithdrawForm_bank_required"));
					return
				}

				// Validate Amount
				if( amount.val() == "" ){
					TCG.Alert("errors", TCG.Prop("requestWithdrawForm_amount_required"));
					return;
				}
				if( !regExPattern("amount", amount.val()) ){
					TCG.Alert("errors", TCG.Prop("requestWithdrawForm_amount_invalid"));
					return;
				}

				// Validate Withdrawal Password
				if( withdrawalPass.val() == "" ){
					TCG.Alert("errors", TCG.Prop("requestWithdrawForm_withdrawalPass_required"));
					return;
				}

				if(checkInvalidRange){ return }

				if( !submitBtn.hasClass("processing") ){
					submitBtn.addClass("processing");
					var dataRSA = { values: control.encode([ amount.val(), bankId, withdrawalPass.val() ]) };
					TCG.Ajax({ url: "./withdrawApply", data: dataRSA }, function(result){
						if(result.status){
							TCG.Alert("success", TCG.Prop(result.description));
							resetBtn.click();
							form.removeClass("enable");
							$("#bankCardList .banks").removeClass("selected");
							$("#bankInfo .bankCardHolder").html("&nbsp;");
							$("#bankInfo .bankProvince").html("&nbsp;");
							$("#bankInfo .bankName").html("&nbsp;");
							$("#bankInfo .bankCardNo").html("&nbsp;");
							control.getWalletBalance();
							control.submitWithdrawRequest();
							var withdrawRemaining = $("#requestWithdrawForm .remainingWithdrawTimes").text() - 1;
							$("#requestWithdrawForm .remainingWithdrawTimes").text(withdrawRemaining);
						}else{
							TCG.Alert("errors", TCG.Prop(result.description));
						}
						submitBtn.removeClass("processing");
					});
				}
			}
		});
	},
	/***************************************************************
	// Withdraw - withdrawal Records
	***************************************************************/
	withdrawalRecords: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.datepickerStartEnd($("#withdrawalForm [name='startTime']"), $("#withdrawalForm [name='endTime']"));
				control.customSelect("#withdrawalForm select");
				control.switchDecimal();
				control.getWithdrawalRecords();
				$("#withdrawalForm .form-submit").click();
			}else{
				window.location = "/";
			}
		});
	},
	getWithdrawalRecords: function(){
		$(document).off("click", "#withdrawalForm .form-submit").on("click", "#withdrawalForm .form-submit", function(){
			var form = $("#withdrawalForm"),
				submitBtn = form.find(".form-submit"),
				status = form.find("[name='status']"),
				startTime = form.find("[name='startTime']"),
				endTime = form.find("[name='endTime']"),
				data = {
					status: status.val(),
					startDate: startTime.val() + " 00:00:00",
					endDate: endTime.val() + " 23:59:59"
				};
			if( !submitBtn.hasClass("processing") ){
				submitBtn.addClass("processing");
				TCG.Ajax({ url: "./getWithdrawTransaction", data: data }, function(result){
					if(result.status){
						UI.loadWithdrawalRecords(result.result);
					}else{
						TCG.Alert("errors", TCG.Prop(result.description));
					}
					submitBtn.removeClass("processing");
				});
			}
		});
	},
	/***************************************************************
	// Withdraw - bindCard
	***************************************************************/
	bindCard: function(){
		control.getUserInfo(function(result){
			if(result.status){
				var userInfo = result.result;
				if( userInfo.email !== null ) $("#bindCardForm .form-group.mailbox").remove();
				if( userInfo.payee !== null ) $("#bindCardForm .form-group.withdrawName [name='withdrawName']").val( control.maskData(userInfo.payee,1) ).attr("readonly", "true").parent().addClass("dark");
				// Check WIthdrawal Password
				TCG.Ajax({ url: "./hasWithdrawalPassword" }, function(result){
					if(result.status){
						if(result.result == 1){
							$("#bindCardForm .form-group.withdrawPass").remove();
							$("#bindCardForm .form-group.conWithdrawPass").remove();
						}
						control.getProvinceList(function(provinceList){
							$("#bindCardForm [name='bankProvince']").html(provinceList);
							control.customSelect("#bindCardForm select");
							control.selectProvince("#bindCardForm [name='bankProvince']", "#bindCardForm [name='bankCity']");
						});
					}else{
						TCG.Alert("errors", TCG.Prop(result.description));
					}
				});
				// Get WIthdraw BankCards
				control.getWithdrawBankList();
				// Get BankCards
				control.getBankCards("bindCard");
				control.form();
				control.addBankCard(userInfo.payee);
				control.validateBindCardInput();
			}else{
				window.location = "/";
			}
		});
	},
	getWithdrawBankList: function(){
		TCG.Ajax({ url: "./getWithdrawBankList" }, function(result){
			if(result.status){
				UI.loadWithdrawBankList( result.result.withdraw_banks );
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		})
	},
	validateBindCardInput: function(){
		$(document).off("keyup", "#bindCardForm input.form-control").on("keyup", "#bindCardForm input.form-control", function(){
			control.validateBindCardForm();
		});
		$(document).off("change", "#bindCardForm select.form-control").on("change", "#bindCardForm select.form-control", function(){
			control.validateBindCardForm();
		});
	},
	validateBindCardForm: function(){
		var form = $("#bindCardForm"),
			payeeName = form.find("[name='withdrawName']"),
			bankCode = form.find("[name='bankName']"),
			bankName = bankCode.find("option[value='" +bankCode.val()+ "']").attr("data-bankName"),
			bankCardNo = form.find("[name='bankCardNo']"),
			bankProvince = form.find("[name='bankProvince']"),
			bankCity = form.find("[name='bankCity']"),
			bankBranch = form.find("[name='bankBranch']"),
			email = form.find("[name='mailbox']"),
			withdrawPass = form.find("[name='withdrawPass']"),
			conWithdrawPass = form.find("[name='conWithdrawPass']"),
			submitBtn = form.find(".form-submit");

		// Validate BankName/BankCode, Bank Card No., Province, City, Branch, PayeeName, Email, WithdrawPassword, Confirm Password
		if( submitBtn.attr("disabled") != undefined || bankCode.val() == "" || bankName == undefined || bankName == "" ||bankCardNo.val() == "" || !regExPattern("bankCardNumber", bankCardNo.val()) || bankProvince.val() == "" || bankCity.val() == "" || ( payeeName.attr("readonly") == undefined && ( payeeName.val() == "" || !regExPattern("alphaOnly",payeeName.val()) ) ) || ( email[0] && ( email.val() == "" || !regExPattern("email", email.val()) ) ) || ( withdrawPass[0] && ( withdrawPass.val() == "" || !regExPattern("password", withdrawPass.val()) || conWithdrawPass.val() == "" || conWithdrawPass.val() != withdrawPass.val() ) ) ){
			form.removeClass("enable");
		}else{
			form.addClass("enable");
		}
	},
	setBankCardLength: function(cardLength){
		globalVar.bankCardLengh = cardLength;
		// if the  bank cards are already exceeding the limit disabled the button/form
		if (globalVar.bankCardLengh >= globalVar.BANK_CARD_MAX_LIMIT) {
			$("#bindCardForm .form-submit").prop("disabled", true);
			$("#bindCardForm #cardLimitReminder").hide();
			$("#bindCardForm #cardLimitMessage").show();

			$(document).off("click", "#bindCardForm #cardLimitMessage span.blueText")
					   .on("click", "#bindCardForm #cardLimitMessage span.blueText", function(){
				control.customerService();
			});
		}
	},
	addBankCard: function(userPayeeName){
		//font-Adjust
		document.getElementsByClassName('long-white mem-icon po-middle')[1].childNodes[1].setAttribute("id", 'bankNo');
		$(document).bind("input propertychange", "#bankNo", function(){
		var bankCardNo = $("#bindCardForm").find("[name='bankCardNo']");
			if( bankCardNo.val().length > 14){
				document.getElementsByClassName('long-white mem-icon po-middle')[1].childNodes[1].style.fontSize = "11px";
			}
			else if(bankCardNo.val().length < 14){
				document.getElementsByClassName('long-white mem-icon po-middle')[1].childNodes[1].style.fontSize = "17px";
			}
	    });

		// Submit Form
		var userPayeeName = userPayeeName;
		$(document).off("click", "#bindCardForm .form-submit").on("click", "#bindCardForm .form-submit", function(){
			var form = $("#bindCardForm"),
				payeeName = form.find("[name='withdrawName']"),
				bankCode = form.find("[name='bankName']"),
				bankName = bankCode.find("option[value='" +bankCode.val()+ "']").attr("data-bankName"),
				bankCardNo = form.find("[name='bankCardNo']"),
				bankProvince = form.find("[name='bankProvince']"),
				bankCity = form.find("[name='bankCity']"),
				bankBranch = form.find("[name='bankBranch']"),
				email = form.find("[name='mailbox']"),
				withdrawPass = form.find("[name='withdrawPass']"),
				conWithdrawPass = form.find("[name='conWithdrawPass']"),
				resetBtn = form.find(".form-reset"),
				submitBtn = form.find(".form-submit");

			if( form.hasClass("enable") ){

				// Validate BankName/BankCode
				if( bankCode.val() == "" || bankName == undefined || bankName == "" ){
					TCG.Alert("errors", TCG.Prop("bindCardForm_bankName_required"));
					return
				}

				// Validate Bank Card No.
				if( bankCardNo.val() == "" ){
					TCG.Alert("errors", TCG.Prop("bindCardForm_bankCardNo_required"));
					return
				}

				if( !regExPattern("bankCardNumber", bankCardNo.val()) ){
					TCG.Alert("errors", TCG.Prop("bindCardForm_bankCardNo_invalid"));
					return
				}

				// Validate Province
				if( bankProvince.val() == "" ){
					TCG.Alert("errors", TCG.Prop("bindCardForm_bankProvince_required"));
					return
				}

				// Validate City
				if( bankCity.val() == "" ){
					TCG.Alert("errors", TCG.Prop("bindCardForm_bankCity_required"));
					return
				}

				// Check Payee Name
				if( userPayeeName == null  ){// payeeName[0] ){
					// Validate PayeeName
					if( payeeName.val() == "" ){
						TCG.Alert("errors", TCG.Prop("bindCardForm_withdrawName_required"));
						return;
					}else if(!regExPattern("alphaOnly",payeeName.val())){
						TCG.Alert("errors", TCG.Prop("bindCardForm_payeeName_invalid") );
						return;
					}else{
						payeeNameVal = payeeName.val();
					}
				}else{
					payeeNameVal = null;
				}

				// Check Email
				if( email[0] ){
					// Validate PayeeName
					if( email.val() == "" ){
						TCG.Alert("errors", TCG.Prop("bindCardForm_mailbox_required"));
						return;
					}else if( !regExPattern("email", email.val()) ){
						TCG.Alert("errors", TCG.Prop("bindCardForm_mailbox_invalid"));
						return;
					}else{
						emailVal = email.val();
					}
				}else{
					emailVal = null;
				}

				// Check Withdraw Pass
				if( withdrawPass[0] ){
					// Validate Withdraw Pass
					if( withdrawPass.val() == "" ){
						TCG.Alert("errors", TCG.Prop("bindCardForm_withdrawPass_required"));
						return;
					}else if( !regExPattern("password", withdrawPass.val()) ){
						TCG.Alert("errors", TCG.Prop("bindCardForm_withdrawPass_invalid"));
						return;
					}else{
						withdrawPassVal = withdrawPass.val();
					}

					// Confirm Password
					if( conWithdrawPass.val() == "" ){
						TCG.Alert("errors", "bindCardForm_confirmWithdrawPass_required");
						return;
					}else if(conWithdrawPass.val() != withdrawPass.val()){
						TCG.Alert("errors", "bindCardForm_confirmWithdrawPass_failed");
						return;
					}else{
						conWithdrawPassVal = conWithdrawPass.val();
					}

				}else{
					withdrawPassVal = null;
					conWithdrawPassVal = null;
				}

				// don't add a bank card if bankCard >= BANK_CARD_MAX_LIMIT
				if (globalVar.bankCardLengh >= globalVar.BANK_CARD_MAX_LIMIT) {
					// NOTE! current fix should not show a prompt, left this code for reference
					// TCG.Alert("errors", TCG.Prop("withdraw.bank.card.max"),"S"); 
					$("#bindCardForm .form-submit").prop("disabled", true);
				} else {
					// Add BankCard
					if( !submitBtn.hasClass("processing") ){
						submitBtn.addClass("processing");
						var dataRSA  = { values: control.encode([ bankCode.val(), bankName, bankCardNo.val(), bankProvince.val(), bankCity.val(), bankBranch.val(), emailVal, payeeNameVal, withdrawPassVal, conWithdrawPassVal ]) };
						TCG.Ajax({ url: "./withdraw/addCard", data: dataRSA }, function(result){
							if(result.status){
								resetBtn.click();
								form.removeClass("enable");
								bankCity.html("<option value=''>市</option>");
								control.resetCustomSelect(form);
								control.getBankCards("bindCard");

								if( emailVal != null ) form.find(".form-group.mailbox").remove();
								if( withdrawPassVal != null ) form.find(".form-group.withdrawPass").remove();
								if( conWithdrawPassVal != null ) form.find(".form-group.conWithdrawPass").remove();

								if( payeeNameVal != null ){
									payeeName.val( control.maskData(payeeNameVal,1) ).parent().addClass("dark");
									control.addBankCard(payeeNameVal);
								}else{
									payeeName.val( control.maskData(userPayeeName,1) );
									control.addBankCard(userPayeeName);
								}

								TCG.Alert("success", TCG.Prop("bindCardForm_bind_Success"));
							}else{
								TCG.Alert("errors", TCG.Prop(result.description));
							}
							submitBtn.removeClass("processing");
						});
					}
				}
			}
	    });
	},
	/***************************************************************
	// Personal - myProfile
	***************************************************************/
	myProfile: function(){
		control.getUserInfo(function(result){
			if(result.status){
				var form = $("#myProfileForm");
				var userInfo = result.result;
				if(userInfo.payee) form.find("[name='payeeName']").parents(".form-input").addClass("readonly").html(userInfo.payee);
				if(userInfo.email) form.find("[name='email']").parents(".form-input").addClass("readonly").html(userInfo.email);
				form.find("[name='nickname']").val(userInfo.nickname);
				form.find("[name='mobileNo']").val(userInfo.mobile);
				form.find("[name='qq']").val(userInfo.qq);
				TCG.Ajax({ url: "./hasWithdrawalPassword" }, function(result){
					if(result.status){
						if(result.result == 1){
							form.find("[name='withdrawPass']").parents(".form-input").addClass("readonly").html( "********" );
							form.find("[name='conWithdrawPass']").parents(".form-input").addClass("readonly").html( "********" );
						}
						control.form();
						control.checkNicknameAvailability(userInfo.nickname);
						control.submitMyProfile(userInfo.payee, userInfo.email, result.result);
						control.validateMyProfileInput();
						control.validateMyProfileForm();
					}else{
						TCG.Alert("errors", TCG.Prop(result.description));
					}
				});
			}else{
				window.location = "/";
			}
		});

	},
	checkNicknameAvailability: function(currentNickname){
		var currentNickname = currentNickname;
		$(document).off("focusout", "#myProfileForm [name='nickname']").on("focusout", "#myProfileForm [name='nickname']", function(){
			var nickname = $(this).val(),
				isValid = nickname != "" ? true : false;
			if( isValid && ( ( currentNickname == null ) || ( currentNickname != null && currentNickname != nickname ) ) ){
				var data = {
						merchantCode: globalVar.merchantCode,
						nickname: nickname
					};
				TCG.Ajax({ url: "./checkNickname", data: data }, function(result){
					if(!result.status){
						TCG.Alert("errors", TCG.Prop(result.description));
					}
				});
			}
		});
	},
	validateMyProfileInput: function(){
		$(document).off("keyup", "#myProfileForm .form-control").on("keyup", "#myProfileForm .form-control", function(){
			control.validateMyProfileForm();
		});
	},
	validateMyProfileForm: function(){
		var form = $("#myProfileForm"),
			payeeName = form.find("[name='payeeName']"),
			withdrawPass = form.find("[name='withdrawPass']"),
			withdrawConPass = form.find("[name='conWithdrawPass']"),
			email = form.find("[name='email']"),
			nickname = form.find("[name='nickname']"),
			mobileNo = form.find("[name='mobileNo']"),
			qq = form.find("[name='qq']");
		// Validate PayeeName, Email, Withdraw Pass, Confirm Withdraw Pass
		if(( payeeName[0] != undefined && ( payeeName.val() == "" || !regExPattern("alphaOnly",payeeName.val()) ) ) || ( email[0] != undefined && ( email.val() == "" || !regExPattern("email",email.val()) ) )  || ( withdrawPass[0] != undefined && ( withdrawPass.val() == "" || !regExPattern("password", withdrawPass.val()) || withdrawPass.val() != withdrawConPass.val() ) )){
			form.removeClass("enable");
		}else{
			form.addClass("enable");
		}
	},
	submitMyProfile: function(payeeName, email, hasWithdrawPass){
		var userInfo = { payeeName: payeeName, email: email, hasWithdrawPass: hasWithdrawPass };
		$(document).off("click", "#myProfileForm .form-submit").on("click", "#myProfileForm .form-submit", function(){
			var form = $("#myProfileForm"),
				payeeName = form.find("[name='payeeName']"),
				withdrawPass = form.find("[name='withdrawPass']"),
				withdrawConPass = form.find("[name='conWithdrawPass']"),
				email = form.find("[name='email']"),
				nickname = form.find("[name='nickname']"),
				mobileNo = form.find("[name='mobileNo']"),
				qq = form.find("[name='qq']");

			if( form.hasClass("enable") ){

				// Validate Nickname
				if( nickname.val() == "" ){
					TCG.Alert("errors", TCG.Prop("submitMyProfile_nickname_required") );
					return;
				}

				// Validate Mobile
				if( mobileNo.val() != "" && !regExPattern("mobileNo",mobileNo.val()) ){
					TCG.Alert("errors", TCG.Prop("submitMyProfile_mobileno_required") );
					return;
				}

				// Validate QQ
				if( qq.val() != "" && !regExPattern("numberOnly",qq.val()) ){
					TCG.Alert("errors", TCG.Prop("submitMyProfile_qqno_required") );
					return;
				}

				var data = { nickname: nickname.val(), mobile: mobileNo.val(), qq: qq.val() };
				// Check PayeeName
				if( userInfo.payeeName == undefined ){
					// Validate PayeeName
					if( payeeName.val() == "" ){
						TCG.Alert("errors", TCG.Prop("submitMyProfile_withdrawalName_required") );
						return;
					}else if(!regExPattern("alphaOnly",payeeName.val())){
						TCG.Alert("errors", TCG.Prop("submitMyProfile_withdrawalName_required") );
						return;
					}else{
						data.payeename = payeeName.val();
					}
				}else{
					data.payeename = userInfo.payeeName;
				}

				// Check Email
				if( userInfo.email == undefined ){
					// Validate Email
					if( email.val() == "" ){
						TCG.Alert("errors", TCG.Prop("submitMyProfile_email_required") );
						return;
					}else if(!regExPattern("email",email.val())){
						TCG.Alert("errors", TCG.Prop("submitMyProfile_email_required") );
						return;
					}else{
						data.mail = email.val();
					}
				}else{
					data.mail = userInfo.email;
				}

				// Check Withdraw Pass
				if( userInfo.hasWithdrawPass == 1 ){
					// Update Info
					control.updateMyProfile(form, data);
				}else{
					// Validate Withdraw Pass
					if( withdrawPass.val() == "" ){
						TCG.Alert("errors", TCG.Prop("submitMyProfile_password_required") );
						return;
					}else if(!regExPattern("password", withdrawPass.val()) ){
						TCG.Alert("errors", TCG.Prop("submitMyProfile_password_required") );
						return;
					}else{
						// Confirm Password
						if( withdrawPass.val() != withdrawConPass.val() ){
							TCG.Alert("errors", TCG.Prop("submitMyProfile_fundPassword_required") );
							return;
						}else{
							// Update Info and Set Withdraw Password
							var dataRSA = { values: control.encode([ withdrawPass.val(), withdrawConPass.val(), 1 ]) };
							control.updateMyProfile(form, data, dataRSA);
						}
					}
				}
			}
		});
	},
	updateMyProfile: function(form, data, dataRSA){
		var submitBtn = form.find(".form-submit");
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			TCG.Ajax({ url: "./updatememberinfo", data: data }, function(result){
				if(result.status){
					// Update Withdraw Pass
					if( dataRSA ){
						control.setWithdrawPass(form, data, dataRSA);
						TCG.Alert("success", TCG.Prop("myProfileForm_pinfo_success"));
					}else{
						TCG.Alert("success", TCG.Prop("myProfileForm_pinfo_success"));
						submitBtn.removeClass("processing");
						control.submitMyProfile(data.payeename, data.mail, 1);
					}
					//
					control.checkNicknameAvailability(data.nickname);
					if(form.find("[name='payeeName']")[0]) form.find("[name='payeeName']").parents(".form-input").addClass("readonly").html(data.payeename);
					if(form.find("[name='email']")[0]) form.find("[name='email']").parents(".form-input").addClass("readonly").html(data.mail);
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
					submitBtn.removeClass("processing");
				}
			});
		}
	},
	setWithdrawPass: function(form, data, dataRSA){
		var submitBtn = form.find(".form-submit");
		TCG.Ajax({ url: "./setPaymentPassword", data: dataRSA }, function(result){
			if(result.status){
				//TCG.Alert("success", TCG.Prop(result.description));
				if(form.find("[name='withdrawPass']")[0]) form.find("[name='withdrawPass']").parents(".form-input").addClass("readonly").html( "********" );
				if(form.find("[name='conWithdrawPass']")[0]) form.find("[name='conWithdrawPass']").parents(".form-input").addClass("readonly").html( "********" );
				control.submitMyProfile(data.payeename, data.mail, 1);
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
				control.submitMyProfile(data.payeename, data.mail, 0);
			}
			submitBtn.removeClass("processing");
		});
	},
	/***************************************************************
	// Personal - bonusDetails
	***************************************************************/
	bonusDetails: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.clickBonusDetailsTab();
				control.getCustomerSeries();
			}else{
				window.location = "/";
			}
		});
	},
	clickBonusDetailsTab: function(){
	    $(document).off("click","#bonusDetailsTabs .tab-btn").on("click","#bonusDetailsTabs .tab-btn", function(){
	    	var rel = $(this).attr("data-rel");
	      	$("#bonusDetailsTabs .tab-btn").removeClass("sel").addClass("unsel");
	      	$(this).removeClass("unsel").addClass("sel");
	      	$("#bonusDetailsTabs .tab-content").hide();
	      	$("#"+rel).show();
	    });
	},
	getCustomerSeries: function(){
		$.ajax({
		    url: "./lgw/customers/series",
		    headers: globalVar.headers,
		   	dataType: "json",
		    contentType: "application/json",
		    complete: function(result, textStatus, jqXHR){
				var resultJSON = result.responseJSON;
		   		switch(result.status){
					case 200:
						UI.loadCustomerSeries(resultJSON);
						break;
					case 500:
						TCG.Alert("errors", TCG.Prop(resultJSON.errorCode));
						break;
					default:
		   		}
		    }
		});
	},
	/***************************************************************
	// Personal - gameHistory
	***************************************************************/
	gameHistory: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.form();
				control.switchDecimal();
				control.switchGameHistory();
	
				// Lotto
				control.showMoreFilter();
				control.searchLottoGameHistory();
				control.viewLottoGameHistoryItem();
				control.datepickerStartEnd($("#lottoGameHistoryForm [name='startTime']"), $("#lottoGameHistoryForm [name='endTime']"), 0);
				control.customSelect("#lottoGameHistoryForm [name='chaseNo']");
				UI.loadQueryConditionList(globalVar.headers, function(obj){
					$("#lottoGameHistoryForm [name='game']").html(obj.games);
					control.customSelect("#lottoGameHistoryForm [name='game']");
					control.customSelect("#lottoGameHistoryForm [name='status']");
					$("#lottoGameHistoryForm [name='pageNo']").val(1);
					$("#lottoGameHistoryForm .form-submit").click();
				});

				// pvp
				control.datepickerStartEnd($("#pvpGameHistoryForm [name='startTime']"), $("#pvpGameHistoryForm [name='endTime']"), 0);
				control.customSelect("#pvpGameHistoryForm select");
				control.searchPvpGameHistory(result.result.customerId);
			}else{
				window.location="/";
			}
		});

	},
	switchGameHistory: function(){
		$(document).off("click", "#switchGameHistory li").on("click", "#switchGameHistory li", function(){
			var rel = $(this).attr("data-rel");
			if( !$(this).hasClass("active") ){
				if(rel == "lotto"){
					$("#lottoGameHistoryForm").removeClass("hide");
					$("#lottoGameHistoryTable").removeClass("hide");
					$("#lottoGameHistoryTotal").removeClass("hide");

					$("#pvpGameHistoryForm").addClass("hide");
					$("#pvpGameHistoryTable").addClass("hide");
					$("#pvpGameHistoryTotal").addClass("hide");

					$("#lottoGameHistoryForm .form-submit").click();
				}else{
					$("#lottoGameHistoryForm").addClass("hide");
					$("#lottoGameHistoryTable").addClass("hide");
					$("#lottoGameHistoryTotal").addClass("hide");
					
					$("#pvpGameHistoryForm").removeClass("hide");
					$("#pvpGameHistoryTable").removeClass("hide");
					$("#pvpGameHistoryTotal").removeClass("hide");

					$("#pvpGameHistoryForm .form-submit").click();
				}
				$("#switchGameHistory li.active").removeClass("active");
				$(this).addClass("active");
			}
		});
	},
	// Lotto
	searchLottoGameHistory: function(){
		$(document).off("click", "#lottoGameHistoryForm .form-submit").on("click", "#lottoGameHistoryForm .form-submit", function(){
			control.getLottoGameHistory();
		});
	},
	showMoreFilter: function(){
		$(document).off("click", "#lottoGameHistoryForm .tabBtn").on("click", "#lottoGameHistoryForm .tabBtn", function(){
			var form = $("#lottoGameHistoryForm"),
				otherFilter = form.find(".otherFilter"),
				table = $("#tableContainer");
			if( otherFilter.hasClass("hide") ){
				$(this).addClass("active");
				otherFilter.removeClass("hide");
				table.addClass("mini");
				$("#lottoGameHistoryList").addClass("y-overflow");
				control.customSelect("#lottoGameHistoryForm [name='chaseStatus']");
			}else{
				$(this).removeClass("active");
				otherFilter.addClass("hide");
				table.removeClass("mini");
				$("#lottoGameHistoryList").removeClass("y-overflow");
			}
		});
	},
	getLottoGameHistory: function(){
		var form = $("#lottoGameHistoryForm"),
			formInput = form.find(".form-control"),
			submitBtn = form.find(".form-submit"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			status = form.find("[name='status']"),
			game = form.find("[name='game']"),
			order = form.find("[name='order']"),
			issue = form.find("[name='issue']"),
			chaseStatus = form.find("[name='chaseStatus']"),
			pageNo = form.find("[name='pageNo']"),
			arr = order.val().split("-"),
			orderNumber = arr[0] || "",
			chasingOrder = "";

		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");

			if( arr[1] != undefined ){
				chasingOrder = isNaN(arr[1]) ? arr[1] : arr[1]*1;
			}

			var data = {
				"startDate": Number(new Date(startTime.val().replace(/\-/g,"/")+ " 00:00:00")),
				"endDate": Number(new Date(endTime.val().replace(/\-/g,"/")+ " 23:59:59")),
				"orderStatus": status.val(),
				"gameId": game.val(),
				"orderNumber": orderNumber,
				"chasingOrder": chasingOrder,
				"numero": issue.val(),
				"chasingStatus": chaseStatus.val(),
				"page": (pageNo.val()*1)  - 1,
				"size": 6
			};

			$.ajax({
			    url: "./lgw/orders",
			    headers: globalVar.headers,
			    data: JSON.stringify(data),
			   	dataType: "json",
			    contentType: "application/json",
			    type: "POST",
			    complete: function(result, textStatus, jqXHR){
					var resultJSON = result.responseJSON;
			   		switch(result.status){
						case 200:
					    	UI.loadLottoGameHistory(resultJSON);
							UI.loadPagination("lottoGameHistory", pageNo.val(), resultJSON.orders.totalPages)
							break;
						case 500:
							TCG.Alert("errors", TCG.Prop(resultJSON.errorCode));
							break;
						default:
			   		}
			    	submitBtn.removeClass("processing");
			    }
			});

		}
	},
	viewLottoGameHistoryItem: function(){
		$(document).off("click", "#lottoGameHistoryList .openItem").on("click", "#lottoGameHistoryList .openItem", function(){
			$("#listWrapper").addClass("hide");
			$("#itemWrapper").removeClass("hide");
			control.getGameHistoryItem($(this).attr("data-orderId"));
	    });
	},
	getGameHistoryItem: function(orderId){
		$.ajax({
		    url: "./lgw/orders/detail/" + orderId,
		    headers: globalVar.headers,
		   	dataType: "json",
		    contentType: "application/json",
		    success: function(result, textStatus, jqXHR){
				UI.loadLottoGameHistoryItem(result);
				control.cancelGameHistoryDetail();
				$("#cancelOrderDetailId").val(orderId);
		    }
		});
	},
	cancelGameHistoryDetail: function(){
		$(document).off("click", "#cancelGameHistoryDetail").on("click", "#cancelGameHistoryDetail", function(){
			TCG.Confirm(TCG.Prop("gameHistoryCancel"), "", function(ok){
				if(ok){
					var orderDetailId = $("#cancelOrderDetailId").val();
					$.ajax({
					    url: "./lgw/orders/suborders/cancel",
					    headers: globalVar.headers,
					    data: '['+orderDetailId+']',
					    type: "PUT",
					   	dataType: "json",
					    contentType: "application/json",
					    complete: function(result, textStatus, jqXHR){
					    	switch(result.status){
					    		case 500:
						    		TCG.Alert("errors", TCG.Prop(result.responseJSON.errorCode));
					    			break;
					    		case 200:
									$("#cancelGameHistoryDetail").parent().hide();
							 		$("#itemWrapper .orderStatus").text( TCG.Prop("orderStatus_8") );		
							 		TCG.Alert("success", TCG.Prop("gameHistoryCancel_success"));	 		
					    			break;
								default:
						    		console.log("errors", TCG.Prop(result.responseJSON.errorCode) + ", statusCode: " + result.status);
					    	}
					    }
					});					
				}
			})
		});
	},
	goBackToGameHistory: function(){
		$(document).off("click", "#backToGameHistory").on("click", "#backToGameHistory", function(){
 			$("#listWrapper").removeClass("hide");
 			$("#itemWrapper").addClass("hide");
 			control.getLottoGameHistory();
 	   });
	},
	// Pvp
	searchPvpGameHistory: function(customerId){
		var customerId = customerId;
		$(document).off("click", "#pvpGameHistoryForm").on("click", "#pvpGameHistoryForm", function(){
			control.getPvpGameHistory(customerId);
		});
	},
	getPvpGameHistory: function(customerId){		
		var form = $("#pvpGameHistoryForm"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			gameType = form.find("[name='gameType']"),
			gameRoom = form.find("[name='gameRoom']"),
			pageNo = form.find("[name='pageNo']"),
			submitBtn = form.find(".form-submit"),
			data = {
				customerId: customerId,
				startDate: startTime.val(),
				endDate: endTime.val(),
				gameType: gameType.val(),
				gameRoom: gameRoom.val(),
				pageNo: pageNo.val(),
				pageSize: 10
			};
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			TCG.Ajax({ url: "./getAccountGameBetHistory", data: data }, function(result){
				if(result.status){
					UI.loadPvpGameHistory(result.result, gameType.val());
					var pageSize = result.result.page.pageSize,
						totalPage = Math.ceil(result.result.page.total/pageSize);
					UI.loadPagination("pvpGameHistory", result.result.page.currentPage, totalPage);
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
				}
				submitBtn.removeClass("processing");
			});
		}
	},
	/***************************************************************
	// Personal - norecordChase
	***************************************************************/
	norecordChase: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.datepickerStartEnd($("#norecordChaseForm [name='startTime']"), $("#norecordChaseForm [name='endTime']"), 0);
				control.switchDecimal();
				control.searchNorecordChase();
				control.selectNoRecordChase();
				UI.loadQueryConditionList(globalVar.headers, function(obj){
					$("#norecordChaseForm [name='game']").html(obj.games);
					control.customSelect("#norecordChaseForm select")
					$("#norecordChaseForm [name='pageNo']").val(1);
					$("#norecordChaseForm .form-submit").click();
				});				
			}else{
				window.location="/";
			}
		})
	},
	searchNorecordChase: function(){
		$(document).off("click", "#norecordChaseForm .form-submit").on("click", "#norecordChaseForm .form-submit", function(){
			var form = $("#norecordChaseForm"),
				submitBtn = form.find(".form-submit"),
				status = form.find("[name='status']"),
				game = form.find("[name='game']"),
				startTime = form.find("[name='startTime']"),
				endTime = form.find("[name='endTime']"),
				order = form.find("[name='order']"),
				issue = form.find("[name='issue']"),
				chaseStatus = form.find("[name='chaseStatus']"),
				pageNo = form.find("[name='pageNo']"),
				arr = order.val().split("-"),
				orderNumber = arr[0] || "",
				chasingOrder = "";
			if( !submitBtn.hasClass("processing") ){
				submitBtn.addClass("processing");

				if( arr[1] != undefined ){
					chasingOrder = isNaN(arr[1]) ? arr[1] : arr[1]*1;
				}

				var data = {
					"startDate": Number(new Date(startTime.val().replace(/\-/g,"/")+ " 00:00:00")),
					"endDate": Number(new Date(endTime.val().replace(/\-/g,"/")+ " 23:59:59")),
					"orderStatus": status.val(),
					"gameId": game.val(),
					"orderNumber": orderNumber,
					"chasingOrder": chasingOrder,
					"numero": issue.val(),
					"chasingStatus": "1",
					"page": (pageNo.val()*1)  - 1,
					"size": 6
				};

				$.ajax({
				    url: "./lgw/orders",
				    headers: globalVar.headers,
				    data: JSON.stringify(data),
				   	dataType: "json",
				    contentType: "application/json",
				    type: "POST",
				    complete: function(result, textStatus, jqXHR){
						var resultJSON = result.responseJSON;
				   		switch(result.status){
							case 200:
						    	UI.loadNorecordChase(resultJSON);
								// UI.loadPagination("lottoGameHistory", pageNo.val(), resultJSON.orders.totalPages)
								break;
							case 500:
								TCG.Alert("errors", TCG.Prop(resultJSON.errorCode));
								break;
							default:
				   		}
				    	submitBtn.removeClass("processing");
				    }
				});		
			}	
		});
	},
	viewNoRecordChaseItem: function(){
		$(document).off("click", "#itemWrapper .capsuleTab li").on("click","#itemWrapper .capsuleTab li", function(){
			var tab = $(this).attr("data-rel");
			$("#itemWrapper .capsuleTab li.active").removeClass("active");
			$(this).addClass("active");
			$("#itemWrapper .tab1Content").addClass("hide");
			$("#itemWrapper .tab2Content").addClass("hide");
			$("#itemWrapper ."+tab).removeClass("hide");
		});
	},
	selectNoRecordChase: function(){
		$(document).off("click", "#norecordChaseList .openItem").on("click", "#norecordChaseList .openItem", function(){
			var orderId = $(this).attr("data-orderId");
			$("#norecordChase").addClass("hide");
			$("#itemWrapper").removeClass("hide");
			control.viewNoRecordChaseItem();
			control.backToNoRecordChase();
			$("#itemWrapper .capsuleTab li[data-rel='tab1Content']").click();
			control.getNoRecordChaseItem(orderId);
		});
	},
	backToNoRecordChase: function(){
		$(document).off("click", "#backToNoRecordChase").on("click", "#backToNoRecordChase", function(){
			$("#itemWrapper").addClass("hide");
			$("#norecordChase").removeClass("hide");
		});
	},
	getNoRecordChaseItem: function(orderId){
		$.ajax({
		    url: "./lgw/orders/detail/" + orderId,
		    headers: globalVar.headers,
		   	dataType: "json",
		    contentType: "application/json",
		    success: function(result, textStatus, jqXHR){
				UI.loadNoRecordChaseItem(result);
				// control.cancelGameHistoryDetail();
				// $("#cancelOrderDetailId").val(orderId);
		    }
		});
	},	
	/***************************************************************
	// Personal - changeAccount
	***************************************************************/
	changeAccount: function(){
		control.getUserInfo(function(result){
			if(result.status){
				$("#changeAccountForm [name='pageNo']").val(1);
				control.form();
				control.datepickerStartEnd($("#changeAccountForm [name='startTime']"), $("#changeAccountForm [name='endTime']"));
				control.searchTransactionDetails();
				control.switchDecimal();
				control.getWalletList("#changeAccountForm [name='account']", function(){
			        //$("#changeAccountForm .form-submit").click();
				});
				control.onChangeSelect();
				control.changeOptions("#changeAccountForm [name='account']", "#changeAccountForm [name='type']");
				control.customSelect("#changeAccountForm [name='type']");
			}else{
				window.location="/";
			}
		});
	},
	onChangeSelect: function(){
		$(document).off("change", "#changeAccountForm [name='account']")
				   .on("change", "#changeAccountForm [name='account']", function(){
			control.changeOptions("#changeAccountForm [name='account']", "#changeAccountForm [name='type']");
			$("#changeAccountList").html("");
		});
	},
	changeOptions: function(account, type){
		var select = $(account),
			type = $(type),
			selected = select.find("option:selected").val();
			//console.log(selected);

			type.remove("options");

			switch(selected){
				// PVP
				case "1":
					var options = "";
					options += '<option value="5100,5112,5200" class="entire" selected>全部</option>';
					options += '<optgroup label="收入">';
						options += '<option value="5100">对战盈亏</option>';	
						options += '<option value="5112">活动</option>';
						options += '<option value="">钱包转账</option>';
					options += '</optgroup>';

					options += '<optgroup label="支出">';
						options += '<option value="5200">对战盈亏</option>';
						options += '<option value="">钱包转账</option>';
					options += '</optgroup>';

					$(type).html(options);
					break;

				// Main
				case "2":
					var options = "";
					options += '<option value="6101,6112,8122,6104,6111,6109,6114,4105,6113,6201,8202,8222,6207" class="entire" selected>全部</option>';
					options += '<optgroup label="收入">';
						options += '<option value="6101">存款</option>';	
						options += '<option value="">彩票分红</option>';
						options += '<option value="6112">电玩分红</option>';
						options += '<option value="">活动</option>';
						options += '<option value="">钱包转账</option>';
						options += '<option value="8122">系统充正</option>';
						options += '<option value="6104">上下级转账</option>';
						options += '<option value="6111">对战玩家返水</option>';
						options += '<option value="6109">对战代理返点</option>';
						options += '<option value="6114">彩票代理返点</option>';
						options += '<option value="4105">彩票个人返点</option>';
						options += '<option value="6113">电子返水</option>';
					options += '</optgroup>';

					options += '<optgroup label="支出">';
						options += '<option value="6201">提款</option>';
						options += '<option value="8202">钱包转账</option>';
						options += '<option value="8222">系统冲负</option>';
						options += '<option value="6207">上下级转账</option>';
					options += '</optgroup>';
					
					$(type).html(options);
					break;

				// RNG
				case "3":
					var options = "";
					options += '<option value="3100,3102,3101,3200,3201" class="entire" selected>全部</option>';
					options += '<optgroup label="收入">';
						options += '<option value="3100">中奖</option>';	
						options += '<option value="3102">活动</option>';
						options += '<option value="3101">钱包转账</option>';
					options += '</optgroup>';

					options += '<optgroup label="支出">';
						options += '<option value="3200">投注</option>';
						options += '<option value="3201">钱包转账</option>';
					options += '</optgroup>';

					$(type).html(options);

					break;

				// Lotto
				case "4":
					var options = "";
					options += '<option value="4100,4106,4107,4108,4109,4110,4111,4104,4101,4200,4201,4208" class="entire" selected>全部</option>';
					options += '<optgroup label="收入">';
						options += '<option value="4100">中奖</option>';								
						options += '<option value="4106,4107,4108,4109,4110,4111">撤单</option>';
						options += '<option value="4104">活动</option>';	
						options += '<option value="4101">钱包转账</option>';
					options += '</optgroup>';

					options += '<optgroup label="支出">';
						options += '<option value="4200">投注</option>';
						options += '<option value="4201">钱包转账</option>';
						options += '<option value="4208">撤单手续费</option>';
					options += '</optgroup>';

					$(type).html(options);
					break;
				default:
			}

			$(type).trigger("chosen:updated");
	},
	searchTransactionDetails: function(){
		$(document).off("click", "#changeAccountForm .form-submit").on("click", "#changeAccountForm .form-submit", function(){
			control.getTransactionDetails();
		});
	},
	getTransactionDetails: function(){
		var form = $("#changeAccountForm"),
			accountType = form.find("[name='account']"),
			transactionType = form.find("[name='type']"),
			types = transactionType.chosen().val(),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			pageNo = form.find("[name='pageNo']"),
			pageNoVal = pageNo.val() == "" ? 1 : pageNo.val(),
			submitBtn = form.find(".form-submit");
			
			types = types.filter(Boolean);
			types = types.join();

		if(!submitBtn.hasClass("processing")){
			submitBtn.addClass("processing");
			var data = {
				accountType: accountType.val(),
				transactionType: types,
				startTime: startTime.val(),
				endTime: endTime.val(),
				pageNo: pageNoVal,
				pageSize: 9
			};
			TCG.Ajax({ url: "./getTransactionDetails", data: data }, function(result){
				if(result.status){
					UI.loadTransactionDetails(result.result);
					UI.loadPagination("transactionDetails", result.result.pageNo, result.result.totalPage)
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
				}
				submitBtn.removeClass("processing");
			});
		}
	},
	/***************************************************************
	// Personal - palStatements
	***************************************************************/
	palStatementsPersonal: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.datepickerStartEnd($("#lottoPersonalPnlForm [name='startTime']"), $("#lottoPersonalPnlForm [name='endTime']"));
				control.datepickerStartEnd($("#pvpPersonalPnlForm [name='startTime']"), $("#pvpPersonalPnlForm [name='endTime']"));
				control.switchPersonalPnl();
				control.switchDecimal();
				$("#lottoPersonalPnlForm [name='pageNo']").val(1);
				$("#pvpPersonalPnlForm [name='pageNo']").val(1);
				control.searchLottoPersonalPnlStatements(result.result.customerId);
				control.searchPvpPersonalPnlStatements(result.result.customerId);
				$("#lottoPersonalPnlForm .form-submit").click();
			}else{
				window.location="/";
			}
		})
	},
	switchPersonalPnl: function(){
		$(document).off("click", "#switchPersonalPnl li").on("click", "#switchPersonalPnl li", function(){
			var rel = $(this).attr("data-rel");
			if( !$(this).hasClass("active") ){
				if(rel == "lotto"){
					$("#pvpPersonalPnlForm").addClass("hide");
					$("#pvpPersonalPnlTable").addClass("hide");
					$("#lottoPersonalPnlForm").removeClass("hide");
					$("#lottoPersonalPnlTable").removeClass("hide");
					$("#lottoPersonalPnlForm .form-submit").click();
				}else{
					$("#lottoPersonalPnlForm").addClass("hide");
					$("#lottoPersonalPnlTable").addClass("hide");
					$("#pvpPersonalPnlForm").removeClass("hide");
					$("#pvpPersonalPnlTable").removeClass("hide");
					$("#pvpPersonalPnlForm .form-submit").click();
				}
				$("#switchPersonalPnl li.active").removeClass("active");
				$(this).addClass("active");
			}
		});
	},
	searchLottoPersonalPnlStatements: function(customerId){
		var customerId = customerId;
		$(document).off("click", "#lottoPersonalPnlForm .form-submit").on("click", "#lottoPersonalPnlForm .form-submit", function(){
			var form = $("#lottoPersonalPnlForm"),
				submitBtn = form.find(".form-submit"),
				startTime = form.find("[name='startTime']"),
				endTime = form.find("[name='endTime']"),
				pageNo = form.find("[name='pageNo']")
				data = {
					customerId: customerId,
					startDate: startTime.val()+ " 00:00:00",
					endDate: endTime.val()+ " 23:59:59",
					pageNo: pageNo.val(),
					pageSize: 100
				};
			if( !submitBtn.hasClass("processing") ){
				submitBtn.addClass("processing");
				TCG.Ajax({ url: "./getDetailedLottoPNLReport", data: data }, function(result){
					if(result.status){
						UI.loadLottoPersonalPnlStatements(result.result);
					}else{
						TCG.Alert("errors", TCG.Prop(result.description));
					}
					submitBtn.removeClass("processing");
				});
			}
		});
	},
	searchPvpPersonalPnlStatements: function(customerId){
		var customerId = customerId;
		$(document).off("click", "#pvpPersonalPnlForm .form-submit").on("click", "#pvpPersonalPnlForm .form-submit", function(){
			var form = $("#pvpPnlForm"),
				submitBtn = form.find(".form-submit"),
				startTime = form.find("[name='startTime']"),
				endTime = form.find("[name='endTime']"),
				data = {
					startTime: startTime.val(),
					endTime: endTime.val()
				};
			if( !submitBtn.hasClass("processing") ){
				submitBtn.addClass("processing");
				// TCG.Ajax({ url: "", data: data }, function(result){
				// 	if(result.status){
						UI.loadPvpPersonalPnlStatements({});
					// }else{
					// 	TCG.Alert("errors", TCG.Prop(result.description));
					// }
					submitBtn.removeClass("processing");
				// });
			}
		});
	},


	/***************************************************************
	// Personal - changePassword
	***************************************************************/
	changePassword: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.form();
				control.submitChangePassword();
				control.validateChangePasswordInput();
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		});
	},
	validateChangePasswordInput: function(){
		$(document).off("keyup", "#changePasswordForm .form-control").on("keyup", "#changePasswordForm .form-control", function(){
			control.validateChangePasswordForm();
		});
	},
	validateChangePasswordForm: function(){
		var form = $("#changePasswordForm"),
			oldPass = form.find("[name='oldPass']"),
			newPass = form.find("[name='newPass']"),
			conNewPass = form.find("[name='conNewPass']");
		// Validate Old Pass, New PAss
		if( oldPass.val() == "" || newPass.val() == "" || !regExPattern("password", newPass.val()) || conNewPass.val() == "" || newPass.val() != conNewPass.val() ){
			form.removeClass("enable");
		}else{
			form.addClass("enable");
		}
	},
	submitChangePassword: function(){
		$(document).off("click", "#changePasswordForm .form-submit").on("click", "#changePasswordForm .form-submit", function(){
			var form = $("#changePasswordForm"),
				oldPass = form.find("[name='oldPass']"),
				newPass = form.find("[name='newPass']"),
				conNewPass = form.find("[name='conNewPass']"),
				resetBtn = form.find(".form-reset"),
				submitBtn = form.find(".form-submit");

			if( form.hasClass("enable") ){

				// Validate Old Pass
				if( oldPass.val() == "" ){
					TCG.Alert("errors", TCG.Prop("changePasswordForm_oldPass_required"));
					return;
				}

				// Validate New PAss
				if( newPass.val() == ""){
					TCG.Alert("errors", TCG.Prop("changePasswordForm_newPass_required"));
					return;
				}
				if( !regExPattern("password", newPass.val()) ){
					TCG.Alert("errors", TCG.Prop("changePasswordForm_newPass_invalid"));
					return;
				}

				// Confirm New Password
				if( conNewPass.val() == "" ){
					TCG.Alert("errors", TCG.Prop("changePasswordForm_conNewPass_required"));
					return;
				}
				if( newPass.val() != conNewPass.val() ){
					TCG.Alert("errors", TCG.Prop("changePasswordForm_conNewPass_notMatch"));
					return;
				}

				if( !submitBtn.hasClass("processing") ){
					var dataRSA = { values: control.encode([ oldPass.val(), newPass.val(), conNewPass.val() ]) };
					submitBtn.addClass("processing");
					TCG.Ajax({ url: "./modifyPassword", data: dataRSA }, function(result){
						if(result.status){
							TCG.Alert("success", TCG.Prop("changePasswordForm_success"));
							resetBtn.click();
							form.removeClass("enable");
						}else{
							TCG.Alert("errors", TCG.Prop(result.description));
						}
						submitBtn.removeClass("processing");
					});
				}
			}

		});
	},
	/*************************************************************
	// Personal - modfndPassword
	**************************************************************/
	modfndPassword: function(){
		control.getUserInfo(function(result){
			if(result.status){
				TCG.Ajax({ url: "./hasWithdrawalPassword" }, function(result){
					if(result.status){
						if(result.result == 1){
							$("#oldWithdrawPass .form-group").html("<input type='password' required='' name='oldPass' class='form-control ch-input' />");
							$("#oldWithdrawPass").removeClass("hide");
						}
						control.form();
						control.submitModfndPassword();
						control.validateModfndPasswordInput();
					}else{
						TCG.Alert("errors", TCG.Prop(result.description));
					}
				});
			}else{
				window.href="/";
			}
		});
	},
	validateModfndPasswordInput: function(){
		$(document).off("keyup", "#modfndPasswordForm .form-control").on("keyup", "#modfndPasswordForm .form-control", function(){
			control.validateModfndPasswordForm();
		});
	},
	validateModfndPasswordForm: function(){
		var form = $("#modfndPasswordForm"),
			oldPass = form.find("[name='oldPass']"),
			newPass = form.find("[name='newPass']"),
			conNewPass = form.find("[name='conNewPass']");
		// Validate New Pass, Confirm New Password, Old Password
		if( newPass.val() == "" || !regExPattern("password", newPass.val()) || conNewPass.val() == "" || newPass.val() != conNewPass.val() || ( oldPass[0] != undefined && (oldPass.val() == "") ) ){
			form.removeClass("enable");
		}else{
			form.addClass("enable");
		}
	},
	submitModfndPassword: function(){
		$(document).off("click", "#modfndPasswordForm .form-submit").on("click", "#modfndPasswordForm .form-submit", function(){
			var form = $("#modfndPasswordForm"),
				oldPass = form.find("[name='oldPass']"),
				newPass = form.find("[name='newPass']"),
				conNewPass = form.find("[name='conNewPass']"),
				submitBtn = form.find(".form-submit");

			if( form.hasClass("enable") ){

				// Validate New Pass
				if( newPass.val() == ""){
					TCG.Alert("errors", TCG.Prop("modfndPasswordForm_newPass_required"));
					return;
				}
				if( !regExPattern("password", newPass.val()) ){
					TCG.Alert("errors", TCG.Prop("modfndPasswordForm_newPass_invalid"));
					return;
				}

				// Confirm New Password
				if( conNewPass.val() == "" ){
					TCG.Alert("errors", TCG.Prop("modfndPasswordForm_conNewPass_required"));
					return;
				}
				if( newPass.val() != conNewPass.val() ){
					TCG.Alert("errors", TCG.Prop("modfndPasswordForm_conNewPass_notMatch"));
					return;
				}

				if( !submitBtn.hasClass("processing") ){
					submitBtn.addClass("processing");
					// Check Old Pass
					if( oldPass[0] ){
						// Validate Old Pass
						if( oldPass.val() == "" ){
							TCG.Alert("errors", TCG.Prop("modfndPasswordForm_oldPass_required"));
							return;
						}
						// Change Password
						var dataRSA = { values: control.encode([ oldPass.val(), newPass.val(), conNewPass.val() ]) };
						control.changeModfndPassword(form, dataRSA);

					}else{
						// Set Password
						var dataRSA = { values: control.encode([ newPass.val(), conNewPass.val(), 0 ]) };
						control.setModfndPassword(form, dataRSA);
					}
				}
			}
		});
	},
	setModfndPassword: function(form, dataRSA){
		var resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit");
		TCG.Ajax({ url: "./setPaymentPassword", data: dataRSA }, function(result){
			if(result.status){
				TCG.Alert("success", TCG.Prop(result.description));
				resetBtn.click();
				form.removeClass("enable");
				$("#oldWithdrawPass .form-group").html("<input type='password' required='' name='oldPass' class='form-control ch-input' />");
				$("#oldWithdrawPass").removeClass("hide");
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
			submitBtn.removeClass("processing");
		});
	},
	changeModfndPassword: function(form, dataRSA){
		var resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit");
		TCG.Ajax({ url: "./changePaymentPassword", data: dataRSA }, function(result){
			if(result.status){
				TCG.Alert("success", TCG.Prop(result.description));
				resetBtn.click();
				form.removeClass("enable");
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
			submitBtn.removeClass("processing");
		});
	},
	/*************************************************************
	// Personal - ssSettings
	**************************************************************/
	ssSettings: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.form();
				control.checkSecurityQuestions();
				control.validateSecurityQuestionInput();
				// Fixed Auto Fillup/Remember Password
				setTimeout(function(){
					$("#securityQuestionForm .form-reset").click();
					$("#securityQuestionForm").removeClass("hide");
				}, 500);
			}else{
				window.location = "/";
			}
		})
	},
	checkSecurityQuestions: function(){
		TCG.Ajax({ url: "./getCustomerSecurityQuestion" }, function(result){
			if(result.status){
				if(result.result.questions.length > 0){
					$("#securityQuestionForm .securityQ").html(result.result.questions[0]).removeClass("slect-box-custom-medium mem-icon");
				}else{
					control.getSecurityQuestions();
				}
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
			control.submitSecurityQuestionAnswer();
		});
	},
	getSecurityQuestions: function(){
		TCG.Ajax({ url: "./getSecurityQuestions" }, function(result){
			if(result.status){
				UI.loadSecurityQuestions(result.result);
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		});
	},
	validateSecurityQuestionInput: function(){
		$(document).off("keyup", "#securityQuestionForm input.form-control").on("keyup", "#securityQuestionForm input.form-control", function(){
			control.validateSecurityQuestionForm();
		});
		$(document).off("change", "#securityQuestionForm select.form-control").on("change", "#securityQuestionForm select.form-control", function(){
			control.validateSecurityQuestionForm();
		});
	},
	validateSecurityQuestionForm: function(){
		var form = $("#securityQuestionForm"),
			question = form.find("[name='question']"),
			answer = form.find("[name='answer']"),
			withdrawPass = form.find("[name='withdrawalPass']");
		// Validate Answer, Withdraw Pass, Question
		if( answer.val() == "" || withdrawPass.val() == "" || ( question[0] != undefined && question.val() == "" ) ){
			form.removeClass("enable");
		}else{
			form.addClass("enable");
		}
	},
	submitSecurityQuestionAnswer: function(){
		// Submit Security Question
		$(document).off("click", "#securityQuestionForm .form-submit").on("click", "#securityQuestionForm .form-submit", function(){
			var form = $("#securityQuestionForm"),
				question = form.find("[name='question']"),
				answer = form.find("[name='answer']"),
				withdrawPass = form.find("[name='withdrawalPass']");

			if( form.hasClass("enable") ){

				// Validate Answer
				if(answer.val() == ""){
					TCG.Alert("errors", TCG.Prop("securityQuestionForm_answer.is.required"));
					return;
				}

				// Validate Withdraw Pass
				if(withdrawPass.val() == ""){
					TCG.Alert("errors", TCG.Prop("securityQuestionForm_withdraw.password.is.required"));
					return;
				}

				var data = { answer: answer.val(), withdrawPassword: withdrawPass.val() };
				// Check Question
				if( question[0] ){
					// Validate Question
					if(question.val() == ""){
						TCG.Alert("errors", TCG.Prop("securityQuestionForm_question.is.required"));
						return;
					}
					// Set Security Q
					data.question = question.val();
					control.setSecurityQuestionAnswer(form, data);
				}else{
					// Reset Security Q
					data.question = $("#securityQuestionForm .securityQ").text();
					control.resetSecurityQuestionAnswer(form, data);
				}
			}
	    });
	},
	setSecurityQuestionAnswer: function(form, data){
		var resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit");
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			TCG.Ajax({ url: "./setupSecurityQuestion", data: data }, function(result){
				if(result.status){
					TCG.Alert("success", TCG.Prop(result.description));
					$("#securityQuestionForm .securityQ").html(data.question).removeClass("slect-box-custom-large mem-icon");
					setTimeout(function(){
					/*$("#securityQuestionForm .securityQ").html(data.question).removeClass("slect-box-custom-medium mem-icon");
					setTimeout(function(){*/					
						form.find("[type='text']").val("");
						form.find("[type='password']").val("");
						form.removeClass("enable");
					},500);
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
				}
				submitBtn.removeClass("processing");
			});
		}
	},
	resetSecurityQuestionAnswer: function(form, data){
		var resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit");
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			TCG.Ajax({ url: "./resetSecurityQuestion", data: data }, function(result){
				if(result.status){
					TCG.Alert("success", TCG.Prop(result.description));
					control.getSecurityQuestions();
					setTimeout(function(){
						form.find("[type='text']").val("");
						form.find("[type='password']").val("");
						form.removeClass("enable");
					}, 500);
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
				}
				submitBtn.removeClass("processing");
			});
		}

	},
	/*************************************************************
	// Agent Center - Register Downline
	**************************************************************/
	agentRegisterDownline: function(){
		control.loadGlobalRebates();
		UI.loadRebateQuota();
		UI.loadGameSeries("#agentRegisterDownlineForm");
		control.submitRegisterAgent();
	},
	submitRegisterAgent: function(){
		$(document).off("click", "#agentRegisterDownlineForm .form-submit")
				   .on("click", "#agentRegisterDownlineForm .form-submit", function(){
			control.registerAgent();
		});
	},
	registerAgent: function(){

		//	Declare
		var form = $("#agentRegisterDownlineForm"),
			quotaId = form.find("label[class='tab-btn sel']").attr("quota-id"),
			lotteries = form.find("input[name='lottery']:checked"),
			username = form.find("#dira-regdline-username").val(),
			password = form.find("#dira-regdline-password").val(),
			userType = form.find("input[name='dira-regdline-regtype']:checked").val();
		var data = {
			merchantCode: globalVar.merchantCode,
			username: username
		};
		//	Validate
		//		1.Check username's format
		//		2.Check password's format
		//		3.Check username exists
		if(username == "" || !/^[\w]{6,11}$/.test(username)){
			TCG.Alert("errors", TCG.Prop("format.username.err"));
		}else if(password != "" && !/^[\w]{6,11}$/.test(password)){
			TCG.Alert("errors", TCG.Prop("format.pwd.err"));
		}else{
			TCG.Ajax({url:"./checkUsername", data: data, type: "POST"}, function(rs){
				if(!rs.status){
					TCG.Alert("errors", TCG.Prop(rs.description));
				}else{
					//	Declare
					var encodeValue = [username, password, userType];
					var msg = "";

					//	Combine the message
					msg += "<div style='text-align:left; margin-left:40px; color:#fff;'>";
					msg += "注册类型:" + (userType == 1 ? "代理" :"会员") + "<br/>";
					msg += "注册帐号:" + username + "<br/>";
					msg += "登录密码:" + (password != "" ? password : "預設為123456") + "<br/>";
					for(var i = 0; i < lotteries.length; i++){
						var gameGroup = lotteries.eq(i).siblings("input.quota-amount").attr("gamecode");
						var groupCode = gameGroup.substr(gameGroup.length - 1);
						encodeValue[i+3] = lotteries.eq(i).val() + ","+groupCode+"," + lotteries.eq(i).siblings("input.quota-amount").val();
						msg += lotteries.eq(i).siblings("label").text().replace(":","") + "獎金組:" + lotteries.eq(i).siblings("input.quota-amount").val() + "<br/>";
					}
					msg += "</div>";

					if(!isNaN(quotaId)) {
						encodeValue = [username, password, userType, quotaId] ;
					}
					//	Let agent confirm
					TCG.Confirm(msg, "S", function(ok){
						if(ok){
							//	Register
							data = control.encode(encodeValue);
							TCG.Ajax({ url: "./agentSet/register?values=" + data}, function(result){
								if(result.status){
									TCG.Alert("success", TCG.Prop(result.description), "S");
									UI.loadRebateQuota();
								}else{
									TCG.Alert("errors", TCG.Prop(result.description), "S");
								}
							});
						}
					});
				}
			});
		}
	},
	/*************************************************************
	// Agent Center - Generate Affiliate URL
	**************************************************************/
	agentGenerateAffiliateUrl: function(){
		//control.datepickerStartEnd($("#generateAffiliateUrlForm [name='startTime']"), $("#generateAffiliateUrlForm [name='endTime']"));
		//UI.loadRebateQuota();
		UI.loadGameSeries("#generateAffiliateUrlForm");
		control.customSelect("#generateAffiliateUrlForm select");
		control.chosePathType();
		control.submitGenerateAffiliateUrl();
		control.clickQuotaTab("#dira-genaffurl-quota-tabs");
	},
	chosePathType: function(){
		$(document).off("change", "#generateAffiliateUrlForm select[name='pathType']")
			.on("change", "#generateAffiliateUrlForm select[name='pathType']", function(){
				var value = $(this).children("option:selected").val();
				if(value == 0 || value == 1){
					$("#generateAffiliateUrlForm input[name='dira-genaffurl-promotionpath']").val($(this).children("option:selected").text());
					$("#generateAffiliateUrlForm input[name='dira-genaffurl-promotionpath']").attr("readonly", true);
				}else if(value == 2){
					$("#generateAffiliateUrlForm input[name='dira-genaffurl-promotionpath']").val("");
					$("#generateAffiliateUrlForm input[name='dira-genaffurl-promotionpath']").attr("readonly", false);
				}
			});
		$("#generateAffiliateUrlForm select[name='pathType']").trigger("change");
	},
	submitGenerateAffiliateUrl: function(){
		$(document).off("click", "#generateAffiliateUrlForm .form-submit")
				   .on("click", "#generateAffiliateUrlForm .form-submit", function(){
			control.doGenerateAffiliateUrl();
		});
	},
	doGenerateAffiliateUrl: function(){
		//	Declare
		var form = $("#generateAffiliateUrlForm"),
			button = form.find(".form-submit"),
			interval = form.find("select[name='interval'] option:selected").val(),
			lotteries = form.find("input[name='lottery']:checked"),
			endDate,
			data = {
				type: form.find("input[name='dira-genaffurl-regtype']:checked").val(),
				startDate: control.formatDateFull(new Date(), "yyyy-MM-dd"),
				pathType: form.find("select[name='pathType'] option:selected").val(),
				path: form.find("input[name='dira-genaffurl-promotionpath']").val(),
				qq: form.find("input[name='dira-genaffurl-promotionqq']").val(),
				gamesSeries: 0,
				configs: [lotteries.length]
			};

		//	Validate
		//		step1.	Check interval, if interval is unlimit, then endDate is null
		if(interval == null || interval == ""){
			TCG.Alert("errors", TCG.Prop("generateAffiliateUrlForm_interval_required"), "S");
			return;
		} else if(interval == "unlimit"){
			data.endDate = null
		} else{
			endDate = new Date(new Date().getTime() + (1000 * 24 * 60 * 60 * parseInt(interval)));
			data.endDate = control.formatDateFull(endDate, "yyyy-MM-dd");
		}
		//		step2.	Check qq's format
		if(data.qq != "" && !regExPattern("qq", data.qq)){
			TCG.Alert("errors", TCG.Prop("generateAffiliateUrlForm_qq_required"), "S");
			return;
		}
		//		step3.	Check path type
		if(data.pathType == ""){
			TCG.Alert("errors", TCG.Prop("generateAffiliateUrlForm_path_type_required"), "S");
			return;
		}
		//		step4.	Check path
		if(data.path == "" || data.path.length > 14){
			TCG.Alert("errors", TCG.Prop("generateAffiliateUrlForm_path_required"), "S");
			return;
		}

		//	Calculate game series
		for(var i = 0; i < lotteries.length; i++){
			var gameGroup = lotteries.eq(i).siblings("input.quota-amount").attr("gamecode");
			var groupCode = gameGroup.substr(gameGroup.length - 1);
			data.configs[i] = {
				rebate: lotteries.eq(i).siblings("input.quota-amount").val(),
				gameCode: lotteries.eq(i).val(),
				prizeModeId: groupCode
			}
		}

		//	Submit
		if(!button.hasClass("processing")){
			button.addClass("processing");
			TCG.Ajax({url:"agentSet/createAffiliateUrl", data:JSON.stringify(data), type:"POST", contentType:"application/json"}, function(rs){
				if(rs.status){
					TCG.Confirm(TCG.Prop("generateAffiliateUrlForm_create_successful"),'', {},'复制链接','关闭')
					$("#dialog_box_icon").addClass('success');

					// add the ZeroClipboard plugin to ok btn
					// NOTE! the flash ZeroClipboard plugin is transparent but need physical click to work.
					var temp = rs.result + '.' + window.location.host + '/2kc_register.html';
					var client = control.copyClipboard($("#dialog_box_ok"));
					client.on('dataRequested', function ( client, args ) {
					  client.setText(temp);
					  $("#dialog_box_ok").trigger('click');
					});
				}else{
					TCG.Alert("errors",TCG.Prop(rs.description));
				}
				button.removeClass("processing");
			});
		}
	},
	sliderAmount: function(value, min, max, step, index, f){
		var form = $(f),
			lotteries = form.find("input[name='lottery']");
		lotteries.eq(index).siblings(".quota-amount").val(min);
		lotteries.eq(index).siblings(".quota-amount").attr("max",max);
		lotteries.eq(index).siblings(".quota-amount").attr("min",min);
		lotteries.eq(index).siblings(".plus").val(" ");
		lotteries.eq(index).siblings(".minus").val(" ");
		lotteries.eq(index).siblings(".quota")
			.slider({
				value: min,
				orientation: "horizontal",
				range: min,
				min: min,
				max: max,
				animate: true,
				step: step,
				slide: function(event,ui) {
					lotteries.eq(index).siblings("input.quota-amount").val(ui.value);
				},
				change: function(event, ui){
					var amt = ui.value;
					if(amt < value){
						lotteries.eq(index).siblings("input.quota-amount").css({ "background-position": "-494px -482px" });
					}
					else {
						lotteries.eq(index).siblings("input.quota-amount").css({ "background-position": "-455px -228px" });
					}
				},
			});

		lotteries.eq(index).siblings(".quota-amount")
			.on("change", function(){
				var newValue = parseInt($(this).val());

				if(newValue > max){
					$(this).prevAll(".quota").slider({
						value: max
					});

					$(this).val(max);
				} else if(newValue < min) {
					$(this).prevAll(".quota").slider({
						value: min
					});
					$(this).val(min);
				} else{
					$(this).prevAll(".quota").slider({
						value: newValue
					});

					$(this).val(newValue);
				}
				if(isNaN(newValue)) {
					$(this).val(min);
				}

			});
        //
		lotteries.eq(index).siblings(".plus")
			.click(function() {
				var thisQuota = $(this).prevAll(".quota"),
					value = thisQuota.slider("value"),
					max = thisQuota.slider("option", "max");
					nextAmount = parseInt($(this).nextAll(".quota-amount").val());
					step = thisQuota.slider("option", "step");

				thisQuota.slider("value", value + step);

				if(nextAmount >= max){
					$(this).nextAll(".quota-amount").val( value );
				} else {
					$(this).nextAll(".quota-amount").val( value + step);
				}
			});

		lotteries.eq(index).siblings(".minus")
			.click(function () {
				var thisQuota = $(this).nextAll(".quota"),
					value = thisQuota.slider("value"),
					min = thisQuota.slider("option", "min");
					nextAmount = parseInt($(this).nextAll(".quota-amount").val());
					step = thisQuota.slider("option", "step");

				thisQuota.slider("value", value - step);

				if(nextAmount <= min){
					$(this).nextAll(".quota-amount").val( value );
				} else {
					$(this).nextAll(".quota-amount").val( value - step);
				}
			});
	},

	channelPayment: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.form();
				control.getWalletBalance();
			}else{
				window.location = "/";
			}
		});
		control.sliderChannelPayment(0, 0, 3000, 0, "#ghostSlider");
		$(document).off("click", "#channelPaymentForm .form-submit")
				   .on("click", "#channelPaymentForm .form-submit", function(){
			control.submitChannelPayment();
		});
	},
	submitChannelPayment: function(){
			//	Declare
			var form = $("#channelPaymentForm"),
				ChannelPaymentTargetUsername = form.find("[data-userinfo='username']")[0].innerHTML,
				ChannelPaymentAmount = form.find("input[name='amount']").val(),
				ChannelPaymentBankCode = '0500';
			var data = { values: control.encode([ChannelPaymentTargetUsername,ChannelPaymentAmount,ChannelPaymentBankCode])};
			TCG.Ajax({url:"./depositQR", data: data, type: "POST"}, function(rs){
 				if(rs.status){
					TCG.Alert("success",TCG.Prop(rs.description));
							TCG.Alert("success", TCG.Prop(rs.description), null, function(){
								window.open(rs.result.qr_image,"Channel Payment","_blank","width=1024,height=768")
								control.getWalletBalance();
								form.find(".bankRadioBtn").removeClass("selected-red");
								form.removeClass("enable");
						});
 				}else{
 					TCG.Alert("errors",TCG.Prop(rs.description));
 				}
			});

	},

	sliderChannelPayment: function(v, mi, mx, index, f){
		var sliderElement = document.getElementsByClassName('sliderLegend')[0];
		function removeSliderSelected(){
		        sliderElement.childNodes[1].className=""
		        sliderElement.childNodes[3].className=""
		        sliderElement.childNodes[5].className=""
		        sliderElement.childNodes[7].className=""
		}


		$( function() {
		    $("#ghostSlider").slider({
		      value:v,
		      min: mi,
		      max: mx,
		      step: 1000,
		      slide: function( event, ui ) {
		        //$( "#amount" ).val( "$" + ui.value );
		        if(ui.value == 0){
		        	ui.value = 500;
		        	removeSliderSelected();
		        	sliderElement.childNodes[1].className="selected"
		        }
		        else if(ui.value == 1000){
		        	removeSliderSelected();
		        	sliderElement.childNodes[3].className="selected"
		        }
		        else if(ui.value == 2000){
		        	removeSliderSelected();
		        	sliderElement.childNodes[5].className="selected"
		        }
		        else if(ui.value == 3000){
		        	removeSliderSelected();
		        	sliderElement.childNodes[7].className="selected"
		        }
		        $("#channelPaymentForm").find("input[name='amount']").val(ui.value);
		      }
		    });

			$("#channelPaymentForm").find("input[name='amount']").val(500);
		  });
	},

	clickQuotaTab: function(id){
	    $(document).off("click", id+" .tab-btn").on("click",id+" .tab-btn", function(){
			var quotaId = $(this).attr("quota-id");
	    	var rel = $(this).attr("data-rel");
	      	if($(this).hasClass("sel")){
	      		$(this).removeClass("sel").addClass("unsel");
	      		$(document).find(".quota").slider("enable");
				$(document).find(".quota-amount").removeAttr("disabled");
		      	$(document).find(".minus").removeAttr("disabled");
		      	$(document).find(".plus").removeAttr("disabled");
		      	//$(document).find("input[type='checkbox']").removeAttr("disabled");
				$("#gameSeries input[type=text]").each(function() {
					var minseries = $(this).attr("min");
					$(this).val(minseries);
					$(".quota").slider({value: minseries});
				});

	      	} else {
	      		$(id+" .tab-btn").removeClass("sel").addClass("unsel");
		      	$(this).removeClass("unsel").addClass("sel");
		      	$(id+" .tab-content").hide();
		      	$("#"+rel).show();
		      	$(document).find(".quota").slider("disable");
		      	$(document).find(".quota-amount").attr("disabled", "true");
		      	$(document).find(".minus").attr("disabled", "true");
		      	$(document).find(".plus").attr("disabled", "true");
		      	//$(document).find("input[type='checkbox']").attr("disabled", "true");
				var quotaRebateConfig = null;
				globalVar.quotaObj.forEach(function(entry) {
					if(entry.quotaId==quotaId) {
						quotaRebateConfig = entry.quotaRebateConfig;
					}
				})
				$("#gameSeries input[type=text]").each(function() {
					for(var i=0;i<quotaRebateConfig.length;i++){
						var gameCode = quotaRebateConfig[i].type+quotaRebateConfig[i].prizeModeId;
						var inputCode = $(this).attr("gameCode");
						if(inputCode == gameCode) {
							//$(".quota-amount").val(entry.rebateValue);
							//$("#gameSeries input[type=text]").val(quotaRebateConfig[i].rebateValue);
							$(this).val(quotaRebateConfig[i].rebateValue);
							$(".quota").slider({value: quotaRebateConfig[i].rebateValue});
						}
					}
				});
	      	}
	    });	
	},
	/*************************************************************
	// Agent Center - Link Manager
	**************************************************************/
	linkManager: function(){
		//	Beautify select
		control.customSelect("#linkManagerForm select");

		//	Bind search event
		control.bindSearchAgentDownlines();
		//	Bind List register account detail
		control.bindSearchGetRegisterdAffiliate();
		//	Bind detail event
		control.bindDetailAffiliateUrls();
		//	Bind delete event
		control.bindDeleteAffiliateUrls();
	},
	bindSearchAgentDownlines: function(){
		$(document).off("click", "#linkManagerForm .form-submit").on("click", "#linkManagerForm .form-submit", function(){
			$("#linkManagerForm [name='pageNo']").val(1);
			control.viewAffiliateUrls();
		});
		$("#linkManagerForm .form-submit").trigger("click");
	},
	viewAffiliateUrls: function(){
		//	Declare
		var form = $("#linkManagerForm"),
			button = form.find(".form-submit"),
			pathType = form.find("select[name='pathType'] option:selected").val(),
			type = form.find("select[name='type'] option:selected").val(),
			status = form.find("select[name='status'] option:selected").val(),
			pageNo = form.find("input[name='pageNo']").val(),
			pageSize = 8, //form.find("input[name='pageSize']").val(),
			queryString = "";

		//	Combine query condition
		if(pathType != null && pathType != ""){
			queryString += "pathType=" + pathType + "&";
		}
		if(type != null && type != ""){
			queryString += "type=" + type + "&";
		}
		if(status != null && status != ""){
			queryString += "status=" + status + "&";
		}
		queryString += "page=" + pageNo + "&";
		queryString += "pageSize=" + pageSize + "&";

		//	Submit
		if(!button.hasClass("processing")){
			button.addClass("processing");
			TCG.Ajax({url: "/agentSet/viewAffiliateUrls?" + queryString, type: "GET"},function(rs){
				if(rs.status){
					var page = rs.result.pageInfo;
					UI.loadAgentDownlines(rs.result);

					form.find("#totalPlannedAmount").text(page.totalRecords);
					UI.loadPagination("linkManager",page.currentPage, Math.ceil(page.totalRecords / page.pageSize));
				} else{
					TCG.Alert("errors",TCG.Prop(rs.description),"S");
				}
				button.removeClass("processing");
			});
		}
	},
	bindSearchGetRegisterdAffiliate: function(){
		$(document).off("click", ".registerCount").on("click", ".registerCount", function(){
			//  Get entry
			var entry = JSON.parse($(this).parents(".divTableRow").find(".entry").text());

			TCG.Ajax({url:"agentSet/registeredAffiliates?affiUrlId="+entry.id}, function(rs){
				if(rs.status){
					TCG.Ajax({url:"xml/linkManagerEnrollmentPopup.xml", dataType: "html"}, function(xml){
						var _html = [];
						var entry = null;
						var $xml = $("<div></div>");

						//	Result
						for(var i = 0; i < rs.result.length; i++){
							entry = rs.result[i];

							_html.push('<div class="dira-lm-enroll-trow clearfix">');
							_html.push('<div class="dira-lm-enroll-tcol">' + entry.customerName + '</div>');
							_html.push('<div class="dira-lm-enroll-tcol">' + entry.registeredDate + '</div>');
							_html.push('</div>');
						}
						$xml.append(xml);
						$xml.find(".dira-lm-enroll-tbody").append(_html.join(""));

						//	Popup
						TCG.Alert("Registered Users", $xml.html(), "L");
					});
				}else{
					TCG.Alert("errors",TCG.Prop(rs.description),"S");
				}
			});
		});
	},
	bindDeleteAffiliateUrls: function(){
		$(document).off("click", ".affiliateUrlDelete").on("click", ".affiliateUrlDelete", function(){
			//  Get entry
			var entry = JSON.parse($(this).parents(".divTableRow").find(".entry").text());

			TCG.Ajax({url: '/agentSet/deleteAffiliateUrl?affiUrlId=' + entry.id}, function(rs){
				if(rs.status){
					control.viewAffiliateUrls();
				}else{
					TCG.Alert("errors",TCG.Prop(rs.description),"S");
				}
			});
		});
	},
	bindDetailAffiliateUrls: function(){
		$(document).off("click", ".affiliateUrlDetail").on("click", ".affiliateUrlDetail", function(){
			//  Get entry
			var entry = JSON.parse($(this).parents(".divTableRow").find(".entry").text());
			var TYPE = ["会员", "代理"],
				STATUS = ["关闭", "正常", "过期"];

			TCG.Ajax({url: 'xml/linkManagerAffiliateDetailPopup.xml', dataType: 'html'}, function(xml){
				//  Declare
				var $div = $("<div></div>");

				$div.append(xml);
				$div.find(".regLink").text(UI.generateAffiliateUrl(entry.code).url);
				$div.find(".regType").text(TYPE[entry.type]);
				$div.find(".regStatus").text(STATUS[entry.type]);
				for(var i = 0; i < entry.configs.length; i++){
					var _html = [];
					_html.push('<dl class="dira-lm-affdtl-gameItem">');
					_html.push('<dt class="dira-lm-affdtl-gameName">' + TCG.Prop(entry.configs[i].gameCode) + '</dt>');
					_html.push('<dd class="dira-lm-affdtl-gameRebate">' + entry.configs[i].rebate + '</dd>');
					_html.push('</dl>');
					$div.find(".dira-lm-affdtl-games").append($(_html.join("")));
				}
				TCG.Alert("Affiliate URL Detail", $div.html(), "L");
			}, "关闭");
		});
	},
	/*************************************************************
	// Agent Center - Member Management
	**************************************************************/
	memberManagement: function(){
		control.getUserInfo(function(result) {
			globalVar.cid = result.result.customerId;
			window.sessionStorage.setItem("resultObj", "");
			control.setAgentNickName(window.sessionStorage.getItem("nickname"));
			control.datepickerStartEnd($("#memberManagementForm [name='startTime']"), $("#memberManagementForm [name='endTime']"));
			control.customSelect("#memberManagementForm select");
			control.switchDecimal();
			control.dropdownMenu();
			control.searchMemberManagement();
			control.viewMemberAdditionalPage();
		});

	},
	showDetail: function(downlineId) {
		control.getMemberManagement(true,downlineId)
	},
	dropdownMenu: function(){
		$(document).off("click", "#rebateSetup").on("click", "#rebateSetup", function(){
			$("[data-switchDecimal]").each(function(){
				var decimal = $(this).attr("data-switchDecimal") == 2 ? 4 : 2,
					value = $(this).attr("data-value");
				$(this).attr("data-switchDecimal", decimal);
				$(this).html( control.customCurrencyFormat(value, decimal) );
			});
		});
	},
	searchMemberManagement: function(){
		$(document).off("click", "#memberManagementForm .form-submit")
				   .on("click", "#memberManagementForm .form-submit", function(){
			control.getMemberManagement(true);
		});
	},
	getMemberManagement: function(click, downlineId){
		var defaultSize = 100;
		var form = $("#memberManagementForm"),
			formInput = form.find(".form-control"),
			submitBtn = form.find(".form-submit"),
			startRegDate = form.find("[name='startTime']"),
			endRegDate = form.find("[name='endTime']"),
			customerName = form.find("[name='customerName']"),
			downlineType = form.find("[name='downlineType']"),
			userType = form.find("[name='userType']"),
			pageNo = form.find("[name='pageNo']"),
			pageSize = form.find("[name='pageSize']"),
			data = {
				startRegDate: startRegDate.val(),
				endRegDate: endRegDate.val(),
				customerName: customerName.val(),
				userType: userType.val(),
				downlineType: downlineType.val(),
				pageNo: pageNo.val() -1,
				pageSize: defaultSize
			};
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			//var pageInfo;
			var currentPage = data.pageNo + 1;
			var sizeShowsOnPage = 5;
			var firstQuery = true;

			//all empty meants first query
			if (sessionStorage.resultObj != "" && sessionStorage.resultObj != null  ) {
				firstQuery = false;
			}

			//check if currentPage has data in session already.
			var showList = [];
			var resultArr = firstQuery?[]:jQuery.parseJSON(sessionStorage.resultObj);
			if(!click) {
				for(var i=0; i<resultArr.length;i++) {
					if($.isArray(resultArr[i]) && resultArr[i]!= null &&resultArr[i][0]==currentPage) {
						showList = resultArr[i][1];
					}
				}
				if(showList.length != 0) {
					control.loadPageList(currentPage,sizeShowsOnPage);
					submitBtn.removeClass("processing");
					return;
				}
			}

			if(click || firstQuery || currentPage * sizeShowsOnPage > defaultSize) {
				//when click downline name agentId will be supplied
				if(downlineId != undefined){
					data.agentId = downlineId;
				}
				TCG.Ajax({url: "/agentSet/getAgentDownlines",  data: data, type: "POST"},function(rs){
					if(rs.status && rs.result != null){
						sessionStorage.teamBalance = rs.result.teamBalance;
						sessionStorage.teamSize = rs.result.teamSize;
						var resultList = rs.result.list;
						var tempArr = [];
						var j;
						//to calculate which page to start query data.
						var pageGroupSize = Math.ceil(defaultSize / sizeShowsOnPage);
						var pageIndex = currentPage % pageGroupSize;
						if(pageIndex == 0) {
							j = currentPage - (pageGroupSize - 1);
						}else{
							j = currentPage - (pageIndex - 1);
						}

						resultArr[0] = rs.result.pageInfo;
						for(var i=0;i<resultList.length;i++){
							tempArr.push(resultList[i]);
							if(tempArr.length == sizeShowsOnPage || resultList.length-1 == i) {
								var pageContent = [j,tempArr];
								resultArr[j] = pageContent;
								j++;
								tempArr = [];
							}
						}
						// console.log(data.customerName);
						if(data.customerName == ""){
							$("#downlineUsername").addClass("hide").text("");
						}else{
							$("#downlineUsername").removeClass("hide").text( data.customerName );
						}

						sessionStorage.resultObj = JSON.stringify(resultArr);
					}else{
						TCG.Alert("error", TCG.Prop("no.data"));
						submitBtn.removeClass("processing");
						sessionStorage.setItem("resultObj","");
						control.loadPageList(0,0);
						return;
					}
					if(click) {
						currentPage = 1;
					}
					control.loadPageList(currentPage,sizeShowsOnPage);
					submitBtn.removeClass("processing");
				});
			}
			else{
				control.loadPageList(currentPage,sizeShowsOnPage);
				submitBtn.removeClass("processing");
			}

		}
	},
	loadPageList : function(currentPage, sizeShowsOnPage){
		var totalPages = 0;
		var startIndex = 0;
		var endIndex = sizeShowsOnPage;
		var resultObj = sessionStorage.resultObj==""?[]:jQuery.parseJSON(sessionStorage.resultObj);
		var pageInfo = resultObj[0]==null?"":resultObj[0];
		//var resultList = resultObj.list;
		var showList;
		//if(currentPage > 1) {
		//	startIndex = (currentPage-1) * sizeShowsOnPage;
		//	endIndex  = startIndex + sizeShowsOnPage;
		//}

		for(var i=0; i<resultObj.length;i++) {
			if($.isArray(resultObj[i]) && resultObj[i]!= null && resultObj[i][0]==currentPage) {
				showList = resultObj[i][1];
			}
		}
		totalPages =  Math.ceil(pageInfo.total / sizeShowsOnPage);
		UI.loadMemberManagement(showList);
		UI.loadPagination("memberManagementForm", currentPage , totalPages);
	},
	viewMemberAdditionalPage: function(){
		$(document).on("click", "#showdetail", function(){
				var downlineId  = $(this).closest('.divTableRow').find('.tbl-link').attr('data-downline'),
					customerName = $(this).text();
				// $("#downlineUsername").text(customerName).removeClass("hide");
				control.showDetail(downlineId);
			});
		$(document).on("click", ".setRebate", function(){
			var entry = JSON.parse($(this).parents(".divTableRow").find(".entry").text());
			$("#memberManagement").hide();
			$('#rebateSetting').show();
			var downlineId  = $(this).closest('.divTableRow').find('.tbl-link').attr('data-downline');
			control.loadRebateSetting(downlineId, entry);
		});

		$(document).on("click", ".bettingHistoryLink", function(){
				$("#memberManagement").hide();
				$("#bettingHistory").show();
				var downlineId  = $(this).closest('.divTableRow').find('.tbl-link').attr('data-downline');
				control.agentGameHistory(downlineId);
		});

		$(document).on("click", ".transferToDown", function(){
				var lowerAgent = $("#showdetail").text();
				$("#memberManagement").hide();
				$("#transferToDownline > div.member_ContentCh > div:nth-child(2) > div:nth-child(2)").text(lowerAgent);
				$("#transferToDownline").show();
				var downlineName = $(this).attr("data-downline");
				control.loadTransferDownline(downlineName);
		});
		$(document).on("click", ".setAgent", function(){
				var downlineId  = $(this).closest('.divTableRow').find('.tbl-link').attr('data-downline');
				control.promoToAgent(downlineId);
		});
		$(document).on("click", "#sendMessage", function(){
				TCG.Alert("Affiliate URL Detail","sendMessage");
		});
	},
	loadRtnBtn : function(){
		$(".return-btn").on( "click", function(event){
			event.preventDefault();
			$("#agentGameHistory").hide();
			$("#transferToDownline").hide();
			$("#rebateSetting").hide();
			$("#bettingHistory").hide();

			$("#agentGameHistoryForm").removeClass("hide");
			$("#agentGameHistoryTable").removeClass("hide");
			$("#agentGameHistoryTotal").removeClass("hide");
			$("#agentPvpGameHistoryForm").addClass("hide");
			$("#agentPvpGameHistoryTable").addClass("hide");
			$("#agentPvpGameHistoryTotal").addClass("hide");
			$("#switchAgentGameHistory li.active").removeClass("active");
			$("#switchAgentGameHistory li[data-rel='lotto']").addClass("active");

			$("#memberManagement").show();
		});
	},
	loadTransferDownline : function(downlineName) {
		control.loadRtnBtn();
		control.getWalletBalance();
		control.loadTransferSumbit(downlineName);
	},
	promoToAgent : function(downlineId) {
		var data = {
			customerId : downlineId
		};
		TCG.Ajax({url: "/agentSet/promoteDownline" ,data : data, type: "POST"},function(rs){
			if(rs.status){
				TCG.Alert("success","设定成功");
			} else{
				TCG.Alert("errors",TCG.Prop(rs.description));
			}
		});
	},
	loadTransferSumbit: function(downlineName){
		$(document).off("click", "#transferToDownline > .dira-regdline-confirm > input")
			.on("click", "#transferToDownline > .dira-regdline-confirm > input", function(){
				control.submitTransferToDown(downlineName);
			});
		$(document).on("keyup", "[name='transferAmt']", function(){
			$(".bl-data-hover").html($("[name='transferAmt']").val());
		});
	},
	submitTransferToDown: function(downlineName){
		var avilBal = sessionStorage.walletBalance,
			payPass = $("input[name='paymentpwd']").val(),
			amtToTrans = $("input[name='transferAmt']").val();
		var data = [
			 downlineName,
			 amtToTrans,
			 payPass
		];
		data = control.encode(data);
		TCG.Ajax({url: "./agentLR/lowerRecharge?values="+data, type: "POST"},function(rs){
			if(rs.status){
				TCG.Alert("success","转帐成功");
				control.getWalletBalance();
				$("input[name='paymentpwd']").val("");
				$("input[name='transferAmt']").val("");
			} else{
				TCG.Alert("errors",TCG.Prop("unknown.system.err"));
			}
		});
	},
	agentGameHistory: function(downlineId){
		control.loadRtnBtn();
		control.switchDecimal("#bettingDecimal");
		control.datepickerStartEnd( $("#agentGameHistoryForm [name='startTime']"), $("#agentGameHistoryForm [name='endTime']") );
		control.loadBettingRecordSumbit(downlineId);
		control.switchAgentGameHistory();
		UI.loadQueryConditionList(globalVar.headers, function(obj){
			$("#agentGameHistoryForm [name='gameId']").html(obj.games);
			control.customSelect("#agentGameHistoryForm [name='gameId']");
			$("#agentGameHistoryForm .form-submit").click();
		});

		// For Pvp
		control.datepickerStartEnd($("#agentPvpGameHistoryForm [name='startTime']"), $("#agentPvpGameHistoryForm [name='endTime']"));
		control.customSelect("#agentPvpGameHistoryForm select");	
		control.searchAgentPvpGameHistory(downlineId);
	},
	switchAgentGameHistory: function(){
		$(document).off("click", "#switchAgentGameHistory li").on("click", "#switchAgentGameHistory li", function(){
			if( $(this).attr("data-rel") == "lotto" ){
				$("#agentGameHistoryForm").removeClass("hide");
				$("#agentGameHistoryTable").removeClass("hide");
				$("#agentGameHistoryTotal").removeClass("hide");

				$("#agentPvpGameHistoryForm").addClass("hide");
				$("#agentPvpGameHistoryTable").addClass("hide");
				$("#agentPvpGameHistoryTotal").addClass("hide");
	
				$("#agentGameHistoryForm .form-submit").click();
			}else{
				$("#agentGameHistoryForm").addClass("hide");
				$("#agentGameHistoryTable").addClass("hide");
				$("#agentGameHistoryTotal").addClass("hide");

				$("#agentPvpGameHistoryForm").removeClass("hide");
				$("#agentPvpGameHistoryTable").removeClass("hide");
				$("#agentPvpGameHistoryTotal").removeClass("hide");

				$("#agentPvpGameHistoryForm .form-submit").click();
			}
			$("#switchAgentGameHistory li.active").removeClass("active");
			$(this).addClass("active");
		});
	},
	searchAgentPvpGameHistory: function(downlineId){
		var downlineId = downlineId;
		$(document).off("click", "#agentPvpGameHistoryForm .form-submit").on("click", "#agentPvpGameHistoryForm .form-submit", function(){
			control.getAgentPvpGameHistory(downlineId);
		});
	},
	getAgentPvpGameHistory: function(downlineId){
		var form = $("#agentPvpGameHistoryForm"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			gameType = form.find("[name='gameType']"),
			gameRoom = form.find("[name='gameRoom']"),
			pageNo = form.find("[name='pageNo']"),
			submitBtn = form.find(".form-submit"),
			data = {
				customerId: downlineId,
				startDate: startTime.val(),
				endDate: startTime.val(),
				gameType: gameType.val(),
				gameRoom: gameRoom.val(),
				pageNo: pageNo.val(),
				pageSize: 10
			};
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			TCG.Ajax({ url: "./getAccountGameBetHistory", data: data }, function(result){
				if(result.status){
					UI.loadAgentPvpGameHistory(result.result, gameType.val());
					var pageSize = result.result.page.pageSize,
						totalPage = Math.ceil(result.result.page.total/pageSize);
					UI.loadPagination("agentPvpGameHistory", result.result.page.currentPage, totalPage);
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
				}
				submitBtn.removeClass("processing");
			});
		}
	},
	loadBettingRecordSumbit: function(downlineId){
		$(document).off("click", "#agentGameHistoryForm .form-submit")
			.on("click", "#agentGameHistoryForm .form-submit", function(){
				control.submitBettingRecord(downlineId);
			});
	},
	submitBettingRecord: function(downlineId){
		var downlineId = downlineId;
		var form = $("#bettingHistory"),
			submitBtn = form.find(".form-submit"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			gameId = form.find("[name='gameId']"),
			orderNum = form.find("[name='orderNum']"),
			gameIdVal = gameId.val() == "" ? 0 : gameId.val(),
			pageNo = form.find("[name='pageNo']"),
			pageSize = form.find("[name='pageSize']"),
			data = {
				customerId: downlineId,
				startDate: startTime.val() +" 00:00:00" ,
				endDate: endTime.val() +" 23:59:59",
				gameId: gameIdVal,
				orderNum:orderNum.val(),
				pageNo:pageNo.val(),
				pageSize: 6
		};
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
            console.log(data);
			TCG.Ajax({url: "./downlineBetHistory", data: data,  type: "GET"},function(rs){
				if(rs.status && rs.result.list.length>0){
					UI.loadBettingRecord(rs.result);
					var totalPage = Math.ceil(rs.result.page.total/rs.result.page.pageSize);
					UI.loadPagination("agentGameHistoryForm", pageNo.val() , totalPage, "#bettingpagination");
				} else{
					TCG.Alert("error", TCG.Prop("no.data"));
				}
				submitBtn.removeClass("processing");
			});
		}
	},
	loadRebateSetting: function(downlineId, entry){
		control.loadRtnBtn();
		UI.loadGameSeries("#rebateSetting", true, downlineId);
		control.submitRebateSetting(entry);
	},
	submitRebateSetting: function(entry){
		$(document).off("click", "#rebateSetting .form-submit")
			.on("click", "#rebateSetting .form-submit", function(){
				control.updateMemberRebates(entry);
			});
	},
	updateMemberRebates: function(entry){
		//	Declare
		var form = $("#rebateSetting"),
			button = form.find(".form-submit"),
			lotteries = form.find("input[name='lottery']:checked"),
			configs = [];
		var data = {
			customerName: entry.customerName,
			configs: []
		};

		//	Combine rebate
		for(var i = 0; i < lotteries.length; i++){
			var gameCode = lotteries.eq(i).siblings("input.quota-amount").attr("gamecode");
			var prizeModeId = gameCode.substr(gameCode.length - 1);
			data.configs[i] = {
				rebateValue: lotteries.eq(i).siblings("input.quota-amount").val(),
				type: lotteries.eq(i).val(),
				prizeModeId: prizeModeId
			}
		}

		//	Send request
		if(!button.hasClass("processing")) {
			button.addClass("processing");
			TCG.Ajax({
				url: "./agentSet/updateDownlineRebates",
				data: JSON.stringify(data),
				method: "POST",
				contentType: "application/json; charset=UTF-8"
			}, function (rs) {
				if (rs.status) {
					button.removeClass("processing");
					TCG.Alert("success",TCG.Prop(rs.description), null, function(){
						$('#returnMemberMam').trigger('click');
					});
				}else{
					TCG.Alert("errors",TCG.Prop(rs.description));
				}
			});
		}
	},
	/*************************************************************
	// Agent Center - Agent PNL
	**************************************************************/
	palStatementsAgent: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.switchDecimal("");
				control.switchAgentPnl();
				$(".agentName").text(window.sessionStorage.getItem("nickname"));
				// Lotto
				control.datepickerStartEnd($("#lottoAgentPnlForm [name='startTime']"), $("#lottoAgentPnlForm [name='endTime']"));
				control.searchLottoAgentPnl();
				control.switchLottoAgentPnlSummaryType();
				control.selectLottoAgentDownlinePnl();

				control.datepickerStartEnd($("#pvpAgentPnlForm [name='startTime']"), $("#pvpAgentPnlForm [name='endTime']"));
				control.customSelect("#pvpAgentPnlForm [name='gameType']");
				control.searchPvpAgentPnl();
				control.switchPvpAgentPnlSummaryType();
				control.selectPvpAgentDownlinePnl();

				// Default summaryType
				$("#lottoAgentPnlForm [name='summaryType']").val(0);
				$("#lottoAgentPnlForm .form-submit").click();
			}else{
				window.location="/";
			}
		});
	},
	switchAgentPnl: function(){
		$(document).off("click", "#switchAgentPnl li").on("click", "#switchAgentPnl li", function(){
			var rel = $(this).attr("data-rel");
			if( !$(this).hasClass("active") ){
				if(rel == "lotto"){
					$("#pvpAgentPnlForm").addClass("hide");
					$("#pvpAgentPnlTable").addClass("hide");
					$("#lottoAgentPnlForm").removeClass("hide");
					$("#lottoAgentPnlTable").removeClass("hide");
					$("#lottoAgentPnlForm .form-submit").click();
				}else{
					$("#lottoAgentPnlForm").addClass("hide");
					$("#lottoAgentPnlTable").addClass("hide");
					$("#pvpAgentPnlForm").removeClass("hide");
					$("#pvpAgentPnlTable").removeClass("hide");
					$("#pvpAgentPnlForm .form-submit").click();
				}
				$("#switchAgentPnl li.active").removeClass("active");
				$(this).addClass("active");
			}
		});
	},	
	// Lotto
	selectLottoAgentDownlinePnl: function(){
		$(document).off("click", "#lottoAgentPnlList .tbl-link").on("click", "#lottoAgentPnlList .tbl-link", function(){
			var customerName = $(this).text(),
				customerId = $(this).attr("data-customerId");
			control.getLottoAgentPnl(customerId, customerName);			
		});
	},
	switchLottoAgentPnlSummaryType: function(){
		$(document).off("click", "#lottoAgentPnlForm .summaryTypeList li").on("click", "#lottoAgentPnlForm .summaryTypeList li", function(){
			if( !$(this).hasClass("active") && !$("#lottoAgentPnlForm .form-submit").hasClass("processing") ){
				var rel = $(this).attr("data-rel");
				$("#lottoAgentPnlForm .summaryTypeList li").removeClass("active");
				$(this).addClass("active");
				$("#lottoAgentPnlForm [name='summaryType']").val(rel);
				$("#lottoAgentPnlForm .form-submit").click();
			}
		});
	},	
	searchLottoAgentPnl: function(){
		$(document).off("click", "#lottoAgentPnlForm .form-submit").on("click", "#lottoAgentPnlForm .form-submit", function(){
			// $("#lottoDownlineUsername").addClass("hide");
			control.getLottoAgentPnl();
		});
	},
	getLottoAgentPnl: function(customerId, customerName){
		var form = $("#lottoAgentPnlForm"),
			customerNameVal = form.find("[name='customerName']").val(),
			customerId = customerId || "",
			summaryType = form.find("[name='summaryType']"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			submitBtn = form.find(".form-submit"),
			data = {
				customerName: customerNameVal,
				customerId: customerId,
				summaryType: summaryType.val(),
				startDate: startTime.val(),
				endDate: endTime.val(),
				pageNo: 1,
				pageSize: 100
			};
			if( customerId != "" && customerId != undefined ) data.customerName = "";
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			TCG.Ajax({ url: "./getDownlineLottoPNLReport", data: data }, function(result){
				if(result.status){
					var customerNameVal = customerName == undefined ? data.customerName : customerName;
					if(  customerNameVal == "" || customerNameVal == undefined ){
						$("#lottoDownlineUsername").addClass("hide").text("");
					}else{
						$("#lottoDownlineUsername").removeClass("hide").text(customerNameVal);						
					}
					UI.loadLottoAgentPnl(result.result);
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
				}
				submitBtn.removeClass("processing");
			});
		}
	},	
	// PVP
	selectPvpAgentDownlinePnl: function(){
		$(document).off("click", "#pvpAgentPnlList .tbl-link").on("click", "#pvpAgentPnlList .tbl-link", function(){
			var customerName = $(this).text(),
				customerId = $(this).attr("data-customerId");
			control.getPvpAgentPnl(customerId, customerName);
		});
	},	
	switchPvpAgentPnlSummaryType: function(){
		$(document).off("click", "#pvpAgentPnlForm .summaryTypeList li").on("click", "#pvpAgentPnlForm .summaryTypeList li", function(){
			if( !$(this).hasClass("active") && !$("#pvpAgentPnlForm .form-submit").hasClass("processing") ){
				var rel = $(this).attr("data-rel");
				$("#pvpAgentPnlForm .summaryTypeList li").removeClass("active");
				$(this).addClass("active");
				$("#pvpAgentPnlForm [name='summaryType']").val(rel);
				$("#pvpAgentPnlForm .form-submit").click();
			}
		});
	},	
	searchPvpAgentPnl: function(){
		$(document).off("click", "#pvpAgentPnlForm .form-submit").on("click", "#pvpAgentPnlForm .form-submit", function(){
			control.getPvpAgentPnl();
		});
	},
	getPvpAgentPnl: function(customerId, customerName){
		var form = $("#pvpAgentPnlForm"),
			customerId = customerId || "",
			customerNameVal = form.find("[name='customerName']").val(),
			startTime = form.find("[name='startTime']"),
			summaryType = form.find("[name='summaryType']"),
			gameType = form.find("[name='gameType']"),
			endTime = form.find("[name='endTime']"),
			submitBtn = form.find(".form-submit"),
			data = {
				customerName: customerNameVal,
				customerId: customerId,
				group_type: summaryType.val(),
				startDate: startTime.val(),
				endDate: endTime.val(),
				gameType: gameType.val(),
				pageNo: 1,
				pageSize: 100
			};
			if( customerId != "" && customerId != undefined ) data.customerName = "";
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			TCG.Ajax({ url: "./getTeamPVPFishingPNLReport", data: data }, function(result){
				if(result.status){
					var customerNameVal = customerName == undefined ? data.customerName : customerName;
					if( customerNameVal == "" || customerNameVal == undefined ){					
						$("#pvpDownlineUsername").addClass("hide").text("");
					}else{
						$("#pvpDownlineUsername").removeClass("hide").text(customerNameVal);						
					}					
					UI.loadPvpAgentPnl(result.result, gameType.val());
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
				}
				submitBtn.removeClass("processing");
			});
		}
	},
	/*************************************************************
	// Agent Center - Agent Team Betting
	**************************************************************/
	agentTeamBetting: function(){
		control.getUserInfo(function(result){
			if(result.status){
				// $(".full-row.palStatements.rs-palStat .prsnl-top-con.has-tab.border-bot  ul li").click(function(){
				// 	$(".full-row.palStatements.rs-palStat").removeClass("hide");
				// 	$(this).closest(".full-row.palStatements.rs-palStat").addClass("hide");
				// })
				control.datepickerStartEnd($("#lottoTeamBettingForm [name='startTime']"), $("#lottoTeamBettingForm [name='endTime']"));
				control.searchTeamBetting();
				control.customSelectGame();
				control.switchAgentTeamBetting();
				$("#lottoTeamBettingForm [name='pageNo']").val(1);
				UI.loadQueryConditionList(globalVar.headers ,function(obj){
					$("#lottoTeamBettingForm [name='game']").html(obj.games);
					// $("#lottoTeamBettingForm [name='status']").html(obj.orderStatus);
					control.customSelect("#lottoTeamBettingForm select");
					UI.loadGroupGames(function(_html){
						$("#customGameList").html(_html);
						$("#lottoTeamBettingForm .form-submit").click();
					})
				});

				// Lotto
				control.switchDecimal("#lottoTeamBetting .switchDecimal");

				// Pvp
				control.datepickerStartEnd($("#pvpTeamBettingForm [name='startTime']"), $("#pvpTeamBettingForm [name='endTime']"));
				control.customSelect("#pvpTeamBettingForm select");
				control.showMorePvpFilter();
				control.searchPvpTeamBetting();
			}else{
				window.location="/";
			}
		});
	},
	switchAgentTeamBetting: function(){
		$(document).off("click", "#switchAgentTeamBetting li").on("click", "#switchAgentTeamBetting li", function(){
			if($(this).attr("data-rel") == "lotto"){
				$("#pvpTeamBetting").addClass("hide");
				$("#lottoTeamBetting").removeClass("hide");
				$("#lottoTeamBettingForm .form-submit").click();
			}else{
				$("#lottoTeamBetting").addClass("hide");
				$("#pvpTeamBetting").removeClass("hide");
				$("#pvpTeamBettingForm .form-submit").click();
			}
			$("#switchAgentTeamBetting li.active").removeClass("active");
			$(this).addClass("active");
		});
	},
	showMorePvpFilter: function(){
		$(document).off("click", "#pvpTeamBettingForm .tabBtn").on("click", "#pvpTeamBettingForm .tabBtn", function(){
			var form = $("#pvpTeamBettingForm"),
				otherFilter = form.find(".otherFilter"),
				table = $("#tableContainer");
			if( otherFilter.hasClass("hide") ){
				$(this).addClass("active");
				otherFilter.removeClass("hide");
				table.addClass("mini");
				$("#lottoGameHistoryList").addClass("y-overflow");
				control.customSelect("#lottoGameHistoryForm [name='chaseStatus']");
			}else{
				$(this).removeClass("active");
				otherFilter.addClass("hide");
				table.removeClass("mini");
				$("#lottoGameHistoryList").removeClass("y-overflow");
			}
		});
	},	
	searchPvpTeamBetting: function(){
		$(document).off("click", "#pvpTeamBettingForm .form-submit").on("click", "#pvpTeamBettingForm .form-submit", function(){
			control.getPvpTeamBetting();
		});
	},
	getPvpTeamBetting: function(){
		var form = $("#pvpTeamBettingForm"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			customerId = form.find("[name='customerId']"),
			range = form.find("[name='range']"),
			gameType = form.find("[name='gameType']"),
			gameRoom = form.find("[name='gameRoom']"),
			pageNo = form.find("[name='pageNo']"),
			submitBtn = form.find(".form-submit"),
			data = {
				customerId: customerId.val(),
				startDate: startTime.val(),
				endDate: endTime.val(),
				gameCode: gameType.val(),
				orderNum: gameRoom.val(),
				pageNo: pageNo.val(),
				pageSize: 20,
				range: range.val()
			};
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			TCG.Ajax({ url: "./getTeamPVPRNGBettingReport", data: data }, function(result){
				if(result.status){
					UI.loadPvpTeamBetting(result.result, gameType.val());
					var pageSize = result.result.page.pageSize,
						pageTotal = Math.ceil(result.result.page.total/pageSize);
					UI.loadPagination("pvpTeamBetting", result.result.page.currentPage, pageTotal, "#lottoTeamBettingPagination");
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
				}
				submitBtn.removeClass("processing");
			});
		}
	},
	customSelectGame: function(){
		$(document).off("click", "#lottoTeamBettingForm [name='game']").on("click", "#lottoTeamBettingForm [name='game']", function(){
			var parentDiv = $(this).parents(".selectGame");
			var input = parentDiv.find("[name='game']");
			parentDiv.addClass("show-data");
			parentDiv.find(".gameList .game").unbind("click").bind("click", function(){
				input.val( $(this).text() ).attr({ "data-gameCode": $(this).attr("data-gameCode") });
				parentDiv.find(".gameList .game").removeClass("selected");
				$(this).addClass("selected");
				$(document).off("click","html");
				parentDiv.removeClass("show-data");
			});
			$(document).off("click", "html").on("click", "html", function (e) {
				if(e.target.id == "customGameList" || $(e.target).parents("#customGameList")[0]){
				}else{
					$(document).off("click","html");
					parentDiv.removeClass("show-data");					
				}
			});	
		});
	},
	searchTeamBetting: function(){
		$(document).off("click", "#lottoTeamBettingForm .form-submit").on("click", "#lottoTeamBettingForm .form-submit", function(){
			var form = $("#lottoTeamBettingForm"),
				formInput = form.find(".form-control"),
				customerName = form.find("[name='customerName']"),
				startTime = form.find("[name='startTime']"),
				endTime = form.find("[name='endTime']"),
				status = form.find("[name='status']"),
				range = form.find("[name='range']"),
				gameCode = form.find("[name='game']"),
				gameCodeVal = gameCode.attr("data-gameCode") == "" ? 0 : gameCode.attr("data-gameCode"),
				order = form.find("[name='order']"),
				issue = form.find("[name='issue']"),
				chaseStatus = form.find("[name='chaseStatus']"),
				pageNo = form.find("[name='pageNo']"),
				submitBtn = form.find(".form-submit"),
				data = {
					customerName: customerName.val(),
					startDate: startTime.val(),
					endDate: endTime.val(),
					area: range.val(),
					status: status.val(),
					gameCode: gameCodeVal,
					orderNum: order.val(),
					numero: issue.val(),
					chase: chaseStatus.val(),
					pageNo: pageNo.val(),
					pageSize: 6
				};

			if( !submitBtn.hasClass("processing") ){
				submitBtn.addClass("processing");
				TCG.Ajax({url: "./getTeamBettingReport", data: data},function(result){
					if(result.status){
						UI.loadTeamBetting(result.result);
						var pageSize = result.result.page.pageSize,
							pageTotal = Math.ceil(result.result.page.total/pageSize);
						UI.loadPagination("lottoTeamBetting", result.result.page.currentPage, pageTotal, "#lottoTeamBettingPagination");
					} else{
						TCG.Alert("errors",TCG.Prop(result.description));
					}
					submitBtn.removeClass("processing");			
				});
			}
		});
	},
	/*************************************************************
	// Agent Center - Agent Revenue Report
	**************************************************************/
	agentRevenueReport: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.customSelect("#revenueReportForm select");
				control.datepickerStartEnd($("#revenueReportForm [name='startTime']"), $("#revenueReportForm [name='endTime']"));
				control.switchDecimal();
				control.searchRevenueReport();
				$("#revenueReportForm .form-submit").click();
			}else{
				window.location="/";
			}
		});
	},
	searchRevenueReport: function(){
		$(document).off("click", "#revenueReportForm .form-submit")
				   .on("click", "#revenueReportForm .form-submit", function(){
			control.getRevenueReport();	
		});
	},
	getRevenueReport: function(){
		var form = $("#revenueReportForm"),
			formInput = form.find(".form-control"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			pageNo = form.find("[name='pageNo']"),
			submitBtn = form.find(".form-submit"),
			data = {
				startDate: startTime.val(),
				endDate: endTime.val(),
				pageNo: pageNo.val(),
				pageSize: 9				
			};		
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			TCG.Ajax({url: "./agent/getIncomeReport", data: data},function(result){
				if(result.status){
					UI.loadRevenueReport(result.result);
					var pageSize = result.result.page.pageSize,
						totalPage = Math.ceil(result.result.page.total/pageSize);
					UI.loadPagination("revenueReport", result.result.page.currentPage, totalPage);
				} else{
					TCG.Alert("errors",TCG.Prop(result.description));
				}
				submitBtn.removeClass("processing");			
			});
		}
	},
	/*************************************************************
	// Agent Center - Agent Dividend Record
	**************************************************************/
	agentDividendRecord: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.getAgentDividendRecord();
			}else{
				window.location="/";
			}
		});
	},
	getAgentDividendRecord: function(){
		var data = { gameType: 4 };
		TCG.Ajax({ url: "./agent/getCommissionReport", data: data }, function(result){
			if(result.status){
				UI.loadAgentDividendRecord(result.result);
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		})
	},
	/*************************************************************
	// Messages
	**************************************************************/
	inbox: function(){
		control.getUserInfo(function(result){
			if(result.status){
				control.getInboxMessages();

				$( "#replyMsg" ).click(function() {
					$( "#replyPop" ).toggle("slide", { direction: "right" }, 800);
				});
				
				$( ".close-panel" ).click(function() {
					$( "#replyPop" ).toggle("slide", { direction: "right" }, 300);
				});
			}else{
				window.location="/";
			}
		})
	},
	getInboxMessages: function(page){
		var pageNo = page || 1;
		TCG.Ajax({ url: "./getMessages", data: { page: pageNo } }, function(result){
			if(result.status){
				UI.loadInboxMessages(result.result);
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		});
	},
	/*************************************************************
	// Help
	**************************************************************/
	helpPlayPrize: function()
	{
		$(document).off("click","#playPrize .tab-btn")
				.on("click","#playPrize .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#playPrize .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#playPrize .tab-content").hide();
			$("#"+rel).show();
			$( ".accordions" ).accordion({
				active: false, 
				collapsible: true, 
				heightStyle: "content"
			});
		});
		$( ".accordions" ).accordion({
			active: false, 
			collapsible: true, 
			heightStyle: "content"
		});
		
		//$(".").accordions();
	},
	helpDepositRelated: function()
	{
		$(document).off("click","#depositRel .tab-btn")
				.on("click","#depositRel .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#depositRel .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#depositRel .tab-content").hide();
			$("#"+rel).show();
			$( ".accordions" ).accordion({
				active: false, 
				collapsible: true, 
				heightStyle: "content"
			});
		});
		
		$( ".accordions" ).accordion({
			active: false, 
			collapsible: true, 
			heightStyle: "content"
		});
	},
	helpYourWithdrawal: function()
	{
		$(document).off("click","#yourWithdraw .tab-btn")
				.on("click","#yourWithdraw .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#yourWithdraw .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#yourWithdraw .tab-content").hide();
			$("#"+rel).show();
			$( ".accordions" ).accordion({
				active: false, 
				collapsible: true, 
				heightStyle: "content"
			});
		});
		
		$( ".accordions" ).accordion({
			active: false, 
			collapsible: true, 
			heightStyle: "content"
		});
	},
	helpAccountNumbers: function()
	{
		$(document).off("click","#accntNum .tab-btn")
				.on("click","#accntNum .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#accntNum .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#accntNum .tab-content").hide();
			$("#"+rel).show();
			$( ".accordions" ).accordion({
				active: false, 
				collapsible: true, 
				heightStyle: "content"
			});
		});
		
		$( ".accordions" ).accordion({
			active: false, 
			collapsible: true, 
			heightStyle: "content"
		});
	},
	helpInstallation: function()
	{
		$(document).off("click","#installHelp .tab-btn")
				.on("click","#installHelp .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#installHelp .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#installHelp .tab-content").hide();
			$("#"+rel).show();
			$( ".accordions" ).accordion({
				active: false, 
				collapsible: true, 
				heightStyle: "content"
			});
		});
		
		$( ".accordions" ).accordion({
			active: false, 
			collapsible: true, 
			heightStyle: "content"
		});
	},
	helpBonusBettingIssues: function()
	{
		$(document).off("click","#bbi .tab-btn")
				.on("click","#bbi .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#bbi .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#ibbi .tab-content").hide();
			$("#"+rel).show();
			$( ".accordions" ).accordion({
				active: false, 
				collapsible: true, 
				heightStyle: "content"
			});
		});
		
		$( ".accordions" ).accordion({
			active: false, 
			collapsible: true, 
			heightStyle: "content"
		});
	},
	helpAboutUs: function()
	{
		$(document).off("click","#faqTabs .tab-btn")
				.on("click","#faqTabs .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#faqTabs .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#faqTabs .tab-content").hide();
			$("#"+rel).show();
			$( ".accordions" ).accordion({
				active: false, 
				collapsible: true, 
				heightStyle: "content"
			});
		});
		
		$( ".accordions" ).accordion({
			active: false, 
			collapsible: true, 
			heightStyle: "content"
		});
	}
}

/**********************************************************
RegEx Pattern
***********************************************************/
function regExPattern(type, inputVal){
	var pattern;
	switch(type){
		case "email":
			pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z|a-z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
			break;
		case "remark":
			pattern = /^.{0,255}$/;
			break;
		case "alphaNum":
			pattern = /\w+/;
			break;
		case "username":
			pattern = /^[\w]{6,11}$/;
			break;
		case "password":
			pattern = /^[\w]{6,16}$/;
			break;
		case "numberOnly":
			pattern = /^[0-9]+$/;
			break;
		case "alpha":
			pattern = /[a-z|A-Z]+/;
			break;
		case "alphaOnly":
			//pattern = /^[a-zA-Z]+$/;
			pattern = /^\W+|[a-z]+$/i;
			break;
		case "mobileNo":
			pattern = /^[0-9]{11}$/;
			break;
		case "decimalNum":
			pattern = /^(\d+\.?\d+|\d+)$/;
			break;
		case "amount":
			pattern = /^(\d+\.?\d+|\d+)$/;
			break;			
		case "bankCardNumber":
			pattern = /^[0-9]{14,20}$/;
			break;	
		case "alipayAccount":
			pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z|a-z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b|^[0-9]{11}$/;
			break;
		case "orderNumber":
			pattern = /^[A-Z0-9]+\-\d+$/;
			break;
		case "issueNumber":
			pattern = /^\d+\-\d+$/;
			break;
		case "qq":
			pattern = /^[1-9]\d{4,13}$/;
			break;
		case "url":
			pattern = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;
			break;
		default:
			console.log("Invalid Type!");
			return false;
	}	
	return pattern.test( inputVal );
}