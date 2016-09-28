var globalVar = {
	getAddressResult: null
}

// Binding Card
function bindCard(){
	var bindCard = this,
		localVar = { bankCards: [] };
	this.init = function(){
		bindCard.checkLogin(function(result){
			if(result.status){
				bindCard.events();
				getProvince(function(provinceList){
					$("#bindCardForm [name='bankProvince']").html(provinceList);
				});
				bindCard.checkUserInfo(result.result);
				bindCard.getBankCard();				
			}else{
				alert("login required!");
			}
		})
	}
	this.checkLogin = function(callback){
		TCG.Ajax({
			url: "./memberinfo"
		}, function(result){
			callback(result);
		});
	}		
	this.checkUserInfo = function(userInfo){
		if( userInfo.email !== null ) $("#bindCardForm .form-group.mailbox").remove();
		bindCard.hasWithdrawPassword(function(result){
			if(result.status){
				if(result.result == 1){
					$("#bindCardForm .form-group.withdrawPass").remove();
					$("#bindCardForm .form-group.conWithdrawPass").remove();
				}
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		});
	}
	this.hasWithdrawPassword = function(callback){
		$.ajax({
			url: "./hasWithdrawalPassword",
			dataType: "JSON"
		}).success(function(result){
			callback(result);
		});
	}	
	this.getBankCard = function(){
		TCG.Ajax({ url: "./withdraw/getCard" }, function(result){
			if(result.status){
				bindCard.bankCardList( result.resul.bankCards );
			}else{
				TCG.Alert("errors", TCG.Prop(result.description));
			}
		})
	}
	this.bankCardList = function(bankCards){
		var list = ""
		if(bankCards.length > 0){
			list += "<div class='all-list'>";
			list += "<div class='card-holder dataLoaded'>";			
			list += "<div class='main-wrp-card'>";
			for(var i=1; i<=bankCards.length; i++){
				list += "<div class='banks z-i" +i+ " z-i'>";
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
			list += "</div>";
			list += "</div>";
		}else{
			list += "<div class='bankCard-Plain'>";
			list += "<span class='det-01 fx-mov'>**** **** **** 0000</span>";
			list += "<span class='det-02'>卡号</span>";
			list += "<span class='det-03'>**** **** ****0000</span>";
			list += "<span class='det-04'>提款人姓名 </span>";
			list += "<span class='det-05'>XXXXXX</span>";
			list += "<span class='det-06'>綁卡日期</span>";
			list += "<span class='det-07'>0000-00-00</span>";
			list += "</div>";
		}

		// BankCard Count
		$("#bindCardForm .bankCardCount").text(bankCards.length);
		
		// Add BankCard
		$("#bankCardList").html(list);			

		// Disabled Submit Btn
		if( bankCards.length >= 5 ){
			$("#bindCardForm .form-submit").prop("disabled", true);			
		}		
	}
	this.checkPayeeName = function(input){
		var isValid;
		if( input.val() == "" ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("payeeName is required!"));
		}else{
			isValid = true;
		}
		return isValid;		
	}
	this.checkBankName = function(input){
		var isValid;
		if( input.val() == "" ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("BankName is required!"));
		}else{
			isValid = true;
		}
		return isValid;		
	}
	this.checkBankCardNo = function(input){
		var isValid;
		if( input.val() == "" ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("payeeName is required!"));
		}else if( !regExPattern("bankCardNumber",input.val()) ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("Invalid BankCard Number"));
		}else{
			isValid = true;
		}
		return isValid;		
	}
	this.checkBankProvince = function(input){
		var isValid;
		if( input.val() == "" ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("bankProvince is required!"));
		}else{
			isValid = true;
		}
		return isValid;		
	}
	this.checkBankCity = function(input){
		var isValid;
		if( input.val() == "" ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("bankCity is required!"));
		}else{
			isValid = true;
		}
		return isValid;		
	}
	this.checkBankBranch = function(input){
		var isValid;
		if( input.val() == "" ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("bankBranch is required!"));
		}else{
			isValid = true;
		}
		return isValid;		
	}
	this.checkEmail = function(input){
		var isValid;
		if( input.val() == "" ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("email is required!"));
		}else if( !regExPattern("email", input.val()) ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("Invalid Email!"));
		}else{
			isValid = true;
		}
		return isValid;
	}
	this.checkPassword = function(input){
		var isValid;
		if( input.val() == "" ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("Password is required!"));
		}else if( !regExPattern("password", input.val()) ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("Invalid Password"));
		}else{
			isValid = true;
		}
		return isValid;
	}	
	this.confirmPassword = function(password, confirmPassword){
		var isValid;
		if( password.val() != confirmPassword.val() ){
			isValid = false;
			TCG.Alert("errors", TCG.Prop("Password not match!"));
		}else{
			isValid = true;
		}
		return isValid;
	}	
	this.events = function(){
		// Submit Form
		$(document).off("click", "#bindCardForm .form-submit")
				   .on("click", "#bindCardForm .form-submit", function(){
			var form = $("#bindCardForm"),
				payeeName = form.find("[name='withdrawName']"),
				bankCode = form.find("[name='bankName']"),
				bankName = bankCode.find("option[value='" +bankCode.val()+ "']").text(),
				bankCardNo = form.find("[name='bankCardNo']"),
				bankProvince = form.find("[name='bankProvince']"),
				bankCity = form.find("[name='bankCity']"),
				bankBranch = form.find("[name='bankBranch']"),
				email = form.find("[name='mailbox']"),
				withdrawPass = form.find("[name='withdrawPass']"),
				conWithdrawPass = form.find("[name='conWithdrawPass']");

			if( bindCard.checkPayeeName(payeeName) && bindCard.checkBankName(bankCode) && bindCard.checkBankCardNo(bankCardNo) && bindCard.checkBankProvince(bankProvince) && bindCard.checkBankCity(bankCity) && bindCard.checkBankBranch(bankBranch) ){
				var bankCardInfo = { values: encode([ bankCode.val(), bankName, bankCardNo.val(), bankProvince.val(), bankCity.val(), bankBranch.val() ]) };
				if( email[0] || withdrawPass[0] ){

				}else{
					bindCard.submit(form,bankCardInfo);
				}
			}

	    });

		// Select Province
		$(document).off("change", "#bindCardForm [name='bankProvince']")
				   .on("change", "#bindCardForm [name='bankProvince']", function(){
			var provinceVal = $(this).val(),
				province = $(this).find("option[value='" +provinceVal+ "']"),
				city = $("#bindCardForm [name='bankCity']");
			if( province.attr("data-englishName") == "" ){
				city.html("<option value=''>市</option>").trigger("chosen:updated");
			}else{
				getCity(province.attr("data-englishName"), function(cityList){
					$("#bindCardForm [name='bankCity']").html(cityList).trigger("chosen:updated");
				});
			}
	    });	

		// Remove Select Bank
		$(document).off("click", "#bankCardList .banks");			   
	}
	this.submit = function(form, addBankCard, setWithdrawPass, setEmail){
		var resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit"),
		if( !submitBtn.hasClass("processing") ){
			// Disabled Submit
			submitBtn.addClass("processing");

			TCG.Ajax({ url: "./withdraw/addCard", data: addBankCard }, function(result){
				if(result.status){
					if( setWithdrawPass != undefined || setEmail != undefined ){
						// $("#bindCardForm .form-group.mailbox").remove();

						// $("#bindCardForm .form-group.withdrawPass").remove();
						// $("#bindCardForm .form-group.conWithdrawPass").remove();						

						bindCard.getBankCard();						
						resetBtn.click();
						submitBtn.removeClass("processing");
					}else{
						bindCard.getBankCard();						
						TCG.Alert("success", TCG.Prop("Successfully added Card!") );
						resetBtn.click();
						submitBtn.removeClass("processing");
					}
				}else{
					TCG.Alert("errors", TCG.Prop(result.description));
				}
			});
		}
	}
	return bindCard.init();
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
		TCG.Ajax({ url: "./resource/province_city_zh-CN.xml", dataType: "xml" }, function(xml){
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