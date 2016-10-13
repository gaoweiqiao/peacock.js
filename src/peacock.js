/**
 * Created by patrick on 16/10/13.
 */
window.peacock = (function(){

    var peacock = {};
    function register(propertyName,obj){
        Object.defineProperty(peacock,propertyName,{
            get:function(){
                if("function" === typeof obj){
                    return obj();
                }else {
                    return obj;
                }
            }
        });
    }
    /**
     *  工具类
     */
    var helper = {};
    helper.slice = Function.call.bind(Array.prototype.slice);

    helper.getQeury = function(queryString){
        var result = {};
        var regex = /([0-9a-zA-Z%]+)=([0-9a-zA-Z%]+)/g;
        var kv;
        while(kv = regex.exec(queryString)){
            if(!result.hasOwnProperty(kv[1])){
                result[kv[1]] = [];
            }
            result[kv[1]].push(decodeURI(kv[2]));
        }
        return result;
    };

    /**
     *  向全局对象里添加,获取,删除对象
     **/
    var share = {};
    register("$share",share);
    /**
     *  全局事件映射表
     * */
    var signalTable = {};
    var signalCenter = {
        on: function(signalName,listener,context){
            console.log(context);
            if(typeof signalName !== "string"){
                throw new Error("signal must be string");
            }
            if(typeof listener !== "function"){
                throw new Error("listener must be function");
            }
            if(!signalTable.hasOwnProperty(signalName)){
                signalTable[signalName]=[listener];
            }else{
                var listenerList = signalTable[signalName];
                for(var key in listenerList){
                    if(listenerList[key] == listener){
                        return;
                    }
                }
                listenerList.push(listener);
            }
        },
        un:function(signalName,listener){
            if(signalTable.hasOwnProperty(signalName)){
                var listenerList = signalTable[signalName];
                for(var key in listenerList){
                    if(listener === listenerList[key]){
                        delete listenerList[key];
                        break;
                    }
                }
            }
        },
        send:function(signalName){
            if(signalTable.hasOwnProperty(signalName)){
                var listenerList = signalTable[signalName];
                var args = arguments;
                setTimeout(function(){
                    for(var key in listenerList){
                        listenerList[key].apply(undefined,args);
                    }
                });
            }
        }
    };
    register("$bus",signalCenter);
    /**
     *  查询参数
     * */
    function QueryParams(paramsDict){
        this.getQueryParam = function(name){
            if(paramsDict.hasOwnProperty(name)){
                return paramsDict[name][0];
            }
            return undefined;
        };
        this.getQueryParams = function(name){
            if(paramsDict.hasOwnProperty(name)){
                return paramsDict[name];
            }
            return undefined;
        }
    }
    var queryParam = {
        url: undefined,
        params: new QueryParams()
    };
    function getQueryParams(){
        if(queryParam.url !== location.href){
            var queryString = location.search;
            queryParam.url = location.href;
            queryParam.params = new QueryParams(helper.getQeury(queryString));
        }
        return queryParam.params;
    }
    register("$query",getQueryParams);
    /**
     *   封装sessionStorage
     * */
    var cache=[];
    var storage = {
        database:{
            query:function(filter){
                storage.checkFilter(filter);
                var result=[];
                for(var i= 0;i<cache.length;i++){
                    if(filter(cache[i])){
                        result.push(cache[i]);
                    }
                }
                return result;
            },
            insert:function(){
                for(var i=0;i<arguments.length;i++){
                    cache.push(arguments[i]);
                }
                localStorage.setItem("cache",JSON.stringify(cache));
            },
            update:function(filter,updater){
                storage.checkFilter(filter);
                for(var i=0;i<cache.length;i++){
                    if(filter(cache[i])){
                        updater(cache[i]);
                    }
                }
                localStorage.setItem("cache",JSON.stringify(cache));
            },
            remove:function(filter){
                storage.checkFilter(filter);
                for(var i=0;i<cache.length;i++){
                    if(filter(cache[i])){
                        cache.splice(i,1);
                    }
                }
                localStorage.setItem("cache",JSON.stringify(cache));
            }
        },
        checkFilter:function(filter){
            if("function" !== typeof filter){
                throw new Error("filter is not a function");
            }
        }
    };
    register("$db",storage.database);
    /**
     *   判断是iOS还是Android
     * */
    var device = {
        isAndroid:function(){
            var ua = navigator.userAgent.toLowerCase();
            return /android/.test(ua);
        },
        isIOS:function(){
            var ua = navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(ua)
        }
    };
    register("$device",device);
    /**
     *  导航,负责单页切换效果的Navigator
     * */
    var navigator = {
        __id:undefined,
        register:function(id){
            this.__id = document.getElementById(id);
        },
        pushPage:function(id,url){
            var newElement = document.createElement("page");
            var pageDom = new Vue({
                template:document.getElementById(id).innerHTML,
                methods:{
                    out:function(){
                        this.$el.className = "page page-ready";
                    }
                },
                ready:function(){
                    console.log(this.$el.className);
                    this.$el.className = "page";
                }
            });
            pageDom.$mount(newElement);
            this.__id.appendChild(pageDom.$el);
        }
    };
    register("$navigator",navigator);
    var page = Vue.extend({
        template: "<div class='page page-ready' style='background-color: #ff0000;' @click='out'>new-tag</div>",
        methods:{
            out:function(){
                this.$el.className = "page page-ready";
            }
        },
        ready:function(){
            console.log(this.$el.className);
            this.$el.className = "page";
        }
    });
    //Vue.component("page",page);
    /**
     *  返回全局对象
     * */
    return peacock;

}());


