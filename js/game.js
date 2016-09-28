/*var currentGame = {};
var currentLottery = sessionStorage.getItem("currentLottery");
currentLottery = currentLottery.split("_");
currentGame.gameGroupId = currentLottery[0];
currentGame.gameId = currentLottery[1];
currentGame.gameCode = currentLottery[2];
currentGame.gameMode = sessionStorage.getItem("gameMode");*/
var currentGame = {};
/*$(document).ready(function(){
	gameUI.init();
})*/

$(document).on("click", ".lt-number-row .num-wrp", function(){
	draw.selectBall($(this));
});

$(document).on("click", "dt.btn.game-icons.inline-block.currency", function () {
    draw.bettingMode($(this));
});

$(document).on("click", ".lt-pick-row > li", function(){
	var option = $(this),
		row = option.closest(".game-cntaner");
	draw.autoSelect(option, row);
});

$(document).on("click", "dt.btn.less_btn", function(){
	var rebate = $(".p-amount").text();
	$(".p-amount").text(draw.rebate(rebate, "lt"));
});

$(document).on("click", "dt.btn.mrethan_btn", function(){
	var rebate = $(".p-amount").text();
	$(".p-amount").text(draw.rebate(rebate, "gt"));
});

$(document).on("click", ".tz_bet_wrp .tz_bet1 dt.btn.minus_btn", function(){
	var value = $(".input-holer-tz > input[type='text']").val();
	draw.multiplier(value, "dec");
});

$(document).on("click", ".tz_bet_wrp .tz_bet1 dt.btn.plus_btn", function(){
	var value = $(".input-holer-tz > input[type='text']").val();
	draw.multiplier(value, "inc");
});

$(document).on("change", ".input-holer-tz > input[type='text']", function() {
	currentGame.multiples = $(this).val();
    order.updateOrders($(this).text());
    gameUI.totalAmount();
});

$(document).on("click", "#tab1 .tz_history_content ul li.cancel-x", function(){
	$(this).parent().remove();
	order.cartSummary();
});

$(document).on("click", ".lottery-menu .tab-menu-right.inline-block .game-icons", function(){
	var playSwitch = $(this);
	order.clearOrders(function(e){
		if (e) {
			draw.playMenu(playSwitch);
		} else {
			return false;
		}
	})
});

$(document).on("click", ".lottery-info-tab .lottery-info-tab-wrp.inline-block .game-icons", function(){
	draw.switchBalls($(this));
});

$(document).on("click", ".blBet-btn", function(){
	order.addToCart();
	order.sendOrders();
});

/*var num = [], sub = [];
$(".lot-game-wrp .game-cntaner .lt-number-row .num-wrp").each(function(){
	num.push($(this).text());
});

$(".lot-game-wrp .game-cntaner .lt-number-row .sub-wrp").each(function(){
	sub.push($(this).text());
});*/

$(document).on("click", ".menu-loterry .with_child ul.child_menu li", function(){
	var playInfo = $(this).attr("data-lotto").split("-");
	currentGame.playId = playInfo[0];
	currentGame.singleBetPrice = playInfo[1];
	gameUI.getGameRows(currentGame.gameGroupId, currentGame.playId);
	$(".in-box-Text").text($(this).text());
	sessionStorage.setItem("playName", $(this).text()); 
});

$(document).on("click", ".tz_bet_wrp > .tz_bet.betting-btn > .orBet-bnt.game-icons", function(){
	order.addToCart();
});

$(document).on("click", "#betOrder.game-icons.red-border-button", function(){
	order.sendOrders();
});

$(document).on("click", "#cno.game-icons.white-border-button", function(){
	if ($("#tab1 .tz_history_content").html() == "") {
		TCG.Alert("alerts", "请先选择号码");
	} else {
		TCG.Ajax({url:'xml/lotterypopup.xml',dataType:'html'},function(txt){
	        TCG.WinOpen({text:txt,transparent:false,width:'1268px',height:'602px'},function(){});
	        cno.normalInit();
		});
	}
});

$(document).on("click", ".icon-3-con", function(){
	order.rngOrder(1);
});

$(document).on("click", ".icon-4-con", function(){
	for(var i = 4; i >= 0; i--) {
		order.rngOrder(5);
	}
});

