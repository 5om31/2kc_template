var globalVar = {
	merchantCode: "2000cai",
	getAddressResult: null
};
var app = new app();
var common = new common();
function common(){
	var common = this;
	this.init = function(){
		common.events();
		common.getAnnouncements();
	}
	this.getLoggedInHeader = function(){
		var header = "<div class='login-ico hb-ico'></div>";
			header += "<div class='login-nam'>您好，<span data-userInfo='username'></span></div>";
			header += "<div class='onel-line'></div>";
			header += "<div class='money-ico hb-ico showBalance'></div>";
			header += "<div class='money-amount balanceWrapper'><span data-walletBalance=''></span> <a href='javascript:void(0);' class='hideBalance'>余额隐藏</a></div>";
			header += "<div class='onel-line'></div>";
			header += "<div class='money-deposit'><a href='javascript:void(0);' data-remodal='deposit'>存款</a></div>";
			header += "<div class='money-withdrawal'><a href='javascript:void(0);' data-remodal='withdrawal'>提款</a></div>";
			header += "<div class='onel-line'></div>";
			header += "<div class='logout-ico'><a href='javascript:void(0);' id='logout'>&nbsp;</a></div>";
			header += "<div class='clearfix'></div>";	
		$("#loggedInHeader").html(header);		
		$("body").addClass("logged-in");
	}
	this.getAnnouncements = function(){
		$("#marquee").marquee({
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
	this.customSelect = function(id){
		var prop = {
			"width": "100%",
			"disable_search": true
		};
		$(id).chosen(prop).on("chosen:showing_dropdown", function(){
			$(this).parents("div").addClass("red-up");
		}).on("chosen:hiding_dropdown", function(){
			$(this).parents("div").removeClass("red-up");
		});
	}
	this.customCurrencyFormat = function(amount, decimal){
		var format = currencyFormat(amount,decimal).toString().split("."),
			decimal = format[1].replace(",","") || "";
			currency = format[0] + ".<span class='tblDec'>" +decimal+ "</span>";
		return currency;
	}
	this.loadWalletBalance = function(){
		app.getAllWalletBalance(function(result){
			if(result.status){
				var wallets = result.result.value.balances;
				for(var i=0; i < wallets.length; i++){
					if( wallets[i].accountName == "LOTT" ){
						$("[data-walletBalance]").text( currencyFormat( wallets[i].availBalance, 2 ) );
					}
				}
			}else{
				openAlert({ type: "errors", message: result.description });
			}
		});
	}
	this.getUserInfo = function(userInfo){
		if(userInfo == undefined){
			app.getMemberInfo(function(result){
				if(result.status){
					getInfo(result.result);					
				}else{
					openAlert({ type: "errors", message: result.description });
				}
			});		
		}else{
			getInfo(userInfo);
		}
		function getInfo(userInfo){
			$("[data-userInfo='nickname']").text( userInfo.nickname == null ? "用户尚无昵称" : userInfo.nickname );
			$("[data-userInfo='lastLogin']").text(userInfo.lastlogin);
			$("[data-userInfo='username']").text( userInfo.account.split("@")[1] );						
		}
	}
	this.loadMenu = function(menu, submenu){
		if( $("body").hasClass("logged-in") || ["help","activity"].indexOf(menu) >= 0  ){
			// Remove Current Active Menu
			$("[data-menu]").removeClass("activeOn");
			// Remove Current Content 
			$("#submenuContent").html("");
			// Activate Clicked Menu
			$("[data-menu='" +menu+ "']").addClass("activeOn");
			// Load Submenu
			$("#remodalSubMenu").html( loadModalSubMenu(menu) );
			if(submenu === undefined){
				if( $("#remodalSubMenu [data-submenu]")[0] ){
					$("#remodalSubMenu [data-submenu]")[0].click();				
				}
			}else{
				if( $("#remodalSubMenu [data-submenu='" +submenu+ "']")[0] ){
					$("#remodalSubMenu [data-submenu='" +submenu+ "']").click();							
				}	
			}
		}else{
			openAlert({ type: "errors", message: "login_required" });
		}
	}
	this.loginRequired = function(){
		openAlert({
			type: "errors",
			message: "login_required"
		}, function(){
			window.location = "/";
		});
	}
	this.customPagination = function(pageNo, pageTotal){
		var currentPage = null, 
			dom = "<div class='pag-arr-left game-icons pag-bnt'><a href='javascript:void(0)' data-pageNav='prev'>&nbsp;</a></div>";
		for(var i = 1; i <= pageTotal; i++){
			currentPage = pageNo == i ? "active" : "";
			dom += "<div class='pag-num game-icons pag-bnt " +currentPage+ "'><a href='javascript:void(0);' data-pageNo='" +i+ "'>" +i+ "</a></div>";
		}
		dom += "<div class='pag-arr-right game-icons pag-bnt'><a href='javascript:void(0);' data-pageNav='next'>&nbsp;</a></div>";
		
		dom += "<div class='pag-search-con inline-block'>";
		dom += "<input type='text' class='pag-search game-icons' name='pageNo' />";
		dom += "<input class='game-icons switch-dete' type='button' name='goToPage' value='确定' />";
		dom += "</div>";
		return dom;		
	}
	this.accordion = function(id, prop){
		var id = id || ".accordions",
			prop = prop || { active: false, collapsible: true, heightStyle: "content" };
		$(id).accordion(prop);
	}
	this.events = function(){

		// Open Menu In Remodal
		$(document).off("click", "[data-remodal]")
				   .on("click","[data-remodal]", function(){		
			var path = $(this).attr("data-remodal").split("/"),
				menu = path[0],
				submenu = path[1],
				prop = { width: "1275px", height: "600px"};
			loadModalContent("remodal", prop, function(){							
				common.loadMenu(menu,submenu);
			});
 	    });				   

		// Select Menu In Remodal
		$(document).off("click", "[data-menu]")
				   .on("click", "[data-menu]", function(){
			var menu = $(this).attr("data-menu");
			common.loadMenu(menu);
		});

		// Load SubMenu Content
		$(document).off("click", "[data-submenu]")
				   .on("click", "[data-submenu]", function(){
			var id = $(this).attr("data-submenu");
			$("[data-submenu]").removeClass("sub-act");
			$(this).addClass("sub-act");
			$("#submenuContent").html("");			
			loadSubmenuContent(id);
		});

		// Reset Form
		$(document).off("click", ".form-reset")
				   .on("click", ".form-reset", function(){
			var form = $(this).parents("form");
			setTimeout(function(){
				form.find("select").trigger("chosen:updated");
			}, 100);
			form.find(".selected-red").removeClass("selected-red");
		});

		// Submit Form
		$(document).off("keyup", "form .form-control")
				   .on("keyup", "form .form-control", function(e){
			if(e.which == 13){
				var form = $(this).parents("form");
				form.find(".form-submit").click();				
			}
		});

		// disabled Form Submit	
		$(document).off("submit", "form")
				   .on("submit", "form", function(){
			return false;
	   	});				  

	   	// Open Customer Service
	   	$(document).off("click", "[data-customerService]")
	   			   .on("click", "[data-customerService]", function(){
			var cServiceURL = 'http://f18.livechatvalue.com/chat/chatClient/chatbox.jsp?companyID=678398&configID=61224&jid=8655963422&lan=zh';
			PopupCenter(cServiceURL, 'customerService', '800', '560'); 	
		});

	   	// Logout
	   	$(document).off("click", "#logout")
	   			   .on("click", "#logout", function(){
	   		TCG.Confirm("Are you sure you want to logout", "",  function(ok){ 
	   			if(ok){
	   			}
	   		});

			TCG.Confirm(TCG.Prop("logout"), "", function(ok){
				if(ok){
					// app.logout(function(result){
						localStorage.clear();
		   				window.location = "/";
					// });
				}
			});	   		
		});

	   	// Hide Balance
	   	$(document).off("click", "#loggedInHeader .hideBalance")
	   			   .on("click", "#loggedInHeader .hideBalance", function(){
	   		$("#loggedInHeader .balanceWrapper").hide();
 		});

	   	// Show Balance
	   	$(document).off("click", "#loggedInHeader .showBalance")
	   			   .on("click", "#loggedInHeader .showBalance", function(){
	   		$("#loggedInHeader .balanceWrapper").show();
 		});
	}
	return common.init();
}

/**************************************
DEPOSIT
***************************************/
// Online Payment
function onlinePayment(){
	var onlinePayment = this;
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				onlinePayment.events();
				onlinePayment.getBanks();
				common.getUserInfo(result.result);
				common.loadWalletBalance();				
			}else{
				common.loginRequired();
			}
		});
	}
	this.getBanks = function(){
		app.getBankList(function(result){
			if(result.status){
				var list = "",
					banks = result.result.pg_banks;
				for(var i=0; i<banks.length; i++){
					list += "<li class='opTab-content inline-block'>";
					list += "<input data-minDeposit='" +banks[i].min_deposit+ "' data-maxDeposit='" +banks[i].max_deposit+ "' value='" +banks[i].bank_code+ "' class='bank-list' type='radio' name='bankName' />";
					list += "<span class='bankRadioBtn mem-icon crcl-ch inline-block'>&nbsp;</span>";
					list += "<img class='inline-block' src='images/bank/" +banks[i].bank_code+ ".jpg' />";
					list += "</li>";
				}
				$("#bankList").html(list);
			}else{
				openAlert({ type: "errors", message: result.description });
			}
		});	
	}
	this.events = function(){
		// CollapseButton
		$(document).off("click", "#accordionTab .tabBtn")
				   .on("click", "#accordionTab .tabBtn", function(){
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

		// Click Amount List
		$(document).off("click", "#amountList .amount")
				   .on("click", "#amountList .amount", function(){
			var amount = parseInt( $(this).text() );
			$("#onlinePaymentForm [name='amount']").val(amount);
		});

		// Increase/Decrease Amount
		$(document).off("click", "#onlinePaymentForm [data-changeAmount]")
				   .on("click", "#onlinePaymentForm [data-changeAmount]", function(){
			var amount = $("#onlinePaymentForm [name='amount']"),
				action = $(this).attr("data-changeAmount");
			regExPattern("amount", amount.val(), function(valid){
				var newAmount;
				if(valid){
					newAmount = action == "increase" ? parseFloat( amount.val() ) + 1.00 : parseFloat( amount.val() ) - 1.00;
				}else{
					newAmount = action == "increase" ? 1 : 0;
				}
				if( newAmount >= 0)	$("#onlinePaymentForm [name='amount']").val(newAmount);
			});
		});

		// Select Bank
		$(document).off("click", "#onlinePaymentForm [name='bankName']")
				   .on("click", "#onlinePaymentForm [name='bankName']", function(){
			$(".bankRadioBtn").removeClass("selected-red");
			$(this).parent().find(".bankRadioBtn").addClass("selected-red");
		});

		// Select Deposit Winnings
		$(document).off("click", "#onlinePaymentForm [name='winnings']")
				   .on("click", "#onlinePaymentForm [name='winnings']", function(){
			$(".winningsRadioBtn").removeClass("selected-red");
			$(this).parents(".winningsRadioBtn").addClass("selected-red");
		});

		// Submit Form
		$(document).off("click", "#onlinePaymentForm .form-submit")
				   .on("click", "#onlinePaymentForm .form-submit", function(){
			var form = $("#onlinePaymentForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							var message = "onlinePaymentForm_"+inputs[i].elem.attr("name")+ "_" + inputs[i].invalid[0];
							break;
						}
					}
					openAlert({ type: "errors", message: message });
				}else{
					var bankName = form.find("[name='bankName']:checked");
					if(bankName.length == 0){
						openAlert({ type: "errors", message: "onlinePaymentForm_bankName_required" });
					}else{
						onlinePayment.deposit();
					}
				}
			});
		});
	}
	deposit = function(){
		var form = $("#onlinePaymentForm"),
			resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit"),
			amount = form.find("[name='amount']"),
			bankName = form.find("[name='bankName']:checked"),
			data = { amount: amount.val(), bankName: bankName.val() };
		if(!submitBtn.hasClass("processing")){
			submitBtn.addClass("processing");
			console.log("Success", data);
			resetBtn.click();
			submitBtn.removeClass("processing");
		}
	}
	return onlinePayment.init();
}

