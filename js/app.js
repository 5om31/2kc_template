function app(){
	var app = this;
	this.captcha = function(callback){
		var timeStamp = new Date().getTime(),
			url = "/secure/imageCode?_="+timeStamp;
		callback(url);
	}
	this.checkLogin = function(callback){
		app.getMemberInfo(function(result){ 
			var result = result.status;// && localStorage.getItem("t") != null ? result : {status:false};
			callback(result);
		});
		// var result = localStorage.getItem("t") != null ? { status: true, data: JSON.parse(localStorage.getItem("t")) } : { status: false };
		// callback(result);
	}
	this.login = function(data, callback){
		var param = { url: "/login", data: data };
		TCG.Ajax(param, callback);
	}
	this.logout = function(callback){
		var param = { url: "/logout" };
		TCG.Ajax(param, callback);
	}
	this.register = function(data, callback){
		var param = {  url: "/register", data: data };
		TCG.Ajax(param, callback);
	}
	this.checkUsername = function(data, callback){
		var param = { url: "/checkUsername", data: data };
		TCG.Ajax(param, callback);
	}
	this.getDefaultAgent = function(data, callback){
		var param = { url: "/getDefaultAgent", data: data };
		TCG.Ajax(param, callback);
	}
	this.forgotPassword = function(data, callback){
		var param = { url: "/findPwdByEmail", data: data };
		TCG.Ajax(param, callback);
	}
	this.getMemberInfo = function(callback){
		var param = { url: "/memberinfo" };
		TCG.Ajax(param, callback);
	}
	this.getCaptcha = function(callback){
		var timeStamp = new Date().getTime(),
			url = "/secure/imageCode?_="+timeStamp;
		callback(url);		
	}
	this.getGames = function(data, callback){
		var param = { url: "/getUserGameList", data: data };
		TCG.Ajax(param, callback);
	}
	this.updateMemberInfo = function(data, callback){
		var param = { url: "/updatememberinfo", data: data };
		TCG.Ajax(param, callback);
	}
	this.changePassword = function(data, callback){
		var param = { url: "/modifyPassword", data: data };
		TCG.Ajax(param, callback);
	}
	this.withdrawGetCard = function(callback){
		var param = { url: "/withdraw/getCard" };
		TCG.Ajax(param, callback);
	}
	this.withdrawAddCard = function(data, callback){
		var param = { url: "/withdraw/addCard", data: data };
		TCG.Ajax(param, callback);
	}
	this.getBankList = function(callback){
		var param = { url: "/getDepositBankList" };
		TCG.Ajax(param, callback);
	}
	this.getWithdrawBankList = function(callback){
		var param = { url: "/getWithdrawBankList" };
		TCG.Ajax(param, callback);
	}
	this.depositPG = function(data, callback){
		var param = { url: "/depositPG", data: data };
		TCG.Ajax(param, callback);
	}
	this.depositMT = function(data, callback){
		var param = { url: "/depositMT", data: data };
		TCG.Ajax(param, callback);
	}
	this.depositAlipay = function(data, callback){
		var param = { url: "/depositAlipay", data: data };
		TCG.Ajax(param, callback);
	}
	this.withdraw = function(data, callback){
		var param = { url: "/withdrawApply", data: data };
		TCG.Ajax(param, callback);
	}
	this.getWalletList = function(callback){
		var param = { url: "/getWalletList" };
		TCG.Ajax(param, callback);
	}
	this.getAllWalletBalance = function(callback){
		var param = { url: "/getAllWalletBal" };
		TCG.Ajax(param, callback);
	}
	this.getWalletBalance = function(data, callback){
		var param = { url: "/getWalletBal", data: data };
		TCG.Ajax(param, callback);
	}
	this.transferToMainWallet = function(data, callback){
		var param = { url: "/transferToMainWallet", data: data};
		TCG.Ajax(param, callback);
	}
	this.transferFromMainWallet = function(data, callback){
		var param = { url: "/transferFromMainWallet", data: data};
		TCG.Ajax(param, callback);
	}
	this.checkLockTransStatus = function(data, callback){
		var param = { url: "/checkLockTransStatus", data: data };
		TCG.Ajax(param, callback);
	}
	this.getTransactionDetails = function(data, callback){
		var param = { url: "/getTransactionDetails", data: data};
		TCG.Ajax(param, callback);
	}
	this.getSystemAnnouncements = function(data, callback){
		var param = { url: "/getSystemAnnouncements", data: data };
		TCG.Ajax(param, callback);
	}
	this.getJackpot = function(data, callback){
		var param = { url: "/getJackpot", data: data};
		TCG.Ajax(param, callback);
	}
	this.gamesVersionUpdate = function(data, callback){
		var param = { url: "/games/versionUpdate", data: data};
		TCG.Ajax(param, callback);
	}
	this.gameStatistics = function(data, callback){
		var param = { url: "/getGameSummaryReport", data: data };
		TCG.Ajax(param, callback);
	}
	this.getRoomList = function(data, callback){
		var param = { url: "/getRoomList", data: data};
		TCG.Ajax(param, callback);
	}
	this.getPromotions = function(data, callback){
		var param = { url: "/getPromotions", data: data };
		TCG.Ajax(param, callback);
	}
	this.acceptPromotion = function(data, callback){
		var param = { url: "/acceptPromotion", data: data};
		TCG.Ajax(param, callback);
	}
	this.getUnreadMessages = function(callback){
		var param = { url: "/getUnreadMessageCount" };
		TCG.Ajax(param, callback);
	}
	this.getMessages = function(data, callback){
		var param = { url: "/getMessages", data: data };
		TCG.Ajax(param, callback);
	}
	this.getMessageCount = function(callback){
		var param = { url: "/getMessageCount" };
		TCG.Ajax(param, callback);
	}
	this.readMessage = function(data, callback){
		var param = { url: "/markRead", data: data};
		TCG.Ajax(param, callback);
	}
	this.viewMessage = function(data, callback){
		var param = { url: "/viewMessage", data: data};
		TCG.Ajax(param, callback);
	}
	this.launchGame = function(data, callback){
		var param = { url: "/launchGame", data: data};
		TCG.Ajax(param, callback);
	}
	this.getListAnnouncement = function(callback){
		var param = { url: "/getListAnnouncement.do" };
		TCG.Ajax(param, callback);
	}
	this.getAgentInfo = function(callback){
		var param = { url: "/agentSet/agentInfo" };
		TCG.Ajax(param, callback);
	}
	this.getListAgentConfig = function(callback){
		var param = { url: "/agentSet/getListAgentConfig" };
		TCG.Ajax(param, callback);
	}
	this.agentRegisterDownline = function(data, callback){
		var param = { url: "/agentSet/register", data: data};
		TCG.Ajax(param, callback);
	}
	this.agentDownlineManagement = function(data, callback){
		var param = { url: "/agentSet/getAgentDownlines", data: data};
		TCG.Ajax(param, callback);
	}
	this.agentDownlineTransfer = function(data, callback){
		var param = { url: "/agentLR/lowerRecharge", data: data};
		TCG.Ajax(param, callback);
	}
	this.modifyDownlineRebate = function(data, callback){
		var param = { url: "/modifyDownlineRebate", data: data };
		TCG.Ajax(param, callback);
	}
	this.playerAnalysis = function(data, callback){
		var param = { url: "/playerAnalysis", data: data };
		TCG.Ajax(param, callback)
	}
	this.rngComissionReport = function(data, callback){
		var param = { url: "/rngComissionReport", data: data };
		TCG.Ajax(param, callback);
	}
	this.winList = function(data, callback){
		var param = { url: "/getWinnerBoard", data: data};
		TCG.Ajax(param, callback);
	}
	this.getAddress = function(callback){
		var param = { url: "./resource/province_city_zh-CN.xml", dataType: "xml" };
		TCG.Ajax(param, callback);
	}
	this.loginByToken = function(data, callback){
		var param = { url: "/loginByToken", data: data };
		TCG.Ajax(param, callback);
	}
	this.checkWalletLockStatusByVendor = function(data, callback){
		var param = { url: "/checkWalletLockStatusByVendor", data: data };
		TCG.Ajax(param, callback);
	}

	this.getSecurityQuestions = function(callback){
		var param = { url: "./getSecurityQuestions" };
		TCG.Ajax(param, callback);		
	}
	this.getCustomerSecurityQuestion = function(callback){
		var param = { url: "./getCustomerSecurityQuestion" };
		TCG.Ajax(param, callback);		
	}
	this.getSwfMovieObject=function(movieName){
	  if (window.document[movieName]){
	    return window.document[movieName];
	  }
	  if (navigator.appName.indexOf("Microsoft Internet")==-1){
	    if (document.embeds && document.embeds[movieName])
	      return document.embeds[movieName]; 
	  }else{
	    return document.getElementById(movieName);
	  }
	}
	this.downlineAnalysis  = function(data, callback) {
		var param = { url: "/downlineAnalysis", data: data };
		TCG.Ajax(param, callback);
	}
}

