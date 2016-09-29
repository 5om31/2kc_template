$(document).ready(function(){
	var register = {
		merchantCode: "2000cai",
		affCode: "",
		expiredAffCode: false,
		init: function(){
			register.checkAffUrl();
			register.events();
			register.loadErrorMessages();
			document.getElementsByClassName('form-control ch-inpt')[1].setAttribute("maxlength", "16");
		},
		checkAffUrl: function(){
			var hostname=window.location.hostname;
			var affCode=hostname.substring(0,hostname.indexOf(".",0));
			if(affCode!='www'){
				TCG.Ajax({ url: "./affiliate", data: { merchantCode: register.merchantCode, code: affCode } }, function(result){
					if(result.status){
						if( result.result.qq != null ){
							var url = result.result.qq;
								_link = "<li><a href='" +url+ "' target='_blank'>联系代理</a></li>";
							$("#csLink").after(_link);
						}
						if( result.description == "expired.affiliate.url" ){
							TCG.Alert("errors", TC.Prop("registerForm_expiredAffCode"));
							register.expiredAffCode = true;
							register.affCode = "";
						}else{
							register.affCode = affCode;
							register.expiredAffCode = false;
						}
					}else{
						console.log(result.description);
					}
				});
			}			
		},
		events: function(){
			// Open Terms And COndition
			$(document).on("click", "#termsAndCondition", function(){
				// TCG.Ajax({ url: "./xml/userAgreement.xml", dataType: "html", cache: false }, function(txt){
				    TCG.WinOpen({ width: "700px", height: "600px", text: $.load("/xml/userAgreement.xml") }, function(){
				    	console.log("test");
				    });
				 // });
			});

			// Close Terms And COndition
			$(document).on("click", "#closeUserAgreement", function(){
				TCG.hideLoading();
			});

			// Open CS Link
			$(document).on("click", "#csLink > a", function(){
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
			});

			// Submit Form
			$(document).on("click", "#registerForm .form-submit", function(){
				var form = $("#registerForm"),
					resetBtn = form.find(".form-reset"),
					submitBtn = form.find(".form-submit"),
					username = form.find("[name='username']"),
					password = form.find("[name='pass']"),
					confirmPassword = form.find("[name='conPass']"),
					terms = form.find("[name='terms']"),
					merchatCode = register.merchantCode,
					email = "",
					mobileNo = "",
					qq = "",
					nickname = "",
					affCode = register.affCode;	
				if( register.checkUsername( username ) && register.checkPassword(password, confirmPassword) && register.confirmPassword(password, confirmPassword) ){
					if( register.expiredAffCode == false ){
						if( password.val() != "123456" ){
							if( terms.is(":checked") ){
								if( !submitBtn.hasClass("processing") ){
									submitBtn.addClass("processing");
									var data = [ merchatCode, username.val(), nickname, password.val(), confirmPassword.val(), email, mobileNo, qq, affCode ],
										dataRSA = { values: register.encode(data) };
						            $.ajax({url : "./register", data: dataRSA, type: "POST", dataType: "JSON", cache: false}).success(function(result){
										if(result.status){
											TCG.Alert("success","注册成功 <br /> 帐号："+username.val() , "", function(){
												TCG.showLoading();			
												// Login
												var dataRSA = { values: register.encode([merchatCode,username.val(),password.val(),11111]) };
									            $.ajax({url : "./login", data: dataRSA, type: "POST", dataType: "JSON", cache: false}).success(function(result){
													if(result.status){
														window.sessionStorage.setItem("username",result.result.userName);
														window.sessionStorage.setItem("token",result.result.token);
														window.location = "index.html";
													}else{
														TCG.Alert("errors",TCG.Prop(result.description));
														TCG.hideLoading();			
													}
													if(typeof callback == "function") callback(result.status);								        
									            });
											}, "进入游戏");
										}else{
											TCG.Alert("errors",TCG.Prop(result.description));
											submitBtn.removeClass("processing");
										}
									});
								}
							}else{
								TCG.Alert("errors",TCG.Prop("registerForm_terms_required"));
							}
						}else{
							TCG.Alert("errors", TCG.Prop("registerForm_passwordStrength"));
							password.parents(".form-group").removeClass("valid").addClass("invalid");
						}
					}else{
						TCG.Alert("errors", TCG.Prop("registerForm_expiredAffCode"));
					}
				}
			});

			// Username On keyup
			$(document).on("keyup", "#registerForm [name='username']", function(){
				register.checkUsername( $(this) );			
			});

			// Username On focusout
			$(document).on("focusout", "#registerForm [name='username']", function(){
				register.checkUsernameAvailability( $(this) );			
			});

			// Password On keyup
			$(document).on("keyup", "#registerForm [name='pass']", function(){
				var password = $(this), confirmPassword = $("#registerForm [name='conPass']");
				register.checkPassword(password, confirmPassword);			
			});

			// Confirm Password On keyup
			$(document).off("keyup", "#registerForm [name='conPass']")
					   .on("keyup", "#registerForm [name='conPass']", function(){
				var password = $("#registerForm [name='pass']"), confirmPassword = $(this);
				register.confirmPassword(password, confirmPassword);			
			});		

			// Terms on click
			$(document).on("change","[name='terms']", function(){
				if( $(this).is(":checked") ){
					$(".checkicon").removeClass("reg-unchecked").addClass("reg-checked");
				}else{
					$(".checkicon").removeClass("reg-checked").addClass("reg-unchecked");
				}
			})			

			// Submit Form On Enter
			$(document).on("keyup", "form .form-control", function(e){
				if(e.which == 13){
					$(this).parents("form").find(".form-submit").click();
				}
			});
		},
		checkUsername: function(input){
			var isValid = false;
			if( input.val() == "" || !/^[\w]{6,11}$/.test(input.val()) ){
				input.parents(".form-group").removeClass("valid").addClass("invalid");
			}else{
				input.parents(".form-group").removeClass("invalid").addClass("valid");
				isValid = true;
			}
			return isValid;
		},
		checkUsernameAvailability: function(input){
			var isValid = register.checkUsername(input);
			if(isValid){
				var data = {
						merchantCode: register.merchantCode, 
						username: input.val()
					};
				$.ajax({
					url: "./checkUsername",
					type: "POST",
					dataType: "JSON",
					data: data,
					success: function(result){
						if(!result.status){
							TCG.Alert("errors", TCG.Prop( result.description ) );
							input.parents(".form-group").removeClass("valid").addClass("invalid");
						}
					}
				});
			}
		},
		checkPassword: function(password, confirmPassword){
			var isValid = false;
			if(password.val() == "" || !/^[\w]{6,16}$/.test( password.val()) ){
				password.parents(".form-group").removeClass("valid").addClass("invalid");
			}else{
				password.parents(".form-group").removeClass("invalid").addClass("valid");
				isValid = true;
			}
			if( confirmPassword.val() != "" ) register.confirmPassword(password, confirmPassword);
			return isValid;
		},
		confirmPassword: function(password, confirmPassword){
			var isValid = false;
			if( password.val() == "" || password.val() != confirmPassword.val() ){
				confirmPassword.parents(".form-group").removeClass("valid").addClass("invalid");
			}else{
				confirmPassword.parents(".form-group").removeClass("invalid").addClass("valid");
				isValid = true;
			}
			return isValid;
		},
		loadErrorMessages : function(){
			var errMsg = $("#registerForm [data-errMsg]");
			errMsg.each(function(i){
				var msg = TCG.Prop( $(this).attr("data-errMsg") );
				$(this).html(msg);
			});
		},
		encode: function(arr){
			var encodedData = [];
			for( var i=0; i<arr.length; i++ ){
				encodedData.push( encodeURI(arr[i]) );
			}
			return getEncryptedText(encodedData);
		}
	}	
	register.init();
});