// Quick Payment
function quickPayment(){
	var quickPayment = this;
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				quickPayment.events();
				quickPayment.getBanks();
				common.getUserInfo(result.result);
				common.loadWalletBalance();
				copyClipboard();
			}else{
				common.loginRequired();
			}
		})
	}
	this.getBanks = function(){
		app.getBankList(function(result){
			if(result.status){
				var list = "",
					banks = result.result.manual_transfer_banks;
				for(var i=0; i<banks.length; i++){
					list += "<li class='opTab-content inline-block'>";
					list += "<input data-minDeposit='" +banks[i].min_deposit+ "' data-maxDeposit='" +banks[i].max_deposit+ "' value='" +banks[i].bank_code+ "' class='bank-list' type='radio' name='bankName' />";
					list += "<span class='bankRadioBtn mem-icon crcl-ch inline-block'>&nbsp;</span>";
					list += "<img class='inline-block' src='images/bank/" +banks[i].bank_code+ ".jpg' />";
					list += "</li>";
				}
				$("#bankList").html(list);
			}else{
				openAlert({ type: "errors", message: result.description });
			}
		});			
	}
	this.events = function(){
		// Click Amount List
		$(document).off("click", "#amountList .amount")
				   .on("click", "#amountList .amount", function(){
			var amount = parseInt( $(this).text() );
			$("#quickPaymentForm [name='amount']").val(amount);
		});

		// Increase/Decrease Amount
		$(document).off("click", "#quickPaymentForm [data-changeAmount]")
				   .on("click", "#quickPaymentForm [data-changeAmount]", function(){
			var amount = $("#quickPaymentForm [name='amount']"),
				action = $(this).attr("data-changeAmount");
			regExPattern("amount", amount.val(), function(valid){
				var newAmount;
				if(valid){
					newAmount = action == "increase" ? parseFloat( amount.val() ) + 1.00 : parseFloat( amount.val() ) - 1.00;
				}else{
					newAmount = action == "increase" ? 1 : 0;
				}
				if( newAmount >= 0)	$("#quickPaymentForm [name='amount']").val(newAmount);
			});
		});

		// Select Bank
		$(document).off("click", "#quickPaymentForm [name='bankName']")
				   .on("click", "#quickPaymentForm [name='bankName']", function(){
			$(".bankRadioBtn").removeClass("selected-red");
			$(this).parent().find(".bankRadioBtn").addClass("selected-red");
		});

		// Submit Form
		$(document).off("click", "#quickPaymentForm .form-submit")
				   .on("click", "#quickPaymentForm .form-submit", function(){
			var form = $("#quickPaymentForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							var message = "quickPaymentForm_"+ inputs[i].elem.attr("name")+"_"+ inputs[i].invalid[0];
							break;
						}
					}
					openAlert({ type: "errors", message: message });
				}else{
					var bankName = form.find("[name='bankName']:checked");
					if( bankName.length == 0 ){
						openAlert({ type: "errors", message: "quickPaymentForm_bankName_required" });
					}else{
						quickPayment.deposit();
					}
				}
			});
		});

		// Back to Deposit Form
		$(document).off("click", "#quickPaymentPostDeposit .backBtn")
				   .on("click", "#quickPaymentPostDeposit .backBtn", function(){
			$("#quickPaymentPostDeposit").addClass("hide");
			$("#quickPaymentDeposit").removeClass("hide");
		});
	}
	deposit = function(){
		var form = $("#quickPaymentForm"),
			resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit"),
			amount = form.find("[name='amount']"),
			bankName = form.find("[name='bankName']:checked"),
			data = { amount: amount.val(), bankName: bankName.val() };
		if(!submitBtn.hasClass("processing")){
			submitBtn.addClass("processing");
			console.log("Success", data);
			resetBtn.click();
			$("#quickPaymentDeposit").addClass("hide");
			$("#quickPaymentPostDeposit").removeClass("hide");
			submitBtn.removeClass("processing");			
		}
	}
	return quickPayment.init();
}

