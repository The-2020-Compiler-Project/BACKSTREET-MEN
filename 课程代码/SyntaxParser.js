SyntaxParser = function(){
    /* 语法分析对象
     * 通过调用词法分析的next接口得到token
     * 通过递归下降方法分析语法
     * 通过语义分析的接口实现语义动作
     */
    this.next = undefined;
    this.tokenParser = new TokenParser();
    this.sp = new SemanticParser();
    this.stack = new Stack();
    this.quatCreate = new QuatCreate();
    this.grammarList = function(){
        /* 识别<语句表>
         * 1.0版本作为主程序需要先调用next
         * 识别成功返回 "end"
         */
        this.next = this.tokenParser.next();
        this.grammar();
        while(this.next !== "Over") {
            this.grammar();
        }
        console.log("识别完成");
    }

    this.grammar = function(){
        /* 识别语句
         * 分别为声明语句,赋值语句,exit语句
         */
        switch(this.next.type){
            case "char":
            case "tape":
                this.sp.flag = this.next.type;
                this.next = this.tokenParser.next();
                this.state();
                break;
            case "IT":
                this.stack.push(this.next.type);
                this.next = this.tokenParser.next();
                this.evaluateOrMove();
                break;
            case "exit":
                this.next = this.tokenParser.next();
                this.numConstant();
                break;
            default:
                Bugs.log(this.next.line,this.next.row,"SyntaxError: 此处只能是标识符或关键字 ");
        }
        if(this.next.value === ';'){
            this.next = this.tokenParser.next();
        }
        else Bugs.log(this.next.line,this.next.row,"SyntaxError: 此处缺少; ");
    }

    this.state = function(){
        // 识别文法中的 state
        this.sub();
        while(true){
            if(this.next.value === ','){
                this.quatCreate.quatDeclare();
                this.stack.pop();
                this.next = this.tokenParser.next();
                this.sub();
            }
            else break;
        }
    }

    this.numConstant = function(){
        // 识别数字常量
        if(this.next.type !== "CT"){
            Bugs.log(this.next.line,this.next.row,"SyntaxError: 此处只能是数字常量 ");
        }
        if(Number(this.next.value) === 0)
            this.quatCreate.quatExitNormally();
        else this.quatCreate.quatExitWrong();
        this.next = this.tokenParser.next();
    }

    this.strConstant = function(){
        // 识别字符常量
        if(this.next.type !== "CS"){
            Bugs.log(this.next.line,this.next.row,"SyntaxError: 此处只能是字符常量 ");
        }
        else this.stack.push(this.next.value);
        this.next = this.tokenParser.next();
    }

    this.sub = function(){
        // 识别文法中的sub
        if(this.next.type === "IT"){
            this.sp.judgeState(this.next.value,this.sp.flag);
            this.stack.push(this.next.value);
            this.next = this.tokenParser.next();
            this.operateOne();
        }
        else Bugs.log(this.next.line,this.next.row,"SyntaxError: 此处缺少标识符 ");
    }

    this.operateOne = function(){
        // 识别文法中的operateOne
        if(this.next.value === '=') {
            this.next = this.tokenParser.next();
            this.rightValue();
            this.quatCreate.quatDeclareEvaluate();
            this.stack.pop();
            this.stack.pop();
            this.next = this.tokenParser.next();
        }
        else{
            this.quatCreate.quatDeclare();
            this.stack.pop();
        }
    }

    this.operateTwo = function(){
        // 识别文法中的operateTwo
        switch(this.next.value){
            case "=":
                this.next = this.tokenParser.next();
                this.rightValue();
                this.quatCreate.quatEvaluate();
                this.stack.pop();
                this.stack.pop();
                this.next = this.tokenParser.next();
                break;
            case "->":
                this.sp.judgeTapeDeclared(this.stack.items[this.stack.items.length-1]);
                this.quatCreate.quatTapeRight();
                this.stack.pop();
                this.next = this.tokenParser.next();
                break;
            case "<-":
                this.sp.judgeTapeDeclared(this.stack.items[this.stack.items.length-1]);
                this.quatCreate.quatTapeLeft();
                this.stack.pop();
                this.next = this.tokenParser.next();
                break;
            default:
                Bugs.log(this.next.line,this.next.row,"SyntaxError: 此处缺少操作符 ");
        }
    }

    this.rightValue = function(){
        if(this.next.type === "IT"){
            this.sp.judgeVarDeclared(this.next.value);
            this.stack.push(this.next.value);
            this.sp.judgeTypeSame(this.stack.items[this.stack.items.length-1],this.stack.items[this.stack.items.length-2]);
            this.next = this.tokenParser.next();
        }
        else{
            this.strConstant();
            this.next = this.tokenParser.next();
        }
    }

    this.evaluateOrMove = function(){
        // 识别文法中的evaluateOrMove
        this.operateTwo();
        this.evaluateOrMoves();
        this.next = this.tokenParser.next();
    }

    this.evaluateOrMoves = function(){
        // 识别文法中的evaluateOrMoves
        if(this.next.value === ','){
            this.next = this.tokenParser.next();
            if(this.next.type === "IT"){
                this.stack.push(this.next.value);
                this.evaluateOrMove();
                this.next = this.tokenParser.next();
            }
            else Bugs.log(this.next.line,this.next.row,"SyntaxError: 此处缺少标识符 ");
        }
    }
};

TokenParser = function(){
    /*
     * test类
     */
    Token = function(value,type){
        this.value = value;
        this.type = type;
    }
    this.next = function(){
        let next;
        console.log(this.token[0]);
        if(this.token.length === 0)
            return "Over";
        else{
            next = this.token[0];
            this.token.shift();
        }
        return next;
    }
    this.token = [new Token("char","char"),new Token("test","IT"),new Token(",","DT"),new Token(";","DT")];
}

let syntaxParser = new SyntaxParser();
syntaxParser.grammarList();