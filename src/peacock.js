/**
 * Created by patrick on 16/10/13.
 */
window.pck = {};
(function(module){
    //注册模块属性$开始
    var __module = {};
    function register(propertyName,objCreator){
        if(!isFunction(objCreator)){
            throw new Error('objCreator must be a function')
        }
        Object.defineProperty(module,propertyName,{
            get:function(){
                if(undefined === __module[propertyName]){
                    __module[propertyName] = objCreator();
                }
                return __module[propertyName];
            },
            configurable:false,
            enumerable:false
        });
    }
    /**
     * 版本号
     * */
    register('version',function(){
        return '0.0.1';
    });
    /**
     *  继承
     * */
    module.extends = function(Child,Parent){
        var F = function () {};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
    };
    /**
     *  向全局对象里添加,获取,删除对象
     **/
    function Share(){

    }
    module.extends(Share,Object);
    register("$share",function(){
        return new Share();
    });
    /**
     *  url参数相关操作方法
     * */
    function __getKeyValueFromUrl(queryString){
        var queryParam = {};
        var regex = /([0-9a-zA-Z%_\-\+]+)=([0-9a-zA-Z%_\-\+]+)/gi;
        //
        var kv;
        while(kv = regex.exec(queryString)){
            if(!queryParam.hasOwnProperty(kv[1])){
                queryParam[kv[1]] = [];
            }
            queryParam[kv[1]].push(decodeURI(kv[2]));
        }
        return queryParam;
    }
    function Url(){

        var url = location.href;
        var params = __getKeyValueFromUrl(location.search);
        /**
         *  url 定义属性
         * */
        Object.defineProperty(this,"url",{
            get:function(){
                return location.href;
            }
        });
        Object.defineProperty(this,"params",{
            get:function(){
                if(url !== this.url){
                    params = __getKeyValueFromUrl(location.search);
                }
                return params;
            }
        });
        this.constructor.prototype.query = function(key){
            if(url !== this.url){
                params = this.params;
            }
            if(undefined !== params[key] && params[key].length > 0){
                return params[key][0];
            }
            return undefined;
        };
        this.constructor.prototype.queryAll = function(key){
            if(url !== this.url){
                params = this.params;
            }
            return params[key];
        };
        /**
         *  options 包括protocol,host,port,path,params,hash
         * */
        this.constructor.prototype.genUrl = function(options){
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
        };
    }
    module.extends(Url,Object);
    register("$url",function(){
        return new Url();
    });
    /**
     *  log相关方法
     * */
    var __prettyLog = function(loglevel){
        return function (information){
            var msg = information;
            if('object' === typeof information){
                msg = JSON.stringify(information,undefined,"\t");
            }
            console[loglevel](msg);
        };
    };
    function Log(){
        var logLevelList = ['info','log','warn','error'];
        for(var i=0;i<logLevelList.length;i++){
            this.constructor.prototype[logLevelList[i]] = __prettyLog(logLevelList[i]);
        }
    }
    module.extends(Log,Object);
    register("$log",function(){
        return new Log();
    });
    /**
     * 工具类
     * */
    function Util(){
    }
    module.extends(Util,Object);
    register("$util",function(){
        return new Util();
    });
    /**
     *  $object对象工具函数
     * */
    function isNil(obj){
        return undefined === obj || null === obj;
    }
    function isFunction(func){
        return 'function' === typeof func;
    }
    function keyPath(keyPath){
        var regex = /(?:\.([^\.\[\'\"\]]+)|\['([^\.\[\'\"\]]+)\']|\["([^\.\[\'\"\]]+)"\])/g;
        var pathList = [];
        var result = null;
        while(result = regex.exec("."+keyPath)){
            (function(){
                for(var i=1;i<result.length;i++){
                    if(undefined !== result[i]){
                        pathList.push(result[i]);
                        break;
                    }
                }
            }());
        }
        return pathList;
    }
    function getKeyPath(obj,keyPathString){
        //
        if(null === obj || undefined === obj || "object" !== typeof obj){
            return obj;
        }
        //
        var pathList = keyPath(keyPathString);
        for(var i=0;i<pathList.length;i++){
            obj = obj[pathList[i]];
            if(undefined === obj){
                break
            }
        }
        return obj;
    }
    function setKeyPath(obj,keyPath,value){
        if(null === obj || undefined === obj || "object" !== typeof obj){
            return obj;
        }
        var pathList = keyPath(keyPath);
        var prop = obj;
        for(var i=0;i<pathList.length;i++){
            prop = prop[pathList[i]];
            if(pathList.length - 2 !== i){
                if(undefined === prop){
                    break;
                }
            }else{
                prop[pathList[i+1]] = value;
            }
        }
        return obj;
    }
    function getValue(objOrFunction){
        if(isFunction(objOrFunction)){
            return objOrFunction();
        }
        return objOrFunction;
    }
    function casify(obj,convert){
        if ('object' === typeof obj){
            for(var name in obj){
                if(obj.hasOwnProperty(name)) {
                    var casedName = convert(name);
                    if (Array.isArray(obj)) {
                        for (var i = 0; i < obj.length; i++) {
                           casify(obj[i], convert);
                        }
                    }else{
                        casify(obj[name], convert);
                        (function (){
                            var originalName = name;
                            var convertedName = casedName;
                            if (originalName !== convertedName) {
                                Object.defineProperty(obj, convertedName, {
                                    set: function (value) {
                                        obj[originalName] = value;
                                    },
                                    get: function () {
                                        return obj[originalName];
                                    }
                                });
                            }
                        }());
                    }
                }
            }
        }

    }

    function camelCasing(obj){
        casify(obj,camelCasify);
    }
    function ObjectUtil(){
        this.constructor.prototype.isNil = isNil;
        this.constructor.prototype.isFunction = isFunction;
        this.constructor.prototype.keyPath = keyPath;
        this.constructor.prototype.getKeyPath = getKeyPath;
        this.constructor.prototype.setKeyPath = setKeyPath;
        this.constructor.prototype.getValue = getValue;
        //转换属性名 todo:待测试
        this.constructor.prototype.casify = casify;
        this.constructor.prototype.camelCasing = camelCasing;
    }
    module.extends(ObjectUtil,Object);
    register("$object",function(){
        return new ObjectUtil();
    });
    /**
     *  $Date 日期时间工具方法
     * */
    function getDayBreak(date){
        return new Date(date.getFullYear(),date.getMonth(),date.getDate(),0,0,0,0);
    }
    function addDay(date,delta){
        var timestamp = date.getTime()+60*60*1000*24*delta;
        return new Date(timestamp);
    }
    function format(template,date,padLeft){
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
    function DateUtil(){

        //获取凌晨0点的Date对象
        this.constructor.prototype.getDayBreak = getDayBreak;
        //增加n天,负数为减天数
        this.constructor.prototype.addDay = addDay;
        //格式化日期
        this.constructor.prototype.format = format;
    }
    module.extends(DateUtil,Object);
    register("$date",function(){
        return new DateUtil();
    });
    /**
     *  $string 字符串工具方法
     * */
    function trim(string,chars){
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

    }
    function repeat(string,repeatCount){
        var list = [];
        if(repeatCount < 2){
            return string;
        }
        for(var i=0;i< repeatCount;i++){
            list.push(string);
        }
        return list.join("");
    }
    function padBoth(string,leftPadCount,rightPadCount,chars){
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
            resultStringList.push(repeat(chars,leftRepeatCount));
            resultStringList.push(chars.slice(0,leftRestCharCount));
        }
        resultStringList.push(string);
        if(rightPadCount > 0){
            var rightRepeatCount = Math.floor(rightPadCount / chars.length);
            var rightRestCharCount = rightPadCount % chars.length;
            resultStringList.push(repeat(chars,rightRepeatCount));
            resultStringList.push(chars.slice(0,rightRestCharCount));
        }

        return resultStringList.join("");

    }
    function padLeft(string,length,chars){
        var leftPadCount = 0;
        if(length > string.length){
            leftPadCount = length - string.length;
        }
        return padBoth(string,leftPadCount,0,chars);
    }
    function padRight(string,length,chars){
        var rightPadCount = 0;
        if(length > string.length){
            rightPadCount = length - string.length;
        }
        return padBoth(string,0,rightPadCount,chars);
    }
    function pad(string,length,chars){
        var leftPadCount = 0;
        var rightPadCount = 0;
        if(length > string.length){
            var totalPadCount = length - string.length;
            leftPadCount = Math.floor(totalPadCount/2);
            rightPadCount = totalPadCount-leftPadCount;
        }
        return padBoth(string,leftPadCount,rightPadCount,chars);
    }
    function render(template,data){
        var regex = /(\{\{\s*(\S*)\s*\}\})/g;
        var resultStringList = [];
        var result = null;
        var lastIndex = 0;
        while(result = regex.exec(template)){
            resultStringList.push(template.slice(lastIndex,result.index));
            var key = result[2];
            if("{{" === key || "}}" === key || "{" ===key || "}" === key){
                resultStringList.push(key);
            }else{
                resultStringList.push(new ObjectUtil().getKeyPath(data,key));
            }

            lastIndex = result.index + result[1].length;
        }
        if(template.length - 1 > lastIndex){
            resultStringList.push(template.slice(lastIndex,template.length));
        }
        return resultStringList.join("");
    }
    function camelCasify(word){
        var regex = /[a-zA-Z0-9\$]+/g;
        var wordList = [];
        var result;
        while (result = regex.exec(word)){
            (function(){
                var wordFragment = result[0];
                wordList.push(wordFragment[0].toUpperCase());
                wordList.push(wordFragment.slice(1));
            }());
        }
        return wordList.join('');
    }
    //todo:
    function kebabCasify(word){
        var regex = /[a-zA-Z0-9\$]+/g;
        var camelRegex = /[A-Z][a-zA-Z0-9\$]*/g;
        var wordList = [];
        var result;
        while (result = regex.exec(word)){
            (function(){
                var wordFragment = result[0];
                //
                var camelResult = camelRegex.exec(wordFragment);
                if(camelResult){
                    if(camelResult.index > 0){
                        wordList.push(wordFragment.slice(0,camelResult.index).toLowerCase());
                    }
                    do{
                        wordList.push(camelResult[0].toLowerCase());
                    }
                    while (camelResult = camelRegex.exec(wordFragment));
                }else{
                    wordList.push(wordFragment);
                }
            }());
        }
        return wordList.join('-');
    }
    //todo:
    function snackCasing(word){
        var regex = /[a-zA-Z0-9\$]+/g;
        var camelRegex = /[A-Z][a-zA-Z0-9\$]*/g;
        var wordList = [];
        var result;
        while (result = regex.exec(word)){
            (function(){
                var wordFragment = result[0];
                //
                var camelResult = camelRegex.exec(wordFragment);
                if(camelResult){
                    if(camelResult.index > 0){
                        wordList.push(wordFragment.slice(0,camelResult.index).toLowerCase());
                    }
                    do{
                        wordList.push(camelResult[0].toLowerCase());
                    }
                    while (camelResult = camelRegex.exec(wordFragment));
                }else{
                    wordList.push(wordFragment);
                }

            }());
        }
        return wordList.join('_');
    }
    function StringUtil(){
    console.log("StringUtil init");
        //删除字符串两边的指定字符
        this.constructor.prototype.trim = trim;
        //重复n次字符串
        this.constructor.prototype.repeat = repeat;
        //填充两边
        this.constructor.prototype.padBoth = padBoth;
        //填充左边
        this.constructor.prototype.padLeft = padLeft;
        //填充右边
        this.constructor.prototype.padRight = padRight;
        //近似均匀地填充两边
        this.constructor.prototype.pad = pad;
        //渲染模板函数:{{}}
        this.constructor.prototype.render = render;
        //转变为驼峰标识
        this.constructor.prototype.camelCasify = camelCasify;
        //转变为减号连接
        this.constructor.prototype.kebabCasify = kebabCasify;
        //转变为下划线连接
        this.constructor.prototype.snackCasing = snackCasing;
    }
    module.extends(StringUtil,Object);
    register("$string",function(){
        return new StringUtil();
    });
    /**
     *  $number 数字方法
     * */
    var isInteger = function(i){
        return (!isNaN(i)) && Math.floor(i) === i;
    };
    function NumberUtil(){
        //判断是不是整数
        this.constructor.prototype.isInteger = isInteger;
    }
    module.extends(NumberUtil,Object);
    register("$number",function(){
        return new NumberUtil();
    });
    /**
     *  $array 数组方法
     * */
    function ArrayUtil(){
        this.constructor.prototype.slice = Function.call.bind(Array.prototype.slice);
        this.constructor.prototype.forEach = Function.call.bind(Array.prototype.forEach);
    }
    module.extends(ArrayUtil,Object);
    register("$array",function(){
        return new ArrayUtil();
    });
    /**
     *   依赖注入
     * */
    var __dependencies = {};
    module.register = function(name,dependent){
        if (undefined === __dependencies[name]){
            __dependencies[name] = dependent;

        }else{
            throw new Error(['duplicate name ',name].join(''));
        }
    };
    module.config = function(config){
        if('function' === typeof config){
            config = config();
        }
        if('object' === typeof config && (!Array.isArray(config))){
            for(var name in config){
                if(config.hasOwnProperty(name)){
                    module.register(name,config[name])
                }
            }
        }else{
            throw new Error('config must be a object or a function which return object.');
        }
    };
    /**
     *  config是配置的,module.config是全局注入的,临时配置会覆盖全局配置
     *  有use(deps,injection)两种形式,其中config可以是function或object
     * */
    var __inject = function(dependence,injection,paramGetter){
        if(!Array.isArray(dependence)){
            throw new Error('dependence is not a array');
        }
        if('function' !== typeof injection){
            throw new Error('injection is not a function');
        }
        //检查完毕
        var paramList = [];
        for(var i=0;i<dependence.length;i++){
            var paramName = dependence[i];
            var param = paramGetter(paramName);
            if(undefined === param){
                throw new Error(paramName+' is not found. you must register it before using it.');
            }else if(isFunction(param)){
                param = param();
            }
            paramList.push(param);
        }
        injection.apply(undefined,paramList);
    };
    module.use = function(dependence,injection){
        __inject(dependence,injection,function(paramName){
            return  __dependencies[paramName];
        });
    };
    module.with = function(config){
        var configContext = new ConfigContext(config);
        return configContext;
    };
    function ConfigContext(tempConfig){
        this.constructor.prototype.use = function(dependence,injection){
            __inject(dependence,injection,function(paramName){
                return  undefined !== tempConfig[paramName] ? tempConfig[paramName] : __dependencies[paramName];
            });
        }
    }
    module.extends(ConfigContext,Object);
    module.config({
        '$share': function(){return module.$share},
        '$url': function(){return module.$url},
        '$log': function(){return module.$log},
        '$util': function(){return module.$util},
        '$object': function(){return module.$object},
        '$date': function(){return module.$date},
        '$string': function(){return module.$string},
        '$number': function(){return module.$number},
        '$array': function(){return module.$array}
    })
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



