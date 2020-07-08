function Stack() {    //语义栈
    this.items = [];
    // 向栈添加新元素
    this.push = function (element) {
        this.items.push(element);
    }
    // 从栈内弹出一个元素
    this.pop = function () {
        return this.items.pop();
    }
    // 返回栈顶的元素
    this.peek = function () {
        return this.items[this.items.length - 1];
    }
    // 判断栈是否为空
    this.isEmpty = function () {
        return this.items.length === 0;
    }
    // 返回栈的长度
    this.size = function () {
        return this.items.length;
    }
    // 清空栈
    this.clear = function () {
        this.items = [];
    }
    // 打印栈内的所有元素
    this.print = function () {
        console.log(this.items.toString());
    };
}
function Quat(operation, param1, param2, result) {
    /**
     * 创建了一个四元式对象
     */
    this.operation = operation;
    this.param1 = param1;
    this.param2 = param2;
    this.result = result;
}
function SemanticParser(){
    this.init = function() {
        this.flag = undefined;   //在声明语句中存放标志
    }
    this.judgeState = function(next,flag){
        /*  仅在声明语句时对被声明的变量使用
        *   声明语句的语义动作不调用查找的方法，直接调用插入并检测它的返回值
        *   返回值 : 如果是true表示是新变量并已经插入到符号表内，如果是false则表示已经定义过
        *   symbol: 变量名
        *   type:   变量类型
        */
        this.temp = undefined;

        this.temp = SymbolTable.insertSymbol(next.value,flag,'');    //这里的value和词法分析的value代表的意义不同
        if(this.temp === false){
            Bugs.log(next.row,next.line,"SemanticError: 重复声明！ ");
        }
    }
    this.judgeVarDeclared = function(next){
        /* 查符号表，判断是否未经声明使用
        *  在非声明语句中，判断“普通变量”是否未经声明使用
        *  symbol: 符号的名字
        *  返回值:
        */
        this.temp = undefined;

        this.temp = SymbolTable.getVarSymbolInfo(next.value);
        if(this.temp === undefined){
            //bug 类，变量未经声明使用
            Bugs.log(next.row,next.line,"SemanticError: 未经声明使用！ ");
        }

    }
    this.judgeTapeDeclared = function(next,symbol){
        /* 查符号表，判断是否未经声明使用
        *  在非声明语句中，判断“纸带变量”是否未经声明使用
        *  symbol: 符号的名字
        *  返回值:
        */
        this.temp = undefined;
        this.temp = SymbolTable.getTapeSymbolInfo(symbol);
        if(this.temp === undefined){
            //bug 类，纸带变量未经声明使用
            Bugs.log(next.row,next.line,"SemanticError: 纸带变量未经声明使用！ ");

        }
    }
    this.judgeTypeSame = function(next,symbol1,symbol2){
        /* 查符号表，判断赋值语句等号两边数据类型是否一致
        * symbol1: 符号名1
        * symbol2: 符号名2
        * 返回值:
         */
        this.temp1= undefined;
        this.temp2 = undefined;
        this.temp1 = SymbolTable.getVarSymbolInfo(symbol1);
        if(this.temp1 !== undefined){          //如果为普通变量
            this.temp2 = SymbolTable.getVarSymbolInfo(symbol2);
            if(this.temp2 !== undefined) {
                if(this.temp1.type!== this.temp2.type){
                    //bug类,两操作数类型不一致
                    Bugs.log(next.row,next.line,"SemanticError: 操作数类型不一致！ ");

                }
            } 
        }
        else{     //如果为纸带变量
            this.temp1 = SymbolTable.getTapeSymbolInfo(symbol1);
            this.temp2 = SymbolTable.getTapeSymbolInfo(symbol2);
            if(this.temp1 === undefined || this.temp2 === undefined){
                //bug类,两操作数类型不一致
                Bugs.log(next.row,next.line,"SemanticError: 非纸带变量进行纸带移动操作！ ");

            }
        }
    }
}
function QuatCreate() {
    this.stack = new Stack();
    this.semanticParser = new SemanticParser();
    this.init = function(stack, semanticParser) {
        this.stack = stack;
        this.semanticParser = semanticParser;
        this.stack.clear();
        this.semanticParser.init();
        this.quat = [];
    }
    this.quatEvaluate = function(){
        /* 生成赋值语句四元式
        *
        */
        this.quat.push(new Quat('=',this.stack.items[this.stack.items.length - 1] , '' ,this.stack.items[this.stack.items.length - 2]));
    }
    this.quatDeclareEvaluate = function(){
        /* 生成声明语句四元式
        *  声明同时赋值
        */
        this.quat.push(new Quat('=',this.stack.items[this.stack.items.length - 1],this.semanticParser.flag,this.stack.items[this.stack.items.length - 2]));
    }
    this.quatTapeLeft = function () {
        /*
        *  生成纸带左移操作四元式
         */
        this.quat.push(new Quat('<-',this.stack.items[this.stack.items.length - 1],1,''));
    }
    this.quatTapeRight = function () {
        /*
        *  生成纸带右移操作四元式
         */
        this.quat.push(new Quat('->',this.stack.items[this.stack.items.length - 1],1,''));
    }
    this.quatExitNormally = function(){
        /* 生成程序正常退出的四元式
        *
         */
        this.quat.push(new Quat('jmp','','' ,-1));
    }
    this.quatExitWrong = function(){
        /*  生成程序异常退出的四元式
        *
         */
        this.quat.push(new Quat('jmp','','',-2));
    }
    this.quatDeclare = function(){
        /*  生成声明语句四元式
         *  声明同时不进行赋值
         */
        this.quat.push(new Quat('=','',this.semanticParser.flag,this.stack.items[this.stack.items.length - 1]));

    }
}