/*********************************
Load XML Page Content
*********************************/
function loadModalContent(name, prop, callback){
    TCG.showLoading();
	TCG.Ajax({
  		url: "./xml/"+name+".xml",
  		dataType: "html",
  		cache: false
  	}, function(txt){
		TCG.hideLoading();
        prop.text = txt; 
		TCG.WinOpen(prop, function(){
			$(document).on("keydown", function(e){
				if(e.keyCode == 27 ){
					$("#popup_close").click();
				}
			});
	  		callback();
		}, function(){
			$(document).off("keydown");
		});
  	});
}

function loadModalSubMenu(name){
	var obj = {
		"deposit": {
			"menu": "存款",
			"submenu": {
				"onlinePayment": "在线支付",
				"quickPayment": "快捷支付",
				"alipay": "支付宝",
				"conversionOfFunds": "资金转换",
				"depositRecords": "存款记录"				
			}
		},
		"withdrawal": {
			"menu": "提款",
			"submenu": {
				"withdrawalRequest": "提款申请",
				"withdrawal": "提款记录",
				"bindCard": "绑定提款卡"
			}
		},
		"personal": {
			"menu": "个人",
			"submenu": {
				"myProfile": "我的资料",
				"bonusDetails": "奖金详情",
				"gameHistory": "游戏记录",
				"norecordChase": "追号记录",
				"changeAccount": "帐变明细",
				"palStatements": "盈亏报表",
				"changePassword": "登录密码",
				"modfndPassword": "资金密码",
				"ssSettings": "设置密保"						
			}
		},
		"proxy": {
			"menu": "代理",
			"submenu": {
				"accurateRegistration": "精准注册",
				"linkToRegister": "链接注册",
				"linkManager": "链接管理",
				"memberManagement": "会员管理",
				"profitAndLossStatement": "盈亏报表",
				"agentTeamBetting": "团队投注",
				"agentRevenueReport": "收入报表",
				"dividendRecord": "分红记录"				
			}
		},
		"message": {
			"menu": "讯息",
			"submenu": {
				"menu1": "submenu 1"
			}
		},
		"help": {
			"menu": "帮助",
			"submenu": {
				"helpPlayPrize": "玩法奖金",
				"helpDepositRelated": "存款相关",
				"helpYourWithdrawal": "提款相关",
				"helpAccountNumbers": "帐号相关",
				"helpBonusBettingIssues": "常见问题",
				"helpInstallation": "安装帮助",
				"helpAboutUs": "关于我们"				
			}
		},
		"activity": {
			"menu": "帮助",
			"submenu": {
				"announcement": "公告新闻",
				"activityInfo": "活动资讯"				
			}
		}
	},	
	list = "<p class='title-menu'>"+obj[name].menu+"</p><ul class='remodalSubMenu'>";
	for(var i in obj[name].submenu){
		list += "<li data-submenu='" +i+ "'>" +obj[name].submenu[i]+ "</li>";
	}
	return list+="</ul>";
}