/*$(document).on("click", ".alignleft.bcb-left.game-icons.white-border-button", function(){
	order.clearOrders();
});*/
var draw = {
	selectBall: function(ball) {
		if (ball.hasClass("selected")) {
			ball.removeClass("selected");
		}else {
			ball.addClass("selected");
		}
		draw.stakes();
	},
	bettingMode: function(currency) {
		$("dt.btn.game-icons.inline-block.currency").removeClass("active");
		currency.addClass("active"); 
		gameUI.gameSetting(currency.attr("id"));
	},
	playMenu: function(mode) {

		$(".lottery-menu .tab-menu-right.inline-block .game-icons").removeClass("active");
		mode.addClass("active");
		if (mode.text() == "超级6") {
			gameUI.gamePlayMenu(currentGame.gameId, "ZY");
		} else {
			gameUI.gamePlayMenu(currentGame.gameId, "Tradition");
		}

	},
	switchBalls: function(balls) {
		$(".lottery-info-tab .lottery-info-tab-wrp.inline-block .game-icons").removeClass("active");
		balls.addClass("active");
		gameUI.hotGap(balls.text());
	},
	autoSelect: function(option, row) {
		switch (option.text()) {
			case '全':
				$(".num-wrp", row).addClass("selected");
				break;
			case '大':
				$(".num-wrp:gt(4)", row).addClass("selected");
				$(".num-wrp:lt(5)", row).removeClass("selected");
				break;
			case '小':
				$(".num-wrp:lt(5)", row).addClass("selected");
				$(".num-wrp:gt(4)", row).removeClass("selected");
				break;
			case '奇':
				$(".num-wrp:odd", row).addClass("selected");
				$(".num-wrp:even", row).removeClass("selected");
				break;
			case '偶':
				$(".num-wrp:even", row).addClass("selected");
				$(".num-wrp:odd", row).removeClass("selected");
				break;
			case '清':
				$(".num-wrp", row).removeClass("selected");
				break;
			default:
				break;
		}
		draw.stakes();
		gameUI.totalAmount();
	},
	rebate: function(rebate, ctrl) {
		var rebate = rebate.split("/"),
			amount = rebate[0]*1,
			percent = rebate[1].replace('%', '')*1;
		switch (ctrl) {
			case "lt":
				if (amount > currentGame.series.minSeries && percent > 0){
					amount = amount - 2;
					percent = percent + 0.1;
				}
				break;
			case "gt":
				if (amount < currentGame.series.maxBetSeries && percent > 0) {
					amount = amount + 2;
					percent = percent - 0.1;
				}
				break;
			default:
				break;
		}
		var newRebate = amount + "/" + percent.toFixed(1) + "%";
		currentGame.rebate = amount;
		return newRebate;
	},
	multiplier: function(value, ctrl) {
		value = value*1;
		switch (ctrl) {
			case "inc":
				if (value<999) {
					value += 1;
				};
				break;
			case "dec":
				if (value>0) {
					value -= 1;
				};
				break;
			default:
				// statements_def
				break;
		}
		$(".tz_bet_wrp .tz_bet1 .input-holer-tz > input[type='text']").val(value);
		currentGame.multiples = value;
		order.updateOrders(value);
		gameUI.totalAmount();
	},
	stakes: function() {
		var stacks = [];
		$("#ssc > div.lot-game-wrp > div").each(function(row){
			stacks.push($(".lt-number-row > dt.selected", this).length);
		})
		var totalStakes = stacks.reduce(function(a,b){return a*b;});
		$(".tz_bet_wrp > .tz_bet.amount-bet-current > dt > #stakes").text(totalStakes);
		currentGame.stakes = totalStakes;
		gameUI.totalAmount();
	}
};
/*var headers = {
	"Merchant": "2000cai",
	"Authorization": sessionStorage.getItem("token")
};*/
var api = {
	headers: function() {
		var data = {
			"Merchant": "2000cai",
			"Authorization": sessionStorage.getItem("token")
		}
		return data;
	},
	getGames: function (callback) {
		$.ajax({
			url: "./lgw/games",
			headers: api.headers(),
			success: function(result, textStatus, jqXHR){
				callback(result);
			}
		});
	},
	getGamesSeries: function () {
		$.ajax({
			url: "./lgw/games/series",
			headers: api.headers(),
			success: function(result, textStatus, jqXHR){
				console.log(result);
			}
		});
	},
	getGamesPlayMenu: function (gameId, callback) {
		$.ajax({
			url: "./lgw/games/"+gameId+"/play_menu",
			headers: api.headers(),
			success: function(result, textStatus, jqXHR){
				callback(result);
			}
		});
	},
	getGamesSetting: function (gameId, callback) {
		$.ajax({
			url: "./lgw/games/"+gameId+"/setting",
			headers: api.headers(),
			success: function(result, textStatus, jqXHR){
				callback(result);
			}
		});
	},
	getCustomerSeries: function (callback) {
		$.ajax({
			url: "./lgw/customers/series",
			headers: api.headers(),
			success: function(result, textStatus, jqXHR){
				callback(result);
			}
		});	
	},
	getHotGapInfo: function (gameId, callback) {
		$.ajax({
			url: "lgw/draw/"+gameId+"/hot_gap_info",
			headers: api.headers(),
			success: function(result, textStatus, jqXHR){
				callback(result);
			}
		});
	},
	postBetOrder: function (data, callback) {
		$.ajax({
			url: "lgw/orders/betting",
			headers: api.headers(),
			data: JSON.stringify(data),
			dataType: "json",
			contentType: "application/json",
			type: "POST",
			success: function(result, textStatus, jqXHR){
				callback(result);
			},
			error: function(result){
				TCG.Alert("alerts",TCG.Prop(result.responseJSON.errorCode), "XS");
			}
		});
	},
	getNumerosChase: function (gameId, callback) {
		$.ajax({
			url: "lgw/numeros/chase/"+gameId,
			headers: api.headers(),
			dataType: "json",
			contentType: "application/json",
			success: function(result, textStatus, jqXHR){
				callback(result);
			},
			error: function(result){
				TCG.Alert("alerts",result.responseJSON.message, "M");
			}
		});
	},
	getNumberRecent: function (data, callback) {
		$.ajax({
			url: "lgw/numeros/recent",
			headers: api.headers(),
			data: data,
			dataType: "json",
			success: function(result, textStatus, jqXHR){
				callback(result);
			},
			error: function(result){
				TCG.Alert("alerts",result.responseJSON.message, "M");
			}
		});
	}
}