// Alipay
function alipay(){
	var alipay = this;
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				alipay.events();
				common.getUserInfo(result.result);
				common.loadWalletBalance();
				common.customSelect("#alipayForm [name='specs']");
			}else{
				common.loginRequired();
			}
		});
	}
	this.events = function(){
		// Select Amount
		$(document).off("click", "#amountList .amount")
			       .on("click", "#amountList .amount", function(){
			var amount = $(this).text();
			$("#alipayForm [name='amount']").val(amount);
		});

		// submit form
		$(document).off("click", "#alipayForm .form-submit")
				   .on("click", "#alipayForm .form-submit", function(){
			var form = $("#alipayForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							var message = "alipayForm_"+ inputs[i].elem.attr("name")+"_" +inputs[i].invalid[0];
							break;
						}
					}
					openAlert({ type: "errors", message: message });
				}else{
					alipay.deposit();
				}
			});
	    });
	}
	this.deposit = function(){
		var form = $("#alipayForm"),
			resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit"),
			amount = form.find("[name='amount']"),
			specs = form.find("[name='specs']"),
			nickname = form.find("[name='nickname']"),
			email = form.find("[name='email']"),
			data = {
				amount: amount.val(),
				specs: specs.val(),
				nickname: nickname.val(),
				email: email.val()
			};
		if(!submitBtn.hasClass("processing")){
			submitBtn.addClass("processing");
			console.log("Success",data);
			resetBtn.click();
			$("#alipayDeposit").addClass("hide");
			$("#alipayPostDeposit").removeClass("hide");
			submitBtn.removeClass("processing");	
		}
	}
	return alipay.init();
}

// Conversion Of Funds
function conversionOfFunds(){
	var conversionOfFunds = this;
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				common.getUserInfo(result.result);
				common.loadWalletBalance();
				conversionOfFunds.events();
			}else{
				common.loginRequired();
			}
		});
	}
	this.events = function(){

	}
	return conversionOfFunds.init();
}

// Deposit Records
function depositRecords(){
	var depositRecords = this;
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				depositRecords.events();
				depositRecords.datepicker();
				common.customSelect(".ctSelect");
				$("#depositRecordsForm .form-submit").click();
			}else{
				common.loginRequired();
			}
		});
	}
	this.datepicker = function(){
		$("#depositRecordsForm [name='startTime']").datepicker({
			dateFormat: "yy-mm-dd",
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#depositRecordsForm [name='endTime']").datepicker("option","minDate",selectedDate);
			}
		}).datepicker("setDate", "0");

		$("#depositRecordsForm [name='endTime']").datepicker({
			dateFormat: "yy-mm-dd",
			minDate: 0,
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#depositRecordsForm [name='startTime']").datepicker("option","maxDate",selectedDate);
			}
		}).datepicker("setDate", "0");		
	}
	this.events = function(){
		// Submit Form
		$(document).off("click", "#depositRecordsForm .form-submit")
				   .on("click", "#depositRecordsForm .form-submit", function(){
			var form = $("#depositRecordsForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							console.log( inputs[i].elem.attr("name")+": "+ inputs[i].invalid );
						}
					}
				}else{
					depositRecords.search();
				}
			});

		});
	}
	this.search = function(){
		var form = $("#depositRecordsForm"),
			submitBtn = form.find(".form-submit"),
			status = form.find("[name='status']"),
			method = form.find("[name='method']"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			data = {
				status: status.val(),
				method: method.val(),
				startTime: startTime.val(),
				endTime: endTime.val()
			};
		if(!submitBtn.hasClass("processing")){
			submitBtn.addClass("processing");
			console.log("Success:",data);
			depositRecords.getData();
			submitBtn.removeClass("processing");	
		}
	}
	this.getData = function(){
		var list="";
		list += "<div class='tableContent-wrp'>";
		list += "<div class='inline-block tablesC'>97611502</div>";
		list += "<div class='inline-block tablesC'>在线充值</div>";
		list += "<div class='inline-block tablesC'>" +common.customCurrencyFormat(90000, 2)+ "</div>";				
		list += "<div class='inline-block tablesC'>" +common.customCurrencyFormat(90000, 2)+ "</div>";
		list += "<div class='inline-block tablesC'>" +common.customCurrencyFormat(90, 2)+ "</div>";
		list += "<div class='inline-block tablesC RemarksData'>MMMMMMMMMM <span class='hover-data hide'>1234567878645 | 132145465465</span></div>";
		list += "<div class='inline-block tablesC dateData'>2016-01-01 00:01:23</div>";
		list += "<div class='inline-block tablesC dateData'>2016-01-01 00:01:23</div>";
		list += "<div class='inline-block tablesC'>成功</div>";
		list += "</div>";
		$("#depositRecordsList").html(list);		

		$("#totalAmountCredit").html( common.customCurrencyFormat(10000000, 2) );
		$("#totalArrivalFee").html( common.customCurrencyFormat(100, 2) );
	}
	return depositRecords.init();
}

/***************************************
Withdraw
***************************************/

// Withdrawal Request
function withdrawalRequest(){
	var withdrawalRequest = this,
		localVar = { bankId: null, withdrawRemaining: "--" };
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				withdrawalRequest.events();
				withdrawalRequest.getBankCards();
				common.getUserInfo(result.result);
				common.loadWalletBalance();				
			}else{
				common.loginRequired();
			}
		})
	}
	this.getBankCards = function(){
		app.withdrawGetCard(function(result){
			if(result.status){
				var list = "",
					bankCards = [];// result.result.withdraw_banks;
				if(bankCards.length > 0){
					list += "<div class='main-wrp-card'>";
					for(var i=1; i<=bankCards.length; i++){
						list += "<div class='banks z-i" +i+ " z-i' data-bankId='1002' data-bankCardNo='9786 **** **** ****' data-bankCardHolder='ABC ***' data-bankName='Industrial and Commercial Bank of China' data-bankProvince='Hunan Province'>";
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
				//openAlert({ type: "errors", message: result.description });
			}
		});
	}
	this.events = function(){
		// Request Withdraw FOrm
		$(document).off("click", "#requestWithdrawForm .form-submit")
				   .on("click", "#requestWithdrawForm .form-submit", function(){
			var form = $("#requestWithdrawForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							var message = "requestWithdrawForm_"+inputs[i].elem.attr("name")+"_"+inputs[i].invalid[0];
							break;
						}
					}
					openAlert({ type: "errors", message: message });
				}else{
					if(localVar.bankId == null){
						openAlert({ type: "errors", message: "requestWithdrawForm_bank_required" });
					}else{
						withdrawalRequest.submit();
					}
				}
			});
	    });

		// Select Bank
		$(document).off("click", "#bankCardList .banks")
				   .on("click", "#bankCardList .banks", function(){
			var selectedBank = $(this),
				banks = $("#bankCardList .banks");
			banks.removeClass("selected");
			selectedBank.addClass("selected");
			localVar.bankId = selectedBank.attr("data-bankId");
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
	this.submit = function(){
		var form = $("#requestWithdrawForm"),
			resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit"),
			amount = form.find("[name='amount']"),
			password = form.find("[name='withdrawalPass']"),
			data = {
				bankId: localVar.bankId,
				amount: amount.val(),
				password: password.val()
			};
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			console.log("Success:",data);
			submitBtn.removeClass("processing");
		}
	}
	return withdrawalRequest.init();
}

// Withdraw
function withdrawal(){
	var withdrawal = this,
		localVar = { decimal: 2 };
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				withdrawal.events();
				withdrawal.datepicker()
				common.customSelect("#withdrawalForm select");
				$("#withdrawalForm .form-submit").click();
			}else{
				common.loginRequired();
			}
		});
	}
	this.datepicker = function(){
		$("#withdrawalForm [name='startTime']").datepicker({
			dateFormat: "yy-mm-dd",
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#withdrawalForm [name='endTime']").datepicker("option","minDate",selectedDate);
			}
		}).datepicker("setDate", "0");

		$("#withdrawalForm [name='endTime']").datepicker({
			dateFormat: "yy-mm-dd",
			minDate: 0,
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#withdrawalForm [name='startTime']").datepicker("option","maxDate",selectedDate);
			}
		}).datepicker("setDate", "0");			
	}
	this.events = function(){
		// Submit Form
		$(document).off("click", "#withdrawalForm .form-submit")
				   .on("click", "#withdrawalForm .form-submit", function(){
			var form = $("#withdrawalForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							console.log( inputs[i].elem.attr("name"), inputs[i].invalid );
						}
					}
				}else{
					withdrawal.search();
				}
			})
	    });

		// Switch Decimal
		$(document).off("click", "#switchDecimal")
				   .on("click", "#switchDecimal", function(){
			localVar.decimal = localVar.decimal == 2 ? 4 : 2;
			withdrawal.getData();
		});		
	}
	this.search = function(){
		var form = $("#withdrawalForm"),
			submitBtn = form.find(".form-submit"),
			status = form.find("[name='status']"),
			method = form.find("[name='method']"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			data = {
				status: status.val(),
				method: method.val(),
				startTime: startTime.val(),
				endTime: endTime.val()
			};
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			console.log("Success:", data);
			withdrawal.getData();
			submitBtn.removeClass("processing");
		}
	}
	this.getData = function(){
		var list = "",
			decimal = localVar.decimal,
			data = [];
		if(data.length > 0){
			list += "<div class='tableContent-wrp'>";
			list +="<div class='inline-block tablesC'>97611502</div>";
			list += "<div class='inline-block tablesC'>"+ common.customCurrencyFormat(90000.00,decimal) +"</div>";
			list += "<div class='inline-block tablesC RemarksData'>上海浦東銀行發展銀行</div>";
			list += "<div class='inline-block tablesC dateData'>2016-01-01 00:01:23</div>";
			list += "<div class='inline-block tablesC dateData'>2016-01-01 00:01:23</div>";
			list += "<div class='inline-block tablesC'>成功</div>";
			list += "</div>";
		}else{
			list += "<div class='tableContent-wrp'>";
			list += "<div class='noResult-data'>没有查到符合条件的数据！</div>";
			list += "</div>";			
		}
		$("#withdrawalList").html(list);
		$("#totalWithdrawAmount").html( common.customCurrencyFormat(0.00, decimal) );
	}
	return withdrawal.init();
}