function loadSubmenuContent(name, argments){
	TCG.Ajax({
  		id: "#submenuContent",
  		url: "./xml/"+name+".xml",
  		dataType: "html",
  		cache: false
  	}, function(){
   		var functions;
   		console.log(name);
   		if(argments){
   			if(typeof window[name] == "function"){
	    		functions=new Function('argments','return ' + name +'(argments);'); 
	    		functions(argments); 				
   			}
		}else{
   			if(typeof window[name] == "function"){
	    		functions=new Function('return ' + name +'();');
	    		functions();
	    	}
   		}
  	});
}

// Load Left Menu
function loadLeftMenu(callback){
	TCG.Ajax({
  		id: "#leftMenu",
  		url: "./xml/leftMenu.xml",
  		dataType: "html",
  		cache: false,
  		lock: true
  	}, function(){
  		if( typeof callback == "function" ){
	  		callback();
  		}
  	});	
}

/**********************************************************
RESERVE FUNCTIONS
**********************************************************/
// Check Attribute: return true/false, parameter( elam )
function hasAttr(elem, find) {  
   return elem.attr(find) !== undefined;
}

function hasName(elem, name){
	return elem.attr("name") == name ? true : false;
}

function currencyFormat(amount, decimalNum){
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
}

/**********************************************************
END RESERVE FUNCTIONS
**********************************************************/