var gameUI = {
	init: function(){
		// var currentLottery = sessionStorage.getItem("currentLottery");
		// currentLottery = currentLottery.split("_");
		globalVar.currentLottery;
		currentGame.playId = 13;
		currentGame.singleBetPrice = 2;
		currentGame.gameGroupId = globalVar.currentLottery.series[0].gameGroupId;
		currentGame.gameId = globalVar.currentLottery.gameId;
		currentGame.gameCode = globalVar.currentLottery.game;
		currentGame.gameGroupCode = globalVar.currentLottery.gameGroup;
		currentGame.gameMode = sessionStorage.getItem("gameMode");
		gameUI.gamesList();
		gameUI.gamePlayMenu(currentGame.gameId, currentGame.gameMode, sessionStorage.getItem("hotgap"));
		//gameUI.setRebates(currentGame.gameGroupCode, currentGame.prizeModeId);
		gameUI.getGameRows(currentGame.gameGroupId);
		gameUI.gameSetting();
		$(".in-box-Text").text("一星直選");
	},
	gamesList: function () {
		var html = "";
		api.getGames(function(result){
			for (var key in result) {
			    // skip loop if the property is from prototype
			    if (!result.hasOwnProperty(key)) continue;

			    var group = result[key];

			    html += '<ul class="group_'+group.code+'"	>';
			    for (var index in group.games) {
					if (!group.games.hasOwnProperty(index)) continue;
					var game = group.games[index];
					html += '<li data-lotto="'+group.gameGroupId+'_'+game.gameId+'_'+game.code+'_'+group.code+'">'+game.remark+'</li>';
			    };
			    html += '</ul>';
			}
			$(".gameList").html(html);
			$(".the-page-content .below_header .wrapper .select-game-icon .gameList ul li").click(function(){
				sessionStorage.setItem("currentLottery", $(this).attr("data-lotto"));
				gameUI.init();
			})
		});	
	},
	gamePlayMenu: function (gameId, mode, hotgap) {
		mode = mode || "ZY";
		hotgap = hotgap || "gap";
		var playName = sessionStorage.getItem("playName");
		var gameMode = null,
			html = "";
		sessionStorage.setItem("gameMode", mode);
		sessionStorage.setItem("hotgap", hotgap);
		if (playName == null) {
			$(".in-box-Text").text("一星直選");
		}
		api.getGamesPlayMenu(gameId, function(result){
			if (mode == "ZY"){
				if (result[1].playMenuGroups.length == 0) {
					gameMode = result[0];
				} else {
					gameMode = result[1];
				}
			} else {
				if (result[0].playMenuGroups.length == 0) {
					gameMode = result[1];
				} else {
					gameMode = result[0];
				}
			}
			sessionStorage.setItem("prizeModeId", gameMode.prizeModeId);
			gameUI.setRebates(currentGame.gameGroupCode, sessionStorage.getItem("prizeModeId"));
			var playMenuGroups = gameMode.playMenuGroups;
			for (var key in playMenuGroups) {
			    if (!playMenuGroups.hasOwnProperty(key)) continue;
			    var menuGroup = playMenuGroups[key];
			    html += '<li class="with_child" data-lotto="'+menuGroup.groupSwitch+'-'+menuGroup.playCode+'-'+menuGroup.sorting+'">'+menuGroup.playName;
			    html += '<ul class="child_menu hide">';
			    for (var index in menuGroup.playMenus) {
					if (!menuGroup.playMenus.hasOwnProperty(index)) continue;
					var playMenu = menuGroup.playMenus[index];
					if (playMenu.playSwitch == 1) {
						html += '<li data-lotto="'+playMenu.playId+'-'+playMenu.singleBetPrice+'">'+playMenu.playName+'</li>';
					}
			    };
			    html += '</ul>';
			    html += '</li>';
			}
			$(".menu-loterry").html(html);
			$("#stakes").text("0");
			$("#totalAmount").text("0.0000");	
			$("#"+sessionStorage.getItem("hotgap")+"").addClass("active");
			$("#"+sessionStorage.getItem("gameMode")+"").addClass("active");
			currentGame.prizeModeId = sessionStorage.getItem("prizeModeId");
		});
	},
	getGameRows: function(gameGroupId, playId){
		playId = playId || 13;
		var html = "";
		var length = 0;
		var id = null;
		var characters = ["万位","千位","百位","十位","个位"];
		getRows(gameGroupId, playId, function(result){
			currentGame.rows = result.rows;
			for(var i = 1; i <= result.rows; i++ ){
				id = result.rowNum[result.rowNum.length - (result.rows - length)];
				html += '<div class="game-cntaner"><span class="lt-tb-row inline-block">'+characters[id-1]+'</span><dl class="lt-number-row inline-block" id="'+id+'">';
				for (var b = result.start; b <= result.end; b++) {
					html += '<dt class="num-wrp" id="'+b+'">'+b+'</dt>';
					html += '<dd class="sub-wrp">'+b+'</dt>';
				}
				html += '</dl><ul class="lt-pick-row inline-block"><li>全</li><li>大</li><li>小</li><li>奇</li><li>偶</li><li>清</li></ul></div>';
				length++;
			}
		})	
		$(".lot-game-wrp").html(html);
		api.getHotGapInfo(currentGame.gameId, function(result){
			currentGame.hot = result.hot;
			currentGame.gap = result.gap;
			gameUI.hotGap();
		}); 
		$("#stakes").text("0");
		$("#totalAmount").text("0.0000");
	},
	hotGap: function(text) {
		text = text || $(".lottery-info-tab .lottery-info-tab-wrp .game-icons.active").text();
		if (text == "遗漏") {
			$(".lot-game-wrp .game-cntaner #1.lt-number-row .sub-wrp").text(function(i){
				return currentGame.gap.FIRST[i];
			});
			$(".lot-game-wrp .game-cntaner #2.lt-number-row .sub-wrp").text(function(i){
				return currentGame.gap.SECOND[i];
			});
			$(".lot-game-wrp .game-cntaner #3.lt-number-row .sub-wrp").text(function(i){
				return currentGame.gap.THIRD[i];
			});
			$(".lot-game-wrp .game-cntaner #4.lt-number-row .sub-wrp").text(function(i){
				return currentGame.gap.FOURTH[i];
			});
			$(".lot-game-wrp .game-cntaner #5.lt-number-row .sub-wrp").text(function(i){
				return currentGame.gap.FIFTH[i];
			});
			sessionStorage.setItem("hotgap", "gap");
		} else {
			$(".lot-game-wrp .game-cntaner #1.lt-number-row .sub-wrp").text(function(i){
				return currentGame.hot.FIRST[i];
			});
			$(".lot-game-wrp .game-cntaner #2.lt-number-row .sub-wrp").text(function(i){
				return currentGame.hot.SECOND[i];
			});
			$(".lot-game-wrp .game-cntaner #3.lt-number-row .sub-wrp").text(function(i){
				return currentGame.hot.THIRD[i];
			});
			$(".lot-game-wrp .game-cntaner #4.lt-number-row .sub-wrp").text(function(i){
				return currentGame.hot.FOURTH[i];
			});
			$(".lot-game-wrp .game-cntaner #5.lt-number-row .sub-wrp").text(function(i){
				return currentGame.hot.FIFTH[i];
			});
			sessionStorage.setItem("hotgap", "hot");
		}
	},
	setRebates: function (gameCode, prizeModeId) {
		var text = "";

		/*api.getCustomerSeries(function(result){
			for (var i in result) {
				if (gameCode == result[i].gameGroupCode && prizeModeId == result[i].prizeModeId) {
					currentGame.series = {
						"gameGroupCode": result[i].gameGroupCode,
					    "prizeModeId": result[i].prizeModeId,
					    "maxSeries": result[i].maxSeries,
					    "minSeries": result[i].minSeries,
					    "maxBetSeries": result[i].maxBetSeries,
					    "defaultSeries": result[i].defaultSeries
					}
				}
			}
			if (currentGame.series.defaultSeries == 2000) {
				text = "2000/0%";
			} else if (currentGame.series.defaultSeries == 1700) {
				text = "1700/12.8%";
			}
			$(".p-amount").text(text);
			currentGame.rebate = currentGame.series.defaultSeries;
		});*/

		var series = globalVar.currentLottery.series;

		for(var i in series) {
			if (prizeModeId == series[i].prizeModeId) {
				currentGame.series = {
					"gameGroupCode": series[i].gameGroupCode,
				    "prizeModeId": series[i].prizeModeId,
				    "maxSeries": series[i].maxSeries,
				    "minSeries": series[i].minSeries,
				    "maxBetSeries": series[i].maxBetSeries,
				    "defaultSeries": series[i].defaultSeries
				}
			}
		}
		if (currentGame.series.defaultSeries == 2000) {
				text = "2000/0%";
		} else if (currentGame.series.defaultSeries == 1700) {
			text = "1700/12.8%";
		}
		$(".p-amount").text(text);
		currentGame.rebate = currentGame.series.defaultSeries;
	},
	gameSetting: function (currency) {
		currency = currency || "Dollar";
		sessionStorage.setItem("currency", currency);
		api.getGamesSetting(currentGame.gameId, function(result){
			var modes = result.bettingModes
			for (var i in modes) {
				if (currency == modes[i].code) {
					currentGame.settings = {
						"bettingModeId": modes[i].bettingModeId,
						"betAmountMax": modes[i].betAmountMax,
					    "betMultipleMax": modes[i].betMultipleMax,
					    "winAmountMax": modes[i].winAmountMax,
					    "unit": modes[i].unit,
					    "code": modes[i].code
					}
				}
			}
			gameUI.totalAmount();
			order.updateOrders();
		});
	},
	totalAmount: function() {
		var stakes = currentGame.stakes,
			multiple = $(".input-holer-tz > input[type='text']").val()*1,
			denominator = currentGame.settings.unit,
			amount = null;
		amount = ((stakes*denominator)*multiple)*currentGame.singleBetPrice;
		isNaN(amount)? amount = 0 : amount;
		$("#totalAmount").text(amount.toFixed(4));

		if (amount === 0) {
			$(".tz_bet.betting-btn .inline-block.game-icons").removeClass("enable");
		} else {
			$(".tz_bet.betting-btn .inline-block.game-icons").addClass("enable");
		}
	},
	clearBoard: function() {
		$(".lt-number-row > .num-wrp.selected").removeClass("selected");
	}
}

