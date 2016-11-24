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
            },
            configurable:false,
            enumerable:false
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
    /**
     *  $object对象工具函数
     * */
    function objectUtil(){
        this.isNil = function(obj){
            return undefined === object || null === obj;
        };
    }
    register("$object",objectUtil);
    /**
     *  $Date 日期时间工具方法
     * */
    function DateUtil(){
        //获取凌晨0点的Date对象
        this.getDayBreak = function(date){
            return new Date(date.getFullYear(),date.getMonth(),date.getDate(),0,0,0,0);
        };
        //增加n天,负数为减天数
        this.addDay = function(date,delta){
            var timestamp = date.getTime()+60*60*1000*24*delta;
            return new Date(timestamp);
        };
        //格式化日期
        this.format = function(template,date,padLeft){
            if(!isNaN(date)){
                date = new Date(date);
            }
            var regex = /(yyyy|MM|dd|HH|mm|ss|z)/g;
            var dateStringList = [];
            var lastIndex = 0;
            var dateComponent = null;
            var stringUtil = new StringUtil();
            function padLeftDate(n,repeatCount){
                if(padLeft){
                    stringUtil.padLeft(n+"",repeatCount,"0")
                }
                return n;
            }
            while(dateComponent = regex.exec(template)){
                dateStringList.push(template.slice(lastIndex,dateComponent.index));
                if("yyyy" === dateComponent[0]){
                    dateStringList.push(date.getFullYear());
                }else if("MM" === dateComponent[0]){
                    dateStringList.push(padLeftDate(date.getMonth()+1));
                }else if("dd" === dateComponent[0]){
                    dateStringList.push(padLeftDate(date.getDate()));
                }else if("HH" === dateComponent[0]){
                    dateStringList.push(padLeftDate(date.getHours()));
                }else if("mm" === dateComponent[0]){
                    dateStringList.push(padLeftDate(date.getMinutes()));
                }else if("ss" === dateComponent[0]){
                    dateStringList.push(padLeftDate(date.getSeconds()));
                }else if("z" === dateComponent[0]){
                    dateStringList.push(padLeftDate(date.getMilliseconds()));
                }
                lastIndex = dateComponent.index+dateComponent[0].length;
            }
            return dateStringList.join("");
        }
    }
    register("$date",DateUtil);
    /**
     *  $string 字符串工具方法
     * */
    function StringUtil(){
        //删除字符串两边的指定字符
        this.trim = function(string,chars){
            var charList = [" "];
            if(undefined !== chars){
                charList = chars.split("");
            }
            //var startFinish = false;
            //var endFinish = false;
            (function a(){
                var trimStart = false;
                var trimEnd = false;
                for(var i=0;i<charList.length;i++){
                    if(string[0] === charList[i]){
                        trimStart = true;
                    }
                    if(string[string.length - 1] === charList[i]){
                        trimEnd = true;
                    }
                }
                var sliceStart = 0;
                var sliceEnd = string.length;
                if(trimStart){
                    sliceStart = 1;
                }
                if(trimEnd){
                    sliceEnd--;
                }
                if(trimStart || trimEnd){
                    string = string.slice(sliceStart,sliceEnd);
                    a();
                }
            }());
            return string;

        };
        //重复n次字符串
        this.repeat = function(string,repeatCount){
            var list = [];
            if(repeatCount < 2){
                return string;
            }
            for(var i=0;i< repeatCount;i++){
                list.push(string);
            }
            return list.join("");
        };
        //填充两边
        this.padBoth = function padBase(string,leftPadCount,rightPadCount,chars){
            if(undefined === chars || "" === chars){
                chars = " ";
            }
            if(0 === leftPadCount && 0 === rightPadCount){
                return string;
            }
            //
            var resultStringList = [];
            if(leftPadCount > 0){
                var leftRepeatCount = Math.floor(leftPadCount / chars.length);
                var leftRestCharCount = leftPadCount % chars.length;
                resultStringList.push(this.repeat(chars,leftRepeatCount));
                resultStringList.push(chars.slice(0,leftRestCharCount));
            }
            resultStringList.push(string);
            if(rightPadCount > 0){
                var rightRepeatCount = Math.floor(rightPadCount / chars.length);
                var rightRestCharCount = rightPadCount % chars.length;
                resultStringList.push(this.repeat(chars,rightRepeatCount));
                resultStringList.push(chars.slice(0,rightRestCharCount));
            }

            return resultStringList.join("");

        };
        //填充左边
        this.padLeft = function(string,length,chars){
            var leftPadCount = 0;
            if(length > string.length){
                leftPadCount = length - string.length;
            }
            return this.padBoth(string,leftPadCount,0,chars);
        };
        //填充右边
        this.padRight = function(string,length,chars){
            var rightPadCount = 0;
            if(length > string.length){
                rightPadCount = length - string.length;
            }
            return this.padBoth(string,0,rightPadCount,chars);
        };
        //近似均匀地填充两边
        this.pad = function(string,length,chars){
            var leftPadCount = 0;
            var rightPadCount = 0;
            if(length > string.length){
                var totalPadCount = length - string.length;
                leftPadCount = Math.floor(totalPadCount/2);
                rightPadCount = totalPadCount-leftPadCount;
            }
            return this.padBoth(string,leftPadCount,rightPadCount,chars);
        };
        //渲染模板函数:{{}}
        this.render = function(template,data){
            var regex = /(\{\{\s*(.*)\s*\}\})/g;
            var resultStringList = [];
            var result = null;
            var lastIndex = 0;
            while(result = regex.exec(template)){
                resultStringList.push(template.slice(lastIndex,result.index));
                var key = result[1];
                resultStringList.push(data[key]);
                lastIndex = result.index + result[1].length;
            }
            if(template.length - 1 > lastIndex){
                resultStringList.push(template.slice(lastIndex,template.length));
            }
            return resultStringList.join("");
        }
    }
    register("$string",StringUtil);
    /**
     *  $number 数字方法
     * */
    function NumberUtil(){
        //判断是不是整数
        this.isInteger = function(i){
            return (!isNaN(i)) && Math.floor(i) === i;
        }
    }
    register("$number",NumberUtil);
    /**
     *  $array 数组方法
     * */
    function ArrayUtil(){
        this.slice = Function.call.bind(Array.prototype.slice);
        this.forEach = Function.call.bind(Array.prototype.forEach);
    }
    register("$array",ArrayUtil);
}(window.pck));
//window.peacock = (function(){
//
//    var peacock = {};
//    /**
//     *  工具类
//     */
//    var helper = {};
//
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