/**********************************************************
DOC COOKIES
**********************************************************/
// Cookies
var docCookies = {
	getItem: function (sKey) {
    	return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    	if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    	var sExpires = "";
    	if (vEnd) {
	      	switch (vEnd.constructor) {
	        	case Number:
	          		sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
	          		break;
	        	case String:
	          		sExpires = "; expires=" + vEnd;
	          		break;
	        	case Date:
	          		sExpires = "; expires=" + vEnd.toUTCString();
	          	break;
      		}
    	}
	    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    	return true;
  	},
  	removeItem: function (sKey, sPath, sDomain) {
    	if (!sKey || !this.hasItem(sKey)) { return false; }
    	document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
    	return true;
  	},
  	hasItem: function (sKey) {
    	return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  	},
  	keys: /* optional method: you can safely remove it! */ function () {
    	var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    	for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    	return aKeys;
  	}
};
/**********************************************************
END DOC COOKIES
**********************************************************/

/**********************************************************
Mask Data
*********************************************************/
function maskData(data, start){
	var newData = data.substring(0,start);
	for(var i=0; i<data.length; i++){
		if( i >= start ){
			newData += "*";
		}
	}
	return newData;
}

/**********************************************************
GET PROVINCE LIST INPUT
**********************************************************/
function getProvince(callback){
	if( globalVar.getAddressResult !== null ){
		var xml = globalVar.getAddressResult,
			parentNode = xml.getElementsByTagName("string"),
			option = "<option value='' data-englishName=''>省</option>";
	   for( var i =0; i < parentNode.length; i++ ){
	   		var provinceValue = parentNode[i].childNodes[0].nodeValue,
	   			provinceName = parentNode[i].getAttribute("name");
	   		option += "<option value='" +provinceValue+ "' data-englishName='" +provinceName+ "'>" +provinceValue+ "</option>";
	   }
		globalVar.getAddressResult = xml;
	    callback(option);		
	}else{
		app.getAddress(function(xml){
			var parentNode = xml.getElementsByTagName("string"),
				option = "<option value='' data-englishName=''>省</option>";
		   for( var i =0; i < parentNode.length; i++ ){
		   		var provinceValue = parentNode[i].childNodes[0].nodeValue,
		   			provinceName = parentNode[i].getAttribute("name");
		   		option += "<option value='" +provinceValue+ "' data-englishName='" +provinceName+ "'>" +provinceValue+ "</option>";
		   }
			globalVar.getAddressResult = xml;
		    callback(option);
		});
	}
}

function getCity(province, callback){
	var xml = globalVar.getAddressResult,
		cityElement = "city_"+province,
		cityList = xml.getElementsByTagName(cityElement)[0],
		CNode = cityList.getElementsByTagName("item"),
		CNodeLength = CNode.length,
		option="<option value=''>市</option>";
	for(var x=0; x < CNode.length; x++){
		var cityName = CNode[x].childNodes[0].nodeValue;
	   		option += "<option value='" +cityName+ "'>" +cityName+ "</option>";
	}
	callback(option);
}