// Binding Card
function bindCard(){
	var bindCard = this,
		localVar = { bankCards: [] };
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				bindCard.events();
				getProvince(function(provinceList){
					$("#bindCardForm [name='bankProvince']").html(provinceList);
					common.customSelect("#bindCardForm select");					
				});
				bindCard.checkUserInfo();
				bindCard.getBankCard();				
			}else{
				common.loginRequired();
			}
		})
	}
	this.checkUserInfo = function(){
		var data = {};
		if( data.email !== undefined ) $("#bindCardForm .form-group.mailbox").remove();
		if( data.withdrawPass !== undefined ){
			$("#bindCardForm .form-group.withdrawPass").remove();
			$("#bindCardForm .form-group.conWithdrawPass").remove();
		}
	}
	this.getBankCard = function(){
		localVar.bankCards = [];
		bindCard.bankCardList();
	}
	this.bankCardList = function(){
		var list = "",
			bankCards = localVar.bankCards;
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
	this.events = function(){
		// Submit Form
		$(document).off("click", "#bindCardForm .form-submit")
				   .on("click", "#bindCardForm .form-submit", function(){
			var form = $("#bindCardForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							var message = "bindCardForm_"+inputs[i].elem.attr("name")+"_"+inputs[i].invalid[0];
							break;
						}
					}
					openAlert({ type: "errors", message: message });
				}else{
					if( form.find("[name='withdrawPass']")[0] ){
						if( bindCard.confirmPassword() ){
							bindCard.submit();
						}else{
							openAlert({ type: "errors", message: "bindCardForm_withdrawPass_notMatch" });
						}
					}else{
						bindCard.submit();
					}
				}
			})
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

		// Password On focusout
		$(document).off("focusout", "#bindCardForm [name='withdrawPass']")
				   .on("focusout", "#bindCardForm [name='withdrawPass']", function(){
			bindCard.checkPassword();			
		});

		// Confirm Password On focusout
		$(document).off("focusout", "#bindCardForm [name='conWithdrawPass']")
				   .on("focusout", "#bindCardForm [name='conWithdrawPass']", function(){
			bindCard.confirmPassword();			
		});			

		// Remove Select Bank
		$(document).off("click", "#bankCardList .banks");			   
	}
	this.checkPassword = function(){
		var pass = $("#bindCardForm [name='withdrawPass']"),
			conPass = $("#bindCardForm [name='conWithdrawPass']");
		validateFormInput(pass, function(invalid){
			if(invalid > 0){
				console.log("Invalid Password");
			}else{
				if(pass.val() != conPass.val() && conPass.val() != "" ){
					console.log("Confirm Password Error");
				};
			}
		});	
	}	
	this.confirmPassword = function(){
		var pass = $("#bindCardForm [name='withdrawPass']"),
			conPass = $("#bindCardForm [name='conWithdrawPass']");
		if( pass.val() != conPass.val() ){
			console.log("Confirm Password Error");
			var x=false;
		}else{
			var x=true;
		}
		return x;		
	}	
	this.submit = function(){
		var form = $("#bindCardForm"),
			resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit"),
			withdrawName = form.find("[name='withdrawName']"),
			bankName = form.find("[name='bankName']"),
			bankCardNo = form.find("[name='bankCardNo']"),
			bankProvince = form.find("[name='bankProvince']"),
			bankCity = form.find("[name='bankCity']"),
			bankBranch = form.find("[name='bankBranch']"),
			data = {
				withdrawName: withdrawName.val(),
				bankName: bankName.val(),
				bankCardNo: bankCardNo.val(),
				bankProvince: bankProvince.val(),
				bankCity: bankCity.val(),
				bankBranch: bankBranch.val()
			};
		if( form.find("[name='mailbox']")[0] ) data.mailbox = form.find("[name='mailbox']").val();
		if( form.find("[name='withdrawPass']")[0] ){
			data.withdrawPass = form.find("[name='withdrawPass']").val();
			data.conWithdrawPass = form.find("[name='conWithdrawPass']").val();
		}
		if( !submitBtn.hasClass("processing") ){
			// Disabled Submit
			submitBtn.addClass("processing");

			// Success Message
			console.log("Success:",data);

			// Add Bank Card in UI
			localVar.bankCards.push("1");
			bindCard.bankCardList();

			// Remove Email & Password Field
			if( data.email !== undefined ) $("#bindCardForm .form-group.mailbox").remove();
			if( data.withdrawPass !== undefined ){
				$("#bindCardForm .form-group.withdrawPass").remove();
				$("#bindCardForm .form-group.conWithdrawPass").remove();
			}

			// Reset Form
			bankCity.html("<option value=''>市</option>").trigger("chosen:updated");
			resetBtn.click();

			// Enabled Submit
			submitBtn.removeClass("processing");
		}

	}
	return bindCard.init();
}


/***************************************
Personal
***************************************/

// My Profile
function myProfile(){
	var myProfile = this;
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				myProfile.events();
				myProfile.getInfo(result.result);
			}else{
				common.loginRequired();
			}
		});
	}
	this.getInfo = function(userinfo){
		// $("[data-userInfo='username']").text("zozo1550");
		common.getUserInfo(userinfo);
		var form = $("#myProfileForm");
		if(userinfo.payeeName) form.find("[name='payeeName']").parents(".form-input").addClass("readonly").html(userinfo.payeeName);			
		if(userinfo.withdrawPass) form.find("[name='withdrawPass']").parents(".form-input").addClass("readonly").html( maskData(userinfo.withdrawPass,0) );			
		if(userinfo.conWithdrawPass) form.find("[name='conWithdrawPass']").parents(".form-input").addClass("readonly").html( maskData(userinfo.conWithdrawPass,0) );			
		if(userinfo.email) form.find("[name='email']").parents(".form-input").addClass("readonly").html(userinfo.email);			
		form.find("[name='nickname']").val(userinfo.nickname);
		form.find("[name='mobileNo']").val(userinfo.mobile);
		form.find("[name='qq']").val(userinfo.qq);		
	}
	this.events = function(){

		// Nickname On focusout
		$(document).off("focusout", "#myProfileForm [name='nickname']")
				   .on("focusout", "#myProfileForm [name='nickname']", function(){
			myProfile.checkNickname();			
		});				   

		// Update Profile
		$(document).off("click", "#myProfileForm .form-submit")
				   .on("click", "#myProfileForm .form-submit", function(){
			var form = $("#myProfileForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							var message = "myProfileForm_"+ inputs[i].elem.attr("name")+"_"+inputs[i].invalid[0];
							break;
						}
					}
					openAlert({ type: "errors", message: message });
				}else{
					if( myProfile.confirmPassword() ){
						myProfile.update();
					}else{
						openAlert({ type: "errors", message: "myProfileForm_conWithdrawPass_notMatch" });
					}
				}
			});
		});				   

	}
	this.checkNickname = function(){
		var nickname = $("#myProfileForm [name='nickname']");
		
	}
	this.confirmPassword = function(){
		var pass = $("#myProfileForm [name='withdrawPass']"),
			conPass = $("#myProfileForm [name='conWithdrawPass']");
		if( pass.val() != conPass.val() ){
			var x=false;
		}else{
			var x=true;
		}
		return x;		
	}
	this.update = function(){
		var form = $("#myProfileForm"),
			submitBtn = form.find(".form-submit"),
			payeeName = form.find("[name='payeeName']"),
			withdrawPass = form.find("[name='withdrawPass']"),
			conWithdrawPass = form.find("[name='conWithdrawPass']"),
			email = form.find("[name='email']"),
			nickname = form.find("[name='nickname']"),
			mobileNo = form.find("[name='mobileNo']"),
			qq = form.find("[name='qq']"),
			data = {
				payeename: payeeName.val(),
				mail: email.val(),
				nickname: nickname.val(),
				mobile: mobileNo.val(),
				qq: qq.val(),
				withdrawPass: withdrawPass.val(),
				conWithdrawPass: conWithdrawPass.val()
			};
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			app.updatememberinfo(data, function(result){
				if(result.status){
					myProfile.getInfo(data)
					submitBtn.removeClass("processing");
				}else{
					openAlert({ type: "errors", message: result.description });
				}
			});
		}
	}
	return myProfile.init();
}

