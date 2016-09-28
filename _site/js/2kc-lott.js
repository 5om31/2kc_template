/**
 * Created by Administrator on 2016/8/18.
 */
var lott={
    init:function(){
        lott.setLottModeUI();
        $("#gap_and_hot dt").removeClass("active");
        $("#gap_and_hot dt[data-val='gap']").addClass("active");//默认加载遗漏
        lott.lottBettingModes();//加载元角分投注模式以及绑定点击事件
        lott.lottBetSeries();//奖金系列事件绑定
    },
    setLottModeUI:function(){
        var series=globalVar.currentLottery.series;
        var txt='';
        if(series.length==1){
            txt+='<dt class="game-icons menu-tab-right2 inline-block active" lott-mode="Tradition">传统</dt>';
        }
        if(series.length>1){
            txt+='<dt class="game-icons menu-tab-right inline-block" lott-mode="ZY">智赢</dt>';
            txt+='<dt class="game-icons menu-tab-right2 inline-block active" lott-mode="Tradition">传统</dt>';
        }
        $('dl[id="lottMode"]').html(txt);
        $(document).off("click","#lottMode dt").on("click","#lottMode dt",function(){//绑定模式切换事件
            if($(this).hasClass("active")){return;}
            $("#lottMode dt").removeClass("active");
            $(this).addClass("active");//默认加载传统模式
            lott.lottPlayMenusUI();//加载玩法菜单UI
        });
        lott.lottPlayMenusUI();//加载玩法菜单UI
    },
    lottPlayMenusUI:function(){
        TCG.Ajax({url:'lgw/games/'+globalVar.currentLottery.gameId+'/play_menu',headers:{Merchant: globalVar.merchantCode}},function(rs) {
            if(rs.length>0){
                var mode=$("#gap_and_hot dt[class*='active']").attr("lott-mode");
                var menus='';
                for(var i=0;i<rs.length;i++){
                    if(rs[i].prizeModeName==mode&&rs[i].playMenuGroups.length>0){
                        var playMenuGroups=rs[i].playMenuGroups;//父级玩法菜单
                        for(var g=0;g<playMenuGroups.length;g++){
                            menus+='<li class="with_child" menu-info="'+playMenuGroups[g].playId+'#'+playMenuGroups[g].playCode+'">'+playMenuGroups[g].playMenu;
                            var childMenus=playMenuGroups[m].playMenus;//子级玩法菜单
                            if(childMenus.length>0){
                                menus+='<ul class="child_menu hide">';
                                for(var c=0;c<childMenus.length;c++){
                                    if(childMenus[c].playSwitch*1==1){
                                        menus+='<li menu-info="'+childMenus[c].playId+'#'+childMenus[c].playCode+'">'+childMenus[c].playMenu+'</li>';
                                    }
                                }
                                menus+='</ul>';
                            }
                             menus+='</li>';
                        }
                    }
                }
                $('ul[class="menu-loterry"]').html(menus);
                $(document).off("click",".menu-loterry>li>ul>li").on("click",".menu-loterry>li>ul>li",function(){
                    var menuInfo=$(this).attr("menu-info");
                    var info=menuInfo.split("#");
                    $("#currentPlayName").text($(this).text());
                    $("#lottWinExplain").html(TCG.Prop("play_explain_"+info[1]));
                    lott[globalVar.currentLottery.series[0].gameGroup].betBallUI(info[1]);
                });
            }
        });
    },
    lottBettingModes:function(){
        TCG.Ajax({url:'lgw/games/'+globalVar.currentLottery.gameId+'/setting',headers:{Merchant: globalVar.merchantCode}},function(rs) {
            if(rs.bettingModes&&rs.bettingModes.length>0){
                var txt='<dt class="inline-block">模式:</dt>';
                for (var i=0;i<bettingModes.length;i++){
                    txt+='<dd class="btn game-icons inline-block currency" bet-mode="'+bettingModes[i].code+'"  mode-info="'+bettingModes[i].bettingModeId+'#'+bettingModes[i].betMultipleMax+'#'+bettingModes[i].unit+'#'+bettingModes[i].code+'">'+TCG.Prop(bettingModes[i].code)+'</dd>';
                }
                $("#lottBetMode").html(txt);
                $(document).off("click","#lottBetMode dd").on("click","#lottBetMode dd",function(){
                    if($(this).hasClass("active")){return;}
                    $("#lottBetMode dd").removeClass("active");
                    $(this).addClass("active");
                    var mode=$(this).attr("mode-info").split("#");
                    globalVar.currentLottery.betMode={id:mode[0],maxMult:mode[1],unit:mode[2],name:mode[3]};
                    //需要计算购物车里面已选号球的投注数据
                });
                $('#lottBetMode dd[bet-mode="Dollar"]').trigger("click");
                lott.lottBetMultiple();//投注倍数事件绑定
            }
        });
    },
    lottBetMultiple:function(){
        $(document).off("click","#lottBetMultiple dt[bet-mult='reduce'],#lottBetMultiple dt[bet-mult='add']").on("click","#lottBetMultiple dt[bet-mult='reduce'],#lottBetMultiple dt[bet-mult='add']",function(){
            var type=$(this).attr("bet-mult");
            var mult=$('input[name="betMultiple"]').val();
            switch (type){
                case "reduce":if(mult*1<=1){return;}$('input[name="betMultiple"]').val(mult*1-1);break;
                case "add":if(mult*1>=globalVar.currentLottery.betMode.maxMult){return;}$('input[name="betMultiple"]').val(mult*1+1);break;
            }
            //或者未加入购物车但已选中的号球
            //需要计算购物车里面已选号球的投注数据
        });
        $(document).off("change","input[name='betMultiple']").on("change","input[name='betMultiple']",function(){
            //或者未加入购物车但已选中的号球
            //需要计算购物车里面已选号球的投注数据
        });
    },
    lottBetSeries:function(){
        var lottMode=$("#gap_and_hot dt[class*='active']").attr("lott-mode");
        var _series={};
        switch(lottMode){
            case "Tradition":_series=globalVar.currentLottery.series[0];break;
            case "ZY":_series=globalVar.currentLottery.series[1];break;
        }
        globalVar.currentLottery.betSeries=_series.minSeries;
        var rebate=(_series.maxSeries*1.00-_series.minSeries*1.00)/2000.00*100;
        $('#lottBetSeries dt[bet-series="val"]').text(_series.minSeries+"/"+rebate+"%");

        $(document).off("click","#lottBetSeries dt[bet-series='reduce'],#lottBetSeries dt[bet-series='add']").on("click","#lottBetSeries dt[bet-series='reduce'],#lottBetSeries dt[bet-series='add']",function(){
            var lottMode=$("#gap_and_hot dt[class*='active']").attr("lott-mode");
            var series={};
            switch(lottMode){
                case "Tradition":series=globalVar.currentLottery.series[0];break;
                case "ZY":series=globalVar.currentLottery.series[1];break;
            }
            var type=$(this).attr("bet-series");
            switch (type){
                case "reduce":
                    if(globalVar.currentLottery.betSeries*1==series.minSeries*1){return;}
                    globalVar.currentLottery.betSeries=globalVar.currentLottery.betSeries*1-2;
                    break;
                case "add":
                    if(globalVar.currentLottery.betSeries*1==series.maxBetSeries){return;}
                    globalVar.currentLottery.betSeries=globalVar.currentLottery.betSeries*1+2;
                    break;
            }
            var rebate=(series.maxSeries*1.00-globalVar.currentLottery.betSeries*1.00)/2000.00*100;
            $('#lottBetSeries dt[bet-series="val"]').text(globalVar.currentLottery.betSeries+"/"+rebate+"%");
        });
    },
    'SSC':{
        betBallUI:function(code){
            switch (code){
                case "Last1Straight":break;
            }
        }
    },
    '11X5':{
        betBallUI:function(code){
            switch (code){
                case "Last1Straight":break;
            }
        }
    },
    'LF':{
        betBallUI:function(code){
            switch (code){
                case "Last1Straight":break;
            }
        }
    },
    getHotAndGap:function(){//进入采种和开奖后需要加载或更新当前采种
        TCG.Ajax({url:'lgw/draw/5/hot_gap_info',headers:{Merchant: "2000cai"}},function(rs){
            //TCG.Ajax({url:'lgw/draw/'+globalVar.currentLottery.gameId+'/hot_gap_info',headers:{Merchant: globalVar.merchantCode}},function(rs){
            var start= 0,end= 0;
            switch ("11X5"){
            //switch (globalVar.currentLottery.series[0].gameGroup){
                case "SSC":
                case "LF":start= 0;end= 10;break;
                case "11X5":start=1;end=12;break;
            }
            globalVar.currentLottery.hot={ball:{},size:{}};
            if(rs.hot){
                for(var i in rs.hot){
                    globalVar.currentLottery.hot.ball[i]=rs.hot[i].slice(start,end);
                    globalVar.currentLottery.hot.size[i]=rs.hot[i].slice(12);
                }
                console.log(globalVar.currentLottery.hot);
            }
            globalVar.currentLottery.gap={ball:{},size:{}};
            if(rs.gap){
                for(var i in rs.hot){
                    globalVar.currentLottery.gap.ball[i]=rs.hot[i].slice(start,end);
                    globalVar.currentLottery.gap.size[i]=rs.hot[i].slice(12);
                }
                console.log(globalVar.currentLottery.gap);
            }
        });
    },
    gapAndHotBtnEvents:function(){
        $(document).off("click","#gap_and_hot dt").on("click","#gap_and_hot dt",function(){
            if($(this).hasClass("active")){return;}
            $("#gap_and_hot dt").removeClass("active");
            $(this).addClass("active");
            var bits=$("#gap_and_hot").attr("play-ranks").split("#");
            var type=$(this).attr("data-val");
            switch (type){
                case "hot":lott.setHotUI(bits);break;
                case "gap":lott.setGapUI(bits);break;
            }
        });
    },
    setGapUI:function(bits){
        for(var i=0;i<bits.length;i++){
            var gaps=globalVar.currentLottery.gap[bits[i]];
            if(gaps.length>0){
                for(var g=0;g<gaps.length;g++){
                    $("#lott_ranks_"+bits[i]+">dl>dd:eq("+g+")").text(gaps[g]);
                }
            }
        }
    },
    setHotUI:function(bits){
        for(var i=0;i<bits.length;i++){
            var hots=globalVar.currentLottery.hot[bits[i]];
            if(hots.length>0){
                for(var h=0;h<hots.length;h++){
                    $("#lott_ranks_"+bits[i]+">dl>dd:eq("+h+")").text(hots[h]);
                }
            }
        }
    },
    autoSetGapOrHot:function(bits){
        var type=$("#gap_and_hot dt[class*='active']").attr("data-val");
        switch (type){
            case "hot":lott.setHotUI(bits);break;
            case "gap":lott.setGapUI(bits);break;
        }
    },
    /**
     * 生成直选玩法UI以及事件
     * @param title 每行称为
     * @param bits 开奖号码对应的位置(万first，千second，百third，十fourth，个fifth)
     * @param start 每行号球开始数字
     * @param end 每行号球结束数字
     * @param width 每行号球的位数
     * @param isSift 是否有筛选
     * @param functions 回调函数
     */
    direct:function(title,bits,start,end,width,isSift,functions){
        var obj={};
        var gameGroup=globalVar.currentLottery.series[0].gameGroup;
        var txt='';
        var ranks=bits.join("#");
        $("#gap_and_hot").attr("play-ranks",ranks);
        for(var i=0;i<bits.length;i++){
            if(gameGroup=='11X5'){
                obj[bits[i]]=[];
            }else{
                obj[bits[i]]='';
            }
            txt+=lott.ranks(title,bits[i],start,end,width,isSift);
        }
        bits.push(obj);
        $(".lot-game-wrp").html(txt);
        lott.gapAndHotBtnEvents();//绑定遗漏或冷热UI事件
        lott.autoSetGapOrHot();//加载遗漏或冷热
        if(functions){functions(bits,isSift);}
    },
    /**
     * 选择号球
     * @param bits
     * @param isSift
     * @param mxBall
     * @param miBall
     */
    selectionBall:function(bits,isSift,mxBall,miBall,functions){
        for(var i=0;i<bits.length-1;i++){
            if(isSift){// 判断玩法是否允许有筛选事件
                lott.multipleBallEvent(bits[i],bits,functions,mxBall);// 投注号球点击事件加载(多个)
                lott.siftBtnEvents(bits[i],bits,functions);// 筛选点击事件加载
            }else{// 无筛选事件并且投注选号只能选择一个
                lott.singleBallEvent(bits[i],bits,functions);// 投注号球点击事件加载(一个)
            }
        }
    },
    /**
     * 根据号球位置创建选号UI
     * @param title 选号UI title
     * @param bit 号球位置
     * @param ball 生成选号UI
     * @param isSift 是否有筛选
     */
    ranks:function(title,bit,start,end,width,isSift){
        var txt='';
        txt+='<div id="lott_ranks_'+bit+'" class="game-cntaner">';
        txt+='<span class="lt-tb-row inline-block">'+(title==null?TCG.Prop("lottery_bett_"+bit):title)+'</span>';
        txt+='<dl class="lt-number-row inline-block">'+lott.ball(start,end,width)+'</dl>';
        if(isSift){
            txt+=lott.sift();
        }
        txt+='</div>';
        return txt;
    },
    ball:function(start,end,width){
        var txt='';
        for(var i=start;i<=end;i++){
            txt+='<dt class="num-wrp">'+(width==2&&i<10?'0'+i:i)+'</dt>';
            txt+='<dd class="sub-wrp"></dd>';
        }
        return txt;
    },
    multipleBallEvent:function(bit,obj,functions,mxBall){
        $(document).off("click","#lott_ranks_"+bit+">dl>dt").on("click","#lott_ranks_"+bit+">dl>dt",function(){
            var checkedBall=$(this).text();
            var gameGroup=globalVar.currentLottery.series[0].gameGroup;
            if($(this).hasClass("selected")){
                $(this).removeClass("selected");
                var vl=obj[obj.length-1][bit].indexOf(checkedBall);
                if(vl>-1){
                    if(gameGroup=='11X5'){
                        obj[obj.length-1][bit].splice(vl,1);
                    }else{
                        var str = obj[obj.length-1][bit].replace(checkedBall, "");
                        obj[obj.length-1][bit]=str;
                    }
                }
                //countAmount(functions(obj));
            }else{
                if(obj[obj.length-1][bit].length+1>mxBall){
                    TCG.Alert("errors","当前玩法最多只能选择"+mxBall+"个号球!");
                    return;
                }
                $(this).addClass("selected");
                if(gameGroup=='11X5'){
                    obj[obj.length-1][bit].push(checkedBall);
                }else{
                    obj[obj.length-1][bit]+=checkedBall;// 把当前所选号码和之前选择的号码组起来
                }
                //countAmount(functions(obj));
            }
        });
    },
    singleBallEvent:function(bit,obj,functions){
        $(document).off("click","#lott_ranks_"+bit+">dl>dt").on("click","#lott_ranks_"+bit+">dl>dt",function(){
            if($(this).hasClass("selected")){
                $(this).removeClass("selected");
                obj[obj.length-1][bit]='';
                //countAmount(functions(obj));
            }else{
                $("#lott_ranks_"+bit+">dl>dt").removeClass("selected");
                $(this).addClass("selected");
                var checkedBall=$(this).text();// 得到所选号码
                //var t=PLAY_ID.split(".");
                //if(t[1]*1==225||t[1]*1==226||t[1]*1==233||t[1]*1==21881||t[1]*1==21882||t[1]*1==218124){// 如果为大小单双需要转换
                //    chknber=dxConversion(chknber);
                //}
                obj[obj.length-1][bit]=checkedBall;// 把当前所选号码和之前选择的号码组起来
                //countAmount(functions(obj));
            }
        });
    },
    sift:function(){
        return '<ul class="lt-pick-row inline-block"><li sift="all">全</li><li sift="big">大</li><li sift="small">小</li><li sift="odd">奇</li><li sift="even">偶</li><li sift="clear">清</li></ul>';
    },
    siftBtnEvents:function(bit,obj,functions){
        $(document).off("click","#lott_ranks_"+bit+">ul>li").on("click","#lott_ranks_"+bit+">ul>li",function(){
            var events=$(this).attr("sift");
            var gameGroup=globalVar.currentLottery.series[0].gameGroup;
            $("#lott_ranks_"+bit+">dl>dt").removeClass("selected");
            switch (events){
                case "all":$("#lott_ranks_"+bit+">dl>dt:nth-child(1n+1)").addClass("selected");break;
                case "big":$("#lott_ranks_"+bit+">dl>dt:gt(4)").addClass("selected");break;
                case "small":$("#lott_ranks_"+bit+">dl>dt:lt(5)").addClass("selected");break;
                case "odd":
                    if(gameGroup==='11X5'){
                        $("#lott_ranks_"+bit+">dl>dt:nth-child(odd)").addClass("selected");
                    }else{
                        $("#lott_ranks_"+bit+">dl>dt:nth-child(even)").addClass("selected");
                    }
                    break;
                case "even":
                    if(gameGroup==='11X5'){
                        $("#lott_ranks_"+bit+">dl>dt:nth-child(even)").addClass("selected");
                    }else{
                        $("#lott_ranks_"+bit+">dl>dt:nth-child(odd)").addClass("selected");
                    }
                    break;
                case "clear":
                    if(gameGroup=='11X5'){
                        obj[obj.length-1][bit].splice(0,obj[obj.length-1][bit].length);
                    }else{
                        obj[obj.length-1][bit]='';
                    }
                    break;
            }
            if(gameGroup==='11X5'){
                var tmp=$("#lott_ranks_"+bit+" .selected").text().replace(/(?=(\d{2})+(\D|$))/g,'$2_').substring(1);
                obj[obj.length-1][bit] = tmp.split('_');
            }else{
                obj[obj.length-1][bit]=$("#lott_ranks_"+bit+" .selected").text();
            }
            //countAmount(functions(obj));
        });
    }
};