var order = {
	cartSummary: function(){
		var orderStake = [0,0], orderAmount = [0,0];
		$(".orderStakes").each(function(stakes){
			orderStake.push($(this).text()*1);
		});
		$(".orderAmount").each(function(amount){
			orderAmount.push($(this).text()*1);
		});
		var total = orderAmount.reduce(function(a,b){return a+b});
		$("#totalStakes").html(orderStake.reduce(function(a,b){return a+b}));
		$("#totalOrderAmount").html(total.toFixed(4));

		if (total === 0) {
			$(".game-icons.red-border-button").removeClass("enable");
		} else {
			$(".game-icons.red-border-button").addClass("enable");
		}
	},
	addToCart: function(){
		var orders = "";
		var orderFormat = [];
		$("#ssc > div.lot-game-wrp > div").each(function(row){
			$(".lt-number-row > dt.selected", this).each(function(ball){
				orders += $(this).text();
			})
			orderFormat.push(orders);
			orders = "";
		})
		if (orderFormat[0] == "") {
			TCG.Alert("alerts", "请先选择号码");
		} else {
			var html = "";
			html += "<ul class='bet_number'>";
		    html += "<li data-format="+currentGame.playId+">"+$(".in-box-Text").text()+"</li>";
		    html += "<li data-format="+orderFormat.join("_")+">"+orderFormat[0]+"</li>";
		    html += "<li class='fxCh' data-format="+currentGame.settings.bettingModeId+">"+$("dt.btn.game-icons.inline-block.currency.active").text()+"</li>";
		    html += "<li class='orderStakes' data-format="+$("#stakes").text()+">"+$("#stakes").text()+"</li>";
		    html += "<li class='tz-mainWrp' data-format="+$(".input-holer-tz input").val()+">"+$(".input-holer-tz input").val()+"</li>";
		    html += "<li class='orderAmount' data-format="+$("#totalAmount").text()+">"+$("#totalAmount").text()+"</li>";
		    html += "<li class='game-icons cancel-x'>&nbsp;</li>";
		    html += "<li class='cm_number hide'>"+orderFormat.join("_")+"</li>";
		    html += "</ul>";
		}
		var betAmount = null;
		$("#tab1 .tz_history_content").append(html);
		order.cartSummary();
	},
	sendOrders: function (){
		if ($("#tab1 .tz_history_content").html() == "") {
			TCG.Alert("alerts", "请先选择号码");
		} else {
			var totalOrder = [];
			$("#tab1 > .tz_history_content > ul").each(function(order){
				console.log(); //order
				var orderRow = []
				$("li", this).each(function(args){
					orderRow.push($(this).data("format"));
				});
				totalOrder.push(orderRow[5]+"~"+orderRow[1]+"~"+orderRow[3]+"~1~"+orderRow[0]+"~"+"0");
			});
			var orderString = totalOrder.join(";");

			var data = {
			  "bettingSlipString": orderString,
			  "multiples": $(".input-holer-tz input").val(),
			  "chase": "false",
			  "gameId": currentGame.gameId,
			  "betCartAmountSum": $("#totalOrderAmount").text(),
			  "series": currentGame.rebate,
			  "currentNumero": $('span[bet-timer="currNumero"]').attr("numero"),
			  "bettingMode": currentGame.settings.bettingModeId,
			  "device": "WEB",
			  "orderType": 1,
			  "prizeModeId": currentGame.prizeModeId
			};

			console.log(data);
			var confirmOrder = '<div class="x-pop lott-rs-cont"><h2>请确认投注信息</h2><p>'+TCG.Prop("gameName_"+currentGame.gameCode)+'第'+data.currentNumero+'期</p><dl class="lott-rs-pop clearfix" style="display: block;"><dt>注数:</dt><dd>'+$("#totalStakes").text()+'注</dd><dt>投注金额:</dt><dd>'+data.betCartAmountSum+'</dd><dt>是否追号：</dt><dd>否</dd></dl></div>';
			//TCG.Alert("success", '<div class="x-pop lott-rs-cont"><h2>生成订单成功</h2><p>lorem lorem lorem ipsum</p><dl class="lott-rs-pop clearfix" style="display: block;"><dt>订单编号:</dt><dd>MMMMMMMMMMMM9012345</dd><dt>投注期号:</dt><dd>00020160525</dd><dt>总投注金额</dt><dd>999,999,999.00</dd><dt>系列</dt><dd>1700</dd><dt>模式</dt><dd>lorem</dd></dl></div>', "L");
			TCG.Confirm(confirmOrder,"S", function(e){
				if (e) {
					api.postBetOrder(data, function(result){
						var alertOrder = '<div class="x-pop lott-rs-cont"><h2>生成订单成功</h2><dl class="lott-rs-pop clearfix" style="display: block;"><dt>订单编号:</dt><dd>'+result.orderNumber+'</dd><dt>投注期号:</dt><dd>'+result.numero+'</dd><dt>投注总额:</dt><dd>'+result.totalBettingAmount.toFixed(4)+'</dd><dt>系列:</dt><dd>'+data.series+'</dd><dt>模式</dt><dd>'+$("dt.btn.game-icons.inline-block.currency.active").text()+'</dd></dl></div>';
						TCG.Alert("success", alertOrder, "M");
						$("#tab1 .tz_history_content").html("");
						$(".lt-number-row .num-wrp").removeClass("selected");
					});
				};
			});	
		}
	},
	rngOrder: function(num){
		gameUI.clearBoard();
		var gameArr = [0,1,2,3,4,5,6,7,8,9];
		$(".lt-number-row").each(function(){
			var randNum = chance.pickset(gameArr, 1);
			$("#"+randNum[0]+".num-wrp", this).addClass("selected");
		});
		draw.stakes();
		gameUI.totalAmount();
		order.addToCart();
	},
	updateOrders: function(){
		$(".tz-mainWrp").attr("data-format", $(".input-holer-tz input").val()).text($(".input-holer-tz input").val());
		$(".fxCh").attr("data-format", currentGame.settings.bettingModeId).text($("dt.btn.game-icons.inline-block.currency.active").text());
		$("#tab1 > .tz_history_content > ul").each(function(){
			var denominator = currentGame.settings.unit;
			var stakes = $(".orderStakes", this).text();
			var multiple = $(".tz-mainWrp", this).text();
			var total = ((stakes*denominator)*multiple)*currentGame.singleBetPrice;
			$(".orderAmount", this).attr("data-format", total.toFixed(4)).text(total.toFixed(4)); 
		})
		order.cartSummary();
	},
	clearOrders: function(callback){
		if ($("#tab1 .tz_history_content").html()!="") {
			TCG.Confirm("此选择影响购物车内容，將进行清空已选择的号码。请问是否继续？", "XS", function(e){
				if (e) {
					$("#tab1 .tz_history_content").html("");
					order.cartSummary();
				} else {
					return false;
				}
				callback(e);
			});
		} else {
			callback(true);
		}
	}
}