// Bonus Details
function bonusDetails(){
	var bonusDetails = this;
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				bonusDetails.events();
			}else{
				common.loginRequired();
			}
		})
	}
	this.events = function(){
		// Tab
	    $(document).off("click","#bonusDetailsTabs .tab-btn")
	   			  .on("click","#bonusDetailsTabs .tab-btn", function(){
	    	var rel = $(this).attr("data-rel");
	      	$("#bonusDetailsTabs .tab-btn").removeClass("sel").addClass("unsel");
	      	$(this).removeClass("unsel").addClass("sel");
	      	$("#bonusDetailsTabs .tab-content").hide();
	      	$("#"+rel).show();
	    });
	}
	return bonusDetails.init();
}

// Game History
function gameHistory(){
	var gameHistory = this,
		localVar = { decimal: 2, pageSize: 10, pageNo: 1 };
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				gameHistory.datepicker();
				gameHistory.events();
				common.customSelect("#gameHistoryForm select");
				$("#gameHistoryForm .form-submit").click();				
			}else{
				common.loginRequired();
			}
		});
	}
	this.datepicker = function(){
		$("#gameHistoryForm [name='startTime']").datepicker({
			dateFormat: "yy-mm-dd",
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#gameHistoryForm [name='endTime']").datepicker("option","minDate",selectedDate);
			}
		}).datepicker("setDate", "0");

		$("#gameHistoryForm [name='endTime']").datepicker({
			dateFormat: "yy-mm-dd",
			minDate: 0,
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#gameHistoryForm [name='startTime']").datepicker("option","maxDate",selectedDate);
			}
		}).datepicker("setDate", "0");		
	}	
	this.events = function(){
		// Submit Form
		$(document).off("click", "#gameHistoryForm .form-submit")
				   .on("click", "#gameHistoryForm .form-submit", function(){
			var form = $("#gameHistoryForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							console.log( inputs[i].elem.attr("name"), inputs[i].invalid );
						}
					}
				}else{
					localVar.pageNo = 1;
					gameHistory.search();
				}
			})
	    })

		// Open Item
		$(document).off("click", "#gameHistoryList .openItem")
				   .on("click", "#gameHistoryList .openItem", function(){
			$("#listWrapper").addClass("hide");
			$("#itemWrapper").removeClass("hide");
			localVar.decimal = 2;
			gameHistory.getItem();
	    });

		// Back to Game History
		$(document).off("click", "#backToGameHistory")	
				   .on("click", "#backToGameHistory", function(){
			$("#listWrapper").removeClass("hide");
			$("#itemWrapper").addClass("hide");
			localVar.decimal = 2;
			gameHistory.getData();
	   });

		// Switch Decimal
		$(document).off("click", "#gameHistoryPage .switchDecimal")
				   .on("click", "#gameHistoryPage .switchDecimal", function(){
			localVar.decimal = localVar.decimal == 2 ? 4 : 2;
			var rel = $(this).attr("data-rel");
			if( rel == "listWrapper" ){
				gameHistory.getData();
			}else{
				gameHistory.getItem();
			}
		});			

		// Pagination - onClick
		$(document).off("click", "#pagination [data-pageNo]")
				   .on("click", "#pagination [data-pageNo]", function(){
			var page = $(this).attr("data-pageNo");
			localVar.pageNo = page;
			$(this).parents(".pag-num").addClass("active");
			$("#pagination .pag-num").removeClass("active");

			gameHistory.search();
	    });	   

		// Pagination - Next/Prev
		$(document).off("click", "#pagination [data-pageNav]")
				   .on("click", "#pagination [data-pageNav]", function(){
			var pageNav = $(this).attr("data-pageNav"),
				pageNo = pageNav == "next" ? parseInt(localVar.pageNo) + 1 : parseInt(localVar.pageNo) - 1;
			if( pageNo > 0 && pageNo <= parseInt(localVar.pageTotal) ){
				localVar.pageNo = pageNo;
				gameHistory.search();				
			}
	    });	  

		// Pagination - GoTo Page No.
		$(document).off("click", "#pagination [name='goToPage']")
				   .on("click", "#pagination [name='goToPage']", function(){
			var pageNo = $("#pagination [name='pageNo']");
			regExPattern("numberOnly", pageNo.val(), function(valid){
				if(valid){
					if( pageNo.val() > 0 && pageNo.val() <= parseInt(localVar.pageTotal) ){
						localVar.pageNo = pageNo.val();
						gameHistory.search();			
					}else{
						pageNo.val(localVar.pageNo);
					}
				}else{
					pageNo.val("");
				}
			});
	    });	   

				   
	}
	this.search = function(){
		var form = $("#gameHistoryForm"),
			submitBtn = form.find(".form-submit"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			status = form.find("[name='status']"),
			game = form.find("[name='game']"),
			order = form.find("[name='order']"),
			issue = form.find("[name='issue']"),
			chaseNo = form.find("[name='chaseNo']"),
			data = {
				startTime: startTime.val(),
				endTime: endTime.val(),
				status: status.val(),
				game: game.val(),
				order: order.val(),
				issue: issue.val(),
				chaseNo: chaseNo.val(),
				pageNo: localVar.pageNo,
				pageSize: localVar.pageSize
			};
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			console.log("Success:", data);
			gameHistory.getData();
			submitBtn.removeClass("processing");			
		}
	}
	this.getData = function(){
		var list = "";
			decimal = localVar.decimal;
		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>2000五分彩</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'><a href='javascript:void(0);' class='openItem'>MMMMMMMM...</a></div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>01-01 <span class='tblDec'>00:21:23</span></div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>20160513-001</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>元</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>1期</div>";
		list += "<div class='divTableCell onel-cl-y'>"+ common.customCurrencyFormat(1000000.0001, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y'>"+ common.customCurrencyFormat(1000000.0001, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y tbl-red'>"+ common.customCurrencyFormat(900000.0001, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-z'>已中奖</div>";
		list += "</div>";

		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>2000五分彩</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'><a href='javascript:void(0);' class='openItem'>MMMMMMMM...</a></div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>01-02 <span class='tblDec'>00:21:23</span></div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>20160513-002</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>元</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>1期</div>";
		list += "<div class='divTableCell onel-cl-y'>"+ common.customCurrencyFormat(888.0000, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y'>"+ common.customCurrencyFormat(168.0000, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y'>"+ common.customCurrencyFormat(234.0000, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-z'>未中奖</div>";
		list += "</div>";
	
		$("#gameHistoryList").html(list);

		$("#totalPlannedAmount").html( common.customCurrencyFormat(1095728.7844, decimal) );
		$("#totalEffectiveAmount").html( common.customCurrencyFormat(1095728.7844, decimal) )
		$("#totalPrizeMoney").html( common.customCurrencyFormat(1095728.7844, decimal) );

		localVar.pageTotal = 5;
		$("#pagination").html( common.customPagination(localVar.pageNo, localVar.pageTotal) );		
	}
	this.getItem = function(){
		var decimal = localVar.decimal,
			data = {
			orderNo: "LQ2K164LF0285A-0001",
			bettingNoteCount: 10000,
			orderStatus: "未中奖",
			seriesModel: "2000 / 元",
			bettingMultiples: 5000,
			bettingOnNumber: 201610253,
			prizeMoney: 0.00,
			bettingTime: "2016-1-1 23:20:50",
			lotteryNumbers: 65235
		};
		$("#itemWrapper .orderNo").text(data.orderNo);
		$("#itemWrapper .bettingNoteCount").html( currencyFormat( data.bettingNoteCount ) );
		$("#itemWrapper .orderStatus").text(data.orderStatus);
		$("#itemWrapper .seriesModel").text(data.seriesModel);
		$("#itemWrapper .bettingMultiples").html( currencyFormat(data.bettingMultiples) );
		$("#itemWrapper .bettingOnNumber").text(data.bettingOnNumber);
		$("#itemWrapper .prizeMoney").html( common.customCurrencyFormat(data.prizeMoney,decimal) );
		$("#itemWrapper .bettingTime").text(data.bettingTime);
		$("#itemWrapper .lotteryNumbers").text(data.lotteryNumbers);

		var list = "";
		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>三星直选</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen yel-pop'>0123456789...<div class='pop-yellow'><div>01-02-03-04-05 | 01-02-03-04-05 | 01-02-03-04-05</div><div>01-02-03-04-05 | 01-02-03-04-05 | 01-02-03-04-05</div></div></div>";			
		list += "<div class='divTableCell onel-cl-y ps-cen'>20</div>";			
		list += "<div class='divTableCell onel-cl-y ps-cen'>"+ common.customCurrencyFormat(99222000.00,decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'></div>";		
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'></div>";			
		list += "<div class='divTableCell onel-cl-y'></div>";
		list += "<div class='divTableCell onel-cl-y'></div>";
		list += "<div class='divTableCell onel-cl-y'></div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-z'></div>";
		list += "</div>";
		
		$("#itemList").html(list);							
	}
	return gameHistory.init();
}

// No Record Chase
function norecordChase(){
	var norecordChase = this,
		localVar = { decimal: 2 };
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				norecordChase.events();
				norecordChase.datepicker();
				common.customSelect("#norecordChaseForm select");
				$("#norecordChaseForm .form-submit").click();				
			}else{
				common.loginRequired();
			}
		})
	}
	this.datepicker = function(){
		$("#norecordChaseForm [name='startTime']").datepicker({
			dateFormat: "yy-mm-dd",
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#norecordChaseForm [name='endTime']").datepicker("option","minDate",selectedDate);
			}
		}).datepicker("setDate", "0");

		$("#norecordChaseForm [name='endTime']").datepicker({
			dateFormat: "yy-mm-dd",
			minDate: 0,
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#norecordChaseForm [name='startTime']").datepicker("option","maxDate",selectedDate);
			}
		}).datepicker("setDate", "0");		
	}	
	this.events = function(){
		// Form Submit 
		$(document).off("click", "#norecordChaseForm .form-submit")
				   .on("click", "#norecordChaseForm .form-submit", function(){
			var form = $("#norecordChaseForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i <inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							console.log( inputs[i].elem.attr("name"), inputs[i].invalid );
						}
					}
				}else{
					norecordChase.search();
				}
			})
	    });

		// Switch Decimal
		$(document).off("click", "#switchDecimal")
				   .on("click", "#switchDecimal", function(){
			localVar.decimal = localVar.decimal == 2 ? 4 : 2;
			norecordChase.getData();
		});					   
	}
	this.search = function(){
		var form = $("#norecordChaseForm"),
			submitBtn = form.find(".form-submit"),
			status = form.find("[name='status']"),
			game = form.find("[name='game']"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			order = form.find("[name='order']"),
			issue = form.find("[name='issue']"),
			data = {
				status: status.val(),
				game: game.val(),
				startTime: startTime.val(),
				endTime: endTime.val(),
				order: order.val(),
				issue: issue.val()
			}
		if( !submitBtn.hasClass("processing") ){
			submitBtn.addClass("processing");
			console.log("Success:", data);
			norecordChase.getData();
			submitBtn.removeClass("processing");
		}
	}
	this.getData = function(){
		var decimal = localVar.decimal,
			list = "";
						
		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>MMMMMMMM...</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>2000五分彩</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>101016864</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>101016868</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>20</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>5</div>";
		list += "<div class='divTableCell onel-cl-y ps-num'>"+ common.customCurrencyFormat(910000.00, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-num tbl-red'>"+ common.customCurrencyFormat(910000.00, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-x tbl-red'>已中奖</div>";
		list += "</div>";

		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>MMMMMMMM...</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>2000五分彩</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>101016864</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>101016868</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>25</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>6</div>";
		list += "<div class='divTableCell onel-cl-y ps-num'>"+ common.customCurrencyFormat(50000.00, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-num'>"+ common.customCurrencyFormat(999999.00, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-x'>进行中</div>";
		list += "</div>";

		$("#norecordChaseList").html(list);
	}
	return norecordChase.init();
}

// Change Account
function changeAccount(){
	var changeAccount = this,
		localVar = { decimal: 2, pageSize: 10, pageNo: 1 };
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				changeAccount.events();
				changeAccount.datepicker();
				common.customSelect("#changeAccountForm select");
				$("#changeAccountForm .form-submit").click();				
			}else{
				common.loginRequired();
			}
		})
	}
	this.datepicker = function(){
		$("#changeAccountForm [name='startTime']").datepicker({
			dateFormat: "yy-mm-dd",
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#changeAccountForm [name='endTime']").datepicker("option","minDate",selectedDate);
			}
		}).datepicker("setDate", "0");

		$("#changeAccountForm [name='endTime']").datepicker({
			dateFormat: "yy-mm-dd",
			minDate: 0,
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#changeAccountForm [name='startTime']").datepicker("option","maxDate",selectedDate);
			}
		}).datepicker("setDate", "0");		
	}	
	this.events = function(){
		// Submit Form
		$(document).off("click", "#changeAccountForm .form-submit")
				   .on("click", "#changeAccountForm .form-submit", function(){
			var form = $("#changeAccountForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							console.log(inputs[i].elem.attr("name"), inputs[i].invalid);
						}
					}
				}else{
					changeAccount.search();
				}
			});
	    });


		// Pagination - onClick
		$(document).off("click", "#pagination [data-pageNo]")
				   .on("click", "#pagination [data-pageNo]", function(){
			var page = $(this).attr("data-pageNo");
			localVar.pageNo = page;
			$(this).parents(".pag-num").addClass("active");
			$("#pagination .pag-num").removeClass("active");
			changeAccount.search();
	    });	   

		// Pagination - Next/Prev
		$(document).off("click", "#pagination [data-pageNav]")
				   .on("click", "#pagination [data-pageNav]", function(){
			var pageNav = $(this).attr("data-pageNav"),
				pageNo = pageNav == "next" ? parseInt(localVar.pageNo) + 1 : parseInt(localVar.pageNo) - 1;
			if( pageNo > 0 && pageNo <= parseInt(localVar.pageTotal) ){
				localVar.pageNo = pageNo;
				changeAccount.search();				
			}
	    });	  

		// Pagination - GoTo Page No.
		$(document).off("click", "#pagination [name='goToPage']")
				   .on("click", "#pagination [name='goToPage']", function(){
			var pageNo = $("#pagination [name='pageNo']");
			regExPattern("numberOnly", pageNo.val(), function(valid){
				if(valid){
					if( pageNo.val() > 0 && pageNo.val() <= parseInt(localVar.pageTotal) ){
						localVar.pageNo = pageNo.val();
						changeAccount.search();			
					}else{
						pageNo.val(localVar.pageNo);
					}
				}else{
					pageNo.val("");
				}
			});
	    });	   	

		// Switch Decimal
		$(document).off("click", "#switchDecimal")
				   .on("click", "#switchDecimal", function(){
			localVar.decimal = localVar.decimal == 2 ? 4 : 2;
			changeAccount.getData();
		});	    			   
	}
	this.search = function(){
		var form = $("#changeAccountForm"),
			submitBtn = form.find(".form-submit"),
			account = form.find("[name='account']"),
			type = form.find("[name='type']"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			data = {
				account: account.val(),
				type: type.val(),
				startTime: startTime.val(),
				endTime: endTime.val(),
				pageSize: localVar.pageSize,
				pageNo: localVar.pageNo
			};
		if(!submitBtn.hasClass("processing")){
			submitBtn.addClass("processing");			
			console.log("Success:", data);
			changeAccount.getData();
			submitBtn.removeClass("processing");			
		}
	}
	this.getData = function(){
		var decimal = localVar.decimal;
			list = "";

		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>mmmmMMMM...</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>追中撤单</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>收入</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-z'>2016-01-01 <span class='tblDec'>00:21:23</span></div>";
		list += "<div class='divTableCell onel-cl-y ps-num tbl-red'>"+ common.customCurrencyFormat(91000000.00, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-num'>"+ common.customCurrencyFormat(91000000.00, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-z'>2000五分彩：中奖停止后返费</div>";
		list += "</div>";

		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>mmmmMMMM...</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>追中撤单</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>收入</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-z'>2016-01-01 <span class='tblDec'>00:21:23</span></div>";
		list += "<div class='divTableCell onel-cl-y ps-num tbl-green'>"+ common.customCurrencyFormat(-99999999.00, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-num'>"+ common.customCurrencyFormat(91000000.00, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-z'>2000五分彩：中奖停止后返费</div>";
		list += "</div>";

		$("#changeAccountList").html(list);

		localVar.pageTotal = 5;
		$("#pagination").html(common.customPagination( localVar.pageNo, localVar.pageTotal ) );
	}
	return changeAccount.init();
}

// Profit and loss statements
function palStatements(){
	var palStatements = this, 
	localVar = { decimal: 2 };
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				palStatements.events();
				palStatements.datepicker();
				$("#palStatementsForm .form-submit").click();				
			}else{
				common.loginRequired();
			}
		})
	}
	this.datepicker = function(){
		$("#palStatementsForm [name='startTime']").datepicker({
			dateFormat: "yy-mm-dd",
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#palStatementsForm [name='endTime']").datepicker("option","minDate",selectedDate);
			}
		}).datepicker("setDate", "0");

		$("#palStatementsForm [name='endTime']").datepicker({
			dateFormat: "yy-mm-dd",
			minDate: 0,
			maxDate: 0,
			onSelect: function(selectedDate){
				$("#palStatementsForm [name='startTime']").datepicker("option","maxDate",selectedDate);
			}
		}).datepicker("setDate", "0");		
	}
	this.events = function(){
		//Submit Form
		$(document).off("click", "#palStatementsForm .form-submit")
				   .on("click", "#palStatementsForm .form-submit", function(){
			var form = $("#palStatementsForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs.invalid.length > 0){
							console.log( inputs[i].elem.attr("name")+": " +inputs[i].invalid );							
						}
					}
				}else{
					palStatements.search();
				}
			});				
		});

		// Switch Decimal
		$(document).off("click", "#switchDecimal")
				   .on("click", "#switchDecimal", function(){
			localVar.decimal = localVar.decimal == 2 ? 4 : 2;
			palStatements.getData();
		});
	}
	this.search = function(){
		var form = $("#palStatementsForm"),
			submitBtn = form.find(".form-submit"),
			startTime = form.find("[name='startTime']"),
			endTime = form.find("[name='endTime']"),
			data = {
				startTime: startTime.val(),
				endTime: endTime.val()
			};
		if(!submitBtn.hasClass("processing")){
			submitBtn.addClass("processing");
			console.log("Success", data);
			localVar.result = {};
			palStatements.getData();
			submitBtn.removeClass("processing");

		}
	}
	this.getData = function(){
		var decimal = localVar.decimal,
			list = "";
		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cell-yellow'>12-16-2016</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(910000,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(900000,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(990000,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(910000,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(9910000,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(9000,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num tbl-red'>" +common.customCurrencyFormat(910000,decimal)+ "</div>";
		list += "</div>";
					
		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cell-yellow'>12-15-2016</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(20,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(20,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(90000,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(910000,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(991000,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num'>" +common.customCurrencyFormat(1000,decimal)+ "</div>";
		list += "<div class='divTableCell onel-cell-yellow ps-num tbl-green'>" +common.customCurrencyFormat(-0.50,decimal)+ "</div>";
		list += "</div>";

		$("#palStatementsList").html(list);

		var total = "";
		total += "<div class='divTableCell onel-tf'>合计:</div>";
		total += "<div class='divTableCell onel-tf ps-num'>" +common.customCurrencyFormat(9999999,decimal)+ "</div>";
		total += "<div class='divTableCell onel-tf ps-num'>" +common.customCurrencyFormat(99999999,decimal) +"</div>";
		total += "<div class='divTableCell onel-tf ps-num'>" +common.customCurrencyFormat(9999999,decimal)+ "</div>";
		total += "<div class='divTableCell onel-tf ps-num'>" +common.customCurrencyFormat(9999999,decimal)+ "</div>";
		total += "<div class='divTableCell onel-tf ps-num'>" +common.customCurrencyFormat(999999,decimal)+ "</div>";
		total += "<div class='divTableCell onel-tf ps-num'>" +common.customCurrencyFormat(99999,decimal)+ "</div>";
		total += "<div class='divTableCell onel-tf ps-num tbl-red'>" +common.customCurrencyFormat(999999,decimal)+ "</div>";

		$("#palStatementsTotal").html(total);
	}
	return palStatements.init();
}

