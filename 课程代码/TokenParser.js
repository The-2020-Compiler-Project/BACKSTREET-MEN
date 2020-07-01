let KW = ["char","tape"];       //关键字数组
let DT = ['-','>','<','='];     //界符数组
let CT = ['1','2'];             //常量数组
let row=0;                      //记录行数
let returnNum=0;                //记录返回的值
//let i=0;                      //用来当str下角标
//let string;                   //存放输入的字符串
let token = "";                     //存放token序列
let name = "";                       //显示单词类型
let test = "char 10";              //用于测试的字符串变量
let location = 0;               //用于记录当前扫描的位置
//Token类
function Token(token,name) {              //用于给语法分析返回数据
    this.token = token;
    this.name = name;
}

//State类
function State() {
    this.state = new Map();

    this.setJmpRul = function (char , nextState) {
        this.state.set(char,nextState); //将char与下一个状态关联
    }

    this.jmpTo = function (char) {
        return this.state.get(char);    //提取与char对应的下一个状态
    }
}

//AutoMachine类
function AutoMachine() {
    this.endState = new Set();      //用于存放终结状态
    this.state = new Map();

    this.makePair = function (curState , char , nextState) {     //将char与nextState绑定
        if(this.state.has(curState)===false)
            this.state.set(curState, new State());
        // curState = new State();
        if(this.state.has(nextState)===false)
            this.state.set(nextState, new State());
        //nextState = new State();
        /*this.state.has(curState) || this.state.set(curState, new State());
        this.state.has(nextState) || this.state.set(nextState, new State());*/
        this.state.get(curState).setJmpRul(char , nextState);   //将char与nextState绑定
    }

    this.setEndState = function (...indexes) {                      //添加终结状态
        for(let index of indexes){
            this.endState.add(index);
        }
    }

    this.judge = function (data) {                                  //判断数据是否正确，返回值为bool型的
        let curState = 0;
        try{
            for(let char of data){
                curState = this.state.get(curState).jmpTo(char);
            }
        }catch (TypeError) {
            return false;
        }
        return this.endState.has(curState);
    }
}


//TokenParser类
function TokenParser() {

    this.str = new String();

    this.load =function() {   //用于接收预处理后的字符串的方法
        this.str = test;
    }


    this.next = function () {
        //if(this.str[location]===)
        returnNum = 0;              //将returnNum置为0
        token = "";
        name = "";
        this.judgeKW();
        this.token1 = new Token(token,name);
        if(returnNum!==1){
            this.judgeCT();
            this.token1 = new Token(token,name);
            if(returnNum!==2){
                this.judgeIT();
                this.token1 = new Token(token,name);
            }
        }
        console.log(this.token1);
        //return this.token;
    }


    this.judgeKW = function() {  //进行关键字的判断
        //console.log(this.str[location]);
        while(this.str[location] ===' '|| this.str[location]==='\t'){
            location++;
        }
        while(this.str[location]==='\n'){   //行数加一
            row++;
            location++;
        }

        if((this.str[location]>= 'a' && this.str[location]<= 'z' ) || (this.str[location]>= 'A' && this.str[location]<= 'Z') || (this.str[location]==='_')){
            while((this.str[location]>= 'a' && this.str[location]<= 'z' ) || (this.str[location]>= 'A' && this.str[location]<= 'Z')|| (this.str[location]>= '0' && this.str[location] <= '9') || this.str[location] ==='_'){
                token += this.str[location];
                location++;
            }
           // console.log(token);
            for(let keyword of KW){
                if(token === keyword){
                    returnNum = 1;        //为关键字，返回值为1
                    name="KW";
                }
            }
            /*else
                name="IT";      //为标识符*/
        }


        this.judgeCT = function () {
            if((this.str[location]>='0' && this.str[location]<='9')||this.str[location]==='.'){
                while ((this.str[location]>='0' && this.str[location]<='9')||this.str[location]==='.'||this.str[location]==='E'||this.str[location]==='e'){
                    token +=this.str[location];
                    location++;
                }
                let num = this.initNumAutoMachine();
                console.log(token);
                if(num.judge(token)===true){
                    name="CT";
                    returnNum=2;    //为数字常量，返回值为2
                }
                else{
                    //出现数字错误 要进入Bug类中
                }
            }

        }
        /*else if (string[i]>='0' && string[i]<='9') {  //常量
            while((string[i]>='0' && string[i] <='9') || string[i]=='.'){   //两个小数点在一起会出现报错
                if(string[i]=='.'&&string[i+1]=='.'){
                    console.log("您的程序在第" + row +"行出现常量错误！");
                    break;
                }
                else{
                    returnNum = 3; //常量状态转为3
                    i++;
                    token += string[i];
                }
            }
            name="CT";
        }*/
        /*else{       //界符
            token += string[i];
            let result = (token in DT);
            if(result == true){
                returnNum = 4;      //是界符，状态转移为4
                name="DT";
            }
            else
                console.log("您的程序在第" + row + "行出现界符错误！");
        }*/
    }


    /*this.judgeIT = function () {    //判断标识符的函数
        let arr = [];               //用于存放a-z的数组
        for(let j=0;j<26;j++){
            let alpha = String.fromCharCode(65+j);  //String的方法转化为字母A-Z
            arr.push(alpha);
        }
        for(let j = 0;j<26;j++){
            let alpha = String.fromCharCode(97+j);//转化为a-z
            arr.push(alpha);
        }
    }*/


    this.initNumAutoMachine = function(){       //识别数字的自动机,返回一个AutoMachine类的数据
        let num = new AutoMachine();
        num.makePair(0, '.', 3 );
        num.makePair(1, '.', 2);

        for(let j=0;j<10;j++){
            let temp = j.toString();
            num.makePair(0,temp,1);
            num.makePair(1,temp,2);
            num.makePair(2,temp,2);
            num.makePair(3,temp,2);
            num.makePair(4,temp,6);
            num.makePair(5,temp,6);
            num.makePair(6,temp,6);
        }
        num.makePair(2,'E',4);
        num.makePair(2,'e',4);
        num.makePair(4,'+',5);
        num.makePair(4,'-',5);

        num.setEndState(2,6);

        return num;
    }


    /*this.initITAutoMachine = function () {
        let it = new AutoMachine();

    }*/
}
let p = new TokenParser();      //建立一个空对象
p.load();
p.next();
p.next();