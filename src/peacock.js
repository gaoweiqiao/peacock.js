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
    function Share(){}
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
                    url = this.url;
                }
                return params;
            }
        });
    }
    module.extends(Url,Object);
    Url.prototype.query = function(key){
        var params = this.params;
        if(undefined !== params[key] && params[key].length > 0){
            return params[key][0];
        }
        return undefined;
    };
    Url.prototype.queryAll = function(key){
        return this.params[key];
    };
    /**
     *  options 包括protocol,host,port,path,params,hash
     * */
    Url.prototype.genUrl = function(options){
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
    register("$url",function(){
        return new Url();
    });
    /**
     *  $db方法
     * */
    //todo:not implement all
    var Cache = (function(){
        var dataSet = {};
        return {
            getData:function(name){
                if(undefined === dataSet[name]){
                    var dataString = sessionStorage.getItem(name);
                    dataSet[name] = dataString ? JSON.parse(dataString) : [];
                }
                return dataSet[name];
            },
            setData:function(name,data){
                dataSet[name] = data;
            },
            sync:function(name){
                if(0 === dataSet[name].length){
                    sessionStorage.removeItem(name);
                }else{
                    sessionStorage.setItem(name,JSON.stringify(dataSet[name]));
                }
            }
        };
    }());
    function Database(){
        function Operation(){
            this.tableName = undefined;
        }
        module.extends(Operation,Object);
        Operation.prototype.operate = function(data){
            throw new Error("Opration don't implements.");
        };
        Operation.prototype.from = function(tableName){
            this.tableName = tableName;
            //dataSet = Cache.getData(tableName);
            return this;
        };
        Operation.prototype.where = function(condition){
            this.condition = condition;
            return this;
        };
        //Operation.prototype.orderBy = function(comparator){
        //    this.comparator = comparator;
        //};
        //Operation.prototype.groupBy = function(group){
        //    this.group = group;
        //};
        Operation.prototype.execute = function(){
            var data = [];
            var dataSet = Cache.getData(this.tableName);
            if(undefined === dataSet){
                throw new Error("No table to query");
                return;
            }
            if(isFunction(this.condition)){
                dataSet.forEach(function(item,index){
                    if(this.condition(item)){
                        data.push(item);
                    }
                }.bind(this));
            }else{
                data = dataSet;
            }
            if(this)
            return this.operate(data);
        };
        //查询操作
        function QueryOperation(){
            QueryOperation.prototype.operate = function(data){
                return data;
            };
        }
        module.extends(QueryOperation,Operation);
        //删除操作
        function DeleteOperation(){
            DeleteOperation.prototype.operate = function(data){
                var dataSet = Cache.getData(this.tableName);
                var filteredDataSet = [];
                dataSet.forEach(function(item){
                    if(-1 === data.indexOf(item)){
                        filteredDataSet.push(item);
                    }
                });
                Cache.setData(this.tableName,filteredDataSet);
                Cache.sync(this.tableName);
            };
        }
        module.extends(DeleteOperation,Operation);
        //更新操作
        function UpdateOperation(update){
            UpdateOperation.prototype.operate = function(data){
                data.forEach(function(item){
                    update(item);
                });
                Cache.sync(this.tableName);
            };
        }
        module.extends(UpdateOperation,Operation);

        //插入操作//batch:true/false
        function InsertOperation(data,batch){
            this.constructor.prototype.into = function(tableName){
                var dataSet = Cache.getData(tableName);
                if(batch){
                    data.forEach(function(item){
                        dataSet.push(item);
                    });
                }else{
                    dataSet.push(data);
                }
                Cache.sync(tableName);
            };
        }
        module.extends(InsertOperation,Object);
        //查询
        this.constructor.prototype.select = function(){
            return new QueryOperation();
        };
        //删除
        this.constructor.prototype.delete = function(){
            return new DeleteOperation();
        };
        //更新
        this.constructor.prototype.update = function(update){
            return new UpdateOperation(update);
        };
        //插入
        this.constructor.prototype.insert = function(data){
            return new InsertOperation(data,false);
        };
        //批量插入
        this.constructor.prototype.insertBatch = function(dataList){
            if(Array.isArray(dataList)){
                return new InsertOperation(data,true);
            }else{
                throw new Error("insertBatch must be passed array param");
            }
        }
    }
    module.extends(Database,Object);
    register('$db',function(){
        return new Database();
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
    function Log(){}
    module.extends(Log,Object);
    Log.prototype.info = __prettyLog('info');
    Log.prototype.log = __prettyLog('log');
    Log.prototype.warn = __prettyLog('warn');
    Log.prototype.error = __prettyLog('error');
    register("$log",function(){
        return new Log();
    });
    /**
     * 工具类
     * */
    function transform(data,rules){
        /**
         * rules:{
         *      'dataKeyPath':{
         *          name:'transformedKeyPath',
         *          type:Number
         *      }
         *      or
         *      'dataKeyPath':'transformedKeyPath'
         * }
         * */
        if('object' === typeof data){
            for(var originalKeyPath in rules){
                if (rules.hasOwnProperty(originalKeyPath)){
                    var keyPathList = keyPath(originalKeyPath);
                    var cursor = data;
                    for(var i=0;i<keyPathList.length;i++){
                        if(Array.isArray(cursor)){
                            cursor.forEach(function(item){

                            });
                        }else{

                        }
                    }
                }

            }
        }
        return data;
    }
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
    function setKeyPath(obj,keyPathString,value){
        if(null === obj || undefined === obj || "object" !== typeof obj){
            return obj;
        }
        var pathList = keyPath(keyPathString);
        var prop = obj;
        for(var i=0;i<pathList.length;i++){
            if(pathList.length - 1 !== i){
                prop = prop[pathList[i]];
                if(undefined === prop){
                    break;
                }
            }else{
                prop[pathList[i]] = value;
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
    //convert function(oldName)=>newName;
    function casify(obj,convert){
        if ('object' === typeof obj){
            if (Array.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    casify(obj[i], convert);
                }
            }else{
                for(var name in obj){
                    if(obj.hasOwnProperty(name)) {
                        var casedName = convert(name);
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
    function kebabCasing(obj){
        casify(obj,kebabCasify);
    }
    function snackCasing(obj){
        casify(obj,snackCasify);
    }
    function rename(obj,convertor){
        if(isFunction(convertor)){
            casify(obj,convertor);
        }else if('object' === typeof convertor){
            casify(obj,function(originalName){
                if(undefined === convertor[originalName]){
                    return originalName;
                }
                return convertor[originalName];
            })
        }else{
            throw new Error('convertor must be a function or object');
        }
    }
    function ObjectUtil(){}
    module.extends(ObjectUtil,Object);
    ObjectUtil.prototype.isNil = isNil;
    ObjectUtil.prototype.isFunction = isFunction;
    ObjectUtil.prototype.keyPath = keyPath;
    ObjectUtil.prototype.getKeyPath = getKeyPath;
    ObjectUtil.prototype.setKeyPath = setKeyPath;
    ObjectUtil.prototype.getValue = getValue;
    ObjectUtil.prototype.casify = casify;
    ObjectUtil.prototype.camelCasing = camelCasing;
    ObjectUtil.prototype.kebabCasing = kebabCasing;
    ObjectUtil.prototype.snackCasing = snackCasing;
    ObjectUtil.prototype.rename = rename;
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
    //convertor : function('yyyy',2016)=>'2016年'
    function format(template,date,convertor){
        if(!isNaN(date)){
            date = new Date(date);
        }
        var regex = /(yyyy|MM|dd|HH|mm|ss|z)/g;
        var dateStringList = [];
        var lastIndex = 0;
        var dateComponent = null;
        var stringUtil = new StringUtil();
        function transform(template,number){
            if(convertor){
                var result = convertor(template,number);
                if(undefined === result){
                    throw new Error('converter must return something');
                }
                return result;
            }
            return number;
        }
        while(dateComponent = regex.exec(template)){
            dateStringList.push(template.slice(lastIndex,dateComponent.index));
            var templateFragment = dateComponent[0];
            if("yyyy" === templateFragment){
                dateStringList.push(transform(templateFragment,date.getFullYear()));
            }else if("MM" === templateFragment){
                dateStringList.push(transform(templateFragment,date.getMonth()+1));
            }else if("dd" === templateFragment){
                dateStringList.push(transform(templateFragment,date.getDate()));
            }else if("HH" === templateFragment){
                dateStringList.push(transform(templateFragment,date.getHours()));
            }else if("mm" === templateFragment){
                dateStringList.push(transform(templateFragment,date.getMinutes()));
            }else if("ss" === templateFragment){
                dateStringList.push(transform(templateFragment,date.getSeconds()));
            }else if("z" === templateFragment){
                dateStringList.push(transform(templateFragment,date.getMilliseconds()));
            }
            lastIndex = dateComponent.index+templateFragment.length;
        }
        return dateStringList.join("");
    }
    //todo:换特殊的正则表达式字符再测一测
    function parseDate(template,dateString){
        //解析模板
        var regex = /(yyyy|MM|dd|HH|mm|ss|z)/g;
        var parseRules = ['yyyy','MM','dd','HH','mm','ss','z'];
        var parseRulesRegex = ['\\d{4}','\\d{1,2}','\\d{1,2}','\\d{1,2}','\\d{1,2}','\\d{1,2}','\\d{1,3}'];

        var dateComponentsOrder = [];
        var last = 0;
        var resultList = [];
        var result;
        while ( result = regex.exec(template)){
            resultList.push(template.slice(last,result.index));
            dateComponentsOrder.push(parseRules.indexOf(result[0]));
            last = result.index + result[0].length;
        }
        //生成正则表达式
        var dateRegexList = [];
        for(var i=0;i<resultList.length;i++){
            dateRegexList.push(regexEscape(resultList[i]));
            dateRegexList.push('(');
            dateRegexList.push(parseRulesRegex[dateComponentsOrder[i]]);
            dateRegexList.push(')');
        }
        var dateRegex = new RegExp(dateRegexList.join(''));
        //
        var matchResult = dateString.match(dateRegex);
        var dateComponents = [0,0,0,0,0,0,0];
        if(matchResult){
            for(var j=1;j<matchResult.length;j++){
                var dateOrder = dateComponentsOrder[j-1];
                dateComponents[dateOrder] = parseInt(matchResult[j]);
            }
        }
        return new Date(dateComponents[0],dateComponents[1]-1,dateComponents[2],dateComponents[3],dateComponents[4],dateComponents[5],dateComponents[6],dateComponents[7]);
    }
    function dateEquals(date0,date1){
        return date0.getTime() === date1.getTime();
    }
    function DateUtil(){}
    module.extends(DateUtil,Object);
    //获取凌晨0点的Date对象
    DateUtil.prototype.getDayBreak = getDayBreak;
    //增加n天,负数为减天数
    DateUtil.prototype.addDay = addDay;
    //格式化日期
    DateUtil.prototype.format = format;
    //解析日期
    DateUtil.prototype.parse = parseDate;
    //判断两个对象相等
    DateUtil.prototype.equals = dateEquals;
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
    function regexEscape(text){
        //* . ? + $ ^ [ ] ( ) { } | \ /
        var escapeStr = '*.?+$^[](){}|\\/-';
        var result = [];
        for(var i=0;i<text.length;i++){
            if(escapeStr.indexOf(text[i]) > -1){
                result.push('\\');
            }
            result.push(text[i]);
        }
        return result.join('');
    }
    function camelCasify(word){
        var regex = /[a-zA-Z0-9\$]+/g;
        var wordList = [];
        var result;
        while (result = regex.exec(word)){
            (function(){
                var wordFragment = result[0];
                var firstLetter = wordFragment[0];
                if(0 === wordList.length){
                    wordList.push(firstLetter.toLowerCase());
                }else{
                    wordList.push(firstLetter.toUpperCase());
                }
                wordList.push(wordFragment.slice(1));
            }());
        }
        return wordList.join('');
    }
    function kebabCasify(word){
        var regex = /[a-zA-Z0-9\$]+/g;
        var camelRegex = /[A-Z][a-z0-9\$]*/g;
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
    function snackCasify(word){
        var regex = /[a-zA-Z0-9\$]+/g;
        var snakeRegex = /[A-Z][a-z0-9\$]*/g;
        var wordList = [];
        var result;
        while (result = regex.exec(word)){
            (function(){
                var wordFragment = result[0];
                //
                var snakeResult = snakeRegex.exec(wordFragment);
                if(snakeResult){
                    if(snakeResult.index > 0){
                        wordList.push(wordFragment.slice(0,snakeResult.index).toLowerCase());
                    }
                    do{
                        wordList.push(snakeResult[0].toLowerCase());
                    }
                    while (snakeResult = snakeRegex.exec(wordFragment));
                }else{
                    wordList.push(wordFragment);
                }

            }());
        }
        return wordList.join('_');
    }
    function StringUtil(){}
    module.extends(StringUtil,Object);
    //删除字符串两边的指定字符
    StringUtil.prototype.trim = trim;
    //重复n次字符串
    StringUtil.prototype.repeat = repeat;
    //填充两边
    StringUtil.prototype.padBoth = padBoth;
    //填充左边
    StringUtil.prototype.padLeft = padLeft;
    //填充右边
    StringUtil.prototype.padRight = padRight;
    //近似均匀地填充两边
    StringUtil.prototype.pad = pad;
    //渲染模板函数:{{}}
    StringUtil.prototype.render = render;
    //转变为驼峰标识
    StringUtil.prototype.camelCasify = camelCasify;
    //转变为减号连接
    StringUtil.prototype.kebabCasify = kebabCasify;
    //转变为下划线连接
    StringUtil.prototype.snackCasify = snackCasify;
    register("$string",function(){
        return new StringUtil();
    });
    /**
     *  $number 数字方法
     * */
    function isNumber(number){
        return 'number' === typeof number;
    }
    function isInteger(number){
        return isNumber(number) && 0 === number % 1;
    }
    function isFloat(number){
        return isNumber(number) && 0 !== number % 1;
    }
    function NumberUtil(){}
    module.extends(NumberUtil,Object);
    //判断是不是整数
    NumberUtil.prototype.isNumber = isNumber;
    //判断是不是整数
    NumberUtil.prototype.isInteger = isInteger;
    //判断是不是浮点数
    NumberUtil.prototype.isFloat = isFloat;
    register("$number",function(){
        return new NumberUtil();
    });
    /**
     *  $array 数组方法
     * */
    function ArrayUtil(){}
    module.extends(ArrayUtil,Object);
    ArrayUtil.prototype.slice = Function.call.bind(Array.prototype.slice);
    ArrayUtil.prototype.forEach = Function.call.bind(Array.prototype.forEach);
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
        '$db': function(){return module.$db},
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



