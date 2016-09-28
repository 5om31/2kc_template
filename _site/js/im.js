var im = {};

im.drawNumberStompTopic = [];
im.userTopic = {} ;

im.connect = function(userId) {
    var bridge = UU.webMessageBridgeInst;
    bridge.connect(userId, '/rtmsg');
};

im.subscribeDrawResult = function(gameCode,callback) {

    // subscribe draw number topic
    var drawNumberTopicUrl = '/topic/draw_number/' + gameCode;

    this.drawNumberStompTopic[gameCode] = UU.StompTopic.create({
        topic: drawNumberTopicUrl
    });

    this.drawNumberStompTopic[gameCode] .subscribe(

        function(message) {
            callback(message);
        }
    );
};

im.unSubscribeDrawResult = function(gameCode) {
    this.drawNumberStompTopic[gameCode].unsubscribe();
};

im.subscribeUserChannel = function(userId,callback) {


    var userTopicUrl = '/topic/user/' + userId;

    this.userTopic = UU.StompTopic.create({
        topic: userTopicUrl
    });

    this.userTopic.subscribe(
        function(message) {
            callback(message);
        }
    );
};

im.unSubscribeUserChannel = function(gameCode) {
    this.userTopic.unsubscribe();
};