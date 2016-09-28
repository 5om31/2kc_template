/*
* @Author: Conan
* @Date:   2016-07
* @Last Modified by:   Conan Hou
*/
;(function(window,document,$){
	window.TCG={};
	var TCG=window.TCG;

	$.alerts = {
		
		// These properties can be read/written by accessing $.dialogbox.propertyName from your scripts at any time
		
		verticalOffset: 0,                // vertical offset of the dialog from center screen, in pixels
		horizontalOffset: 0,                // horizontal offset of the dialog from center screen, in pixels/
		repositionOnResize: true,           // re-centers the dialog on window resize
		overlayOpacity: 0.01,                // transparency level of overlay
		overlayColor: '#000',               // base color of overlay
		draggable: true,                    // make the dialogs draggable (requires UI Draggables plugin)
		okButton: '确定',         // text for the OK button
		cancelButton: '取消', // text for the Cancel button
		dialogClass: null,                  // if specified, this class will be applied to all dialogs
		size:{
			XS:{width:'379px',height:'259px'},
			S:{width:'397px',height:'370px'},
			M:{width:'500px',height:'460px'},
			AM:{width:'500px',height:'490px'},
			L:{width:'561px',height:'580px'},
			CL:{width:'511px',height:'514px'}
		},
		// Public methods
		//alert it's only two size,'XS' and 'L'
		alert: function(type, message, size, callback) {
			switch (size){
				case 'L':
					$.alerts._show('L', message, false, null, function(result) {
						if( callback ) callback(result);
					});
					break;
				case 'M':
					$.alerts._show('AM', message, true, type, function (result) {
						if (callback) callback(result);
					});
					break;
				default:
					$.alerts._show('XS', message, true, type, function (result) {
						if (callback) callback(result);
					});
			}
		},

		confirm: function(message, size, callback) {
			switch (size){
				case 'S':
					$.alerts._show('S', message, true, 'confirm', function(result) {
						if( callback ) callback(result);
					});
					break;
				case 'M':
					$.alerts._show('M', message, true, 'confirm', function(result) {
						if( callback ) callback(result);
					});
					break;
				case 'L':
					$.alerts._show('CL', message, true, 'confirm', function(result) {
						if( callback ) callback(result);
					});
					break;
				default:
					$.alerts._show('XS', message, true, 'confirm', function(result) {
						if( callback ) callback(result);
					});
			}
		},
		
		// Private methods
		
		_show: function(size, msg, icon, type, callback) {
			
			$.alerts._hide();
			$.alerts._overlay('show');
			var dialog_html='<div id="dialog_box_container"><div id="dialog_box_title"><div id="dialog_box_icon"></div></div><div id="dialog_box_content"></div></div>';
			if(!icon){
				dialog_html='<div id="dialog_box_container"><div id="dialog_box_content"></div></div>';
			}
			$("BODY").append(dialog_html);
			if( size ){
				$("#dialog_box_container").css({
					width:$.alerts.size[size].width,
					height:$.alerts.size[size].height
				});
			}
			if(size=='L'){
				$("#dialog_box_content").css({
					margin: '31px 0px 0px 0px'
				});
			}
			
			// IE6 Fix
			var pos = ('undefined' == typeof(document.body.style.maxHeight)) ? 'absolute' : 'fixed'; 
			
			$("#dialog_box_container").css({
				position: pos,
				zIndex: 9999,
				padding: 0,
				margin: 0
			});
			
			$("#dialog_box_icon").addClass(type);
			$("#dialog_box_content").html(msg);
			
			$.alerts._reposition();
			$.alerts._maintainPosition(true);
			
			switch( type ) {
				case 'confirm':
					$("#dialog_box_content").after('<div id="dialog_box_button"><input type="button" value="' + $.alerts.okButton + '" id="dialog_box_ok" /> <input type="button" value="' + $.alerts.cancelButton + '" id="dialog_box_cancel" /></div>');
					$("#dialog_box_ok").click( function() {
						$.alerts._hide();
						if( callback ) callback(true);
					});
					$("#dialog_box_cancel").click( function() {
						$.alerts._hide();
						if( callback ) callback(false);
					});
					$("#dialog_box_ok").focus();
					$("#dialog_box_ok, #dialog_box_cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#dialog_box_ok").trigger('click');
						if( e.keyCode == 27 ) $("#dialog_box_cancel").trigger('click');
					});
				break;
				default:
					$("#dialog_box_content").after('<div id="dialog_box_button"><input type="button" value="' + $.alerts.okButton + '" id="dialog_box_ok" /></div>');
					$("#dialog_box_ok").click( function() {
						$.alerts._hide();
						callback(true);
					});
					$("#dialog_box_ok").focus().keypress( function(e) {
						if( e.keyCode == 13 || e.keyCode == 27 ) $("#dialog_box_ok").trigger('click');
					});
			}
			
			// Make draggable
			if( $.alerts.draggable ) {
				try {
					$("#dialog_box_container").draggable({ handle: $("#dialog_box_title") });
					$("#dialog_box_title").css({ cursor: 'move' });
				} catch(e) { /* requires jQuery UI draggables */ }
			}
		},
		
		_hide: function() {
			$("#dialog_box_container").remove();
			$.alerts._overlay('hide');
			$.alerts._maintainPosition(false);
		},
		
		_overlay: function(status) {
			switch( status ) {
				case 'show':
					$.alerts._overlay('hide');
					$("BODY").append('<div id="dialog_box_overlay"></div>');
					$("#dialog_box_overlay").css({
						position: 'absolute',
						zIndex: 9998,
						top: '0px',
						left: '0px',
						width: '100%',
						height: $(document).height(),
						background: $.alerts.overlayColor,
						opacity: $.alerts.overlayOpacity
					});
				break;
				case 'hide':
					$("#dialog_box_overlay").remove();
				break;
			}
		},
		
		_reposition: function() {
			//console.log("$(window).height():"+$(window).height()+",$(document).height():"+$(document).height());
			//console.log("$(window).width():"+$(window).width()+",$(document).width():"+$(document).width());
			var top = (($(window).height() / 2) - ($("#dialog_box_container").outerHeight() / 2)) + $.alerts.verticalOffset;
			var left = (($(window).width() / 2) - ($("#dialog_box_container").outerWidth() / 2)) + $.alerts.horizontalOffset;
			if( top < 0 ) top = 0;
			if( left < 0 ) left = 0;
			
			// IE6 fix
			if( 'undefined' == typeof(document.body.style.maxHeight) ) top = top + $(window).scrollTop();
			
			$("#dialog_box_container").css({
				top: top + 'px',
				left: left + 'px'
			});
			$("#dialog_box_overlay").height( $(document).height() );
		},
		
		_maintainPosition: function(status) {
			if( $.alerts.repositionOnResize ) {
				switch(status) {
					case true:
						$(window).bind('resize', $.alerts._reposition);
					break;
					case false:
						$(window).unbind('resize', $.alerts._reposition);
					break;
				}
			}
		}
		
	}
	/**
	 * this alert dialog box
	 * @param type  value is:errors,success,alerts
	 * @param message
	 * @param size value:XS,L
	 * @param callback,this is on click after need run function.
	 * @param okBtnTxt,ok button text.
     */
	TCG.Alert = function(type, message, size, callback,okBtnTxt) {
		$.alerts.okButton=okBtnTxt==undefined||okBtnTxt==null||okBtnTxt==''?'确定':okBtnTxt;
		$.alerts.alert(type, message, size, callback);
	}

	/**
	 * this confirm dialog box
	 * @param message
	 * @param size value:XS,S,M
	 * @param callback, this is on click ok button or cancel button after need run function.and one parameter,it's boolean type.
	 * @param okBtnTxt ok button text.
	 * @param cancelBtnTxt cancel button text
     */
	TCG.Confirm = function(message, size, callback,okBtnTxt,cancelBtnTxt) {
		$.alerts.okButton=okBtnTxt==undefined||okBtnTxt==null||okBtnTxt==''?'确定':okBtnTxt;
		$.alerts.cancelButton=cancelBtnTxt==undefined||cancelBtnTxt==null||cancelBtnTxt==''?'取消':cancelBtnTxt;
		$.alerts.confirm(message, size, callback);
	};

	/**
	 * 浮动层插件
	 * $.popups.show的使用方法
	 */
	$.popups={
		id:'',//容器ID也是引入页面内容中的第一个DIV的id
		opacity:0.6,//遮罩层透明度
		overlayColor:'#000',
		show:function(arguments,openCallback,closeCallback){
			var defaultParams={text:'',isWindow:true,transparent:false,width:'1270px',height:'657px'};

			defaultParams.text = arguments.text!==undefined ? arguments.text : defaultParams.text;
			defaultParams.isWindow = arguments.isWindow!==undefined ? arguments.isWindow : defaultParams.isWindow;
			defaultParams.transparent = arguments.transparent!==undefined ? arguments.transparent : defaultParams.transparent;
			defaultParams.width = arguments.width!==undefined ? arguments.width : defaultParams.width;
			defaultParams.height = arguments.height!==undefined ? arguments.height : defaultParams.height;

			$.popups.opacity=defaultParams.transparent?0.01:0.6;//透明度为true,遮罩层为透明,默认60%
			$.popups.overlayColor=defaultParams.isWindow?'#000':'#fff';
			$.popups.hide();
			$.popups.overlay('show');//创建遮罩层

			if(defaultParams.isWindow){
				$.popups.id='#theme_popup';
				$("body").append('<div id="theme_popup"><div id="popup_close"></div><div id="popup_content"></div></div>');//显示内容
				$($.popups.id).css({
					width:defaultParams.width,
					height:defaultParams.height
				});
				$("#popup_content").html(defaultParams.text);
			}else{
				$.popups.id='#loading';
				$("body").append('<div id="loading"></div>');
			}

			// IE6 Fix
			var pos = ('undefined' == typeof(document.body.style.maxHeight)) ? 'absolute' : 'fixed';

			$($.popups.id).css({
				position: pos,
				zIndex: 199,
				padding: 0,
				margin: 0
			});

			$.popups.reposition();
			$.popups.maintainPosition(true);

			$("#popup_close").unbind("click");
			$("#popup_close").bind("click",function(){//绑定关闭窗口的事件
				$.popups.hide();
				if(closeCallback){closeCallback()};
			});
			if(openCallback){openCallback();}
		},

		hide:function() {
			$($.popups.id).remove();//清除窗口
			$.popups.overlay('hide');//清除遮罩层
			$.popups.maintainPosition(false);//取消窗口监听事件
			$.popups.id='';
		},

		overlay: function(status) {//创建遮罩层
			switch( status ) {
				case 'show':
					$.popups.overlay('hide');//清除之前的窗口以及遮罩层
					$("BODY").append('<div id="popups_overlay"></div>');
					$("#popups_overlay").css({
						position: 'absolute',
						zIndex: 198,
						top: '0px',
						left: '0px',
						width: '100%',
						height: $(document).height(),
						background:$.popups.overlayColor,
						opacity: $.popups.opacity
					});
					break;
				case 'hide':
					$("#popups_overlay").remove();
					break;
			}
		},

		reposition: function() {
			var top = (($(window).height() / 2) - ($($.popups.id).outerHeight() / 2)) + 0;
			var left = (($(window).width() / 2) - ($($.popups.id).outerWidth() / 2)) + 0;
			if( top < 0 ) top = 0;
			if( left < 0 ) left = 0;

			// IE6 fix
			if( 'undefined' == typeof(document.body.style.maxHeight) ) top = top + $(window).scrollTop();

			$($.popups.id).css({
				top: top + 'px',
				left: left + 'px'
			});
			$("#popups_overlay").height( $(document).height() );
		},

		maintainPosition: function(status) {
			switch(status) {
				case true:
					$(window).bind('resize', $.popups.reposition);
					break;
				case false:
					$(window).unbind('resize', $.popups.reposition);
					break;
			}
		}
	}
	/**
	 * this is popups
	 * @param arguments is object,the parameter is :
	 * {
	 * text:'',--page content support html tag
	 * transparent:true,-- have overlay opacity,default false
	 * width:'1270px', --popups width size
	 * height:'657px'-- popups height size
	 * }
	 * @param openCallback is function,the popups open after the need to perform the function
	 * @param closeCallback is function,,the popups close after the need to perform the function
     */
	TCG.WinOpen=function(arguments,openCallback,closeCallback){
		$.popups.show(arguments,openCallback,closeCallback);
	}
	/**
	 * lock page and show loading image
	 */
	TCG.showLoading=function(){
		$.popups.show({isWindow:false});
	}

	/**
	 * unlock page and remove loading image
	 */
	TCG.hideLoading=function(){
		$.popups.hide();
	}

	//var defaultParams={text:'',isWindow:true,opacity:true,width:'1270px',height:'657px'};

	TCG.Ajax=function(arguments,callback){
		if(!arguments.type){
			arguments.type='GET';
		}
		if(!arguments.dataType){
			arguments.dataType='json';
		}
		if(!arguments.async || typeof arguments.async !== 'boolean'){
			arguments.async=true;
		}
		if(!arguments.lock || typeof arguments.lock!=='boolean'){
			arguments.lock=false;
		}
		if(!arguments.cache){
			arguments.cache=false;
		}
		arguments.beforeSend=function(xhr){
			// if(this.id){
				// $(this.id).html("<div id="loading"></div>");
			// }
			if(this.lock){
				TCG.showLoading();
			}
		}
		arguments.error=function(xhr){
			if(xhr.status==500){
				if(xhr.responseJSON.errorCode=="CUSTOMER_NOT_LOGIN"){
					//success==false
					TCG.Alert("alerts","您还没有登录,请先登录!","XS",function(){
						TCG.Ajax({ url: "./logout"}, function(result){
							if(result.status){
								sessionStorage.clear();
								window.location = "index.html"; //index.html#lobby
							}else{
								TCG.Alert("errors",TCG.Prop(result.description));
							}
						});
					});
				}
			}
		}
		arguments.success=function(result){
			if((this.dataType==='text'||this.dataType==='html') && this.id){
				$(this.id).html(result);
			}
			if(this.dataType==='json'){
				if(result.status){
					if(this.id && typeof result.data==='string'){
						$(this.id).html(result.data);
					}
				}
			}
			if(callback){
				callback(result);
			}
		}
		arguments.complete=function(xhr,textStatus){
			if(this.lock){
				TCG.hideLoading();//响应成功后清除之前的遮罩层
			}
		}
		return $.ajax(arguments);
	}
	/**
	 * 加载指定语系的Properties文档,如果没有指定语系,
	 * 并且cookie中也为找到以前存放的语系,默认为zh-CN
	 * @param language 
	 * @param callback
	 * @return
	 */
	TCG.loadLanguageProperties=function(language,callback){
		if(language==undefined||language=="undefined"||language==""){
			language="zh-CN";
		}
		$.i18n.properties({
		    name: "message", 
		    path: "resource/", 
		    mode: "map",
		    language: language, 
		    cache: true, 
		    callback: function() {
				if (callback) { callback(); }
		    },
		    error: function() {
		    	// TODO: handle error
		    }
		});
	}
	
	/**
	 * 根据KEY获取在Properties中的对应值
	 * 列如Properties中如下定义
	 * button.cancel.text=Cancel{0}Are you sure?
	 * button.submit.text=Submit
	 * 获取值时：
	 * Yx.Prop("button.submit.text")
	 * Yx.Prop("button.cancel.text",",")
	 */
	TCG.Prop=$.i18n.prop;
	TCG.loadLanguageProperties();
	/**
	 * DES 加密函数
	 */
    TCG.desEncrypt=function(message, key) {
         var keyHex = CryptoJS.enc.Utf8.parse(key);
         var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
             mode: CryptoJS.mode.ECB,
             padding: CryptoJS.pad.Pkcs7
         });
         return encrypted.toString();
     }
    /**
     * DES解密函数
     */
    TCG.desDecrypt=function(ciphertext, key) {
        var keyHex = CryptoJS.enc.Utf8.parse(key);
        // direct decrypt ciphertext
        var decrypted = CryptoJS.DES.decrypt({
            ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
        }, keyHex, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(searchElement, fromIndex) {
			var k;
			// 1. Let O be the result of calling ToObject passing
			//    the this value as the argument.
			if (this == null) {
				throw new TypeError('"this" is null or not defined');
			}

			var O = Object(this);

			// 2. Let lenValue be the result of calling the Get
			//    internal method of O with the argument "length".
			// 3. Let len be ToUint32(lenValue).
			var len = O.length >>> 0;

			// 4. If len is 0, return -1.
			if (len === 0) {
				return -1;
			}

			// 5. If argument fromIndex was passed let n be
			//    ToInteger(fromIndex); else let n be 0.
			var n = +fromIndex || 0;

			if (Math.abs(n) === Infinity) {
				n = 0;
			}

			// 6. If n >= len, return -1.
			if (n >= len) {
				return -1;
			}

			// 7. If n >= 0, then Let k be n.
			// 8. Else, n<0, Let k be len - abs(n).
			//    If k is less than 0, then let k be 0.
			k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

			// 9. Repeat, while k < len
			while (k < len) {
				// a. Let Pk be ToString(k).
				//   This is implicit for LHS operands of the in operator
				// b. Let kPresent be the result of calling the
				//    HasProperty internal method of O with argument Pk.
				//   This step can be combined with c
				// c. If kPresent is true, then
				//    i.  Let elementK be the result of calling the Get
				//        internal method of O with the argument ToString(k).
				//   ii.  Let same be the result of applying the
				//        Strict Equality Comparison Algorithm to
				//        searchElement and elementK.
				//  iii.  If same is true, return k.
				if (k in O && O[k] === searchElement) {
					return k;
				}
				k++;
			}
			return -1;
		};
	}
})(window,document,jQuery);