/*******************************
Global Variable
******************************/	
var globalVar = {
	getAddressResult: null
};

var localVar = { decimal: 2, pageSize: 10, pageNo: 1 };

var control = {
	init:function(){
		window.sessionStorage.setItem("isLogin",false);
		control.checkLogin(true);
		control.gameHistoryDatepicker();
		control.gameHistoryEvents();
		control.gameHistoryCustomSelect("#gameHistoryForm select");
	},
	checkLogin:function(isFirst){
		var hash=window.location.hash==''?'#lobby':window.location.hash;
		TCG.Ajax({url:'memberinfo'},function(rs){
			if(rs.status){
				window.sessionStorage.setItem("isLogin",true);
				var obj={nickname:rs.result.nickname,totalAmount:rs.result.safeBalance,lastLoginTimes:rs.result.lastlogin};
				UI.header(true,obj);
				if((!isFirst)&&hash=='#lobby'){
					UI.afterLogin(obj);
				}
				if(isFirst){//the first check login need load xml
					if(hash=='#lobby'){
						UI.loadLobbyPage(true,obj);
					}
					if(hash=='#lottery') {
						UI.loadLotteryPage();
					}
				}
			}else{
				window.sessionStorage.setItem("isLogin",false);
				UI.header(false);
				if(hash=='#lottery'){
					TCG.Alert("alerts","您停留太久未操作,请重新登录!","XL",function(){
						window.location.hash=='#lobby';
						UI.loadLobbyPage(false,null);
					});
					return;
				}
				if(hash=='#lobby'){
					UI.loadLobbyPage(false,null);
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
				TCG.Alert("errors","请输入登录账号和密码!","XL",function(){$("#username").focus();});
				return;
			}
			if(username==""){
				TCG.Alert("errors","请输入登录账号!","XL",function(){$("#username").focus();});
				return;
			}
			if(password==""){
				TCG.Alert("errors","请输入登录密码!","XL",function(){$("#password").focus();});
				return;
			}
			if (!checkUserName) {
				TCG.Alert("errors","登录账号格式不正确!","XL",function(){$("#username").focus();});
				return;
			}
			if (!checkPassword) {
				TCG.Alert("errors","登录密码格式不正确!","XL",function(){$("#password").focus();});
				return;
			}
			if(!$("#loginBtn").hasClass("processing")){
				$("#loginBtn").addClass("processing").attr("value","正在登录");
				var dataRSA = { values: common.encode([globalVar.merchantCode,username.val(),password.val(),11111]) };
				TCG.Ajax({url: "./login", data: dataRSA, type: "POST"},function(rs){
					if(rs.status){
						if(rs.result.firstTimeLogin){//if user is first time login,need change password.
							window.sessionStorage.setItem("isLogin",false);
							control.firstTimeLogins();
						}else{
							control.checkLogin(false);
						}
					}else{
						TCG.Alert("errors",TCG.Prop(result.description));
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
				if(wallets.length>0){
					for(var i=0;i<wallets.length;i++){
						switch (wallets[i]["accountName"]){
							case "PVP":$("#PVPWallet").text(wallets[i]["availBalance"]);break;
							case "SAFE_BOX":$("#safeBoxWallet").text(wallets[i]["availBalance"]);$("#afterLoginBalance").text(wallets[i]["availBalance"]);break;
							case "RNG":$("#RNGWallet").text(wallets[i]["availBalance"]);break;
							case "LOTT":$("#LOTTWallet").text(wallets[i]["availBalance"]);break;
						}
					}
				}
			}else{
				TCG.Alert("errors","获取钱包列表失败,稍后请重试!");
			}
		});
	},
	refreshWallet:function(){
		$(document).off("click", ".rs-refresh").on("click", ".rs-refresh", function(){
			control.headerWalletList();
		});
	},
	firstTimeLogins:function(){
		TCG.Ajax({url:'xml/firstTimeLogin.xml',dataType:'html'},function(txt){
			TCG.WinOpen({text:txt,transparent:true,width:'447px',height:'470px'},function(){
				$("#popup_close").hide();
			},function(){

			});
		});
	},
	logout: function(){
		// Logout
		$(document).off("click", "#logout").on("click", "#logout", function(){
			TCG.Confirm(TCG.Prop("logout"), "XL", function(ok){
				if(ok){
					$.ajax({ url: "./logout",type: "POST"}).success(function(result){
						if(result.status){
							sessionStorage.clear();
							window.location.href = "index.html#lobby";
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
				TCG.WinOpen({text:txt,width:'1274px',height:'660px'},function(){
					control.popupsModelMenu();
					control.popupSubMenu();
				});
			}
		});
	},
	popupsModelMenu:function(){
		$(document).off("click",".model_main_menus dt,.model_main_menus dd").on("click",".model_main_menus dt,.model_main_menus dd",function(){
			var model=$(this).attr("data-modal");
			if(model!=undefined&&model!=null&&model!=''){
				if(model=='customerservice'){
					control.customerService();
					return;
				}
				$(".model_child_menus").html(UI.modalSubMenu(model));
				control.popupSubMenu();
			}
		});
	},
	popupSubMenu:function(){
		$(document).off("click",".model_child_menus li").on("click",".model_child_menus li",function(){
			var submenu=$(this).attr("data-submenu");
			if(submenu!=undefined&&submenu!=null&&submenu!=''){
				TCG.Ajax({id:".model_child_content",url:"xml/"+submenu+".xml",dataType:'html'},function(){
					var functions=new Function('return control.'+submenu+'();');
					functions();
				});
			}
		});
	},
	forgotPassword: function(){
		// show Forgot Password
		$(document).off("click", "#showForgotPassword")
				   .on("click", "#showForgotPassword", function(){
			UI.forgotPassword();
	    });

		// Show Forgot Password Form
		$(document).off("click", "#showForgotPasswordForm")
				   .on("click", "#showForgotPasswordForm", function(){
			var prop = { width: "490px", height: "420px" };
			UI.openModal("forgotPasswordForm", prop, function(){
				// Submit Forgot Pasword Form
				$("#forgotPasswordForm .form-submit").unbind("click").bind("click", function(){
					var form = $("#forgotPasswordForm"),
						formInput = form.find(".form-control");
					// validateFormInput(formInput, function(invalid, inputs){
					// 	if(invalid > 0){
					// 		for(var i=0; i < inputs.length; i++){
					// 			if(inputs[i].invalid.length > 0){
					// 				var message = "forgotPasswordForm_"+ inputs[i].elem.attr("name") +"_"+ inputs[i].invalid[0];
					// 				break;
					// 			}
					// 		}
					// 		openAlert({ type: "errors", message: message });
					// 	}else{
					// 		var submitBtn = form.find(".form-submit"),
					// 			resetBtn = form.find(".form-reset"),
					// 			username = form.find("[name='username']"),
					// 			email = form.find("[name='email']"),
					// 			data = {
					// 				username: username.val(),
					// 				email: email.val()
					// 			};
					// 		if( !submitBtn.hasClass("processing") ){
					// 			submitBtn.addClass("processing");
					// 			console.log("Success!", data);
					// 			resetBtn.click();
					// 		submitBtn.removeClass("processing");
					// 		}
					// 	}
					// })
			    });

				// Back to Forgot Password
				$("#backToForgetPassword").unbind("click").bind("click", function(){
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
				$(this).attr("identify","show");
				$("#showBalance").addClass("hide");
				$(".rs-refresh").addClass("hide");
				$("#hideBalance").removeClass("hide");
			}
			if(flag=='show'){
				control.headerWalletList();//show balance refresh amount
				$(this).attr("identify","hide");
				$("#hideBalance").addClass("hide");
				$("#showBalance").removeClass("hide");
				$(".rs-refresh").removeClass("hide");
			}
		});
	},
	customerService: function(){
		var cServiceURL = 'http://f18.livechatvalue.com/chat/chatClient/chatbox.jsp?companyID=678398&configID=61224&jid=8655963422&lan=zh';
	   // Fixes dual-screen position                         Most browsers      Firefox
	   var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
	   var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

	   var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
	   var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

	   var left = ((width / 2) - (800 / 2)) + dualScreenLeft;
	   var top = ((height / 2) - (560 / 2)) + dualScreenTop;
	   var newWindow = window.open(cServiceURL, title, 'resizable= no, menubar=no, status=no, toolbar=no, scrollbars=no, width=800, height=560, top=' + top + ', left=' + left);

	   // Puts focus on the newWindow
	   if (window.focus) {
		   newWindow.focus();
	   }
	},
	modal: function(){
		// Open Modal
		$(document).off("click", "[data-modal]")
			   	   .on("click", "[data-modal]", function(){
			var path = $(this).attr("data-modal").split("/"),
				menu = path[0],
				submenu = path[1];
			UI.modal(function(){
				UI.modalSubMenu(menu);
				if( submenu != undefined ){
					$("#remodalSubMenu [data-submenu='" +menu+ "/" +submenu+ "']").click();
				}else{
					$("#remodalSubMenu [data-submenu]")[0].click();
				}
			});
		});
	},
	modalMenu: function(){
		// Click Menu
		$(document).off("click", "#remodal [data-menu]")
			 	   .on("click", "#remodal [data-menu]", function(){
			var menu = $(this).attr("data-menu");
			// Remove Current Active Menu
			$("#remodal [data-menu]").removeClass("activeOn");
			// Remove Current Content 
			$("#submenuContent").html("");
			// Activate Clicked Menu
			$(this).addClass("activeOn");
			// Load SubMenu
			UI.modalSubMenu(menu);
			$("#remodalSubMenu [data-submenu]")[0].click();
		});		
	},
	modalSubMenu: function(){
		// Click Submenu
		$(document).off("click", "#remodalSubMenu [data-submenu]")
				   .on("click", "#remodalSubMenu [data-submenu]", function(){
			// Deactivate All Submenu
			$("[data-submenu]").removeClass("sub-act");
			// Remove Current Content
			$("#submenuContent").html("");          
			// Activate Clicked Submenu
			$(this).addClass("sub-act");
			// Load Submenu Content
			UI.subMenuContent( $(this).attr("data-submenu") );
		});		
	},
	form: function(){
		// Submit Form On Enter
		$(document).off("keyup", "form .form-control")
				   .on("keyup", "form .form-control", function(e){
			if(e.which == 13){
				$(this).parents("form").find(".form-submit").click();
			}
		});		
	},




	/***
	 ***	Start Game History
	 ***/
	
	gameHistoryCustomSelect:function(id){
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
	gameHistoryDatepicker:function(){
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
	},
	gameHistoryEvents:function(){
 		// Submit Form
 		$(document).off("click", "#gameHistoryForm .form-submit")
 				   .on("click", "#gameHistoryForm .form-submit", function(){
 			var form = $("#gameHistoryForm"),
 				formInput = form.find(".form-control"),
 				order = $("#gameHistoryForm input[name='order']"),
 				issue = $("#gameHistoryForm input[name='issue']"),
 				checkOrder = /^[A-Z0-9]+\-\d+$/.test(order.val());
 				checkIssue = /^\d+\-\d+$/.test(issue.val());
 			// validateFormInput(formInput, function(invalid, inputs){
 			// 	if(invalid > 0){
 			// 		for(var i=0; i<inputs.length; i++){
 			// 			if(inputs[i].invalid.length > 0){
 			// 				console.log( inputs[i].elem.attr("name"), inputs[i].invalid );
 			// 			}
 			// 		}
 			// 	}else{
 			// 		localVar.pageNo = 1;
 			// 		gameHistory.search();
 			// 	}
 			// })

 			localVar.pageNo = 1;
 			control.gameHistorySearch();
 				   

 			//console.log(checkOrder);
 			//console.log(checkIssue);

 			//if(order == "" && issue == ""){
 				// localVar.pageNo = 1;
 				// control.gameHistorySearch();
 			//}
 			
 			// if(!checkOrder){
 			// 	TCG.Alert("errors","Invalid Order","XL",function(){order.focus();});
				// return;
 			// }
 			// if(!checkIssue){
 			// 	TCG.Alert("errors","Invalid Issue","XL",function(){issue.focus();});
				// return;
 			// }
 			
 			// if(checkOrder){
 			// 	localVar.pageNo = 1;
 			// 	control.gameHistorySearch();	
 			// }
 	    });

 		// Open Item
 		$(document).off("click", "#gameHistoryList .openItem")
 				   .on("click", "#gameHistoryList .openItem", function(){
 			$("#listWrapper").addClass("hide");
 			$("#itemWrapper").removeClass("hide");
 			localVar.decimal = 2;
 			control.gameHistoryGetItem($(this).html());
 	    });

 		// Back to Game History
 		$(document).off("click", "#backToGameHistory")	
 				   .on("click", "#backToGameHistory", function(){
 			$("#listWrapper").removeClass("hide");
 			$("#itemWrapper").addClass("hide");
 			localVar.decimal = 2;
 			control.gameHistoryGetData();
 	   });

 		// Switch Decimal
 		$(document).off("click", "#gameHistoryPage .switchDecimal")
 				   .on("click", "#gameHistoryPage .switchDecimal", function(){
 			localVar.decimal = localVar.decimal == 2 ? 4 : 2;
 			var rel = $(this).attr("data-rel");
 			if( rel == "listWrapper" ){
 				control.gameHistoryGetData();
 			}else{
 				control.gameHistoryGetItem($(this).html());
 			}
 		});			

 		// Pagination - onClick
 		$(document).off("click", "#pagination [data-pageNo]")
 				   .on("click", "#pagination [data-pageNo]", function(){
 			var page = $(this).attr("data-pageNo");
 			localVar.pageNo = page;
 			$(this).parents(".pag-num").addClass("active");
 			$("#pagination .pag-num").removeClass("active");

 			control.gameHistorySearch();
 	    });	   

 		// Pagination - Next/Prev
 		$(document).off("click", "#pagination [data-pageNav]")
 				   .on("click", "#pagination [data-pageNav]", function(){
 			var pageNav = $(this).attr("data-pageNav"),
 				pageNo = pageNav == "next" ? parseInt(localVar.pageNo) + 1 : parseInt(localVar.pageNo) - 1;
 			if( pageNo > 0 && pageNo <= parseInt(localVar.pageTotal) ){
 				localVar.pageNo = pageNo;
 				control.gameHistorySearch();				
 			}
 	    });	  

 		// Pagination - GoTo Page No.
 		$(document).off("click", "#pagination [name='goToPage']")
 				   .on("click", "#pagination [name='goToPage']", function(){
 			var pageNo = $("#pagination [name='pageNo']"),
 				checkPageNo = /^[0-9]+$/.test(pageNo.val());
 				if(checkPageNo){
 					if( pageNo.val() > 0 && pageNo.val() <= parseInt(localVar.pageTotal) ){
 						localVar.pageNo = pageNo.val();
 						control.gameHistorySearch();
 					}else{
 						pageNo.val(localVar.pageNo);
 					}
 				} else {
 					pageNo.val("").focus();
 				}
 	    });	   
	},
	gameHistorySearch:function(){
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
			// TCG.Ajax({url: "/gameHistory", data: data, type: "POST"},function(rs){
			// 	if(rs.status){
			// 		console.log("Success:", rs);
			// 		control.gameHistoryGetData(rs);
			// 	} else{
			// 		TCG.Alert("errors",TCG.Prop(result.description));
			// 	}
			// });
			console.log("Success:", data);
			control.gameHistoryGetData(data);

			submitBtn.removeClass("processing");			
		}
	},
	gameHistoryGetData:function(rs){
		var list = "";
			decimal = localVar.decimal;

		// list += "<div class='divTableRow'>";
		// list += "<div class='divTableCell onel-cl-y ps-cen'>"+rs.result.gameType+"</div>";
		// list += "<div class='divTableCell onel-cl-y ps-cen'><span class='openItem'>"+rs.result.order+"</span></div>";
		// list += "<div class='divTableCell onel-cl-y ps-cen'>01-01 <span class='tblDec'>"+rs.result.bettingTime+"</span></div>";
		// list += "<div class='divTableCell onel-cl-y ps-cen'>"+rs.result.betIssue+"</div>";
		// list += "<div class='divTableCell onel-cl-y ps-cen div-y'>"+rs.result.mode+"</div>";
		// list += "<div class='divTableCell onel-cl-y ps-cen div-y'>"+rs.result.numberChase+"</div>";
		// list += "<div class='divTableCell onel-cl-y'>"+ customCurrencyFormat(rs.result.planBetAmout, decimal) +"</div>";
		// list += "<div class='divTableCell onel-cl-y'>"+ customCurrencyFormat(rs.result.effectiveAmountOfBets, decimal) +"</div>";
		// list += "<div class='divTableCell onel-cl-y tbl-red'>"+ customCurrencyFormat(rs.result.prizeMoney, decimal) +"</div>";
		// list += "<div class='divTableCell onel-cl-y ps-cen div-z'>"+rs.result.status+"</div>";
		// list += "</div>";

		// $("#gameHistoryList").html(list);

		// $("#totalPlannedAmount").html( customCurrencyFormat(rs.result.totalPlannedAmount, decimal) );
		// $("#totalEffectiveAmount").html( customCurrencyFormat(rs.result.totalEffectiveAmount, decimal) )
		// $("#totalPrizeMoney").html( customCurrencyFormat(rs.result.totalPrizeMoney, decimal) );

		// localVar.pageTotal = 5;
		// $("#pagination").html(customPagination(localVar.pageNo, localVar.pageTotal) );	

		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>2000五分彩</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'><span class='openItem'>LQ2K164LF...</span></div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>01-01 <span class='tblDec'>00:21:23</span></div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>20160513-001</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>元</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>1期</div>";
		list += "<div class='divTableCell onel-cl-y'>"+ customCurrencyFormat(1000000.0001, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y'>"+ customCurrencyFormat(1000000.0001, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y tbl-red'>"+ customCurrencyFormat(900000.0001, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-z'>已中奖</div>";
		list += "</div>";

		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>2000五分彩</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'><span class='openItem'>LQ2K164LF...</span></div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>01-02 <span class='tblDec'>00:21:23</span></div>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>20160513-002</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>元</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'>1期</div>";
		list += "<div class='divTableCell onel-cl-y'>"+ customCurrencyFormat(888.0000, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y'>"+ customCurrencyFormat(168.0000, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y'>"+ customCurrencyFormat(234.0000, decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-z'>未中奖</div>";
		list += "</div>";
		
		$("#gameHistoryList").html(list);

		$("#totalPlannedAmount").html( customCurrencyFormat(1095728.7844, decimal) );
		$("#totalEffectiveAmount").html( customCurrencyFormat(1095728.7844, decimal) )
		$("#totalPrizeMoney").html( customCurrencyFormat(1095728.7844, decimal) );

		localVar.pageTotal = 5;
		$("#pagination").html(customPagination(localVar.pageNo, localVar.pageTotal) );	
	},
	gameHistoryGetItem:function(oNumber){
		var decimal = localVar.decimal;

		// TCG.Ajax({url: "/gameHistoryGetItemDetails", data: data, type: "POST"},function(rs){
		// 	if(rs.status){
		// 		console.log("Success:", rs);
				
		// 		$("#itemWrapper .orderNo").text(rs.result.orderNo);
		// 		$("#itemWrapper .bettingNoteCount").html( currencyFormat( rs.result.bettingNoteCount ) );
		// 		$("#itemWrapper .orderStatus").text(rs.result.orderStatus);
		// 		$("#itemWrapper .seriesModel").text(rs.result.seriesModel);
		// 		$("#itemWrapper .bettingMultiples").html( currencyFormat(rs.result.bettingMultiples) );
		// 		$("#itemWrapper .bettingOnNumber").text(rs.result.bettingOnNumber);
		// 		$("#itemWrapper .prizeMoney").html( customCurrencyFormat(rs.result.prizeMoney,decimal) );
		// 		$("#itemWrapper .bettingTime").text(rs.result.bettingTime);
		// 		$("#itemWrapper .lotteryNumbers").text(rs.result.lotteryNumbers);

		// 		// Table Below
		// 		var list = "";
		// 		list += "<div class='divTableRow'>";
		// 		list += "<div class='divTableCell onel-cl-y ps-cen'>"+rs.result.playMethod+"</div>";
		// 		list += "<div class='divTableCell onel-cl-y ps-cen yel-pop'>"+rs.result.betInfo+"<div class='pop-yellow'>"+rs.result.betInfo+"</div></div>";			
		// 		list += "<div class='divTableCell onel-cl-y ps-cen'>"+rs.result.betCount+"</div>";			
		// 		list += "<div class='divTableCell onel-cl-y ps-cen'>"+ customCurrencyFormat(rs.result.betAmount,decimal) +"</div>";
		// 		list += "</div>";
				
		// 		$("#itemList").html(list);	

		// 	} else{
		// 		TCG.Alert("errors",TCG.Prop(result.description));
		// 	}
		// });

		var decimal = localVar.decimal,
			data = {
			orderNo: "LQ2K164LF0285A-0001",
			bettingNoteCount: 10000,
			orderStatus: "Î´ÖÐ½±",
			seriesModel: "2000 / Ôª",
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
		$("#itemWrapper .prizeMoney").html( customCurrencyFormat(data.prizeMoney,decimal) );
		$("#itemWrapper .bettingTime").text(data.bettingTime);
		$("#itemWrapper .lotteryNumbers").text(data.lotteryNumbers);

		var list = "";
		list += "<div class='divTableRow'>";
		list += "<div class='divTableCell onel-cl-y ps-cen'>ÈýÐÇÖ±Ñ¡</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen yel-pop'>0123456789...<div class='pop-yellow'><div>01-02-03-04-05 | 01-02-03-04-05 | 01-02-03-04-05</div><div>01-02-03-04-05 | 01-02-03-04-05 | 01-02-03-04-05</div></div></div>";			
		list += "<div class='divTableCell onel-cl-y ps-cen'>20</div>";			
		list += "<div class='divTableCell onel-cl-y ps-cen'>"+ customCurrencyFormat(99222000.00,decimal) +"</div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'></div>";		
		list += "<div class='divTableCell onel-cl-y ps-cen div-y'></div>";			
		list += "<div class='divTableCell onel-cl-y'></div>";
		list += "<div class='divTableCell onel-cl-y'></div>";
		list += "<div class='divTableCell onel-cl-y'></div>";
		list += "<div class='divTableCell onel-cl-y ps-cen div-z'></div>";
		list += "</div>";
		
		$("#itemList").html(list);	
	}
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


function customSelect(id){
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

function customCurrencyFormat(amount, decimal){
	var format = currencyFormat(amount,decimal).toString().split("."),
		decimal = format[1].replace(",","") || "";
		currency = format[0] + ".<span class='tblDec'>" +decimal+ "</span>";
	return currency;
}

function getGameHistory(data, callback){
	var param = { url: "/getGameSummaryReport", data: data };
	TCG.Ajax(param, callback);
}

function customPagination (pageNo, pageTotal){
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


control.init();