/**********************************************************
VALIDATE INPUT
**********************************************************/
function validateInput(input, valid){
	if(valid){
		input.parents(".form-group").removeClass("invalid");
	}else{
		input.parents(".form-group").addClass("invalid");
	}		
}
/**********************************************************
END VALIDATE INPUT
**********************************************************/

/**********************************************************
IE Compatibility
**********************************************************/
// indexOf() for IE8
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

/**********************************************************
Encode URI  and Encrypt RSA
**********************************************************/
function encode(arr){
	var encodedData = [];
	for( var i=0; i<arr.length; i++ ){
		encodedData.push( encodeURI(arr[i]) );
	}
	return getEncryptedText(encodedData);
}

/**********************************************************
OPEN ALERT
**********************************************************/
function openAlert(obj, callback){
	//type, message, title
	var extMessage = obj.extMessage || "";
		propMsg = TCG.Prop(obj.message),
		message = "[" +obj.message+ "]" == propMsg ? TCG.Prop("contact_customer_service") : propMsg,
		title = obj.title === undefined ? "" : obj.title,
		type = obj.type; 
	TCG.Alert(type, message + " " + extMessage, title, callback);
}

/**********************************************************
END OPEN ALERT
**********************************************************/

/**********************************************************
Copy 
**********************************************************/
function copyClipboard(elem){
	var e = elem || $("[data-clipboard]");
	ZeroClipboard.setDefaults({
		moviePath: "./js/lib/ZeroClipboard.swf"
	});
	var clip = new ZeroClipboard(e);	
}
/**********************************************************
END Copy
**********************************************************/

/**********************************************************
Window.Open Popup Center Position
**********************************************************/
function PopupCenter(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'resizable= no, menubar=no, status=no, toolbar=no, scrollbars=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
}
/**********************************************************
END Window.Open Popup Center Position
**********************************************************/


/**********************************************************
VALIDATE FORM INPUT
**********************************************************/
function validateFormInput(formInput, callback){
	var data = [],
		invalid = 0;
	$.each(formInput, function(i){
		var input = $(this),
			inputVal = input.val(),
			inputLength = inputVal.length,
			inputType = input.attr("type"),
			inputValid = input.attr("data-valid"),
			minLength = input.attr("data-minLength"),
			maxLength = input.attr("data-maxLength"),
			minVal = input.attr("data-minVal"),
			maxVal = input.attr("data-maxVal");
		data.push({ "elem": input, "invalid": [] });
		if( hasAttr(input,"required") ){
			if( inputType == "checkbox" ){
				if( input.is(":checked") == false ) data[i].invalid.push( "required" ); 
			}else{
				if( $.trim( inputVal ) == "" ) data[i].invalid.push( "required" );
			}
			if( hasAttr(input, "data-valid") ){
				regExPattern( inputValid, inputVal, function(valid){
					if( valid == false ) data[i].invalid.push("invalid");
				});
			}
		}else{
			if( hasAttr(input, "data-valid") ){
				if( inputVal != "" ){
					regExPattern( inputValid, inputVal, function(valid){
						if( valid == false ) data[i].invalid.push("invalid");
					});
				}
			}				
		}
		if( hasAttr(input, "data-minLength") ){
			if( inputLength < minLength ) data[i].invalid.push("minLength");
		}
		if( hasAttr(input, "data-maxLength") && ( hasAttr(input,"required") || hasAttr(input,"required") == false && inputVal != "" ) ){
			if( inputLength > maxLength ) data[i].invalid.push("maxLength");
		}

		if( hasAttr(input, "data-minVal") ){
			if( parseFloat(inputVal) < parseFloat(minVal) ) data[i].invalid.push("minVal");
		}

		if( hasAttr(input, "data-maxVal") ){
			if( parseFloat(inputVal) > parseFloat(maxVal) ) data[i].invalid.push("maxVal");
		}

	});
	for(var i=0; i < data.length; i++){ 
		if( data[i].invalid.length > 0 ) invalid++;
	};
	callback(invalid, data);

}	

function regExPattern(type, inputVal, callback){
	var valid = false,
		pattern;
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
		default:
			callback(true);
			return;
	}
	valid = pattern.test( inputVal );
	callback(valid);
}
/**********************************************************
END VALIDATE FORM INPUT
**********************************************************/