// Change Password
function changePassword(){
	var changePassword = this;
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				common.getUserInfo(result.result);
				changePassword.events();				
			}else{
				common.loginRequired();
			}
		})
	}
	this.showOldPassword = function(){
		if( $("#oldWithdrawPass").hasClass("hide") ){
			$("#oldWithdrawPass .form-group").html("<input type='password' required='' name='oldPass' class='form-control ch-input' />");
			$("#oldWithdrawPass").removeClass("hide");
		}		
	}
	this.events = function(){

		// Password On focusout
		// $(document).off("focusout", "#changePasswordForm [name='newPass']")
		// 		   .on("focusout", "#changePasswordForm [name='newPass']", function(){
		// 	changePassword.checkPassword();			
		// });

		// Confirm Password On focusout
		// $(document).off("focusout", "#changePasswordForm [name='conNewPass']")
		// 		   .on("focusout", "#changePasswordForm [name='conNewPass']", function(){
		// 	changePassword.confirmPassword();			
		// });

		// Submit Form
		$(document).off("click", "#changePasswordForm .form-submit")
				   .on("click", "#changePasswordForm .form-submit", function(){
			var form = $("#changePasswordForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if( inputs[i].invalid.length > 0 ){
							var message = "changePasswordForm_" +inputs[i].elem.attr("name")+ "_" +inputs[i].invalid[0];
							break;
						}
					}
					openAlert({ type: "errors", message: message });
				}else{
					if( changePassword.confirmPassword() ){
						changePassword.update();
					}else{
						openAlert({ type: "errors", message: "changePasswordForm_conNewPass_notMatch" });
					}
				}
			})
		});
	}
	this.checkPassword = function(){
		var pass = $("#changePasswordForm [name='newPass']"),
			conPass = $("#changePasswordForm [name='conNewPass']");
		validateFormInput(pass, function(invalid){
			if(invalid > 0){
				console.log("Invalid Password");
			}else{
				// if(pass.val() != conPass.val() && conPass.val() != "" ){
				console.log("Confirm Password Error");
				// };
			}
		});	
	}
	this.confirmPassword = function(){
		var pass = $("#changePasswordForm [name='newPass']"),
			conPass = $("#changePasswordForm [name='conNewPass']");
		if( pass.val() != conPass.val() ){
			console.log("Confirm Password Error");
			var x=false;
		}else{
			var x=true;
		}
		return x;		
	}	
	this.update = function(){
		var form = $("#changePasswordForm"),
			resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit"),
			oldPass = form.find("[name='oldPass']"),
			newPass = form.find("[name='newPass']"),
			conNewPass = form.find("[name='conNewPass']"),
			data = [ oldPass.val(), newPass.val(), conNewPass.val() ],
			dataRSA = { values: encode(data) };
		if(!submitBtn.hasClass("processing")){
			submitBtn.addClass("processing");
			app.changePassword(dataRSA, function(result){
				if(result.status){
					openAlert({ type: "success", message: "changePasswordForm_success" });
				}else{
					openAlert({ type: "errors", message: result.description });
				}
				resetBtn.click();
				submitBtn.removeClass("processing");
			});
		}
	}
	return changePassword.init();
}