var cno = {
	normalInit: function() {
		$("#normalMultiples").val(currentGame.multiples || 1);
		api.getNumerosChase(currentGame.gameId, function(result){
			var numeros = result.chaseNumeros;
			var html = "";
			for (var i = 0; i < numeros.length; i++) {
				html += "<option value="+numeros[i]+">"+numeros[i]+"</option>";
			}
			$("#normalSelect select[name='numeros']").html(html);
			cno.normalGenerateTable();
		});
		cno.normalEvents();
	},
	normalGenerateTable: function() {
		var startingNumero = $("#normalSelect select[name='numeros'] :selected").text(),
			slips = $("#normalSlips").val(),
			multiples = $("#normalMultiples").val(),
			finalNumero = (startingNumero*1) + (slips*1),
			orderStakes = $("#totalStakes").text(),
			orderAmount = $("#totalOrderAmount").text(),
			html = "";
		for (var s = startingNumero, i = 1; s < finalNumero; s++, i++) {
			html += '<div class="checkbox-lot-table">';
			html += '<dl class="tz_title_content">';
			html += '<input id="check'+i+'" type="checkbox" name="terms" value="'+s+'" class="form-control" checked="">';
			html += '<label for="check'+i+'" class="checkicon reg-checked" onselectstart="return false;">全选</label>';
			html += '<dt>'+i+'</dt>';
			html += '<dt>'+s+'</dt>';
			html += '<dt id="slipMultiple">'+multiples+'</dt>';
			html += '<dt id="slipAmount">'+orderAmount+'</dt>';
			html += '<dt>2016-05-12 17:09:30</dt></dl></div>';
		}
		$("#normalTable").html(html);
		cno.normalSummary(slips);
	},
	normalEvents: function () {
		$(document).on("click", "#normalList", function(){
			cno.normalGenerateTable();
		});
		$(document).on("click", "#tab1 span[data-changeamount]", function(){
			var step = $(this).attr("data-changeamount"),
				multiples = $("#normalMultiples").val()*1;
			if (step == "increase") {
				multiples += 1;
			} else {
				multiples -= 1;
			}
			$("#normalMultiples").val(multiples);
			$("dt#slipMultiple").text(multiples);
			cno.normalUpdateCart();
			$(".tz-mainWrp").attr("data-format", multiples).text(multiples);
			$(".input-holer-tz input").val(multiples);
			cno.normalSummary();
		});
		$(document).on("change", "#normalMultiples", function(){
			var multiples = $("#normalMultiples").val(),
				validate = /^\d{1,3}$/.test(multiples);
			if (validate) {
				$("dt#slipMultiple").text(multiples);
			} else {
				$("dt#slipMultiple").text(currentGame.multiples);
			}
			cno.normalUpdateCart();
			$(".tz-mainWrp").attr("data-format", multiples).text(multiples);
			$(".input-holer-tz input").val(multiples);
			cno.normalSummary();
		});
		$(document).on("change", "#normalSlips", function(){
			var slips = $("#normalSlips").val(),
				validate = /^\d{1,3}$/.test(slips);
			if (!validate) {
				$(this).val("10");
			}
		});
		$(document).on("click", "#tab1 #normalTable .checkicon.reg-checked", function(){
			var self = $(this).parent().parent(),
				checkStatus = self.hasClass("checked");
			if (checkStatus) {
				self.removeClass("checked");
			} else {
				self.addClass("checked");
			}
		});
		$(document).on("click", "#tab1 .checkMain", function(){
			var self = $(this).parent().parent(),
				checkStatus = self.hasClass("checked");
			if (checkStatus) {
				self.removeClass("checked");
				$("#tab1 .checkicon.reg-checked").parent().parent().removeClass("checked");
			} else {
				self.addClass("checked");
				$("#tab1 .checkicon.reg-checked").parent().parent().addClass("checked");
			}
		});
		$(document).on("click", "#cnoOrder.game-icons.red-border-button", function(){
			cno.normalSendOrder();
		})

	},
	normalSummary: function(slips) {
		var slipTotal = [], slipTotalAmount = "";
		$("dt#slipAmount").each(function(){
			slipTotal.push($(this).text()*1);
		})
		slipTotalAmount = slipTotal.reduce(function(a,b){return a+b;});
		$("#totalSlips").text(slips);
		$("#totalCnoAmount").text(slipTotalAmount.toFixed(4));
	},
	normalUpdateCart: function() {
		var stakes = currentGame.stakes,
			denominator = currentGame.settings.unit,
			multiple = $("#normalMultiples").val(),
			amount = ((stakes*denominator)*multiple)*currentGame.singleBetPrice;
		$("#tab1 dt#slipAmount").text(amount.toFixed(4));
	},
	normalSendOrder: function() {
		var totalOrder = [];
		$("#tab1 > .tz_history_content > ul").each(function(order){
			console.log(); //order
			var orderRow = []
			$("li", this).each(function(args){
				orderRow.push($(this).data("format"));
			});
			totalOrder.push(orderRow[5]+"~"+orderRow[1]+"~"+orderRow[3]+"~1~"+orderRow[0]+"~"+"0");
		});
		var orderString = totalOrder.join(";");

		var cnoOrderArr = [];

		$("#tab1 dt#slipMultiple").each(function(){
			cnoOrderArr.push($(this).text());
		});

		var data = {
		  "bettingSlipString": orderString,
		  "chaseSlip" : {
		  	"numero":$("#normalSelect select[name='numeros'] :selected").text(),
		  	"multiples":cnoOrderArr
		  },
		  "multiples": $(".input-holer-tz input").val(),
		  "chase": "true",
		  "gameId": currentGame.gameId,
		  "betCartAmountSum": $("#totalOrderAmount").text(),
		  "series": currentGame.rebate,
		  "currentNumero": $('span[bet-timer="currNumero"]').attr("numero"),
		  "bettingMode": currentGame.settings.bettingModeId,
		  "device": "WEB",
		  "orderType": 1,
		  "prizeModeId": currentGame.prizeModeId
		};

		console.log(data);

		var confirmOrder = '<div class="x-pop lott-rs-cont"><h2>请确认投注信息</h2><p>'+TCG.Prop("gameName_"+currentGame.gameCode)+'第'+$('span[bet-timer="currNumero"]').attr("numero")+'期</p><dl class="lott-rs-pop clearfix" style="display: block;"><dt>注数:</dt><dd>'+$("#totalStakes").text()+'注</dd><dt>投注金额:</dt><dd>'+$("#totalOrderAmount").text()+'</dd><dt>是否追号：</dt><dd>是</dd></dl></div>';
		TCG.Confirm(confirmOrder,"S", function(e){
			if (e) {
				api.postBetOrder(data, function(result){
					var alertOrder = '<div class="x-pop lott-rs-cont"><h2>生成订单成功</h2><dl class="lott-rs-pop clearfix" style="display: block;"><dt>订单编号:</dt><dd>'+result.orderNumber+'</dd><dt>投注期号:</dt><dd>'+result.numero+'</dd><dt>投注总额:</dt><dd>'+result.totalBettingAmount.toFixed(4)+'</dd><dt>系列:</dt><dd>'+data.series+'</dd><dt>模式</dt><dd>'+$("dt.btn.game-icons.inline-block.currency.active").text()+'</dd></dl></div>';
					TCG.Alert("success", alertOrder, "M");
					TCG.hideLoading();
					$("#tab1 .tz_history_content").html("");
					$(".lt-number-row .num-wrp").removeClass("selected");
				});
			};
		});	
	}
}

