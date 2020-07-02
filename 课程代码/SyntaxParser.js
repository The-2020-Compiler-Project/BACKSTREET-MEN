SyntaxParser = function(){
    /* 语法分析对象
     * 通过调用词法分析的next接口得到token
     * 通过递归下降方法分析语法
     * 通过语义分析的接口实现语义动作
     */
    this.next = undefined;
    this.tokenParser = new TokenParser();
    this.grammarList = function(){
        /* 识别<语句表>
         * 1.0版本作为主程序需要先调用next
         * 识别成功返回 "end"
         */
        this.next = this.tokenParser.next();
        this.grammar(this.next);
        if(this.next === "over"){
            return "end";
        }
        else this.grammar();
    }

    this.grammar = function(){
        /* 识别语句
         * 分别为声明语句,赋值语句,exit语句
         */
        switch(this.next.type){
            case "char":
            case "tape":
                this.next = this.tokenParser.next();
                this.state();
                break;
            case "IT":
                this.next = this.tokenParser.next();
                this.evaluateOrMove();
                break;
            case "exit":
                this.next = this.tokenParser.next();
                this.numConstant();
                break;
            default:
                return "error";
        }
        this.next = this.tokenParser.next();
        if(this.next.value === ','){
            this.next = this.tokenParser.next();
        }
        else return "error";
    }

    this.state = function(){
        // 识别文法中的 state
        this.sub();
        while(true){
            if(this.next.value === ','){
                this.next = this.tokenParser.next();
                this.sub();
            }
            else break;
        }
    }

    this.numConstant = function(){
        // 识别数字常量
        if(this.next.type !== "CT"){
            return "error";
        }
        this.next = this.tokenParser.next();
    }

    this.strConstant = function(){
        // 识别字符常量
        if(this.next.type !== "CS"){
            return "error";
        }
        this.next = this.tokenParser.next();
    }

    this.sub = function(){
        // 识别文法中的sub
        if(this.next.type === "IT"){
            this.next = this.tokenParser.next();
            this.operateOne();
        }
        else return "error";
    }

    this.operateOne = function(){
        // 识别文法中的operateOne
        if(this.next.type === '=') {
            this.next = this.tokenParser.next();
            this.rightValue();
            this.next = this.tokenParser.next();
        }
    }

    this.operateTwo = function(){
        // 识别文法中的operateTwo
        switch(this.next.value){
            case "=":
                this.next = this.tokenParser.next();
                this.rightValue();
                this.next = this.tokenParser.next();
                break;
            case "->":
            case "<-":
                this.next = this.tokenParser.next();
                break;
            default:
                return "error";
        }
    }

    this.rightValue = function(){
        if(this.next.type === "IT"){
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
        if(this.next.type === ','){
            this.next = this.tokenParser.next();
            if(this.next.type === "IT"){
                this.evaluateOrMove();
                this.next = this.tokenParser.next();
            }
            else return "error";
        }
    }
};

let syntaxParser = new SyntaxParser();
syntaxParser.grammarList();