// Modify Fund Transfer
function modfndPassword(){
	var modfndPassword = this;
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				common.getUserInfo(result.result);
				modfndPassword.events();
			}else{
				common.loginRequired();
			}
		})
	}
	this.events = function(){

		// Password On focusout
		$(document).off("focusout", "#modfndPasswordForm [name='newPass']")
				   .on("focusout", "#modfndPasswordForm [name='newPass']", function(){
			modfndPassword.checkPassword();			
		});

		// Confirm Password On focusout
		$(document).off("focusout", "#modfndPasswordForm [name='conNewPass']")
				   .on("focusout", "#modfndPasswordForm [name='conNewPass']", function(){
			modfndPassword.confirmPassword();			
		});

		// Submit FOrm
		$(document).off("click", "#modfndPasswordForm .form-submit")
				   .on("click", "#modfndPasswordForm .form-submit", function(){
			var form = $("#modfndPasswordForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							var message = "modfndPasswordForm_" +inputs[i].elem.attr("name")+"_"+ inputs[i].invalid[0];
							break;
						}
					}
					console.log(message);
					openAlert({ type: "errors", message: message });
				}else{
					if( modfndPassword.confirmPassword() ){
						modfndPassword.save();
					}else{
						openAlert({ type: "errors", message: "modfndPasswordForm_conNewPass_notMatch" });
					}
				}
			});
	    });

	}
	this.checkPassword = function(){
		var pass = $("#modfndPasswordForm [name='newPass']"),
			conPass = $("#modfndPasswordForm [name='conNewPass']");
		validateFormInput(pass, function(invalid){
			if(invalid > 0){
				console.log("Invalid Password");
			}else{
				if(pass.val() != conPass.val() && conPass.val() != "" ){
					console.log("Confirm Password Error");
				};
			}
		});	
	}
	this.confirmPassword = function(){
		var pass = $("#modfndPasswordForm [name='newPass']"),
			conPass = $("#modfndPasswordForm [name='conNewPass']");
		if( pass.val() != conPass.val() ){
			console.log("Confirm Password Error");
			var x=false;
		}else{
			var x=true;
		}
		return x;		
	}		
	this.save = function(){
		var form = $("#modfndPasswordForm"),
			resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit"),
			oldPass = form.find("[name='oldPass']"),
			newPass = form.find("[name='newPass']"),
			conNewPass = form.find("[name='conNewPass']");
		if(oldPass == null){
			var data = {
					newPass: newPass.val(),
					conNewPass: conNewPass.val()
				};			
			if(!submitBtn.hasClass("processing")){
				submitBtn.addClass("processing");
				console.log("Success:",data);
				resetBtn.click();
				submitBtn.removeClass("processing");
			}				
		}else{
			var data = {
					oldPass: oldPass.val(),
					newPass: newPass.val(),
					conNewPass: conNewPass.val()
				};			
			if(!submitBtn.hasClass("processing")){
				submitBtn.addClass("processing");
				modfndPassword.showOldPassword();
				resetBtn.click();
				submitBtn.removeClass("processing");
			}			
		}	
	}
	return modfndPassword.init();
}