function getRows(gameGroupId, playId, callback){
	gameGroupId == "1"?playId = playId || 13 : playId = 29;
	var result = {};
	switch (gameGroupId) {
		case "1":
			result.start = 0;
			result.end = 9;
			switch (sessionStorage.getItem("gameMode")) {
				case "Tradition":
					if (playId == 13 || playId == 14) {
						result.rows = 1;
						result.rowNum =[1,2,3,4,5];
					} else if (playId >= 15 && playId <= 20){
						result.rows = 2;
						result.rowNum =[1,2,3,4,5];
					} else if (playId >= 21 && playId <= 28){
						result.rows = 3;
						result.rowNum =[1,2,3,4,5];
					} else if (playId == 29 || playId == 30){
						result.rows = 4;
						result.rowNum =[1,2,3,4,5];
					} else if (playId >= 31 && playId <= 33) {
						result.rows = 5;
						result.rowNum =[1,2,3,4,5];
					} else if (playId >= 34 && playId <= 39){
						result.rows = 2;
						result.rowNum =[1,2];
					} else if (playId >= 40 && playId <= 47){
						result.rows = 3;
						result.rowNum =[1,2,3];
					} else if (playId >= 48 && playId <= 49){
						result.rows = 4;
						result.rowNum =[1,2,3,4];
					} else if (playId >= 50 && playId <= 57){
						result.rows = 3;
						result.rowNum =[2,3,4];
					}
					break;
				case "ZY":
					if (playId == 13 || playId == 14) {
						result.rows = 1;
						result.rowNum =[1,2,3,4,5];
					} else if (playId >= 15 && playId <= 20){
						result.rows = 2;
						result.rowNum =[1,2,3,4,5];
					} else if (playId >= 21 && playId <= 28){
						result.rows = 3;
						result.rowNum =[1,2,3,4,5];
					} else if (playId == 29 || playId == 30){
						result.rows = 4;
						result.rowNum =[1,2,3,4,5];
					} else if (playId >= 50 && playId <= 57){
						result.rows = 5;
						result.rowNum =[1,2,3,4,5];
					}
					break;
				default:
					break;
			}
			break;
		default:
			break;
	}
	console.log(result);
	callback(result);
}
function openTab(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" tab-active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " tab-active";

    if( cityName == "tab2" ){
    	var date = new Date(),
    		year = date.getFullYear(),
    		month = (date.getMonth()+1) < 10 ? "0"+(date.getMonth()+1) : date.getMonth(),
    		day = date.getDate() < 10 ? "0"+date.getDate() : date.getDate(),
    		today = year + "-" + month + "-" + day;
		var data = {
			"gameId": currentGame.gameId *1,
			"page": 0,
			"size": 50
		};
		$.ajax({
		    url: "./lgw/orders/today",
		    headers: api.headers(),
		    data: data,
		   	dataType: "json",
		    contentType: "application/json",
		    type: "GET",
		    success: function(result, textStatus, jqXHR){
		        var _html = "", decimal = 2, orders = result.content;
		        for( var i=0; i<orders.length; i++ ){
		        	var winningNumber = orders[i].winningNumber == null ? "-" : orders[i].winningNumber;
                    _html += "<ul>";
                    _html += "<li>" +orders[i].orderNumber+  "</li>";
                    _html += "<li>" +orders[i].numero+ "</li>";
                    _html += "<li>" +winningNumber+ "</li>";
                    _html += "<li>" +TCG.Prop("bettingMode_"+orders[i].bettingModeCode)+ "</li>";
                    _html += "<li>" +orders[i].series+ "</li>";
                    _html += "<li>" +control.customCurrencyFormat(orders[i].bettingAmount,4)+ "</li>";
                    _html += "<li>" +control.customCurrencyFormat(orders[i].winningAmount,4)+ "</li>";
                    if( orders[i].orderStatus == 2 ){
                        _html += "<li class='cancel-y cancelOrder' data-orderId='" +orders[i].orderDetailId+ "'>撤单</li>";
						}else{
							_html += "<li>" +TCG.Prop("orderStatus_"+orders[i].orderStatus)+ "</li>";
						}
                         _html += "</ul>";
                }
                $("#gameHistoryToday").html(_html);			    	
		    }
		});

    }
}

// Cancel Order
$(document).on("click", "#gameHistoryToday .cancelOrder", function(){
	var order = $(this);
		orderId = order.attr("data-orderId");
	TCG.Confirm(TCG.Prop("gameHistoryCancel"), "", function(ok){
		if(ok){
			$.ajax({
			    url: "./lgw/orders/suborders/cancel",
			    headers: api.headers(),
			    data: '['+orderId+']',
			    type: "PUT",
			   	dataType: "json",
			    contentType: "application/json",
			    complete: function(result, textStatus, jqXHR){
			    	switch(result.status){
			    		case 500:
				    		TCG.Alert("errors", TCG.Prop(result.responseJSON.errorCode));
			    			break;
			    		case 200:
					 		$("#itemWrapper .orderStatus").text( TCG.Prop("orderStatus_8") );		
					 		order.text( TCG.Prop("orderStatus_8") ).removeClass("cancelOrder cancel-y");
					 		TCG.Alert("success", TCG.Prop("gameHistoryCancel_success"));	 		
			    			break;
						default:
				    		console.log("errors", TCG.Prop(result.responseJSON.errorCode) + ", statusCode: " + result.status);
			    	}
			    }
			});					
		}
	});
});

