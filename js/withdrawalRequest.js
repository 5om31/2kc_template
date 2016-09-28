new withdrawalRequest();

// Withdrawal Request
function withdrawalRequest(){
	var withdrawalRequest = this,
		localVar = { selectedBankId: null, withdrawRemaining: "--" };
	this.init = function(){
		withdrawalRequest.checkLogin(function(result){
			if(result.status){
				withdrawalRequest.events();
				withdrawalRequest.getBankCards();
				// common.getUserInfo(result.result);
				// common.loadWalletBalance();				
			}else{
				alert("login required!");
			}
		});
	}
	this.checkLogin = function(callback){
		TCG.Ajax({
			url: "./memberinfo"
		}, function(result){
			callback(result);
		});
	}		
	this.getBankCards = function(){
		TCG.Ajax({ url:"/withdraw/getCard" }, function(result){
			if(result.status){
				var list = "",
					bankCards = result.result.bankCards;
				if(bankCards.length > 0){
					localVar.withdrawRemaining = result.result.remainingTransactionTimes;
					list += "<div class='main-wrp-card'>";
					for(var i=1; i<=bankCards.length; i++){
						list += "<div class='banks z-i" +i+ " z-i' data-bankId='" +bankCards[i].bankCardId+ "' data-bankCardNo='" +bankCards[i].cardNumber+ "' data-bankCardHolder='" +bankCards[i].cardHolder+ "' data-bankName='" +bankCards[i].bankBranchName+ "' data-bankProvince='" +bankCards[i].province+ "'>";
						list += "<span class='bankLogo-Card n012313'></span>";
						list += "<span class='det-01'>**** **** **** 0000</span>";
						list += "<span class='det-02'>卡号</span>";
						list += "<span class='det-03'>**** **** **** 0000</span>";
						list += "<span class='det-04'>提款人姓名 </span>";
						list += "<span class='det-05'>XXXXXX</span>";
						list += "<span class='det-06'>綁卡日期</span>";
						list += "<span class='det-07'>0000-00-00</span>";
						list += "</div>";
					}
					list += "</div>";
				}else{
					list += "<div class='bankCard-Plain'>"; 
					list +=	"<span class='det-01 fx-mov'>**** **** **** 0000</span>";
					list += "<span class='det-02'>卡号</span>";
					list += "<span class='det-03'>**** **** ****0000</span>";
					list += "<span class='det-04'>提款人姓名 </span>";
					list += "<span class='det-05'>XXXXXX</span>";
					list += "<span class='det-06'>綁卡日期</span>";
					list += "<span class='det-07'>0000-00-00</span>";
					list += "</div>";			
				}

				$("#requestWithdrawForm .remainingWithdrawTimes").text(localVar.withdrawRemaining);
				$("#bankCardList").html(list);				
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		});
	}
	this.checkAmount = function(input){
		var isValid;
		if(input.val() == ""){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("Amount is Required!"));
		}else if( !regExPattern("amount", input.val()) ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("Invalid Amount"));
		}else{
			isValid = true;
		}
		return isValid;
	}
	this.checkWithdrawPass = function(input){
		var isValid;
		if(input.val() == ""){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("withdraw Password is Required!"));
		}else{
			isValid = true;
		}
		return isValid;
	}
	this.events = function(){
		// Request Withdraw FOrm
		$(document).off("click", "#requestWithdrawForm .form-submit")
				   .on("click", "#requestWithdrawForm .form-submit", function(){
			var form = $("#requestWithdrawForm"),
				amount = form.find("[name='amount']"),
				withdrawPass = form.find("[name='withdrawalPass']");
			if( withdrawalRequest.checkAmount(amount) && withdrawalRequest.checkWithdrawPass(withdrawPass) ){
				if(localVar.selectedBankId == null){
					TCG.Alert("errors", TCG.Prop("requestWithdrawForm_bank_required") );
				}else{
					var dataRSA = { values: encode([ amount.val(), localVar.selectedBankId, withdrawalPass.val() ]) };
					withdrawalRequest.submit(form, dataRSA);
				}				
			}
	    });

		// Select Bank
		$(document).off("click", "#bankCardList .banks")
				   .on("click", "#bankCardList .banks", function(){
			var selectedBank = $(this),
				banks = $("#bankCardList .banks");
			banks.removeClass("selected");
			selectedBank.addClass("selected");
			localVar.selectedBankId = selectedBank.attr("data-bankId");
			$("#bankInfo .bankCardHolder").text(selectedBank.attr("data-bankCardHolder"));
			$("#bankInfo .bankProvince").text(selectedBank.attr("data-bankProvince"));
			$("#bankInfo .bankName").text(selectedBank.attr("data-bankName"));
			$("#bankInfo .bankCardNo").text(selectedBank.attr("data-bankCardNo"));
	    });

		// Go To Add Bank Card
		$(document).off("click", "#requestWithdrawForm [name='addBankCard']")
				   .on("click", "#requestWithdrawForm [name='addBankCard']", function(){
			$("[data-submenu='bindCard']").click();
	    });
	}
	this.submit = function(form, dataRSA){
		var resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit");
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");

			TCG.Ajax({ url: "./withdrawApply", data: dataRSA }, function(result){
				if(result.status){
					localVar.withdrawRemaining -= 1;
					localVar.selectedBankId = null;
					resetBtn.click();
					TCG.Alert("success", TCG.Prop(result.description));
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
				}
				submitBtn.removeClass("processing");
			});
		}
	}
	return withdrawalRequest.init();
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
		default:
			console.log("Invalid Type!");
			return false;
	}	
	return pattern.test( inputVal );
}