// Secret security settings
function ssSettings(){
	var ssSettings = this;
	this.init = function(){
		app.checkLogin(function(result){
			if(result.status){
				ssSettings.events();
				ssSettings.checkQuestions();				
			}else{
				common.loginRequired();
			}
		})
	}
	this.checkQuestions = function(type){
		var type = type || "set";
		if(type == "set"){
			ssSettings.getQuestions();
			$("#securityQuestionForm .securityQ").html("<select name='question' class='form-control ctSelect' required=''><option value=''>&nbsp;</option><option value='opt1'>Option 1</option></select>").addClass("slect-box-custom-large mem-icon");
			common.customSelect("#securityQuestionForm [name='question']");
		}else{
			$("#securityQuestionForm .securityQ").html("您母亲的姓名是？").removeClass("slect-box-custom-large mem-icon");
		}
	}
	this.getQuestions = function(){
		
	}
	this.events = function(){
		// Submit Security Question
		$(document).off("click", "#securityQuestionForm .form-submit")
				   .on("click", "#securityQuestionForm .form-submit", function(){
			var form = $("#securityQuestionForm"),
				formInput = form.find(".form-control");
			validateFormInput(formInput, function(invalid, inputs){
				if(invalid > 0){
					for(var i=0; i<inputs.length; i++){
						if(inputs[i].invalid.length > 0){
							console.log( "securityQuestionForm_" +inputs[i].elem.attr("name") +"_"+ inputs[i].invalid );
						}
					}
				}else{
					if( form.find("[name='question']")[0] ){
						ssSettings.set();
					}else{
						ssSettings.change();
					}
				}
			});
	    });		
	}
	this.set = function(){
		var form = $("#securityQuestionForm"),
			resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit"),
			question = form.find("[name='question']"),
			answer = form.find("[name='answer']"),
			password = form.find("[name='withdrawalPass']"),
			data = {
				question: question.val(),
				answer: answer.val(),
				password: password.val()
			};
		if(!submitBtn.hasClass("processing")){
			submitBtn.addClass("processing");
			console.log("Success:", data);
			resetBtn.click();
			ssSettings.checkQuestions("change");
			submitBtn.removeClass("processing");			
		}
	}
	this.change = function(){
		var form = $("#securityQuestionForm"),
			resetBtn = form.find(".form-reset"),
			submitBtn = form.find(".form-submit"),
			answer = form.find("[name='answer']"),
			password = form.find("[name='withdrawalPass']"),
			data = {
				answer: answer.val(),
				password: password.val()
			};
		if(!submitBtn.hasClass("processing")){
			submitBtn.addClass("processing");
			console.log("Success:", data);
			resetBtn.click();
			ssSettings.checkQuestions();
			submitBtn.removeClass("processing");			
		}		
	}
	return ssSettings.init();
}

/***************************************
Help
***************************************/

// Help Play Prize
function helpPlayPrize(){
	var helpPlayPrize = this;
	this.init = function(){
		common.getUserInfo();
		helpPlayPrize.events()
	}
	this.events = function(){

	}
	return helpPlayPrize.init();
}

// Help Deposit Related
function helpDepositRelated(){
	var helpDepositRelated = this;
	this.init = function(){
		helpDepositRelated.events();
		common.getUserInfo();
		common.accordion();
	}
	this.events = function(){
		$(document).off("click", "#depositRl .tab-btn")
				   .on("click","#depositRel .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#depositRel .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#depositRel .tab-content").hide();
			$("#"+rel).show();
		});
	}
	return helpDepositRelated.init();
}

// Help Withdrawal
function helpYourWithdrawal(){
	var helpYourWithdrawal = this;
	this.init = function(){
		helpYourWithdrawal.events();
		common.getUserInfo();
		common.accordion();
	}
	this.events = function(){
		$(document).off("click","#yourWithdraw .tab-btn")
				   .on("click","#yourWithdraw .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#yourWithdraw .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#depositRel .tab-content").hide();
			$("#"+rel).show();
		});
	}
	return helpYourWithdrawal.init();
}

// Help Account Numbers
function helpAccountNumbers(){
	var helpAccountNumbers = this;
	this.init = function(){
		helpAccountNumbers.events();
		common.getUserInfo();
		common.accordion();
	}
	this.events = function(){
		$(document).off("click","#accntNum .tab-btn")
				   .on("click","#accntNum .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#accntNum .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#accntNum .tab-content").hide();
			$("#"+rel).show();
		});
	}
	return helpAccountNumbers.init();
}

// Help Bonus Betting Issues
function helpBonusBettingIssues(){
	var helpBonusBettingIssues = this;
	this.init = function(){
		helpBonusBettingIssues.events();
		common.getUserInfo();
		common.accordion();
	}
	this.events = function(){
		$(document).off("click","#bbi .tab-btn")
				   .on("click","#bbi .tab-btn", function(){
			var rel = $(this).attr("data-rel");
			$("#bbi .tab-btn").removeClass("sel").addClass("unsel");
			$(this).removeClass("unsel").addClass("sel");
			$("#depositRel .tab-content").hide();
			$("#"+rel).show();
		});
	}
	return helpBonusBettingIssues.init();
}

// Help Installation
function helpInstallation(){
	var helpInstallation = this;
	this.init = function(){
		helpInstallation.events();
		common.getUserInfo();
	}
	this.events = function(){
		
	}
	return helpInstallation.init();
}

// Help About Us
function helpAboutUs(){
	var helpAboutUs = this;
	this.init = function(){
		helpAboutUs.events();
		common.getUserInfo();
	}
	this.events = function(){
		// Tab
	    $(document).off("click","#faqTabs .tab-btn")
	   			  .on("click","#faqTabs .tab-btn", function(){
	    	var rel = $(this).attr("data-rel");
	      	$("#faqTabs .tab-btn").removeClass("sel").addClass("unsel");
	      	$(this).removeClass("unsel").addClass("sel");
	      	$("#faqTabs .tab-content").hide();
	      	$("#"+rel).show();
	    });
	}
	return helpAboutUs.init();
}
