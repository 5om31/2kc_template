var Logger = window.Logger = Em.Logger.debug;
var UU = Em.Object.create();

// --------------------------------------------------------------------------------
// Listen the message from the server  ( StompJS over SockJS )
// --------------------------------------------------------------------------------

UU.websocket_debug = false;
UU.WebMessageBridge = Em.Object.extend({

    endpoint: '',
    connected: false,
    disconnected: false,
    sockjs: undefined,
    stompClient: undefined,
    reconnectTimer: undefined,
    reconnectTimeout: 1500,


    connect: function(token, endpoint) {
        
        var self = this;

        if ( !Em.isEmpty(endpoint) ) {
            self.set('endpoint', endpoint);
            self.set('disconnected', false);
        } else if (Em.isEmpty(self.get('endpoint'))){
            throw "connect endpoint is null.";
        }

        // protocols_whitelist: ['websocket', 'xhr-pooling', 'iframe-xhr-polling']
        // websocket SLB 不支援
        // https://github.com/sockjs/sockjs-client/wiki/%5BArticle%5D-SockJS:-WebSocket-emulation-done-right
        var options = {
            protocols_whitelist: ['websocket', 'xhr-pooling', 'iframe-xhr-polling'],
            debug: UU.websocket_debug
        };
        self.sockjs = new SockJS(self.endpoint, null, options);
        self.stompClient = Stomp.over(self.sockjs);
        
        if(!UU.websocket_debug){
            self.stompClient.debug = null;
        }

        self.stompClient.connect(token,token, function(frame) {

            self.set('connected' , true);

        },function() {

            if(!self.get('disconnected')){
                self.set('connected' , false);
                self.reconnect();
            }
            
        });
    },

    disconnect: function() {

        clearTimeout(this.reconnectTimer);
        this.set('disconnected', true);

        if (! Em.isEmpty( this.stompClient ) ) {

            try {
                this.stompClient.disconnect();
            } catch(ex) {
                Logger("disconnect failed: ", ex);
            }
            
            this.set('connected' , false);
            this.stompClient = undefined;
            delete this.sockjs;
            this.sockjs = undefined;
        }

    },

    subscribe: function(topic,func) {

        if (this.get('connected')) {

            return this.stompClient.subscribe(topic, func);
        }
    },

    stateChanaged: function() {

        Logger('Connected:' , this.get('connected'));

    }.observes('connected') ,

    reconnect: function( ) {
        var self = this;

        self.reconnectTimer = setTimeout(function() {

            self.connect();

        }, this.get('reconnectTimeout'));

    }

});

UU.webMessageBridgeInst = UU.WebMessageBridge.create({});


UU.StompTopic = Em.Object.extend({

    messageBridge: UU.webMessageBridgeInst,
    subscription:null,
    funcCallback: null,
    onSubscribeCallback: undefined,
    topic: '',
    message: '',

    unsubscribe: function() {

        if ( this.subscription != null) {
            this.subscription.unsubscribe();
        }

        // clear
        this.subscription = null;
        this.funcCallback = null;
        this.set('message','');
    },

    subscribe: function(func, callbackFunc) {

        var self = this;
        this.funcCallback = func;
        this.onSubscribeCallback = callbackFunc;
        this.subscription = this.messageBridge.subscribe(this.get('topic'), function(message) {

            self.set('message', message);

            if ( ! Em.isNone(func) ) {
                func(message.body);
            }
         });

        if (this.subscription && typeof(callbackFunc) === 'function') {
            callbackFunc();
        }
    },

    connectedChanage: function() {

        var connected = this.get('messageBridge.connected');

        if (connected && (!Em.isNone(this.funcCallback)) ) {


            this.subscribe(this.funcCallback, this.onSubscribeCallback);
        }


    }.observes('messageBridge.connected')
});