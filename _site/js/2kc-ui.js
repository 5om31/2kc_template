var UI = {
    header: function(isLoggedIn,obj){
        var header = "";
        if(isLoggedIn){
            var accountName = obj.account.split("@")[1];
            // Header After Login
            header += "<li class='login-nam'>您好，<span data-userinfo='username'>"+accountName+"</span></li>";
			header += "<li class='money-amount balanceWrapper'><p id='showBalance' class='show clearfix'><span class='wallet-lbl'>中心钱包</span><span id='safeBoxWallet' class='data-wb'></span></p><span id='hideBalance' class='hide'>余额已隐藏</span>&nbsp;<span class='rs-refresh'></span>&nbsp;<a href='javascript:void(0);' identify='hide' id='isCheckBalance'>隐藏</a>";
			header += "<dl class='sub-wallet-menu hide clearfix'>";
			header += "<span class='top-arw'></span>";
			header += "<dt>彩票钱包</dt><dd id='LOTTWallet'></dd>";
			header += "<dt>棋牌钱包</dt><dd id='PVPWallet'></dd>";
			header += "<dt>电子钱包</dt><dd id='RNGWallet'></dd>";
			header += "</dl>";
			header += "</li>";
			header += "<li class='money-deposit rs-dw-btn'><a id='topDeposit' href='javascript:void(0);' data-modal='deposit'>存款</a></li>";
			header += "<li class='money-withdrawal rs-dw-btn'><a id='topWithdraw' href='javascript:void(0);' data-modal='withdrawal'>提款</a></li>";
			header += "<li class='logout-ico'><a href='javascript:void(0);' id='logout'>&nbsp;</a></li>";
			header += "<li class='clearfix'></li>";
            $("#loggedInHeader").html(header);
            $("body").removeClass("logged-out").addClass("logged-in");
            control.headerWalletList();//set wallet date list
            control.refreshWallet();//set refresh wallet event
            control.switchBalance();
            control.logout();//logout events
        }else{
            $("#loggedInHeader").html("");
            $("body").removeClass("logged-in").addClass("logged-out");
        }
        UI.marquee();
    },
    marquee:function(){
        TCG.Ajax({url:'./getSystemAnnouncements',data:{merchantCode:globalVar.merchantCode}},function(rs){
            if(rs.status){
                var _html='';
                if(rs.result.contentLobby.length>0){
                    for(var i=0;i<rs.result.contentLobby.length;i++){
                        _html+='<p>'+rs.result.contentLobby[i].content+'</p>';
                    }
                    $("#marquee").html(_html).marquee({
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
                }else{
                    $("#marquee").html("<p>暂时没有滚动公告</p>");
                }
            }
        });
    },
    loadLobbyPage:function(isLogged,obj){
        TCG.Ajax({id:'.the-page-content',url:"./xml/lobby.xml",dataType:'html'},function(){
            UI.lotteryMenus();//load lottery games menu
            if(isLogged){
                UI.afterLogin(obj);//after login ui
            }else{
                $("#leftMenu dl").addClass("hide");
                $("#topMenu ul").addClass("hide");
                //before login ui is default
                control.login();//set login event
                control.forgetPassword();
                control.pageMenu("#topRightMenu li,#moreActivity");
            }
            control.carousel();
            UI.hotGames();
            control.indexAnnouncement();
        });
    },
    loadLotteryPage:function(){
        control.clearLottBetTimer();
        TCG.Ajax({id:'.the-page-content',url:"xml/lottery.xml",dataType:'html'},function(){
            control.pageMenu("#leftMenu dt,#leftMenu dd,#topDeposit,#topWithdraw");
            globalVar.currentLottery=UI.getCurrentLottery();
            UI.checkUserType();
            if(globalVar.currentLottery==null){return;}
            $("#topLottMenus").addClass(globalVar.currentLottery.game);
            UI.lotteryMenus();
            UI.lottBetTimes(true);
            UI.showDrawUI();
            //

            var currentGameW = window.sessionStorage.getItem("currentLottery").split('_');
            var gameCodeIndex = 2;
            var currentGameCode = currentGameW[gameCodeIndex];

            // Subscribe the draw result topic

            im.subscribeDrawResult(currentGameCode,function(message) {

                var messageObj = JSON.parse(message);
                UI.showDrawNumber(messageObj.numero ,messageObj.winningNumber )
            });

            //

            gameUI.init();
        //gametype
        });
    },
    lotteryMenus:function(){
        var hash=window.location.hash==''?'#lobby':window.location.hash;
        TCG.Ajax({url:'lgw/games',headers:{Merchant: globalVar.merchantCode}},function(rs){
            if(rs.length>0){
                switch (hash){
                    case "#lobby":UI.lottMenusByLobby(rs);break;
                    case "#lottery":UI.lottMenusByLottery(rs);break;
                }
            }
        });
    },
    lottMenusByLobby:function(rs){
        var _menus='';
        var pvpgame='';
        // pvpgame+='<dl class="sm-link" id="fungames">';
        // pvpgame+='<dt class="pvp_game inline-block"></dt>';
        // pvpgame+='<dd class="inline-block slider-g-t">娱乐游戏</dd>';
        // pvpgame+='</dl>';
        if(window.sessionStorage.getItem("isLogin")=='false'){//not login
            for(var i=0;i<rs.length;i++){
                // Disabled Other Games
                _menus+='<dl class="sm-link">';
                _menus+='<dt class="'+(rs[i].code=='11X5'?'fx11x5':rs[i].code)+' inline-block"></dt>';
                _menus+='<dd class="inline-block slider-g-t">'+rs[i].displayName+'</dd>';
                _menus+='<ul class="hide">';
                if(rs[i].games.length>0){
                    for(var j=0;j<rs[i].games.length;j++){
                        _menus+='<li class="'+rs[i].games[j].code+'" data-lotto="'+rs[i].games[j].gameGroupId+'_'+rs[i].games[j].gameId+'_'+rs[i].games[j].code+'">'+rs[i].games[j].remark+'</li>';
                    }
                }
                _menus+='</ul></dl>';
            }
            $(".slider-menu").html(_menus+pvpgame);
            UI.lottMenusEvent(".sm-link ul li",true);
        }
        if(window.sessionStorage.getItem("isLogin")=='true'){//It's login
            TCG.Ajax({url:'lgw/customers/series',headers:{Merchant: globalVar.merchantCode,Authorization:window.sessionStorage.getItem("token")}},function(rss){
                if(rss.length>0){
                    for(var s=0;s<rss.length;s++){
                        for(var i=0;i<rs.length;i++){
                            if(rs[i]["code"]==rss[s].gameGroupCode&&rss[s].prizeModeId*1==1){
                                _menus+='<dl class="sm-link">';
                                _menus+='<dt class="'+(rs[i].code=='11X5'?'fx11x5':rs[i].code)+' inline-block"></dt>';
                                _menus+='<dd class="inline-block slider-g-t">'+rs[i].displayName+'</dd>';
                                _menus+='<ul class="hide">';
                                if(rs[i].games.length>0){
                                    for(var j=0;j<rs[i].games.length;j++){
                                        var group_info=rss[s].gameGroupCode+"_"+rs[i].games[j].gameGroupId+"_"+rss[s].prizeModeId+"_"+rss[s].maxSeries+"_"+rss[s].minSeries+"_"+rss[s].maxBetSeries+"_"+rss[s].defaultSeries;
                                        window.sessionStorage.setItem(rs[i].games[j].code,group_info);
                                        _menus+='<li class="'+rs[i].games[j].code+'" data-lotto="'+rs[i].games[j].gameGroupId+'_'+rs[i].games[j].gameId+'_'+rs[i].games[j].code+'_'+rs[i].code+'">'+rs[i].games[j].remark+'</li>';
                                    }
                                }
                                _menus+='</ul></dl>';
                            }
                            if(rs[i]["code"]==rss[s].gameGroupCode&&rss[s].prizeModeId*1==2){
                                if(rs[i].games.length>0){
                                    for(var j=0;j<rs[i].games.length;j++){
                                        var group_info=rss[s].gameGroupCode+"_"+rs[i].games[j].gameGroupId+"_"+rss[s].prizeModeId+"_"+rss[s].maxSeries+"_"+rss[s].minSeries+"_"+rss[s].maxBetSeries+"_"+rss[s].defaultSeries;
                                        window.sessionStorage.setItem(rs[i].games[j].code+"_ZY",group_info);
                                    }
                                }
                            }
                        }
                    }
                }
                $(".slider-menu").html(_menus+pvpgame);
                UI.lottMenusEvent(".sm-link ul li",true);
            });
        }
    },
    lottMenusByLottery:function(rs){
        //newGame it's css name for hot game icon
        //mosTplayed it's css name for new game icon
        var _menus='<dl class="gameList hide">';
        TCG.Ajax({url:'lgw/customers/series',headers:{Merchant: globalVar.merchantCode,Authorization:window.sessionStorage.getItem("token")}},function(rss){
            if(rss.length>0){
                for(var s=0;s<rss.length;s++){
                    for(var i=0;i<rs.length;i++){
                        if(rs[i].code==rss[s].gameGroupCode&&rss[s].prizeModeId==1){
                            _menus+='<ul class="group_'+rs[i].code+'">';
                            if(rs[i].games.length>0){
                                for(var j=0;j<rs[i].games.length;j++){
                                    var group_info=rss[s].gameGroupCode+"_"+rs[i].games[j].gameGroupId+"_"+rss[s].prizeModeId+"_"+rss[s].maxSeries+"_"+rss[s].minSeries+"_"+rss[s].maxBetSeries+"_"+rss[s].defaultSeries;
                                    window.sessionStorage.setItem(rs[i].games[j].code,group_info);
                                    _menus+='<li data-lotto="'+rs[i].games[j].gameGroupId+'_'+rs[i].games[j].gameId+'_'+rs[i].games[j].code+'">'+rs[i].games[j].remark+'</li>';
                                }
                            }
                            _menus+='</ul>';
                        }
                        if(rs[i]["code"]==rss[s].gameGroupCode&&rss[s].prizeModeId*1==2){
                            if(rs[i].games.length>0){
                                for(var j=0;j<rs[i].games.length;j++){
                                    var group_info=rss[s].gameGroupCode+"_"+rs[i].games[j].gameGroupId+"_"+rss[s].prizeModeId+"_"+rss[s].maxSeries+"_"+rss[s].minSeries+"_"+rss[s].maxBetSeries+"_"+rss[s].defaultSeries;
                                    window.sessionStorage.setItem(rs[i].games[j].code+"_ZY",group_info);
                                }
                            }
                        }
                    }
                }
            }
            //_menus+='<ol id="fungames" class="group_games">';
            //_menus+='<li>捕鱼游戏</li>';
            //_menus+='<li class="newGame">棋牌游戏</li>';
            //_menus+='</ol>';
            _menus+='</dl>';
            $("#topLottMenus").html(_menus);
            UI.lottMenusEvent("#topLottMenus ul li",true);
        });
    },
    forgotPassword: function(){
        var _html = "<dl id='rs-dbox' class='ui-draggable forget-pwd clearfix'>";
        _html += "<dt>根据下列方式找回登录密码</dt>";
        _html += "<dd class='to-fpwd' submenu='email'>安全邮箱</dd>";
        _html += "<dd class='to-fpwdf' submenu='customerservices'>联系客服</dd>";
        _html += "<dd class='clearfix'></dd>";
        _html += "</dl>";
        TCG.WinOpen({text:_html, width: "430px", height: "270px",transparent:true},function(){
            $(document).off("click","#rs-dbox dd").on("click","#rs-dbox dd",function(){
                var type=$(this).attr("submenu");
                if(type=='email'){
                    TCG.hideLoading();
                    control.findPasswordByEmail();
                }
                if(type=='customerservices'){
                    control.customerService();
                }
            });
        });
    },
    popupsModel:function(submenu){
        var _html='<div class="popups_model">';
        _html+='<dl class="model_main_menus">';
        _html+='<dt class="deposit_icon" data-modal="deposit"></dt>';
        _html+='<dd data-modal="deposit">存款</dd>';
        _html+='<dt class="withdraw_icon" data-modal="withdrawal"></dt>';
        _html+='<dd data-modal="withdrawal">提款</dd>';
        _html+='<dt class="member_icon" data-modal="personal"></dt>';
        _html+='<dd data-modal="personal">个人</dd>';
        _html+='<dt class="agent_icon" data-modal="agent"></dt>';
        _html+='<dd data-modal="agent">代理</dd>';
        _html+='<dt class="soon email_icon" data-modal=""></dt>'; //message
        _html+='<dd class="soon" data-modal="">讯息</dd>';    //message
        _html+='<dt class="service_icon" data-modal="customerservice"></dt>';
        _html+='<dd data-modal="customerservice">客服</dd>';
        _html+='<dt class="help_icon" data-modal="help"></dt>';
        _html+='<dd data-modal="help">帮助</dd>';
        _html+='</dl>';
        _html+='<div class="model_content">';
        _html+='<div class="model_child_menus">';
        _html+=UI.modalSubMenu(submenu);
        _html+='</div>';
        _html+='<div class="model_child_content">';
        _html+='</div>';
        _html+='</div>';
        _html+='<div class="esc_words">';
        _html+='<p>按ESC离开</p>';
        _html+='</div>';
        _html+='</div>';
        return _html;
    },
    modalSubMenu: function(menu){
        // Modal Submenu
        var _html = "";
        switch(menu){
            case "deposit":
                _html += "<p>存款</p>";
                _html += "<ul>";
                _html += "<li data-submenu='onlinePayment'>快捷支付</li>";
                _html += "<li data-submenu='quickPayment'>网银支付</li>";
                _html += "<li data-submenu='channelPayment'>微信支付</li>";
                _html += "<li data-submenu='alipay'>支付宝</li>";
                _html += "<li data-submenu='conversionOfFunds'>钱包转账</li>";
                _html += "<li data-submenu='depositRecords'>存款记录</li>";
                _html += "</ul>";
                break;
            case "withdrawal":
                _html += "<p>提款</p>";
                _html += "<ul>";
                _html += "<li data-submenu='withdrawalRequest'>提款申请</li>";
                _html += "<li data-submenu='withdrawalRecords'>提款记录</li>";
                _html += "<li data-submenu='bindCard'>绑定提款卡</li>";
                _html += "</ul>";
                break;
            case "personal":
                _html += "<p>个人</p>";
                _html += "<ul>";
                _html += "<li data-submenu='myProfile'>我的资料</li>";
                _html += "<li data-submenu='bonusDetails'>奖金详情</li>";
                _html += "<li data-submenu='gameHistory'>投注记录</li>";
                _html += "<li data-submenu='norecordChase'>追号记录</li>";
                _html += "<li data-submenu='changeAccount'>帐变明细</li>";
                _html += "<li data-submenu='palStatementsPersonal'>盈亏报表</li>";                //personalPalStatements
                _html += "<li data-submenu='changePassword'>登录密码</li>";
                _html += "<li data-submenu='modfndPassword'>资金密码</li>";
                _html += "<li data-submenu='ssSettings'>设置密保</li>";
                _html += "</ul>";
                break;
            case "agent":
                _html += "<p>代理</p>";
                _html += "<ul>";
                _html += "<li data-submenu='agentRegisterDownline'>精准注册</li>";
                _html += "<li data-submenu='agentGenerateAffiliateUrl'>链接注册</li>";
                _html += "<li data-submenu='linkManager'>链接管理</li>";
                _html += "<li data-submenu='memberManagement'>会员管理</li>";
                _html += "<li data-submenu='palStatementsAgent'>盈亏报表</li>";
                _html += "<li data-submenu='agentTeamBetting'>团队投注</li>";
                _html += "<li data-submenu='agentRevenueReport'>收入报表</li>";
                _html += "<li data-submenu='agentDividendRecord'>分红记录</li>";
                _html += "</ul>";
                break;
            case "message":
                _html += "<p>讯息</p>";
                _html += "<ul>";
                _html += "<li data-submenu='inbox'>编写讯息</li>";
                _html += "<li data-submenu='writeMessage'>已收讯息</li>";
                _html += "<li data-submenu='sentMessages'>已发讯息</li>";
                _html += "</ul>";
                break;
            case "help":
                _html += "<p>帮助</p>";
                _html += "<ul>";
                _html += "<li data-submenu='helpPlayPrize'>玩法奖金</li>";
                _html += "<li data-submenu='helpDepositRelated'>存款相关</li>";
                _html += "<li data-submenu='helpYourWithdrawal'>提款相关</li>";
                _html += "<li data-submenu='helpAccountNumbers'>帐号相关</li>";
                _html += "<li data-submenu='helpBonusBettingIssues'>常见问题</li>";
                _html += "<li data-submenu='helpInstallation'>安装帮助</li>";
                _html += "<li data-submenu='helpAboutUs'>关于我们</li>";
                _html += "</ul>";
                break;
            case "activity":
                _html += "<p>公告</p>";
                _html += "<ul>";
                _html += "<li data-submenu='announcement'>公告新闻</li>";
                _html += "<li data-submenu='activityInfo'>活动资讯</li>";
                _html += "</ul>";
                break;
        }
        return _html;
    },
    afterLogin: function(obj){
        $("#leftMenu dl").removeClass("hide");//after login show left menu
        $("#topMenu ul").removeClass("hide");//after login show top menu
        // After Login Replace Login Form
        var txt = "<dl class='rs-tc-vam'>";
            txt += "<dt class='icon profile-icon'></dt>";
            txt += "<dd class='welcome'>欢迎您</dd>";
            txt += "<dd class='accnt-uname' data-userInfo='nickname'>"+(obj.nickname == null ? "用户尚无昵称" : obj.nickname )+"</dd>";
            txt += "<dt class='abal-cont'>余额: ";
            txt += "<span class='bal-amnt' id='afterLoginBalance' data-walletbalance='ALL'>"+obj.totalAmount+"</span></dt>";
            txt += "</div>";
            txt += "</div>";
            txt += "<dt class='last-logged-in'>上次登录 <span data-userInfo='lastLogin'>"+obj.lastLoginTimes+"</span></dt>";
            txt += "<dd class='depo-cont-btn sbmt-center'>";
            txt += "<input class='depo-btn red-submt-btn' type='button' value='立即充值' data-modal='deposit' id='afterLoginDeposit'/>";
            txt += "</dd>";
            txt += "<dd id='helpDeposit' class='inline-block how-to-deposit' data-modal='help/aaaa'>如何存款</dd>";
            txt += "<dd id='helpWithdraw' class='inline-block withdraw-notice' data-modal='help/bbbb'>提款须知</dd>";
            txt += "<dd class='clearfix'></dd>";
            txt += "</dl>";
        $("#accountInfo").html(txt).removeClass("acct-out").addClass("acct-in");
        control.pageMenu("#leftMenu dt,#leftMenu dd,#topMenu li,#afterLoginDeposit,#helpDeposit,#helpWithdraw,#topDeposit,#topWithdraw,#moreActivity");
        // Check User Type
        UI.checkUserType();
    },
    checkUserType: function(){
        if(sessionStorage.getItem("isAgent")!=null&&sessionStorage.getItem("isAgent")*1==0){
            $("[data-modal^='agent']").remove();
        }
    },
    hotGames:function(){
        var reqTime=new Date().getTime();
        TCG.Ajax({url:'lgw/games/popular',headers:{Merchant: globalVar.merchantCode},data:{count:globalVar.hotGameCount}},function(rs){
            var _html='';
            if(rs.length>0){
                var respTime=new Date().getTime();
                for(var i=0;i<rs.length;i++){
                    _html+='<li class="'+rs[i].gameCode+'">';
                    _html+='<span class="box-title"></span>';
                    _html+='<em lott-numero="'+rs[i].gameCode+'" numero="'+rs[i].numero+'"></em>';
                    _html+='<span lott-bet-times="'+rs[i].gameCode+'" bet-times="'+Math.floor((rs[i].remainTime-(respTime-reqTime)/2)/1000)+'" class="time-box"></span>';
                    _html+='<div class="btn hm-btn icon" lott-bet-btn="'+rs[i].gameCode+'" data-lotto="Nl_'+rs[i].gameId+'_'+rs[i].gameCode+'">立即投注</div>';
                    _html+='</li>';
                }
                _html+='<div class="clearfix"></div>';
                $("#hotGameMenus").html(_html);
                UI.lottMenusEvent("div[lott-bet-btn]",false);
                var timer=window.setInterval(control.hotGamesTimer,1000);
                globalVar.lottBetTimer.push(timer);
            }
        });
    },
    refreshHotGames:function(status){
        var reqTime=new Date().getTime();
        TCG.Ajax({url:'lgw/games/popular',headers:{Merchant: globalVar.merchantCode},data:{count:globalVar.hotGameCount}},function(rs){
            if(rs.length>0){
                var respTime=new Date().getTime();
                for(var i=0;i<rs.length;i++){
                    $("em[lott-numero='"+rs[i].gameCode+"']").attr("numero",rs[i].numero);
                    $("span[lott-bet-times='"+rs[i].gameCode+"']").attr("bet-times",Math.floor((rs[i].remainTime-(respTime-reqTime)/2)/1000));
                }
                if(status){
                    $("em[lott-numero]").each(function(a){
                        var lott=$(this).attr("lott-numero");
                        var numero=$("em[lott-numero='"+lott+"']").attr("numero");
                        $("em[lott-numero='"+lott+"']").text("距离"+numero+"期开奖");
                        var bet_times=$("span[lott-bet-times='"+lott+"']").attr("bet-times");
                        $("span[lott-bet-times='"+lott+"']").text(UI.fmtTimeTohhmmss(bet_times*1,"hh:mm:ss"));
                        bet_times--;
                        $("span[lott-bet-times='"+lott+"']").attr("bet-times",bet_times);
                    });
                }
            }
        });
    },
    fmtTimeTohhmmss:function(t,fmt){
        var timeStr='';
        if(!t){t=0;}
        if(fmt=='hh:mm:ss'){
            var ss=Math.floor(t%60);//当前数据%60=剩余秒
            var tm=Math.floor(t/60);//当前数据/60=剩余总分钟
            var mm=Math.floor(tm%60);//剩余总分钟%60=剩余分钟
            var hh=Math.floor(tm/60);//剩余总分钟/60=剩余小时
            if(!ss||ss<0){ss=0;}
            if(!mm||mm<0){mm=0;}
            if(!hh||hh<0){hh=0;}
            timeStr=(hh<10?'0'+hh:hh)+':'+(mm<10?'0'+mm:mm)+':'+(ss<10?'0'+ss:ss);
        }
        if(fmt=='mm:ss'){
            var ss=Math.floor(t%60);//当前数据%60=剩余秒
            var mm=Math.floor(t/60);//当前数据/60=剩余总分钟
            if(!ss||ss<0){ss=0;}
            if(!mm||mm<0){mm=0;}
            timeStr=(mm<10?'0'+mm:mm)+':'+(ss<10?'0'+ss:ss);
        }
        return timeStr;
    },
    lottBetTimes:function(status){
        var reqTime=new Date().getTime();
        TCG.Ajax({url:'lgw/numeros/near',headers:{Merchant: globalVar.merchantCode,Authorization:window.sessionStorage.getItem("token")},data:{gameId:globalVar.currentLottery.gameId}},function(rs){
            if(rs.currentNumero){
                var respTime=new Date().getTime();
                $('span[bet-timer="currNumero"]').attr("numero",rs.currentNumero.numero);
                $('p[bet-timer="bet-times"]').attr("bet-times",Math.floor((rs.currentNumero.remainTime-(respTime-reqTime)/2)/1000));
                $('p[bet-timer="bet-times"]').attr("lock-times",Math.floor(rs.currentNumero.lockTime*1));
                $('span[bet-timer="lastNumero"]').attr("numero",rs.previousNumero.numero);
                $('span[bet-timer="lastNumero"]').text(rs.previousNumero.numero);
                if(status){
                    var timer=window.setInterval(control.betTimer,1000);
                    globalVar.lottBetTimer.push(timer);
                    TCG.Ajax({url:'lgw/draw/'+globalVar.currentLottery.gameId,headers:{Merchant: globalVar.merchantCode,Authorization:window.sessionStorage.getItem("token")},data:{page:0,size:7}},function(data){
                        if(data.content){
                            UI.showDrawNumber(data.content[0].numero,data.content[0].winNo);
                            if(data.content.length>1){
                                for(var i=1;i<data.content.length;i++){
                                    UI.lastDrawResult(data.content[i].numero,data.content[i].winNo,"for");
                                }
                            }
                        }
                    });
                }else{
                    control.betTimer();
                }
            }
        });
    },
    lottMenusEvent:function(selector,status){
        $(document).off("click",selector).on("click",selector,function(){
            if(window.sessionStorage.getItem("isLogin")=='false'){
                TCG.Alert("alerts","您还未登录,请先登录!");
                return;
            }
            var data=$(this).attr("data-lotto");
            var t=data.split("_");
            var groupinfo=window.sessionStorage.getItem(t[2]);
            if(groupinfo==null||groupinfo=='null'||groupinfo==''||groupinfo==undefined){
                TCG.Alert('errors','您目前暂未拥有此游戏的奖金系列，请与您的上级联系!');
                return;
            }
            window.sessionStorage.setItem("currentLottery",data);
            window.location.hash="#lottery";
            UI.loadLotteryPage();
        });
        if(status){
            $(document).off("click","#fungames").on("click","#fungames",function(){
                if(window.sessionStorage.getItem("isLogin")=='false'){
                    TCG.Alert("alerts","您还未登录,请先登录!");
                    return;
                }
                TCG.Alert("alerts","娱乐游戏还在开发中,!");
            });
        }
    },
    showDrawUI:function(){
        var len=0;
        var _html='';
        switch (globalVar.currentLottery.series[0].gameGroup){
            case "SSC":len=5;break;
            case "11X5":len=5;break;
            case "LF":len=3;break;
        }
        for(var i=0;i<len;i++){
            _html+='<li class="ball-rolling"></li>';
        }
        $("#drawResult").html(_html);
    },
    showDrawNumber:function(numero,result){
        var lastNumero=$('span[bet-timer="lastNumero"]').attr("numero");
        if(numero==lastNumero){
            if(result.length==5&&result.indexOf(",")<0){
                var timer1=window.setTimeout(function(){
                    $("#drawResult li:eq(0)").removeClass("ball-rolling");
                    $("#drawResult li:eq(0)").text(result.charAt(0));
                    if(timer1!=null){
                        window.clearTimeout(timer1);
                    }
                },1000);
                var timer2=window.setTimeout(function(){
                    $("#drawResult li:eq(1)").removeClass("ball-rolling");
                    $("#drawResult li:eq(1)").text(result.charAt(1));
                    if(timer2!=null){
                        window.clearTimeout(timer2);
                    }
                },2000);
                var timer3=window.setTimeout(function(){
                    $("#drawResult li:eq(2)").removeClass("ball-rolling");
                    $("#drawResult li:eq(2)").text(result.charAt(2));
                    if(timer3!=null){
                        window.clearTimeout(timer3);
                    }
                },3000);
                var timer4=window.setTimeout(function(){
                    $("#drawResult li:eq(3)").removeClass("ball-rolling");
                    $("#drawResult li:eq(3)").text(result.charAt(3));
                    if(timer4!=null){
                        window.clearTimeout(timer4);
                    }
                },4000);
                var timer5=window.setTimeout(function(){
                    $("#drawResult li:eq(4)").removeClass("ball-rolling");
                    $("#drawResult li:eq(4)").text(result.charAt(4));
                    if(timer5!=null){
                        window.clearTimeout(timer5);
                    }
                },5000);
            }
            if(result.length==3&&result.indexOf(",")<0){
                var timer1=window.setTimeout(function(){
                    $("#drawResult li:eq(0)").removeClass("ball-rolling");
                    $("#drawResult li:eq(0)").text(result.charAt(0));
                    if(timer1!=null){
                        window.clearTimeout(timer1);
                    }
                },1000);
                var timer2=window.setTimeout(function(){
                    $("#drawResult li:eq(1)").removeClass("ball-rolling");
                    $("#drawResult li:eq(1)").text(result.charAt(1));
                    if(timer2!=null){
                        window.clearTimeout(timer2);
                    }
                },2000);
                var timer3=window.setTimeout(function(){
                    $("#drawResult li:eq(2)").removeClass("ball-rolling");
                    $("#drawResult li:eq(2)").text(result.charAt(2));
                    if(timer3!=null){
                        window.clearTimeout(timer3);
                    }
                },3000);
            }
            if(result.length>5&&result.indexOf(",")>0){
                var t=result.split(",");
                var timer1=window.setTimeout(function(){
                    $("#drawResult li:eq(0)").removeClass("ball-rolling");
                    $("#drawResult li:eq(0)").text(t[0]);
                    if(timer1!=null){
                        window.clearTimeout(timer1);
                    }
                },1000);
                var timer2=window.setTimeout(function(){
                    $("#drawResult li:eq(1)").removeClass("ball-rolling");
                    $("#drawResult li:eq(1)").text(t[1]);
                    if(timer2!=null){
                        window.clearTimeout(timer2);
                    }
                },2000);
                var timer3=window.setTimeout(function(){
                    $("#drawResult li:eq(2)").removeClass("ball-rolling");
                    $("#drawResult li:eq(2)").text(t[2]);
                    if(timer3!=null){
                        window.clearTimeout(timer3);
                    }
                },3000);
                var timer4=window.setTimeout(function(){
                    $("#drawResult li:eq(3)").removeClass("ball-rolling");
                    $("#drawResult li:eq(3)").text(t[3]);
                    if(timer4!=null){
                        window.clearTimeout(timer4);
                    }
                },4000);
                var timer5=window.setTimeout(function(){
                    $("#drawResult li:eq(4)").removeClass("ball-rolling");
                    $("#drawResult li:eq(4)").text(t[4]);
                    if(timer5!=null){
                        window.clearTimeout(timer5);
                    }
                },5000);
            }
        }
        UI.lastDrawResult(numero,result);
    },
    getCurrentLottery:function(){
        var _series=[];
        var currentLottery=window.sessionStorage.getItem("currentLottery");
        if(currentLottery==null){return null;}
        var dt=currentLottery.split("_");
        var groupinfo=window.sessionStorage.getItem(dt[2]);
        if(groupinfo==null){return null;}
        var gt=groupinfo.split("_");
        var traditionObj={gameGroupId:gt[1],gameGroup:gt[0],prizeModeId:gt[2],maxSeries:gt[3],minSeries:gt[4],maxBetSeries:gt[5],defaultSeries:gt[6]};
        _series[0]=traditionObj;
        var groupinfozy=window.sessionStorage.getItem(dt[2]+"_ZY");
        if(groupinfozy!=null){
            var gtzy=groupinfozy.split("_");
            var zyObj={gameGroupId:gtzy[1],gameGroup:gtzy[0],prizeModeId:gtzy[2],maxSeries:gtzy[3],minSeries:gtzy[4],maxBetSeries:gtzy[5],defaultSeries:gtzy[6]};
            _series[1]=zyObj;
        }
        return {gameId:dt[1],game:dt[2],series:_series};
    },
    lastDrawResult:function(numero,result,isfor){
        var lastThree=$("#lastThreeDrawResult>li").size();
        var lastSeven=$("#lastSevenDrawResult>li").size();
        var _ball='';
        switch (globalVar.currentLottery.series[0].gameGroup){
            case "SSC":_ball='<li '+(result.charAt(0)*1==6||result.charAt(0)*1==9?'class="sumNumber"':'')+'>'+result.charAt(0)+'</li><li>'+result.charAt(1)+'</li><li>'+result.charAt(2)+'</li><li>'+result.charAt(3)+'</li><li>'+result.charAt(4)+'</li>';break;
            case "11X5":var t=result.split(",");_ball='<li>'+t[0]+'</li><li>'+t[1]+'</li><li>'+t[2]+'</li><li>'+t[3]+'</li><li>'+t[4]+'</li>';break;
            case "LF":_ball='<li>'+result.charAt(0)+'</li><li>'+result.charAt(1)+'</li><li>'+result.charAt(2)+'</li>';break;
        }
        if(lastThree*1>=3&&(!isfor)){
            $("#lastThreeDrawResult>li:last-child").remove();
        }
        if(lastSeven*1>=14){
            $("#lastSevenDrawResult>li:last-child").remove();
            $("#lastSevenDrawResult>li:last-child").remove();
        }
        var lastThreeTxt='<li><div class="alignleft">'+numero+'</div>\
            <div class="alignright">\
            <ul>'+_ball+'</ul>\
            </div>\
            </li>';
        var lastSevenTxt='<li class="draw_date">'+numero+'</li>\
            <li class="draw_winning">\
            <ul>'+_ball+'</ul>\
            </li>';
        if(lastThree*1>0&&(!isfor)){
            $("#lastThreeDrawResult>li:first-child").before(lastThreeTxt);
        }else if(lastThree*1<3){
            $("#lastThreeDrawResult").append(lastThreeTxt);
        }
        if(lastSeven*1>0&&(!isfor)){
            $("#lastSevenDrawResult>li:first-child").before(lastSevenTxt);
        }else{
            $("#lastSevenDrawResult").append(lastSevenTxt);
        }
    },
    loadUserInfo: function(userInfo){
        var account = userInfo.account.split("@"),
            username = account[1];
        $("[data-userInfo='username']").text(username);
        $("[data-userInfo='nickname']").text( userInfo.nickname == null ? "用户尚无昵称" : userInfo.nickname );
    },
    loadWalletList: function(id, walletList, callback){
        var list = "<option value=''>请选择</option>";
        for(var i=0; i<walletList.length; i++){
            if( TCG.Prop(walletList[i].accountName) != "[" +walletList[i].accountName+ "]" ){
                var walletName = TCG.Prop(walletList[i].accountName),
                    selected = walletName == "主钱包" ? "selected=''" : "";
                list += "<option value='" +walletList[i].accountTypeId+ "' " +selected+ ">" +walletName+ "</option>";
            }
        }
        $(id).html(list);
        control.customSelect(id);
        callback();
    },
    loadTransferWalletList: function(walletList){
        var _html = "<option value='' data-walletBalance='' data-walletAccountId=''>请选择钱包</option>";    
        for(var i=0; i<walletList.length; i++){
            if( walletList[i].accountName != "FROZEN_ACCOUNT" ){
                var walletName = TCG.Prop(walletList[i].accountName);
                _html += "<option value='" +walletList[i].accountTypeId+ "' data-walletAccountId='" +walletList[i].accountId+ "' data-walletBalance='" +walletList[i].availBalance+ "'>" +walletName+ "</option>";
            }
        }
        $("#conversionOfFundsForm select").html(_html);
        control.customSelect("#conversionOfFundsForm select");
        control.selectTransferWallet();
        control.getTransferFromBalance();
    },
    loadTransactionDetails: function(result){
        var decimal = 2, list = "";

        for(var i=0; i<result.list.length; i++){
            var dateTime = result.list[i].txTime,
                date = dateTime.slice(0, dateTime.indexOf(" ")),
                time = dateTime.substr(dateTime.indexOf(" ") + 1);
            if( result.list[i].amount < 0 ){
                var amountColor = "tbl-green";
                var balPayment = "支出";
                var amount = result.list[i].amount;
            }else{
                // Filter Transaction Type '6201'; Just to fix the issue of wrong response data of Transaction Type-'6201' of MCS or ACS in Ticket, TCG-1323. Like, FOR REALS.
                var transType = result.list[i].txType;
                if (transType == "6201"){
                    var amountColor = "tbl-green";
                    var balPayment = "支出";
                    var amount = "-" + result.list[i].amount;
                } else {
                    var amountColor = "tbl-red";
                    var balPayment = "收入";
                    var amount = result.list[i].amount;
                }
            }
            list += "<div class='divTableRow'>";
            list += "<div class='divTableCell onel-cl-y ps-cen'>" +result.list[i].txId+ "</div>";
            list += "<div class='divTableCell onel-cl-y ps-cen'>" +TCG.Prop(result.list[i].txType)+ "</div>";
            list += "<div class='divTableCell onel-cl-y ps-cen div-y'>" +balPayment+ "</div>";
            list += "<div class='divTableCell onel-cl-y ps-cen div-z'>" +date+ " <span class='tblDec'>" +time+ "</span></div>";
            list += "<div class='divTableCell onel-cl-y ps-num " +amountColor+ "' data-switchDecimal='" +decimal+ "' data-value='" +amount+ "'>"+ control.customCurrencyFormat( amount, decimal) +"</div>";
            list += "<div class='divTableCell onel-cl-y ps-num' data-switchDecimal='" +decimal+ "' data-value='" +result.list[i].currentBalance+ "'>"+ control.customCurrencyFormat( result.list[i].currentBalance, decimal) +"</div>";
            list += "<div class='divTableCell onel-cl-y ps-cen div-z'>" +TCG.Prop(result.list[i].remark)+ "</div>";
            list += "</div>";           
        }

        $("#changeAccountList").html(list);
    },
    loadPagination: function(type, currentPage, pageTotal, id){

        var offSetButtons = 3;
        var totalButtons = offSetButtons*2;
        var currentPageClass = null,
            _html = [];
        _html.push("<div class='pag-arr-left game-icons pag-bnt'><a href='javascript:void(0)' data-pageNav='prev'>&nbsp;</a></div>");
        var startPage = currentPage <=  pageTotal - totalButtons? currentPage :pageTotal-totalButtons ;
        for (var i= startPage <= 0 ? 1 : startPage; i<=pageTotal; i++) {
            if(i < offSetButtons+currentPage || i>pageTotal-offSetButtons) {
                currentPageClass = currentPage == i ? "active" : "";
                _html.push("<div class='pag-num game-icons pag-bnt " +currentPageClass+ "'><a href='javascript:void(0);' data-pageNo='" +i+ "'>" +i+ "</a></div>") ;

            }else if(i==offSetButtons+currentPage){
                _html.push( "<div class='pag-bnt'>...</div>");
            }
        }
        _html.push("<div class='pag-arr-right game-icons pag-bnt'><a href='javascript:void(0);' data-pageNav='next'>&nbsp;</a></div>") ;

        _html.push("<div class='pag-search-con inline-block'>");
        _html.push( "<input type='text' class='pag-search game-icons' name='inputPageNo'  />");
        _html.push( "<input class='game-icons switch-dete' type='button' name='goToPage' value='确定' />");
        _html.push( "</div>");
        var id = id || "#pagination";
        $(id).html(_html);

        control.pageNav(type, currentPage, pageTotal,id);
        control.clickPageNo(type, currentPage, pageTotal,id);
        control.goToPageNo(type, currentPage, pageTotal,id);
    },
    loadWithdrawalRecords: function(result){
        var _html = "", decimal=2, totalWithdrawAmount = 0;
        if(result.length > 0){
            for(var i=0; i<result.length; i++){
                var remark = result[i].remark == null ? "-" : result[i].remark,
                    dateTime = control.timeToDateFormat(result[i].withdrawDate, "dateTime").split(" "),
                    status = result[i].status;
                if(status == 4){ remark = "-"; }

                _html += "<div class='tableContent-wrp'>";
                _html +="<div class='inline-block tablesC'>" +result[i].refId+ "</div>";
                _html += "<div class='inline-block tablesC' data-value='" +result[i].amount+ "' data-switchDecimal='" +decimal+ "'>"+ control.customCurrencyFormat(result[i].amount,decimal) +"</div>";
                _html += "<div class='inline-block tablesC RemarksData'>" +result[i].bankName+ "</div>";
                _html += "<div class='inline-block tablesC dateData'>" +dateTime[0]+ "<span class='time'>" +dateTime[1]+ "</span></div>";
                _html += "<div class='inline-block tablesC dateData'>" +TCG.Prop("withdrawStatus_"+result[i].status)+ "</div>";
                _html += "<div class='inline-block tablesC'>" +remark+ "</div>";
                _html += "</div>";
                totalWithdrawAmount += result[i].amount;
            }
        }else{
            _html += "<div class='tableContent-wrp'>";
            _html += "<div class='noResult-data no-withdraw-data'>没有查到符合条件的数据！</div>";
            _html += "</div>";           
        }
        $("#withdrawalList").html(_html);
        $("#totalWithdrawAmount").html( control.customCurrencyFormat(totalWithdrawAmount, decimal) ).attr({ "data-value": totalWithdrawAmount, "data-SwitchDecimal": decimal });
    },
    loadDepositRecords: function(result){
        var _html="", decimal=2, totalAmounCredit = 0, totalArrivalFee = 0;

        if(result.length > 0){
            
            for( var i=0; i<result.length; i++ ){
                var transId = result[i].transId;
                
                if(transId == null){ transId = "&ndash;"; }

                _html += "<div class='tableContent-wrp'>";
                _html += "<div class='inline-block tablesC'>" +transId+ "</div>";
                _html += "<div class='inline-block tablesC'>" +TCG.Prop("depositMode_"+result[i].depositMode)+ "</div>";
                _html += "<div class='inline-block tablesC' data-switchDecimal='" +decimal+ "' data-value='" +result[i].requestedAmount+ "'>" +control.customCurrencyFormat(result[i].requestedAmount, decimal)+ "</div>";
                _html += "<div class='inline-block tablesC' data-switchDecimal='" +decimal+ "' data-value='" +result[i].amount+ "'>" +control.customCurrencyFormat(result[i].amount, decimal)+ "</div>";
                _html += "<div class='inline-block tablesC' data-switchDecimal='" +decimal+ "' data-value='" +result[i].reimbursementAmount+ "'>" +control.customCurrencyFormat(result[i].reimbursementAmount, decimal)+ "</div>";
                _html += "<div class='inline-block tablesC RemarksData'>" +result[i].refId+ "</div>"; // <span class='hover-data hide'>1234567878645 | 132145465465</span>
                _html += "<div class='inline-block tablesC dateData'>" +UI.convertEpochToLocaldate(result[i].depositDate)+ "</div>";
                _html += "<div class='inline-block tablesC dateData'>" +UI.convertEpochToLocaldate(result[i].actualDepositDate)+ "</div>";
                _html += "<div class='inline-block tablesC'>" + TCG.Prop("depositType_"+result[i].state)+ "</div>";
                _html += "</div>";

                totalAmounCredit+=result[i].amount;
                totalArrivalFee+=result[i].reimbursementAmount;
            }
        }else{
            _html += "<div class='align-center no-deposit-data'>没有查到符合条件的数据！</div>";
        }
        $("#depositRecordsList").html(_html);

        $("#totalAmountCredit").html( control.customCurrencyFormat(totalAmounCredit, decimal) ).attr({ "data-switchDecimal": decimal, "data-value": totalAmounCredit });
        $("#totalArrivalFee").html( control.customCurrencyFormat(totalArrivalFee, decimal) ).attr({ "data-switchDecimal": decimal, "data-value": totalArrivalFee });
        $("#bankCardList").html(_html);
    },
    convertEpochToLocaldate: function(epochTime, format){
        if(format == null){ format = 'dateTime'; }

        switch(format){
            case "dateTime":
                if(epochTime){
                    var utcSeconds = epochTime;
                    var d = new Date(epochTime),
                        yr =  d.getFullYear(),
                        mn = d.getMonth() + 1,
                        mn = (mn < 10 ) ? ("0" + mn) : mn
                        dy = (d.getDate() < 10 ) ? ("0" + d.getDate()) : d.getDate(),
                        d2 =  yr + "-" + mn + "-" + dy,
                        
                        h = (d.getHours() < 10 ) ? ("0" + d.getHours()) : d.getHours(),
                        m = (d.getMinutes() < 10 ) ? ("0" + d.getMinutes()) : d.getMinutes(),
                        s = (d.getSeconds() < 10 ) ? ("0" + d.getSeconds()) : d.getSeconds(),
                        tm = h + ":" + m + ":" + s;

                        d = d2 + "<span class='time'>" + tm + "</span>";
                    return d;
                } else if(epochTime == null){
                    return "&ndash;";
                }
                break;

            case "date":
                if(epochTime){
                    var utcSeconds = epochTime;
                    var d = new Date(epochTime),
                        yr =  d.getFullYear(),
                        mn = d.getMonth() + 1,
                        mn = (mn < 10 ) ? ("0" + mn) : mn
                        dy = (d.getDate() < 10 ) ? ("0" + d.getDate()) : d.getDate(),
                        d2 =  yr + "-" + mn + "-" + dy;
                    return d2;
                } else if(epochTime == null){
                    return "&ndash;";
                }
                break;
            default:
        }

        if(epochTime){
            var utcSeconds = epochTime;
            var d = new Date(epochTime),
                yr =  d.getFullYear(),
                mn = d.getMonth() + 1,
                mn = (mn < 10 ) ? ("0" + mn) : mn
                dy = (d.getDate() < 10 ) ? ("0" + d.getDate()) : d.getDate(),
                d2 =  yr + "-" + mn + "-" + dy,
                
                h = (d.getHours() < 10 ) ? ("0" + d.getHours()) : d.getHours(),
                m = (d.getMinutes() < 10 ) ? ("0" + d.getMinutes()) : d.getMinutes(),
                s = (d.getSeconds() < 10 ) ? ("0" + d.getSeconds()) : d.getSeconds(),
                tm = h + ":" + m + ":" + s;

                d = d2 + "<span class='time'>" + tm + "</span>";
            return d;
        } else if(epochTime == null){
            return "&ndash;";
        }
    },
    loadNorecordChase: function(result){
        var decimal = 2,
            orders = result.orders.content,
            _html = "";
                        
        for( var i=0; i<orders.length; i++ ){
            _html += "<div class='divTableRow'>";
            _html += "<div class='divTableCell onel-cl-y ps-cen openItem' data-orderId='" +orders[i].orderDetailId+ "'>" +orders[i].orderNumber+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen'>" +orders[i].gameCode+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen'>" +orders[i].numero+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen'>-</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen div-y'>" +orders[i].chasingPhase+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen div-y'>-</div>";
            _html += "<div class='divTableCell onel-cl-y ps-num' data-switchDecimal='" +decimal+ "' data-value='" +orders[i].actualBettingAmount+ "'>"+ control.customCurrencyFormat(orders[i].actualBettingAmount, decimal) +"</div>";
            var winningAmount = orders[i].winningAmount == null ? 0 : orders[i].winningAmount,
                winningAmountColor = winningAmount >= 0 ? "tbl-red" : "tbl-green";
            _html += "<div class='divTableCell onel-cl-y ps-num " +winningAmountColor+ "' data-switchDecimal='" +decimal+ "' data-value='" +winningAmount+ "'>"+ control.customCurrencyFormat(winningAmount, decimal) +"</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen div-x " +winningAmountColor+ "'>" +TCG.Prop("orderStatus_"+orders[i].orderStatus)+ "</div>";
            _html += "</div>";
        }

        $("#norecordChaseList").html(_html);
    },    
    loadNoRecordChaseItem: function(result){
        var decimal = 2;
        $("#itemWrapper .prsnl-game-name").html("<span id='rm_"+result.gameCode+ "'>&nbsp;</span>");
        $("#itemWrapper .orderNo").text(result.orderNumber);
        $("#itemWrapper .seriesModel").text(result.series + "/" + TCG.Prop("bettingMode_"+result.bettingModeCode) );
        $("#itemWrapper .prizeMoney").html( result.winningAmount == null ? "-" : control.customCurrencyFormat(result.winningAmount,decimal) );
        $("#itemWrapper .bettingNoteCount").text( result.stakes );
        $("#itemWrapper .bettingMultiples").html( control.currencyFormat(result.multiple) );
        $("#itemWrapper .bettingTime").text( control.timeToDateFormat(result.bettingTime, "dateTime") );
        $("#itemWrapper .orderStatus").text(TCG.Prop("orderStatus_"+result.orderStatus) );
        $("#itemWrapper .bettingOnNumber").text(result.numero);
        $("#itemWrapper .lotteryNumbers").text( result.winningNumber == null ? "-" : result.winningNumber );
        $("#itemWrapper .winningstop").text("N/A");
        $("#itemWrapper .plan_bet_amount").text("N/A");
        $("#itemWrapper .abonding").text("N/A");
        $("#itemWrapper .actual_bet_amount").text("N/A");

        var orderInfos=result.orderInfos, tab1_html = "", tab2_html = "";

        for(var i=0; i<orderInfos.length; i++){
            tab1_html += "<div class='divTableRow'>";
            tab1_html += "<div class='divTableCell onel-cl-y ps-cen'>" +TCG.Prop(orderInfos[i].playCode)+ "</div>";
            tab1_html += "<div class='divTableCell onel-cl-y ps-cen yel-pop'>" +orderInfos[i].bettingContent.replace(/\,+/,"")+ "<div class='pop-yellow'><div>"+ orderInfos[i].first;
            tab1_html += orderInfos[i].second != null ? " | "+ orderInfos[i].second : "";
            tab1_html += orderInfos[i].third != null ? " | " +orderInfos[i].third + "</div>" : "";
            tab1_html += orderInfos[i].fourth != null ? "<div>" +orderInfos[i].fourth : "";
            tab1_html += orderInfos[i].fifth != null ? " | " +orderInfos[i].fifth : "";
            tab1_html += "</div></div></div>";           
            tab1_html += "<div class='divTableCell onel-cl-y ps-cen'>" +orderInfos[i].stakes+ "</div>";          
            tab1_html += "<div class='divTableCell onel-cl-y ps-num' data-switchDecimal='" +decimal+ "' data-value='" +orderInfos[i].bettingAmount+ "'>"+ control.customCurrencyFormat(orderInfos[i].bettingAmount, decimal) +"</div>";
            tab1_html += "</div>";

            tab2_html += "<div class='divTableRow'>"
            tab2_html += "<div class='divTableCell onel-cl-y ps-cen ps-chkd div-x'>";
            tab2_html += "<input type='checkbox' name='test' value='a' checked='' />";
            tab2_html += "<label></label>";
            tab2_html += "</div>";
            tab2_html += "<div class='divTableCell onel-cl-y ps-cen'>101016864</div>";
            tab2_html += "<div class='divTableCell onel-cl-y ps-cen'>0123456789...</div>";
            tab2_html += "<div class='divTableCell onel-cl-y ps-cen div-x'>已中奖</div>";
            tab2_html += "<div class='divTableCell onel-cl-y ps-cen div-x'>20</div>";
            tab2_html += "<div class='divTableCell onel-cl-y ps-num'> 99,222,000.<span class='tblDec'>00</span></div>";
            tab2_html += "<div class='divTableCell onel-cl-y ps-num tbl-red'> 99,222,000.<span class='tblDec'>00</span></div>";
            tab2_html += "</div>";            
        }

        $("#itemWrapper .tab1Content .itemList").html(tab1_html);  
        $("#itemWrapper .tab2Content .itemList").html(tab2_html);  
    },
    loadLottoPersonalPnlStatements: function(result){
        var decimal = 2,
            list = result.list,
            _html = "",
            _total = "";

        for(var i=0; i<list.length; i++){
            if( i+1 != list.length ){
                _html += "<div class='divTableRow clearfix'>";
                _html += "<div class='divTableCell ps-strings'>" +list[i].balanceDate+ "</div>";
                _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].deposit+ "'>" +control.customCurrencyFormat(list[i].deposit, decimal)+ "</div>";
                _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].withdraw+ "'>" +control.customCurrencyFormat(list[i].withdraw, decimal)+ "</div>";
                _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].lottGameBetting+ "'>" +control.customCurrencyFormat(list[i].lottGameBetting, decimal)+ "</div>";
                _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].lottGameRebate+ "'>" +control.customCurrencyFormat(list[i].lottGameRebate, decimal)+ "</div>";
                _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].lottGameWinning+ "'>" +control.customCurrencyFormat(list[i].lottGameWinning, decimal)+ "</div>";
                _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].lottPromotion+ "'>" +control.customCurrencyFormat(list[i].lottPromotion, decimal)+ "</div>";
                var profitLossColor = list[i].profitLoss >= 0 ? "tbl-red" : "tbl-green";
                _html += "<div class='divTableCell ps-num " +profitLossColor+ "' data-switchDecimal='" +decimal+ "' data-value='" +list[i].profitLoss+ "'>" +control.customCurrencyFormat(list[i].profitLoss, decimal)+ "</div>"; //<div class="divTableCell ps-num ">-0.50</div>
                _html += "</div>";
            }else{
                _total += "<span class='tbl-total-lbl span-tr inline-block'>合计:</span>";
                _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='" +list[i].deposit+ "'>" +control.customCurrencyFormat(list[i].deposit, decimal)+ "</span>";
                _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='" +list[i].withdraw+ "'>" +control.customCurrencyFormat(list[i].withdraw, decimal)+ "</span>";
                _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='" +list[i].lottGameBetting+ "'>" +control.customCurrencyFormat(list[i].lottGameBetting, decimal)+ "</span>";
                _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='" +list[i].lottGameRebate+ "'>" +control.customCurrencyFormat(list[i].lottGameRebate, decimal)+ "</span>";
                _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='" +list[i].lottGameWinning+ "'>" +control.customCurrencyFormat(list[i].lottGameWinning, decimal)+ "</span>";
                _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='" +list[i].lottPromotion+ "'>" +control.customCurrencyFormat(list[i].lottPromotion, decimal)+ "</span>";
                var totalProfitLossColor = list[i].profitLoss >= 0 ? "tbl-red" : "tbl-green";
                _total += "<span class='tbl-total-amt span-tr inline-block " +totalProfitLossColor+ "' data-switchDecimal='" +decimal+ "' data-value='" +list[i].profitLoss+ "'>" +control.customCurrencyFormat(list[i].profitLoss, decimal)+ "</span>";
            }
        }
        $("#lottoPersonalPnlList").html(_html);
        $("#lottoPersonalPnlTotal").html(_total);
    },    
    loadPvpPersonalPnlStatements: function(result){
        var decimal = 2,
            _html = "",
            _total = "";

        _html += "<div class='divTableRow clearfix'>";
        _html += "<div class='divTableCell ps-strings'>2016-12-16</div>";
        _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='99999'>" +control.customCurrencyFormat(99999, decimal)+ "</div>";
        _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='99999'>" +control.customCurrencyFormat(99999, decimal)+ "</div>";
        _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='99999'>" +control.customCurrencyFormat(99999, decimal)+ "</div>";
        _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='99999'>" +control.customCurrencyFormat(99999, decimal)+ "</div>";
        _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='99999'>" +control.customCurrencyFormat(99999, decimal)+ "</div>";
        _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='99999'>" +control.customCurrencyFormat(99999, decimal)+ "</div>";
        var profitLossColor = 99999 >= 0 ? "tbl-red" : "tbl-green";
        _html += "<div class='divTableCell ps-num " +profitLossColor+ "' data-switchDecimal='" +decimal+ "' data-value='99999'>" +control.customCurrencyFormat(99999, decimal)+ "</div>"; 
        _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='99999'>" +control.customCurrencyFormat(99999, decimal)+ "</div>";
        var profitLossColor = 99999 >= 0 ? "tbl-red" : "tbl-green";
        _html += "<div class='divTableCell ps-num " +profitLossColor+ "' data-switchDecimal='" +decimal+ "' data-value='99999'>" +control.customCurrencyFormat(99999, decimal)+ "</div>"; 
        _html += "</div>";

        $("#pvpPersonalPnlList").html(_html);

        _total += "<span class='tbl-total-lbl span-tr inline-block'>合计:</span>";
        _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='99999'>" +control.customCurrencyFormat(999999, decimal)+ "</span>";
        _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='999999'>" +control.customCurrencyFormat(999999, decimal)+ "</span>";
        _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='999999'>" +control.customCurrencyFormat(999999, decimal)+ "</span>";
        var profitLossColor = 999999 >= 0 ? "tbl-red" : "tbl-green";
        _total += "<span class='tbl-total-amt span-tr inline-block " +profitLossColor+ "' data-switchDecimal='" +decimal+ "' data-value='999999'>" +control.customCurrencyFormat(999999, decimal)+ "</span>";
        _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='999999'>" +control.customCurrencyFormat(999999, decimal)+ "</span>";
        _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='999999'>" +control.customCurrencyFormat(999999, decimal)+ "</span>";
        var profitLossColor = 999999 >= 0 ? "tbl-red" : "tbl-green";
        _total += "<span class='tbl-total-amt span-tr inline-block " +profitLossColor+ "' data-switchDecimal='" +decimal+ "' data-value='999999'>" +control.customCurrencyFormat(999999, decimal)+ "</span>";
        _total += "<span class='tbl-total-amt span-tr inline-block' data-switchDecimal='" +decimal+ "' data-value='999999'>" +control.customCurrencyFormat(999999, decimal)+ "</span>";
        var profitLossColor = 999999 >= 0 ? "tbl-red" : "tbl-green";
        _total += "<span class='tbl-total-amt span-tr inline-block " +profitLossColor+ "' data-switchDecimal='" +decimal+ "' data-value='999999'>" +control.customCurrencyFormat(999999, decimal)+ "</span>";

        $("#pvpPersonalPnlTotal").html(_total);
    },
    loadLottoGameHistory: function(result){
        var _html = "", decimal = 2, orders = result.orders.content;
        for( var i=0; i<orders.length; i++ ){
            _html += "<div class='divTableRow'>";
            _html += "<div class='divTableCell onel-cl-y ps-cen width-adjustment-104'>" +TCG.Prop("gameName_"+orders[i].gameCode)+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen ps-strings'><span class='openItem tbl-link' data-orderId='" +orders[i].orderDetailId+ "'>" +orders[i].orderNumber+ "</span></div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen width-adjustment-128'>" +control.timeToDateFormat(orders[i].bettingTime, "MonthDateTime")+ "</div>"; //<span class='tblDec'>00:21:23</span></div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen'>" +orders[i].numero+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen div-y'>" +TCG.Prop("bettingMode_"+orders[i].bettingModeCode)+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen div-y'>" +orders[i].chasingPhase+ "</div>";
            _html += "<div class='divTableCell onel-cl-y' data-switchDecimal='" +decimal+ "' data-value='" +orders[i].planBettingAmount+ "'>"+ control.customCurrencyFormat(orders[i].planBettingAmount, decimal) +"</div>";
            _html += "<div class='divTableCell onel-cl-y width-adjustment-80' data-switchDecimal='" +decimal+ "' data-value='" +orders[i].actualBettingAmount+ "'>"+ control.customCurrencyFormat(orders[i].actualBettingAmount, decimal) +"</div>";
            if( orders[i].winningAmount == null ){
                _html += "<div class='divTableCell onel-cl-y tbl-red width-adjustment-75 text-right'>-</div>";
            }else{
                _html += "<div class='divTableCell onel-cl-y tbl-red width-adjustment-75 text-right' data-switchDecimal='" +decimal+ "' data-value='" +orders[i].winningAmount+ "'>"+ control.customCurrencyFormat(orders[i].winningAmount, decimal) +"</div>";
            }
            _html += "<div class='divTableCell onel-cl-y ps-cen div-z'>" +TCG.Prop("orderStatus_"+orders[i].orderStatus)+ "</div>";
            _html += "</div>";
        }

        $("#lottoGameHistoryList").html(_html);
        control.viewLottoGameHistoryItem();

        var total = result.orderSumTO, _total="";
        _total += "<div class='tbl-total-con inline-block'>计划投注金额合计:</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchDecimal='" +decimal+ "' data-value='" +total.sumPlanBettingAmt+ "'>" +control.customCurrencyFormat(total.sumPlanBettingAmt, decimal)+ "</div>";
        _total += "<div class='tbl-total-con inline-block'>有效投注金额合计:</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchDecimal='" +decimal+ "' data-value='" +total.sumActualBettingAmt+ "'>" +control.customCurrencyFormat(total.sumActualBettingAmt, decimal)+ "</div>";
        _total += "<div class='tbl-total-con inline-block'>中奖金额合计:</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchDecimal='" +decimal+ "' data-value='" +total.sumWinningAmt+ "'>" +control.customCurrencyFormat(total.sumWinningAmt, decimal)+ "</div>";
        $("#lottoGameHistoryTotal").html(_total);
    },
    loadLottoGameHistoryItem: function(result){
        var decimal = 2;
        $("#itemWrapper .prsnl-game-name").html("<span id='rm_"+result.gameCode+ "'>&nbsp;</span>");
        $("#itemWrapper .orderNo").text(result.orderNumber);
        $("#itemWrapper .seriesModel").text(result.series + "/" + TCG.Prop("bettingMode_"+result.bettingModeCode) );
        $("#itemWrapper .prizeMoney").html( result.winningAmount == null ? "-" : control.customCurrencyFormat(result.winningAmount,decimal) );
        $("#itemWrapper .bettingNoteCount").text( result.stakes );
        $("#itemWrapper .bettingMultiples").html( control.currencyFormat(result.multiple) );
        $("#itemWrapper .bettingTime").text( control.timeToDateFormat(result.bettingTime, "dateTime") );
        $("#itemWrapper .orderStatus").text(TCG.Prop("orderStatus_"+result.orderStatus) );
        $("#itemWrapper .bettingOnNumber").text(result.numero);
        $("#itemWrapper .lotteryNumbers").text( result.winningNumber == null ? "-" : result.winningNumber );

        var orderInfos=result.orderInfos, _html = "";

        for(var i=0; i<orderInfos.length; i++){
            _html += "<div class='divTableRow'>";
            _html += "<div class='divTableCell onel-cl-y ps-cen'>" +TCG.Prop(orderInfos[i].playCode)+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen yel-pop'>" +orderInfos[i].bettingContent.replace(/\,+/,"")+ "<div class='pop-yellow'><div>"+ orderInfos[i].first;
            _html += orderInfos[i].second != null ? " | "+ orderInfos[i].second : "";
            _html += orderInfos[i].third != null ? " | " +orderInfos[i].third + "</div>" : "";
            _html += orderInfos[i].fourth != null ? "<div>" +orderInfos[i].fourth : "";
            _html += orderInfos[i].fifth != null ? " | " +orderInfos[i].fifth : "";
            _html += "</div></div></div>";           
            _html += "<div class='divTableCell onel-cl-y ps-cen'>" +orderInfos[i].stakes+ "</div>";          
            _html += "<div class='divTableCell onel-cl-y ps-cen' data-switchDecimal='" +decimal+ "' data-value='" +orderInfos[i].bettingAmount+ "'>"+ control.customCurrencyFormat(orderInfos[i].bettingAmount, decimal) +"</div>";
            _html += "</div>";
        }

        if( result.orderStatus == 2 ){
            $("#cancelGameHistoryDetail").parent().show();
        }else{
            $("#cancelGameHistoryDetail").parent().hide();            
        }

        $("#itemList").html(_html);  
        control.goBackToGameHistory();
    },
    loadPvpGameHistory: function(result, gameType){
        var _html = "", _total = "", decimal = 2, orders = result.list, total = result.footer;
        for( var i=0; i<orders.length; i++ ){
            _html += "<div class='divTableRow'>";
            _html += "<div class='divTableCell onel-cl-y ps-cen'>" +orders[i].gameType+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen'>" +orders[i].gameName+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen' data-switchDecimal='" +decimal+ "' data-value='" +orders[i].gameLoses+ "'>" +control.customCurrencyFormat(orders[i].gameLoses, decimal)+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen' data-switchDecimal='" +decimal+ "' data-value='" +orders[i].gameWinnings+ "'>" +control.customCurrencyFormat(orders[i].gameWinnings, decimal)+ "</div>";
            _html += "<div class='divTableCell onel-cl-y ps-cen' data-switchDecimal='" +decimal+ "' data-value='" +orders[i].netProfit+ "'>" +control.customCurrencyFormat(orders[i].netProfit, decimal)+ "</div>";
            _html += "</div>";
        }
        $("#pvpGameHistoryTable .betLost").text( gameType == 0 ? "净输金额" : "投注金额" );
        $("#pvpGameHistoryTable .prizeWon").text( gameType == 0 ? "净赢金额" : "中奖金额" );
        $("#pvpGameHistoryList").html(_html);

        var total_bet_loss = orders.length == 0 ? 0 : total.gameLoses,
            total_prize_winning = orders.length == 0 ? 0 : total.gameWinnings,
            bet_loss_label = gameType == 0 ? "净输金额合计" : "有效投注金额合计",
            prize_winning_label = gameType == 0 ? "净赢金额合计" : "中奖金额合计";
        _total += "<div class='tbl-total-con inline-block'>" +bet_loss_label+ ":</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchDecimal='" +decimal+ "' data-value='" +total_bet_loss+ "'>" +control.customCurrencyFormat(total_bet_loss, decimal)+ "</div>";
        _total += "<div class='tbl-total-con inline-block'>" +prize_winning_label+ ":</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchDecimal='" +decimal+ "' data-value='" +total_prize_winning+ "'>" +control.customCurrencyFormat(total_prize_winning, decimal)+ "</div>";
        $("#pvpGameHistoryTotal").html(_total);        
    },
    loadCustomerSeries: function(data){
        for(var i=0; i<data.length; i++){
            var maxBetSeries = data[i].maxBetSeries,
                maxSeries = data[i].maxSeries;
            switch(data[i].gameGroupCode){
                case "SSC":
                    // SSC 1
                    if( data[i].prizeModeId == 1 ){
                        $("#tab-content1 .max-series").text( maxSeries );
                        var arr = [100000, 20000, 200, 20, 100000, 10000, 1000, 100, 10, 10000, 10000, 1000, 100, 10, 10000, 10000, 1000, 100, 10, 1000, 333.33333, 166.66667, 1000, 100, 10, 1000, 1000, 333.33333, 166.66667, 1000, 333.33333, 166.66667, 1000, 100, 10, 1000, 1000, 333.33333, 166.66667, 1000, 333.33333, 166.66667, 1000, 100, 10, 1000, 1000, 333.33333, 166.66667, 100, 50, 100, 10, 100, 100, 50, 100, 10, 100, 10, 10, 3.69, 18.5185, 1000, 333.33333, 166.6667, 1000, 333.33333, 166.6667, 3.69, 18.5185, 1000, 333.33333, 166.6667, 1000, 333.33333, 166.6667, 3.69, 18.5185, 1000, 333.33333, 166.6667, 1000, 333.33333, 166.6667, 5.2632, 100, 50, 5.2632, 100, 50, 4, 4, 10, 100, 1000, 10000];
                        UI.computeRebate("SSC1", arr, maxSeries, maxBetSeries);
                    // SSC 2
                    }else{
                        $("#tab-content2 .max-series").text( maxSeries );
                        var arr = [10000, 10000, 1000, 100, 10, 10000, 10000, 1000, 100, 10, 1000, 333.33333, 166.66667, 1000, 100, 10, 1000, 1000, 333.33333, 166.66667, 1000, 333.33333, 166.66667, 1000, 100, 10, 1000, 1000, 333.33333, 166.66667, 1000, 333.33333, 166.66667, 1000, 100, 10, 1000, 1000, 333.33333, 166.66667, 100, 50, 100, 10, 100, 100, 50, 100, 10, 100, 10, 10, 3.69, 18.5185, 1000, 333.33333, 166.6667, 1000, 333.33333, 166.6667, 3.69, 18.5185, 1000, 333.33333, 166.6667, 1000, 333.33333, 166.6667, 3.69, 18.5185, 1000, 333.33333, 166.6667, 1000, 333.33333, 166.6667, 5.2632, 100, 50, 5.2632, 100, 50, 4, 4, 10, 100, 1000, 10000];
                        UI.computeRebate("SSC2", arr, maxSeries, maxBetSeries);
                    }
                    break;
                case "11X5":
                    $("#tab-content3 .max-series").text( maxSeries );
                    var arr = [2.2, 5.5, 16.5, 66, 462, 77, 22, 8.25, 5.5, 16.5, 66, 462, 77, 22, 8.25, 462, 77, 15.4, 6.16, 3.08, 2.31, 16.5, 7.3333, 5.1333, 4.62, 990, 165, 110, 55, 3.66666, 11];
                    UI.computeRebate("11X5", arr, maxSeries, maxBetSeries);
                    break;
                case "LF":
                    // 3D
                    $("#tab-content4 .max-series").text( maxSeries );
                    var arr = [1000, 1000, 333.3333, 166.6666, 333.3333, 166.6666, 333.3333, 166.6666, 100, 50, 100, 50, 3.69, 18.52, 35.7, 4, 4, 10];
                    UI.computeRebate("3D", arr, maxSeries, maxBetSeries);

                    // P3P5           
                    $("#tab-content5 .max-series").text( maxSeries );
                    var arr = [1000, 1000, 333.3333, 166.6666, 333.3333, 166.6666, 333.3333, 166.6666, 3.69, 18.52, 35.7, 100, 50, 100, 50, 100, 50, 4, 4, 4, 10, 10];
                    UI.computeRebate("P3P5", arr, maxSeries, maxBetSeries);
                    break;
            }
        }
    },
    computeRebate: function(type, arr, maxSeries, maxBetSeries){
        switch(type){
            case "SSC1":
                var isLower = maxSeries > maxBetSeries ? maxBetSeries : maxSeries, col_b = (maxSeries-maxBetSeries)/20;
                for(var i=0; i<arr.length; i++){
                    var n = i+1,
                        col_a = (isLower*arr[i])/1000;                        
                    $("#tab-content1 .trow-" +n+ " .col-a").html( control.customCurrencyFormat(col_a,2));
                    $("#tab-content1 .trow-" +n+ " .col-b").html( control.customCurrencyFormat(col_b,2) + "%");
                }            
                break;
            case "SSC2":
                var isLower = maxSeries > maxBetSeries ? maxBetSeries : maxSeries, col_a1 = isLower * 0.9, col_a2 = isLower * 0.75, col_b = (maxSeries-maxBetSeries)/20;
                for( var i=0; i<arr.length; i++ ){
                    var n = i+1,
                        col_a = (isLower*arr[i])/1000;                        
                    $("#tab-content2 .trow-" +n+ " .col-a").html( control.customCurrencyFormat(col_a,2) );
                    $("#tab-content2 .trow-" +n+ " .col-a1").html( control.customCurrencyFormat(col_a1,2) );
                    $("#tab-content2 .trow-" +n+ " .col-a2").html( control.customCurrencyFormat(col_a2,2) );
                    $("#tab-content2 .trow-" +n+ " .col-b").html( control.customCurrencyFormat(col_b,2) + "%" );
                }            
                break;
            case "11X5":
                var isLower = maxSeries > maxBetSeries ? maxBetSeries : maxSeries, col_b = (maxSeries-maxBetSeries)/20;
                for(var i=0; i<arr.length; i++){
                    var n = i+1,
                        col_a = (isLower*arr[i])/1000;                        
                    $("#tab-content3 .trow-" +n+ " .col-a").html( control.customCurrencyFormat(col_a,2) );
                    $("#tab-content3 .trow-" +n+ " .col-b").html( control.customCurrencyFormat(col_b,2) + "%" );
                }                            
                break;
            case "3D":
                var isLower = maxSeries > maxBetSeries ? maxBetSeries : maxSeries, col_b = (maxSeries-maxBetSeries)/20;
                for(var i=0; i<arr.length; i++){
                    var n = i+1,
                        col_a = (isLower*arr[i])/1000;                        
                    $("#tab-content4 .trow-" +n+ " .col-a").html( control.customCurrencyFormat(col_a,2) );
                    $("#tab-content4 .trow-" +n+ " .col-b").html( control.customCurrencyFormat(col_b,2) + "%" );            
                }
                break;
            case "P3P5":
                var isLower = maxSeries > maxBetSeries ? maxBetSeries : maxSeries, col_b = (maxSeries-maxBetSeries)/20;
                for(var i=0; i<arr.length; i++){
                    var n = i+1,
                        col_a = (isLower*arr[i])/1000;                        
                    $("#tab-content5 .trow-" +n+ " .col-a").html( control.customCurrencyFormat(col_a,2) );
                    $("#tab-content5 .trow-" +n+ " .col-b").html( control.customCurrencyFormat(col_b,2) + "%" );            
                }
                break;
        }
    },
    loadAgentDownlines: function(result){
        //  Declare
        var _html = [],
            registerAmount = 0;
        var TYPE = ["会员", "代理"],
            STATUS = ["关闭", "正常", "过期"];

        //  Show result
        for(var i = 0; i < result.List.length; i++){
            var entry = result.List[i];

            registerAmount += entry.affiliateCount;
            _html.push('<div class="divTableRow border-bot clearfix">');
            _html.push('<div class="divTableCell yel-con-2">' + UI.shortenPathName(entry.path) + '</div>');
            _html.push('<div class="divTableCell div-x tbl-link ico-file">' + UI.beautifyAffiliateUrl(entry.code) + '</div>');
            _html.push('<div class="divTableCell div-z tbl-link registerCount">'+ entry.affiliateCount + '</div>');
            _html.push('<div class="divTableCell div-y">'+ TYPE[entry.type] + '</div>');
            _html.push('<div class="divTableCell div-y">'+ STATUS[entry.status] + '</div>');
            _html.push('<div class="divTableCell">'+ entry.startDate + '</div>');
            _html.push('<div class="divTableCell">'+ (entry.endDate != null? entry.endDate : '永久有效') + '</div>');
            _html.push('<div class="divTableCell div-y"><div class="tbl-gear game-icons"><ul class="dropdown-opts hide"><span class="arrow-up"></span><li class="affiliateUrlDetail">详情</li><li class="affiliateUrlDelete">删除</li></ul></div></div>');
            _html.push('<div style="display:none;" class="entry">' + JSON.stringify(entry) + '</div>');
            _html.push('</div>');
        }
        $("#linkManagerList").html(_html.join(""));
        $("#linkManagerForm #totalEffectiveAmount").text(registerAmount);

        //  Copy url
        ZeroClipboard.config( { moviePath: window.location.origin + "./js/lib/ZeroClipboard.swf" } );
        var client = new ZeroClipboard($(".zeroclipboard"));
    },
    generateAffiliateUrl: function(code){
        var url = "";
        var hostname = "";

        hostname = code + window.location.hostname.replace("www", "");
        url += window.location.protocol + "//";
        url += hostname;
        url += window.location.port == "80" ? "/" : ":" + window.location.port + "/";
        url += "register.html";

        return {hostname:hostname, url: url};
    },
    beautifyAffiliateUrl: function(code){
        var data = UI.generateAffiliateUrl(code);
        return '<span class="zeroclipboard" data-clipboard-text="' + data.url + '">' + data.hostname + '</span>';
    },
    shortenPathName: function(channelName){
        var cn = channelName;
        if(cn.length > 4){
            cn = cn.substring(0,4)+"...";
            cn += '<div class="pop-yel-2"><span>'+channelName+'</span></div>';
        }
        return cn;
    },
    loadMemberManagement: function(result){
        var memberList = result;
        var list = "",
            decimal = 2;
        if(memberList!=null) {
            memberList.forEach(function(entry) {
                var lastLoginTime = entry.lastLogin == null? new Date(): entry.lastLogin.time;
                var registerDate = entry.registerDate == null? new Date(): entry.registerDate.time;
                var status = entry.activeFlag == 0 ? '禁用'
                    : entry.activeFlag == 1 ? '正常'
                    : entry.activeFlag == 2 ? '禁用'
                    : entry.activeFlag == 5 ? '禁用'
                    : entry.activeFlag == 6 ? '禁用'
                    : entry.activeFlag == 7 ? '删号'
                    : "N/A";
                var super6Rebate = entry.super6Rebate  == 0  ? "-" : entry.super6Rebate;
                var sscRebate = entry.sscRebate == 0 ? "-" : entry.sscRebate;
                var accountBal =  control.customCurrencyFormat( entry.accountBalance, decimal);
                list += '<div class="divTableRow border-bot clearfix">';
                list += '<div id="showdetail" class="divTableCell div-x tbl-link" data-downline='+entry.customerId+'>'+entry.customerName+'</div>';
                list += '<div class="divTableCell ">'+(entry.type == 1?'代理':'会员') +'</div>';
                list += '<div class="divTableCell ">'+ entry.teamSize +'</div>';
                list += '<div class="divTableCell div-z">'+ control.formatDateFull(registerDate * 1, 'yyyy-MM-dd hh:mm') +'</div>';
                list += '<div class="divTableCell div-x">' + control.days_between(new Date(),new Date(lastLoginTime * 1) ) + '</div>';
                list += '<div class="divTableCell ">'+ sscRebate +'</div>';
                list += '<div class="divTableCell ">'+ super6Rebate +'</div>';
                // list += '<div class="divTableCell ">'+ status  +'</div>';
                list += '<div class="divTableCell div-x ps-num" data-switchDecimal="' +decimal+ '"  data-value="'+ entry.accountBalance.toFixed(2)+'">'+ accountBal +'</div>';
                list += '<div class="divTableCell div-y"><div class="tbl-gear game-icons">' +
                    '<ul class="dropdown-opts hide"><span class="arrow-up"></span>';
                if(globalVar.cid == entry.recommenderId)  { list += '<li class="setRebate" >返点设定</li>'; }
                list +=     '<li class="bettingHistoryLink">投注纪录</li>';
                if(sessionStorage.isAgent == 2 && globalVar.cid == entry.recommenderId) { list +=  '<li class="transferToDown" data-downline="'+entry.customerName+'">转给下级</li>';}
                if(entry.type == 0) {  list += '<li class="setAgent">设定代理</li>'; }
                list +=     '</ul></div></div>';
                list += '<div class="entry" style="display:none;">' + JSON.stringify(entry) + '</div>';
                list += '</div>';
            });
        }

        $("#memberManagementList").html(list);
            $("#totalTeamSize").html(sessionStorage.teamSize);
            $("#totalPlannedAmount").html( control.customCurrencyFormat(sessionStorage.teamBalance, decimal) ).attr({ "data-SwitchDecimal": decimal, "data-value": sessionStorage.teamBalance });

    },
    loadBettingRecord: function(result){
        var list = "", _total="", decimal = 2;
        var bettingList = result.list;
        if(bettingList!=null) {
            bettingList.forEach(function(entry) {
                //var createTime = entry.create_time.substring(0,entry.create_time.indexOf("."));
                var createTime = entry.create_time.split(" ")[0];
                var status = "";
                switch (entry.status){
                    case "2":
                        status = "未开奖";
                        break;
                    case "4":
                        status = "已中奖";
                        break;
                    case "5":
                        status = "未中奖";
                        break;
                    case "6":
                        status = "追中撤单";
                        break;
                    case "7":
                        status = "出号撤单";
                        break;
                    case "8":
                        status = "个人撤单";
                        break;
                    case "12":
                        status = "空开撤单";
                        break;

                }
                list+=  '<div class="divTableRow border-bot clearfix">' ;
                list+=  '<div class="divTableCell onel-th-x">'+ entry.order_num +'</div>';
                list+=  '<div class="divTableCell onel-th-x">'+ entry.game_name +'</div>';
                list+=  '<div class="divTableCell onel-th-x">'+ control.formatDateFull(createTime,"yyyy-MM-dd") +'</div>';
                list+=  '<div class="divTableCell onel-th-x rs-td-amt" data-switchDecimal="' +decimal+ '" data-value="'+ entry.actual_bet_amount.toFixed(2)+'" >'+ entry.actual_bet_amount +'</span></div>';
                list+=  '<div class="divTableCell onel-th-x rs-td-amt tbl-red" data-switchDecimal="' +decimal+ '" data-value="'+ entry.win_amount.toFixed(2)+'">'+ entry.win_amount +'</span></div>';
                list+=  '<div class="divTableCell onel-th-x tbl-red">'+ status +'</div>';
                list+=  '</div>';
            });
            var total = result.footer,
                totalBetAmount = list.length == 0 ? 0 : total.total_actual_bet_amount,
                totalWinAmount = list.length == 0 ? 0 : total.total_win_amount;
            $("#gameHistoryList").html(list);

            _total += "<div class='tbl-total-con inline-block'>投注金额合计:";
            _total += "<span class='tbl-total-amt inline-block' data-SwitchDecimal='" +decimal+ "' data-value='" +totalBetAmount+ "'>" +control.customCurrencyFormat(totalBetAmount, decimal)+ "</span>";
            _total += "</div>";
            _total += "<div class='tbl-total-con inline-block'>中奖金额合计:";
            _total += "<span class='tbl-total-amt inline-block' data-SwitchDecimal='" +decimal+ "' data-value='" +totalWinAmount+ "'>" +control.customCurrencyFormat(totalWinAmount, decimal)+ "</span>";
            _total += "</div>";

            $("#agentGameHistoryTotal").html(_total);
        }

    },
    loadAgentPvpGameHistory: function(result, gameType){
        var _html = "", _total = "", decimal = 2, orders = result.list, total = result.footer;
        for( var i=0; i<orders.length; i++ ){
            _html+=  "<div class='divTableRow border-bot clearfix'>" ;
            _html+=  "<div class='divTableCell onel-th-x'>"+ orders[i].gameType +"</div>";
            _html+=  "<div class='divTableCell onel-th-x'>"+ orders[i].gameName +"</div>";
            _html+=  "<div class='divTableCell onel-th-x rs-td-amt' data-switchDecimal='" +decimal+ "' data-value='"+ orders[i].gameLoses +"'>"+ control.customCurrencyFormat(orders[i].gameLoses, decimal) +"</span></div>";
            _html+=  "<div class='divTableCell onel-th-x rs-td-amt' data-switchDecimal='" +decimal+ "' data-value='" + orders[i].gameWinnings+ "'>"+ control.customCurrencyFormat(orders[i].gameWinnings, decimal) +"</span></div>";
            _html+=  "<div class='divTableCell onel-th-x' data-switchDecimal='" +decimal+ "' data-value='" +orders[i].netProfit+ "'>"+ control.customCurrencyFormat(orders[i].netProfit, decimal) +"</div>";
            _html+=  "</div>";
        }
        $("#agentPvpGameHistoryTable .betLoss").text( gameType == 0 ? "净输金额" : "投注金额" );
        $("#agentPvpGameHistoryTable .prizeWon").text( gameType == 0 ? "净赢金额" : "中奖金额，" );
        $("#agentPvpGameHistoryList").html(_html);

        var total_bet_loss = orders.length == 0 ? 0 : total.gameLoses,
            total_prize_winning = orders.length == 0 ? 0 : total.gameWinnings,
            bet_loss_label = gameType == 0 ? "净输金额合计" : "有效投注金额合计",
            prize_winning_label = gameType == 0 ? "净赢金额合计" : "中奖金额合计";
        _total += "<div class='tbl-total-con inline-block'>" +bet_loss_label+ ":";
        _total += "<span class='tbl-total-amt inline-block' data-SwitchDecimal='" +decimal+ "' data-value='" +total_bet_loss+ "'>" +control.customCurrencyFormat(total_bet_loss, decimal)+ "</span>";
        _total += "</div>";
        _total += "<div class='tbl-total-con inline-block'>" +prize_winning_label+ ":";
        _total += "<span class='tbl-total-amt inline-block' data-SwitchDecimal='" +decimal+ "' data-value='" +total_prize_winning+ "'>" +control.customCurrencyFormat(total_prize_winning, decimal)+ "</span>";
        _total += "</div>";
        $("#agentPvpGameHistoryTotal").html(_total);        
    },
    loadLottoAgentPnl: function(result){
        var decimal = 2, list = result.list, _html = "";
        for(var i=0; i<list.length; i++){
            _html += "<div class='divTableRow'>";
            var account = list[i].customer_name.split("@");
            _html += "<div class='divTableCell tbl-link ps-strings' data-customerId='" +list[i].customer_id+ "'>" +account[1]+ "</div>";
            _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].total_deposit+ "'>" +control.customCurrencyFormat(list[i].total_deposit, decimal)+ "</div>";
            _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].total_withdraw+ "'>" +control.customCurrencyFormat(list[i].total_withdraw, decimal)+ "</div>";
            _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].total_lott_game_bettings+ "'>" +control.customCurrencyFormat(list[i].total_lott_game_bettings, decimal)+ "</div>";
            var lottGameRebateColor = list[i].total_lott_game_rebates >= 0 ? "tbl-red" : "tbl-green";
            _html += "<div class='divTableCell ps-num " +lottGameRebateColor+ "'  data-switchDecimal='" +decimal+ "' data-value='" +list[i].total_lott_game_rebates+ "'>" +control.customCurrencyFormat(list[i].total_lott_game_rebates, decimal)+ "</div>";
            _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].total_lott_game_winnings+ "'>" +control.customCurrencyFormat(list[i].total_lott_game_winnings, decimal)+ "</div>";
            _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].total_lott_promotions+ "'>" +control.customCurrencyFormat(list[i].total_lott_promotions, decimal)+ "</div>";
            var profitLossColor = list[i].total_lott_pnl >= 0 ? "tbl-red" : "tbl-green";
            _html += "<div class='divTableCell ps-num " +profitLossColor+ "' data-switchDecimal='" +decimal+ "' data-value='" +list[i].total_lott_pnl+ "'>" +control.customCurrencyFormat(list[i].total_lott_pnl, decimal)+ "</div>";
            _html += "</div>";
        }
        $("#lottoAgentPnlList").html(_html);
    },
    loadPvpAgentPnl: function(result, gameType){
        var decimal = 2,
            list = result.list,
            _html = "";
        for(var i=0; i<list.length; i++){
            _html += "<div class='divTableRow'>";
            var account = list[i].customer_name.split("@");            
            _html += "<div class='divTableCell tbl-link ps-strings' data-customerId='" +list[i].customer_id+ "'>" +account[1]+ "</div>";
            var total_deposit = gameType == 0 ? list[i].total_deposit : list[i].total_deposit;
            _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +total_deposit+ "'>" +control.customCurrencyFormat(total_deposit, decimal)+ "</div>";
            var total_withdraw = gameType == 0 ? list[i].total_withdraw : list[i].total_withdraw;
            _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +list[i].total_withdraw+ "'>" +control.customCurrencyFormat(list[i].total_withdraw, decimal)+ "</div>";
            var total_betting_loss = gameType == 0 ? list[i].total_pvp_game_loses : list[i].total_rng_game_betting;
            _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +total_betting_loss+ "'>" +control.customCurrencyFormat(total_betting_loss, decimal)+ "</div>";
            var total_game_winnings = gameType == 0 ? list[i].total_pvp_game_winnings : list[i].total_rng_game_winning;
            var gameWinningColor = total_game_winnings >= 0 ? "tbl-red" : "tbl-green";
            _html += "<div class='divTableCell ps-num " +gameWinningColor+ "'  data-switchDecimal='" +decimal+ "' data-value='" +total_game_winnings+ "'>" +control.customCurrencyFormat(total_game_winnings, decimal)+ "</div>";
            var total_game_rebate = gameType == 0 ? list[i].total_pvp_game_rebate : list[i].total_rng_game_rebate;
            _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +total_game_rebate+ "'>" +control.customCurrencyFormat(total_game_rebate, decimal)+ "</div>";
            var total_promotion = gameType == 0 ? list[i].total_pvp_promotion : list[i].total_rng_promotion;
            _html += "<div class='divTableCell ps-num' data-switchDecimal='" +decimal+ "' data-value='" +total_promotion+ "'>" +control.customCurrencyFormat(total_promotion, decimal)+ "</div>";
            var total_pnl = (total_game_winnings+total_game_rebate+total_promotion)-total_betting_loss;
            var profitLossColor = total_pnl >= 0 ? "tbl-red" : "tbl-green";
            _html += "<div class='divTableCell ps-num " +profitLossColor+ "' data-switchDecimal='" +decimal+ "' data-value='" +total_pnl+ "'>" +control.customCurrencyFormat(total_pnl, decimal)+ "</div>";
            _html += "</div>";
        }        
        $("#pvpAgentPnlTable .col-lossBetting").text( gameType == 0 ? "净输" : "投注" );
        $("#pvpAgentPnlTable .col-gameWinning").text( gameType == 0 ? "净赢" : "中奖" );
        $("#pvpAgentPnlList").html(_html);
    },
    loadRevenueReport: function(result){
        var list = result.list, total=result.footer, decimal = 2, _html="", _total="";
        for(var i=0; i<list.length; i++){
            var dateTime = list[i].date.split(" "),
                agentRebate = list[i].agentRebate == "" ? 0 : list[i].agentRebate,
                dailySalary = list[i].dailySalary == "" ? 0 : list[i].dailySalary,
                totalIncome = list[i].tatalIncome == "" ? 0 : list[i].tatalIncome;
            _html += "<div class='arr-tr clearfix'>";
            _html += "<div class='arr-td'>" +dateTime[0]+ "</div>";
            _html += "<div class='arr-td' data-switchDecimal='" +decimal+ "' data-value='" +agentRebate+ "'>" +control.customCurrencyFormat(agentRebate, decimal)+ "</div>";
            _html += "<div class='arr-td' data-switchDecimal='" +decimal+ "' data-value='" +dailySalary+ "'>" +control.customCurrencyFormat(dailySalary, decimal)+ "</div>";
            _html += "<div class='arr-td' data-switchDecimal='" +decimal+ "' data-value='" +totalIncome+ "'>" +control.customCurrencyFormat(totalIncome, decimal)+ "</div>";
            _html += '</div>';            
        }
        $("#revenueReportList").html(_html);

        var total_agentRebate = list.length == 0 || total.agentRebate == "" ? 0 : total.agentRebate,
            total_dailySalary = list.length == 0 || total.dailySalary == "" ? 0 : total.dailySalary;
        _total += "<span class='sdt'>代理返点合计:</span><span class='sdd' data-switchDecimal='" +decimal+ "' data-value='" +total_agentRebate+ "'>" +control.customCurrencyFormat(total_agentRebate, decimal)+ "</span>";
        _total += "<span class='sdt'>日工资合计:</span><span class='sdd' data-switchDecimal='" +decimal+ "' data-value='" +total_dailySalary+ "'>" +control.customCurrencyFormat(total_dailySalary, decimal)+ "</span>";
        $("#revenueReportTotal").html(_total);    
    },
    loadAgentDividendRecord: function(result){
        var prev_commission_period = control.timeToDateFormat(result.list[0].prev_start_date.time, "date") + "~" + control.timeToDateFormat(result.list[0].prev_end_date.time, "date");
        $(".prev_commission_period").text(prev_commission_period);
        var prev_pnl = result.list[0].prev_net_profit;
        var prev_pnlColor = prev_pnl >= 0 ? "tbl-red" : "tbl-green";
        $(".prev_pnl").text(prev_pnl).addClass(prev_pnlColor);
        var prev_commission = result.list[0].prev_dividend_income;
        $(".prev_commission").text(prev_commission);
        var current_commission_period = control.timeToDateFormat(result.list[0].curr_start_date.time, "date") + "~" + control.timeToDateFormat(result.list[0].curr_end_date.time, "date");
        $(".current_commission_period").text(current_commission_period);
        var current_pnl = result.list[0].current_net_profit;
        var current_pnlColor = current_pnl >= 0 ? "tbl-red" : "tbl-green"; 
        $(".current_pnl").text(current_pnl).addClass(current_pnlColor);
        var current_commission = result.list[0].current_dividend_income;
        $(".current_commission").text(current_commission);
        var commission_rate = result.list[0].dividend_rate +"%";
        $(".commission_rate").text(commission_rate);
        var count_of_commission_computed = result.list[0].commission_received_count;
        $(".count_of_commission_computed").text(count_of_commission_computed);
        var count_of_commission_disbursed = result.list[0].commission_distributed_count;
        $(".count_of_commission_disbursed").text(count_of_commission_disbursed);
    },
    loadSecurityQuestions: function(result){
        var _html = "<select name='question' class='form-control ctSelect' required=''>";
        _html += "<option value=''>&nbsp</option>";
        for(var i=0; i<result.length; i++){
            _html += "<option value='" +result[i].question+ "'>" +result[i].question+ "</option>";
        }
        _html += "</select>";
        $("#securityQuestionForm .securityQ").html(_html).addClass("slect-box-custom-large mem-icon");   
        control.customSelect("#securityQuestionForm select");
    },
    loadProvinceList: function(parentNode){
        var option = "<option value='' data-englishName=''>省</option>";
        for( var i =0; i < parentNode.length; i++ ){
            var provinceValue = parentNode[i].childNodes[0].nodeValue,
                provinceName = parentNode[i].getAttribute("name");
            option += "<option value='" +provinceValue+ "' data-englishName='" +provinceName+ "'>" +provinceValue+ "</option>";
        }
        return option;
    },
    loadCityList: function(CNode){
        var CNodeLength = CNode.length,
            option="<option value=''>市</option>";
        for(var x=0; x < CNode.length; x++){
            var cityName = CNode[x].childNodes[0].nodeValue;
                option += "<option value='" +cityName+ "'>" +cityName+ "</option>";
        }
        return option;
    },
    loadBankCards: function(type, result){
        var bankCards = result.bankCards,
            _html = ""
        if(bankCards.length > 0){
            _html += "<div class='main-wrp-card'>";
            for(var i=0; i<bankCards.length; i++){
                _html += "<div class='banks z-i" +(i+1)+ " z-i' data-bankId='" +bankCards[i].bankCardId+ "' data-bankCardHolder='" +bankCards[i].cardHolder+ "' data-bankProvince='" +bankCards[i].province+ "' data-bankName='" +bankCards[i].bankName+ "' data-bankCardNo='" +bankCards[i].cardNumber+ "'>";
                _html += "<span class='bankLogo-Card bank-" +bankCards[i].bankCode+ "'></span>";
                _html += "<span class='det-01'>" +bankCards[i].cardNumber+ "</span>";
                _html += "<span class='det-02'>卡号</span>";
                _html += "<span class='det-03'>" +bankCards[i].cardNumber+ "</span>";
                _html += "<span class='det-04'>提款人姓名 </span>";
                _html += "<span class='det-05'>" +bankCards[i].cardHolder+ "</span>";
                _html += "<span class='det-06'>綁卡日期</span>";
                _html += "<span class='det-07'>"+UI.convertEpochToLocaldate(bankCards[i].createdAt, "date")+"</span>";
                _html += "</div>";
            }
            _html += "</div>";
        }else{
            _html += "<div class='bankCard-Plain'>";
            _html += "<span class='det-01 fx-mov'>**** **** **** 0000</span>";
            _html += "<span class='det-02'>卡号</span>";
            _html += "<span class='det-03'>**** **** ****0000</span>";
            _html += "<span class='det-04'>提款人姓名 </span>";
            _html += "<span class='det-05'>XXXXXX</span>";
            _html += "<span class='det-06'>綁卡日期</span>";
            _html += "<span class='det-07'>0000-00-00</span>";
            _html += "</div>";
        }

        switch(type){
            case "bindCard":
                // BankCard Count
                // $("#bindCardForm .bankCardCount").text(bankCards.length);

                // Add BankCard
                var _htmlAppend = "<div class='all-list'><div class='card-holder dataLoaded'>",
                    _htmlPrepend = "</div></div>";

                $("#bankCardList").html(_htmlAppend+_html+_htmlPrepend);

                // set bankCards length
                control.setBankCardLength(bankCards.length);
                
                break;
            case "withdrawalRequest":
                // Remaining Withdraw Count
                $("#requestWithdrawForm .remainingWithdrawTimes").text(result.remainingTransactionTimes);
                // Bank Cards
                $("#bankCardList").html(_html).addClass("withdrawalRequest");

                if( bankCards.length == 0 ) $("#bankInfo .noBankCard").text("您尚未绑定银行卡");
                break;
            default:
        }
    },
    loadWithdrawBankList: function(bankList){
        var _html = "<option value=''></option>";
        for(var i=0; i<bankList.length; i++){
            _html += "<option data-bankName='" +bankList[i].bank_ch_name+ "' value='" +bankList[i].bank_code+ "'>" +bankList[i].bank_ch_name+ "</option>";
        }
        $("#bindCardForm [name='bankName']").html(_html).trigger("chosen:updated");
    },
    loadDepositBankList: function(targetId, banks){
        var _html = "";
        for(var i=0; i<banks.length; i++){
            _html += "<li class='opTab-content inline-block'>";
            _html += "<input data-minDeposit='" +banks[i].min_deposit+ "' data-maxDeposit='" +banks[i].max_deposit+ "' value='" +banks[i].bank_code+ "' class='bank-list' type='radio' name='bankName' />";
            _html += "<span class='bankRadioBtn mem-icon crcl-ch inline-block'>&nbsp;</span>";
            _html += "<img class='inline-block' src='images/bank/" +banks[i].bank_code+ ".jpg' />";
            _html += "</li>";
        }
        $("#bankList").html(_html);
        control.selectDepositBank(targetId);
    },
    loadDepositPromotions: function(targetId, promotions){
        var _html = "";
    },
    postDepositAlipay: function(){
        var _html = "";
		_html += "<div class='depo-qr'>";
		_html += "<img src='../images/2kc-qr.png'>";
		_html += "<ol>";
		_html += "<li>拿出您的手机，打开支付宝，登录账号；</li>";
		_html += "<li>在支付宝页面点击【扫一扫】，然后将手机摄像";
		_html += "<br>头对准支付宝的二维码进行扫描；</li>";
		_html += "<li>扫描成功后点击【转账】，输入金额后【确认转";
		_html += "<br>账】；然后输入支付密码即可。</li>";
		_html += "</ol>";
		_html += "</div>";
        TCG.Alert("alerts", _html, "L");
    },
    // loadDepositRecords: function(result){
    //     var _html="", decimal=2, totalAmounCredit = 0, totalArrivalFee = 0;

    //     if(result.length > 0){
    //         for( var i=0; i<result.length; i++ ){
    //             _html += "<div class='tableContent-wrp'>";
    //             _html += "<div class='inline-block tablesC'>" +result[i].transId+ "</div>";
    //             _html += "<div class='inline-block tablesC'>" +result[i].depositMode+ "</div>";
    //             _html += "<div class='inline-block tablesC' data-switchDecimal='" +decimal+ "' data-value='" +result[i].requestedAmount+ "'>" +control.customCurrencyFormat(result[i].requestedAmount, decimal)+ "</div>";
    //             _html += "<div class='inline-block tablesC' data-switchDecimal='" +decimal+ "' data-value='" +result[i].amount+ "'>" +control.customCurrencyFormat(result[i].amount, decimal)+ "</div>";
    //             _html += "<div class='inline-block tablesC' data-switchDecimal='" +decimal+ "' data-value='" +result[i].reimbursementAmount+ "'>" +control.customCurrencyFormat(result[i].reimbursementAmount, decimal)+ "</div>";
    //             _html += "<div class='inline-block tablesC RemarksData'>" +result[i].refId+ "</div>"; // <span class='hover-data hide'>1234567878645 | 132145465465</span>
    //             _html += "<div class='inline-block tablesC dateData'>" +result[i].depositDate+ "</div>";
    //             _html += "<div class='inline-block tablesC dateData'>" +result[i].actualDepositDate+ "</div>";
    //             _html += "<div class='inline-block tablesC'>" +TCG.Prop("depositType_"+result[i].state)+ "</div>";
    //             _html += "</div>";

    //             totalAmounCredit+=1;
    //             totalArrivalFee+=1;
    //         }
    //     }else{
    //         _html += "<div class='align-center'>没有查到符合条件的数据！</div>";
    //     }
    //     $("#depositRecordsList").html(_html);

    //     $("#totalAmountCredit").html( control.customCurrencyFormat(totalAmounCredit, decimal) ).attr({ "data-switchDecimal": decimal, "data-value": totalAmounCredit });
    //     $("#totalArrivalFee").html( control.customCurrencyFormat(totalArrivalFee, decimal) ).attr({ "data-switchDecimal": decimal, "data-value": totalArrivalFee });
    //     $("#bankCardList").html(_html);
    // },

    loadRebateQuota: function() {
        TCG.Ajax({ url: "./agent/quota" }, function(result){
            var quotas = result.result;
            if(result.status){
                globalVar.quotaObj.length = 0;
                var _html = "<label for=''>可用配额:</label>";
                _html += '<ul class="tabs clearfix" id="dira-regdline-quota-tabs">';
                if(quotas.length > 0){
                    globalVar.quotaObj = quotas;
                    //for(var i=1; i<=bankCards.length; i++){
                    quotas.forEach(function(entry) {
                        _html += "<li><label class='unsel tab-btn' data-rel='tab-content1' for='tab1' quota-id='" + entry.quotaId + "'>"+ entry.templateName +"/"+ entry.quotaRemaining + "个</label></li>";
                    });
                    _html += '</ul>';
                }else{

                }
                $("#rebateQuota").html(_html);
                control.clickQuotaTab("#dira-regdline-quota-tabs");
            }else{
                TCG.Alert("errors", TCG.Prop(result.description));
            }
        });
    },
    loadGameSeriesList: function(callback){
        TCG.Ajax({ url: "./getLottoGamesSeries?merchantCode=2000cai" }, function(result){
            if(result.status){
                var gameSeries = result.result;
                var _html = "<option value=''>全部</option>";
                for(var i=0; i<gameSeries.length; i++){
                    _html += "<option value='" + gameSeries[i].gameGroupCode + "'>"+TCG.Prop(gameSeries[i].gameGroupCode+gameSeries[i].prizeModeId)+"</option>";
                }
                callback(_html);
            }else{
                TCG.Alert("errors", TCG.Prop(result.description));
            }
        });
    },
    loadQueryConditionList: function(headers, callback){
        TCG.Ajax({ url: "./lgw/orders/query_conditions", headers: headers }, function(result){
            var obj = {};
            obj.gamesArr = [];
            obj.games = "<option value=''>全部</option>";
            for(var i in result.games){
                obj.games += "<option value='" +i+ "'>"+TCG.Prop("gameName_"+result.games[i])+"</option>";
                obj.gamesArr.push({ id: i, gameName: TCG.Prop("gameName_"+result.games[i]) });
            }
            obj.orderStatus = "";
            for(var i in result.orderStatus){
                obj.orderStatus += "<option value='" +i+ "'>"+TCG.Prop("orderStatus_"+result.orderStatus[i])+"</option>";
            }
            callback(obj);
        });
    },
    loadGameSeries: function(form, queryDown, downlineId) {
        var url ="";

        if(queryDown) {
            url = "./agentSet/downlineRebates?customerId=" + downlineId;
        }else{
            url = "./getLottoCustomersSeries?merchantCode=2000cai";
        }
        TCG.Ajax({ url: url}, function(result){
            if(result.status){

                var _html = "";
                var gameSeries;
                var memberRebates = [];
                if(queryDown) {
                    gameSeries = jQuery.parseJSON(sessionStorage.agentGameSeries);
                    memberRebates = result.result.configs;

                }else{
                    gameSeries = result.result;
                    sessionStorage.agentGameSeries = JSON.stringify(gameSeries);
                }

                if(gameSeries.length > 0){
                    _html += "<ul class='dira-regdline-gb-list'>";
                    gameSeries.forEach(function(entry,index) {
                        var gameCode = entry.gameGroupCode+entry.prizeModeId;
                        _html += "<li class='dira-regdline-gb-listitem'>";
                        _html += "<input type='checkbox' id='check"+index+"' name='lottery' value=" + entry.gameGroupCode + " checked />";
                        _html += "<label for='check"+index+"'>"+TCG.Prop(entry.gameGroupCode+entry.prizeModeId)+":</label>";
                        _html += "<input type='button' class='minus'/>";
                        _html += "<div class='quota' id='lottQuota"+index+"'></div>";
                        _html += "<input type='button' class='plus'/>";
                        _html += "<input type='text' class='quota-amount game-icons' gameCode='"+gameCode + "'/>";
                        _html += "</li>";
                    });
                    _html += "</ul>";
                }
                $("#gameSeries").html(_html);

                var globeRebate = globalVar.globeRebate;
                gameSeries.forEach(function(entry,index) {
                    var gameSeriesType = entry.gameGroupCode + "_" + entry.prizeModeId;
                    var gameCode = entry.gameGroupCode+entry.prizeModeId;
                    var maxSeries = entry.maxSeries;
                    var minSeries = entry.minSeries;
                    var interval = 2;
                    var seriesChecked = false;
                    for(var i=0; i< globeRebate.length;i++){
                       if(globeRebate[i].gameType == gameSeriesType){
                           if(globeRebate[i].highestRebate < maxSeries) {
                               maxSeries = globeRebate[i].highestRebate - globeRebate[i].rebateDifference;

                           }else{
                               maxSeries = maxSeries - globeRebate[i].rebateDifference;
                           }
                           interval = globeRebate[i].rebateInterval;
                           break;
                       }
                    }
                    for(var i=0;i<memberRebates.length;i++) {
                        var memGameCode = memberRebates[i].type + memberRebates[i].prizeModeId;
                        if(gameCode == memGameCode) {
                            seriesChecked = true;
                            minSeries = minSeries < memberRebates[i].rebateValue ? memberRebates[i].rebateValue : minSeries;
                            break;
                        }
                    }
                    if(memberRebates.length>0  && !seriesChecked) {
                        $("#check"+index).attr('checked', true);
                    }
                    control.sliderAmount(minSeries, minSeries, maxSeries, interval,index, form);
                });

                //  Bind event
                $(document).off("click", form + " input[name='lottery']")
                .on("click", form + " input[name='lottery']", function(){
                    if($(this).prop("checked")){
                        var minSeries = $(this).siblings("input[type='text']").attr("min");
                        $(this).siblings("input[type='text']").val(minSeries).attr("readonly",false);
                        $(this).siblings(".quota").slider("value",minSeries);
                        $(this).siblings(".quota").slider("enable");
                        $(this).siblings(".quota-amount").removeAttr("disabled");
                        $(this).siblings(".minus").removeAttr("disabled");
                        $(this).siblings(".plus").removeAttr("disabled");
                    }else{
                        var minSeries = $(this).siblings("input[type='text']").attr("min");
                        $(this).siblings("input[type='text']").val(minSeries).attr("readonly",true);
                        //$(this).siblings(".quota").slider("value",minSeries);
                        $(this).siblings(".quota").slider("disable");
                        $(this).siblings(".quota-amount").attr("disabled", "true");
                        $(this).siblings(".minus").attr("disabled", "true");
                        $(this).siblings(".plus").attr("disabled", "true");

                    }
                });
            }else{
            	TCG.Alert("errors", TCG.Prop(result.description));
            }
        });

    },
    loadGroupGames: function(callback){
        TCG.Ajax({url:'lgw/games',headers:{Merchant: globalVar.merchantCode}},function(result){
            if(result.length>0){
                var _html = "<div class='game selected' data-gameCode=''>全部</div>";
                for(var i=0; i<result.length; i++){
                    _html += "<ul class='group_" +result[i].code+ "'>";
                    for( var o=0; o<result[i].games.length; o++ ){
                        _html += "<li class='game' data-gameCode='" +result[i].games[o].code+ "'>" +result[i].games[o].remark+ "</li>";
                     }
                     _html += "</ul>";
                }
                // mosTplayed, newGame
                callback(_html);
            }
        });
    },
    loadTeamBetting: function(result){
        var decimal = 2, _html="", _total="", list = result.list, total = result.footer;
        for(var i=0; i<list.length; i++){
            var dateTime = list[i].create_time.split(" ");
            _html += "<div class='divTableRow'>";
            _html += "<div class='divTableCell onel-th-x'>" +list[i].game_name+ "</div>";
            _html += "<div class='divTableCell onel-th-x'>" +list[i].order_num+ "</div>";
            _html += "<div class='divTableCell onel-th-x div-y'>" +list[i].customer_name+ "</div>";
            _html += "<div class='divTableCell onel-th-x div-long'>" +dateTime[0]+ " <span class='tclDec'>" +dateTime[1]+ "</span></div>";
            _html += "<div class='divTableCell onel-th-x div-long'>" +list[i].numero+ "</div>";
            _html += "<div class='divTableCell onel-th-x div-y'>" +TCG.Prop("bettingMode_"+list[i].bet_mode)+ "</div>";
            _html += "<div class='divTableCell onel-th-x div-y'>" +list[i].chase_remark+ "</div>";
            _html += "<div class='divTableCell onel-th-x ps-num2' data-switchDecimal='" +decimal+ "' data-value='" +list[i].plan_bet_amount+ "'>" +control.customCurrencyFormat(list[i].plan_bet_amount, decimal)+ "</div>";
            _html += "<div class='divTableCell onel-th-x ps-num2' data-switchDecimal='" +decimal+ "' data-value='" +list[i].actual_bet_amount+ "'>" +control.customCurrencyFormat(list[i].actual_bet_amount, decimal)+ "</div>";
            var color = 99999 >= 0 ? "tbl-red" : "tbl-green";
            _html += "<div class='divTableCell onel-th-x ps-num2 " +color+ "' data-switchDecimal='" +decimal+ "' data-value='" +list[i].win_amount+ "'>" +control.customCurrencyFormat(list[i].win_amount, decimal)+ "</div>";
            _html += "<div class='divTableCell onel-th-x div-z'>" +TCG.Prop("orderStatus_"+list[i].status)+ "</div>";
            _html += "</div>";
        }
        $("#teamBettingList").html(_html);

        var totalBetAmt = result.list.length == 0 ? 0 : total.total_plan_bet_amount,
            totalActualBetAmt = result.list.length == 0 ? 0 : total.total_actual_bet_amount,
            totalWinAmt = result.list.length == 0 ? 0 : total.total_win_amount;
        _total += "<div class='tbl-total-con inline-block'>计划投注金额合计:</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchDecimal='" +decimal+ "' data-value='" +totalBetAmt+ "'>" +control.customCurrencyFormat(totalBetAmt, decimal)+ "</div>";
        _total += "<div class='tbl-total-con inline-block'>有效投注金额合计:</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchDecimal='" +decimal+ "' data-value='" +totalActualBetAmt+ "'>" +control.customCurrencyFormat(totalActualBetAmt, decimal)+ "</div>";
        _total += "<div class='tbl-total-con inline-block'>中奖金额合计:</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchDecimal='" +decimal+ "' data-value='" +totalWinAmt+ "'>" +control.customCurrencyFormat(totalWinAmt, decimal)+ "</div>";
        $("#totalTeamBetting").html(_total);
    },
    loadPvpTeamBetting: function(result, gameType){
        var decimal = 2, _html="", _total="", total = result.footer, list = result.list;
        for(var i=0; i<list.length; i++){
            _html+="<div class='divTableRow'>";
            var gameType = list[i].gameType == "PVP" ? "" : "";
            _html+="<div class='divTableCell'>" +gameType+ "</div>";
            _html+="<div class='divTableCell'>" +list[i].gameName+ "</div>";
            _html+="<div class='divTableCell'>" +list[i].customerName+ "</div>";
            _html+="<div class='divTableCell' data-switchDecimal='" +decimal+ "' data-value='" +list[i].gameLoses+ "'>" +control.customCurrencyFormat(list[i].gameLoses, decimal)+ "</div>";
            _html+="<div class='divTableCell' data-switchDecimal='" +decimal+ "' data-value='" +list[i].gameWinnings+ "'>" +control.customCurrencyFormat(list[i].gameWinnings, decimal)+ "</div>";
            var netProfitColor = list[i].netProfit >= 0 ? "tbl-red" : "tbl-green";
            _html+="<div class='divTableCell " +netProfitColor+ "' data-switchDecimal='" +decimal+ "' data-value='" +list[i].netProfit+ "'>" +control.customCurrencyFormat(list[i].netProfit, decimal)+ "</div>";
            _html+="</div>";
        }
        var decimal = 2, _html="", _total="";// total = result.footer, list = result.list;
        $("#pvpTeamBettingTable .betLost").text( gameType == 0 ? "净输金额" : "投注金额" );
        $("#pvpTeamBettingTable .prizeWon").text( gameType == 0 ? "净赢金额" : "中奖金额" ); 

        $("#pvpTeamBettingList").html(_html);
        var label_betLoss = gameType == 0 ? "净输金额合计" : "投注金额合计",
            label_betWin = gameType == 0 ? "净赢金额合计" : "中奖金额合计",
            label_pnl = gameType == 0 ? "游戏盈亏合计" : "游戏盈亏合计",
            totalGameLoses = list.length == 0 ? 0 : total.gameLoses,
            totalGameWinnings = list.length == 0 ? 0 : total.GameWinnings,
            totalNetProfit = list.length == 0 ? 0 : total.netProfit;
        _total += "<div class='tbl-total-con inline-block'>" +label_betLoss+ ":</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchdecimal='" +decimal+ "' data-value='" +totalGameLoses+ "'>" +control.customCurrencyFormat(totalGameLoses, decimal)+ "</div>";
        _total += "<div class='tbl-total-con inline-block'>" +label_betWin+ ":</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchdecimal='" +decimal+ "' data-value='" +totalGameWinnings+ "'>" +control.customCurrencyFormat(totalGameWinnings, decimal)+ "</div>";
        _total += "<div class='tbl-total-con inline-block'>" +label_pnl+ ":</div>";
        _total += "<div class='tbl-total-amt inline-block' data-switchdecimal='" +decimal+ "' data-value='" +totalNetProfit+ "'>" +control.customCurrencyFormat(totalNetProfit, decimal)+ "</div>";
        $("#pvpTeamBettingTotal").html(_total);
    },
    loadInboxMessages: function(result){
        var list = result.messages, _html;
        for(var i=0; i<list.length; i++){
            _html += "";
        }
        console.log(result);
    }
}
