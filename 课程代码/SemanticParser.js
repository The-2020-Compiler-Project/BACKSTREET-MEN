function Stack() {    //语义栈
    this.items = [];

// 向栈添加新元素
    this.push = function (element) {
        items.push(element);
    }

// 从栈内弹出一个元素
    this.pop = function () {
        return items.pop();
    }

// 返回栈顶的元素
    this.peek = function () {
        return items[items.length - 1];
    }

// 判断栈是否为空
    this.isEmpty = function () {
        return items.length === 0;
    }

// 返回栈的长度
    this.size = function () {
        return items.length;
    }

// 清空栈
    this.clear = function () {
        items = [];
    }

// 打印栈内的所有元素
    this.print = function () {
        console.log(items.toString());
    };
}



function SemanticParser(){

    this.flag = undefined;   //在声明语句中存放标志


    this.judgeState = function(symbol,type){
        /*  仅在声明语句时对被声明的变量使用
        *   声明语句的语义动作不调用查找的方法，直接调用插入并检测它的返回值
        *   返回值 : 如果是true表示是新变量并已经插入到符号表内，如果是false则表示已经定义过
        *   symbol: 变量名
        *   type:   变量类型
        */
        let temp = undefined;
        temp = SymbolTable.insertSymbol(symbol,type,'');    //这里的value和词法分析的value代表的意义不同
        if(temp === false){
            //出现语义错误 要进入Bug类中

            Bugs.log(this.row,"语义错误:重复定义！");         //等高天威写完了借鉴一下他的方法
        }
    }

    this.judgeVarDeclared = function(symbol){
        /* 查符号表，判断是否未经声明使用
        *  在非声明语句中，判断“普通变量”是否未经声明使用
        *  symbol: 符号的名字
        *  返回值:
        */
        let temp = undefined;
        temp = SymbolTable.getVarSymbolInfo(symbol);
        if(temp === undefined){
            //bug 类，变量未经声明使用
            Bugs.log(this.row,"语义错误:未经声明使用！");
        }

    }

    this.judgeTapeDeclared = function(symbol){
        /* 查符号表，判断是否未经声明使用
        *  在非声明语句中，判断“纸带变量”是否未经声明使用
        *  symbol: 符号的名字
        *  返回值:
        */
        let temp = undefined;
        temp = SymbolTable.getTapeSymbolInfo(symbol);
        if(temp === undefined){
            //bug 类，纸带变量未经声明使用
            Bugs.log(this.row,"语义错误:纸带变量未经声明使用！");
        }

    }
    this.judgeTypeSame = function(symbol1,symbol2){
        /* 查符号表，判断赋值语句等号两边数据类型是否一致
        * symbol1: 符号名1
        * symbol2: 符号名2
        * 返回值:
         */
        let temp1,temp2 = undefined;
        temp1 = SymbolTable.getVarSymbolInfo(symbol1);
        if(temp1 !== undefined){          //如果为普通变量
            temp2 = SymbolTable.getVarSymbolInfo(symbol2);
            if(temp1.type!== temp2.type){
                //bug类,两操作数类型不一致
                Bugs.log(this.row,"语义错误:操作数类型不一致！");
            }
        }
        else{     //如果为纸带变量
            temp1 = SymbolTable.getTapeSymbolInfo(symbol1);
            temp2 = SymbolTable.getTapeSymbolInfo(symbol2);
            if(temp1 === undefined || temp2 === undefined){
                //bug类,两操作数类型不一致
                Bugs.log(this.row,"语义错误:操作数类型不一致！");
            }
        }
    }
}

function QuatCreate() {            //这里还需要完善一下，加单引号
    this.quatEvaluate = function(){
        /* 生成赋值语句四元式
        *
        */
        console.log("= ,",Stack.items[Stack.items.length - 1],",_ ,",Stack.items[Stack.items.length - 2]);
        // new Quat('=',Stack.items[Stack.items.length - 1] , '' ,Stack.items[Stack.items.length - 2] );

    }
    this.quatDeclareEvaluate = function(){
        /* 生成声明语句四元式
        *  声明同时赋值
        */
        console.log("= ,",Stack.items[Stack.items.length - 1],", "SemanticParser.flag,","Stack.items[Stack.items.length - 2]);
    }
    this.quatTapeLeft = function () {
        /*
        *  生成纸带左移操作四元式
         */
        console.log("<- ,",Stack.items[Stack.items.length - 1],",1 ,_ ");
        // new Quat('<-',Stack.items[Stack.items.length - 1],1,'');
    }
    this.quatTapeRight = function () {
        /*
        *  生成纸带右移操作四元式
         */
        console.log("-> ,",Stack.items[Stack.items.length - 1],",1 ,_ ");
        //new Quat('->',Stack.items[Stack.items.length - 1],1,'');
    }
    this.quatExitNormally = function(){
        /* 生成程序正常退出的四元式
        *
         */
        console.log("jmp ,_ ,_ ,%d",-1);
    }
    this.quatExitWrong = function(){
        /*  生成程序异常退出的四元式
        *
         */
        console.log("jmp ,_ ,_ ,%d",-2);
    }



    this.quatDeclare = function(){
        /*  生成声明语句四元式
         *  声明同时不进行赋值
         */
        console.log("= ,_ ,",SemanticParser.flag,", ",Stack.items[Stack.items.length - 2]);
    }
}