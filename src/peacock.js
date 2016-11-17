/**
 * Created by patrick on 16/10/13.
 */
window.pck = {};
(function(module){
    //注册模块属性$开始
    var _module = {};
    function register(propertyName,constructor){
        var params = Array.prototype.slice.call(arguments,2);
        Object.defineProperty(module,propertyName,{
            get:function(){
                if(undefined === _module[propertyName]){
                    _module[propertyName] = {};
                    constructor.apply(_module[propertyName],params);
                }
                return _module[propertyName];
            }
        });
    }
    /**
     *  向全局对象里添加,获取,删除对象
     **/
    function Share(){

    }
    register("$share",Share);
    /**
     *  url参数相关操作方法
     * */
    function Url(){
        function getKeyValueFromUrl(queryString){
            var queryParam = {};
            var regex = /([0-9a-zA-Z%_\-\+]+)=([0-9a-zA-Z%_\-\+]+)/gi;
            //
            var kv;
            while(kv = regex.exec(url)){
                if(!queryParam.hasOwnProperty(kv[1])){
                    queryParam[kv[1]] = [];
                }
                queryParam[kv[1]].push(decodeURI(kv[2]));
            }
            return queryParam;
        }
        var url = window.location.href;
        var params = getKeyValueFromUrl(window.location.href.search);
        /**
         *  url 定义属性
         * */
        Object.defineProperty(this,"url",{
            get:function(){
                return window.location.href;
            }
        });
        this.query = function(key){
            if(url !== this.url){
                params = getKeyValueFromUrl(this.url.search);
            }
            return params[key][0];
        };
        this.queryAll = function(key){
            if(url !== this.url){
                params = getKeyValueFromUrl(this.url.search);
            }
            return params[key];
        };
        /**
         *  options 包括protocol,host,port,path,params,hash
         * */
        this.genUrl = function(options){
            var urlFragmentList = [];

            if(options.host){
                var protocol = options.protocol ? options.protocol+"://" : "http://";
                var host = options.host ? options.host : "";
                var port = options.port ? ":"+options.port : "";
                urlFragmentList.push(protocol);
                urlFragmentList.push(host);
                urlFragmentList.push(port);
            }
            if(undefined === options.path){
                throw new Error("path must not be undefined");
            }else{
                if("/" !== options.path.charAt(0)){
                    urlFragmentList.splice(0);
                }
                urlFragmentList.push(options.path);
                (function(){
                    var prefix = "?";
                    for(var key in options.params){
                        if(options.params.hasOwnProperty(key)){
                            urlFragmentList.push(prefix);
                            urlFragmentList.push(key);
                            urlFragmentList.push("=");
                            urlFragmentList.push(options.params[key]);
                            if("?" === prefix){
                                prefix = "&";
                            }
                        }
                    }
                }());
                if(undefined !== options.hash){
                    urlFragmentList.push("#");
                    urlFragmentList.push(options.hash);
                }
            }
            return urlFragmentList.join("");
        }
    }
    register("$url",Url);
    /**
     *  log相关方法
     * */
    function Log(a){
        this.data = a;
        var logLevelList = ['info','log','warn','error'];
        function print(loglevel){
            return function (information){
                var msg = information;
                if('object' === typeof information){
                    msg = JSON.stringify(information,undefined,"\t");
                }
                console[loglevel](msg);
            };

        }
        for(var i=0;i<logLevelList.length;i++){
            this[logLevelList[i]] = print(logLevelList[i]);
        }
    }
    register("$log",Log);
    /**
     * 工具类
     * */
    function Util(){

    }
    register("$util",Util);

}(window.pck));
//window.peacock = (function(){
//
//    var peacock = {};
//
//    /**
//     *  工具类
//     */
//    var helper = {};
//    helper.slice = Function.call.bind(Array.prototype.slice);
//
//    /**
//     *  全局事件映射表
//     * */
//    var signalTable = {};
//    var signalCenter = {
//        on: function(signalName,listener,context){
//            console.log(context);
//            if(typeof signalName !== "string"){
//                throw new Error("signal must be string");
//            }
//            if(typeof listener !== "function"){
//                throw new Error("listener must be function");
//            }
//            if(!signalTable.hasOwnProperty(signalName)){
//                signalTable[signalName]=[listener];
//            }else{
//                var listenerList = signalTable[signalName];
//                for(var key in listenerList){
//                    if(listenerList[key] == listener){
//                        return;
//                    }
//                }
//                listenerList.push(listener);
//            }
//        },
//        un:function(signalName,listener){
//            if(signalTable.hasOwnProperty(signalName)){
//                var listenerList = signalTable[signalName];
//                for(var key in listenerList){
//                    if(listener === listenerList[key]){
//                        delete listenerList[key];
//                        break;
//                    }
//                }
//            }
//        },
//        send:function(signalName){
//            if(signalTable.hasOwnProperty(signalName)){
//                var listenerList = signalTable[signalName];
//                var args = arguments;
//                setTimeout(function(){
//                    for(var key in listenerList){
//                        listenerList[key].apply(undefined,args);
//                    }
//                });
//            }
//        }
//    };
//    register("$bus",signalCenter);
//    /**
//     *   封装sessionStorage
//     * */
//    var cache=[];
//    var storage = {
//        database:{
//            query:function(filter){
//                storage.checkFilter(filter);
//                var result=[];
//                for(var i= 0;i<cache.length;i++){
//                    if(filter(cache[i])){
//                        result.push(cache[i]);
//                    }
//                }
//                return result;
//            },
//            insert:function(){
//                for(var i=0;i<arguments.length;i++){
//                    cache.push(arguments[i]);
//                }
//                localStorage.setItem("cache",JSON.stringify(cache));
//            },
//            update:function(filter,updater){
//                storage.checkFilter(filter);
//                for(var i=0;i<cache.length;i++){
//                    if(filter(cache[i])){
//                        updater(cache[i]);
//                    }
//                }
//                localStorage.setItem("cache",JSON.stringify(cache));
//            },
//            remove:function(filter){
//                storage.checkFilter(filter);
//                for(var i=0;i<cache.length;i++){
//                    if(filter(cache[i])){
//                        cache.splice(i,1);
//                    }
//                }
//                localStorage.setItem("cache",JSON.stringify(cache));
//            }
//        },
//        checkFilter:function(filter){
//            if("function" !== typeof filter){
//                throw new Error("filter is not a function");
//            }
//        }
//    };
//    register("$db",storage.database);
//    /**
//     *   判断是iOS还是Android
//     * */
//    var device = {
//        isAndroid:function(){
//            var ua = navigator.userAgent.toLowerCase();
//            return /android/.test(ua);
//        },
//        isIOS:function(){
//            var ua = navigator.userAgent.toLowerCase();
//            return /iphone|ipad|ipod/.test(ua)
//        }
//    };
//    register("$device",device);
//    /**
//     *  导航,负责单页切换效果的Navigator
//     * */
//    var navigator = {
//        __id:undefined,
//        register:function(id){
//            this.__id = document.getElementById(id);
//        },
//        pushPage:function(id,url){
//            var newElement = document.createElement("page");
//            var pageDom = new Vue({
//                template:document.getElementById(id).innerHTML,
//                methods:{
//                    out:function(){
//                        this.$el.className = "page page-ready";
//                    }
//                },
//                ready:function(){
//                    console.log(this.$el.className);
//                    this.$el.className = "page";
//                }
//            });
//            pageDom.$mount(newElement);
//            this.__id.appendChild(pageDom.$el);
//        }
//    };
//    register("$navigator",navigator);
//    var page = Vue.extend({
//        template: "<div class='page page-ready' style='background-color: #ff0000;' @click='out'>new-tag</div>",
//        methods:{
//            out:function(){
//                this.$el.className = "page page-ready";
//            }
//        },
//        ready:function(){
//            console.log(this.$el.className);
//            this.$el.className = "page";
//        }
//    });
//    //Vue.component("page",page);
//    /**
//     *  返回全局对象
//     * */
//    return peacock;
//
//}());


