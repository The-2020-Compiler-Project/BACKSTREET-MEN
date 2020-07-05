Bugs = new (function() {
    /**
     * 错误信息收集对象，通过调用 log 方法将信息收集在 msgs 属性中
     * 该对象本身可迭代，可通过 for...of 进行循环
     */
    this.msgs = [];
    this.log = function(lineno, column, msg) {
        /**
         * lineno: 行号，Number 类型
         * column: 列好，Number 类型
         * msg: 具体错误信息，String 类型
         *
         * 每条记录的输出效果类似 "line 1: column 1: 无效的数字常量" ，后期可以修改
         */
        this.msgs.push(`line ${lineno}: column ${column}: ${msg}`);
    }

})();

Bugs[Symbol.iterator] = function*() {
    /**
     * 该方法用于使 Bugs 对象可以用 for 来遍历
     */
    for (let value of this.msgs) {
        yield value;
    }
}


SymbolTable = new (function () {
    /**
     * 符号表对象，每个作用域一个表
     * 用 Map 把标识符名与 SymbolInfo 信息关联起来
     *
     * 各类型标识符的 SymbolInfo 中关联的值如下
     *  num 和 char 变量：
     *      type = 类型的字符形式，value = 具体的值
     *
     *  tape 变量：
     *      编译时：type = 'tape'，value = ''
     *      运行时：type = 'tape', value = TapeState 对象
     */
    function SymbolInfo(type, value) {
        /**
         * 符号表主表项
         * type: 符号类型
         * value: 符号的具体值，普通变量记录值，tape变量、数组和函数关联对应的特殊对象
         */
        this.type = type;
        this.value = value;
    }

    this.tables = [new Map()]; /init 时用到/
    this.tapes = undefined; 

    this.init = function (isRuntime = false) {
        /**
         * isRuntime 用于区分是否在 Runtime 环境使用符号表，如果是则不清空 this.tape
         */
        this.tables = [new Map()];
        isRuntime || (this.tapes = new Map());
    }

    this.pushTable = function () {
        this.tables.push(new Map());
    }

    this.popTable = function () {
        this.tables.pop();
    }

    this.insertSymbol = function (name, type, value) {
        /**
         * 插入一个符号到当前作用域对应的符号表中
         *
         * name: 符号名
         * type，value: 同 SymbolInfo 对象
         *
         * 返回布尔值，true 表示插入成功， false 表示重复定义
         */
        //TODO:
        // 根据 type 来区分变量类型并分别加入到不同的集合中
        //  tape 加入到 this.tapes 中
        //  num 和 char 加入到 this.tables 中
        //  ...
        // 根据 value 来判断是否在 Runtime 环境下使用符号表
        //  tape 变量的 value 如果是 '' 表示在 Compile 环境
        //  ...
        switch (type) {
        case "tape":
            if (value) {
                // Runtime 环境
                this.tapes.get(name).value = value;
            } else {
                // Compile 环境，纸带变量可以重复定义，返回 true
                if (this.tapes.has(name)) return true;
                this.tapes.set(name, new SymbolInfo(type, value));
            }
            break;

        default:
            let tmpTable =  this.tables[this.tables.length-1];
            // num 和 char 变量不可以重复定义，返回 false
            if (tmpTable.has(name)) return false;
            tmpTable.set(name, new SymbolInfo(type, value));
            break;
        }

        return true;
    }

    this.getVarSymbolInfo = function (symbol) {
        /**
         * 从当前最内层作用域向外查找 symbol 指定的普通变量
         * symbol: 普通变量的名字
         * 返回值: 如果找到返回对应的 SymbolInfo 对象，否则返回 undefined
         */
        let tmpInfo = undefined;
        for (let index = this.tables.length-1; index >= 0; index--) {
            tmpInfo || (tmpInfo = this.tables[index].get(symbol));
        }
        return tmpInfo;
    }

    this.getTapeSymbolInfo = function (symbol) {
        /**
         * 获取 symbol 指定的 tape 类型变量
         * 返回值同 getVarSymbolInfo 方法
         */
        return this.tapes.get(symbol);
    }

})();


function TapeState(name) {
    /**
     * tape 对象的符号表中，SymbolInfo 的 value 关联的对象
     */
    this.name = name;
    this.pointer = 0;
    this.tapeData = [' '];

    this.setData = function (data) {
        this.tapeData[this.pointer] = data;
    }

    this.leftMove = function () {
        if (this.pointer === 0) {
            this.tapeData.unshift(' ');
        } else {
            this.pointer--;
        }
    }

    this.rightMove = function () {
        if (this.pointer === this.tapeData.length-1) {
            this.tapeData.push(' ');
        }
        this.pointer++;
    }
}


VirtualMachine = new (function() {
    /**
     * 虚拟机对象，假设传进来的指令集是正确的，所以语义分析能检测到的问题在这里不进行检测
     */
    this.load = function (instructions) {
        /**
         * 加载指令集并初始化虚拟机
         * instructions: 内部元素全是 Quat 对象的数组
         */
        SymbolTable.init(true);
        this.instructions = instructions;
        this.programCounter = 0;
        this.endState = -1;
    }

    this.step = function () {
        /**
         * 运行当前 PC 指向的指令，并根据指令改变 PC
         * 如果当前 PC 执行到指令集的最后或者小于零（exit 关键字的效果），那么抛出 RangeError 异常并结束执行
         * 同时设置 endState 的值，这个值为 -1 表示正常退出，其他负数表示异常退出
         */
        if (this.programCounter < 0) {

            this.endState = this.programCounter;
            throw RangeError("Exit");

        } else if (this.instructions.length > this.programCounter) {
            let tmpQuat = this.instructions[this.programCounter++];
            // 运行对应的动作函数
            this.exec.get(tmpQuat.operation)(
                tmpQuat.param1, tmpQuat.param2, tmpQuat.result
            );
        } else {

            this.endState = -1;
            throw RangeError("End of instructions");

        }
    }

    this.getNowInstruction = function () {
        /**
         * 测试用，后面不需要的话可以删掉
         * 返回值: 当前的 PC 和 执行的指令的字符串
         */
        let tmpQuat = this.instructions[this.programCounter];
        return `${this.programCounter} -> `
                +`(${tmpQuat.operation}, ${tmpQuat.param1}, ${tmpQuat.param2}, ${tmpQuat.result})`;
    }
})();

VirtualMachine.exec = new Map([
    /**
     * 每种指令对应一个长度为 2 的数组
     * 数组的第一个元素是指令对应的 Quat对象 的 operation 的值
     * 数组的第二个元素是相应的动作函数，接受的参数均为这三个，分别对应 Quat对象 中相应的值
     */
    ['=', function (param1, param2, result) {
        if (param2) {
            // 声明语句
            switch (param2) {
                case "tape":
                    SymbolTable.getTapeSymbolInfo(result).value = new TapeState(result);
                    break;

                default:
                    SymbolTable.insertSymbol(result, param2, param1);
                    break;
            }

        } else {
            // 赋值语句
            let searchResult = SymbolTable.getTapeSymbolInfo(result)
                            || SymbolTable.getVarSymbolInfo(result);

            let tmpValue = 0;
            if (param1.startsWith('\'') || param1.startsWith('\"')) {
                tmpValue = param1.slice(1, -1);
            } else if (typeof(param1) === "number") {
                tmpValue = param1;
            } else {
                tmpValue = SymbolTable.getVarSymbolInfo(param1).value;
                typeof(tmpValue) === "number" || (tmpValue = tmpValue.slice(1, -1));
            }

            switch (searchResult.type) {
                case "tape":
                    searchResult.value.setData(tmpValue);
                    break;

                default:
                    searchResult.value = tmpValue;
                    break;
            }

        }
    }],
    ['<-', function (param1, param2, result) {
        for (let times = 0; times < param2; times++) {
            SymbolTable.getTapeSymbolInfo(param1).value.leftMove();
        }
    }],
    ['->', function (param1, param2, result) {
        for (let times = 0; times < param2; times++) {
            SymbolTable.getTapeSymbolInfo(param1).value.rightMove();
        }
    }],
    ['jmp', function (param1, param2, result) {
        // 注意：这里的 programCounter 不能用 this 来访问
        VirtualMachine.programCounter = result;
    }]

    //TODO: 后面如果要支持新的指令，就在最后继续添加类似的数组就好，别忘了当前最后一个数组后面的逗号
]);


function testBench(fstr) {
    /**
     * 测试虚拟机的函数，之后可以删除
     */
    function Quat(operation, param1, param2, result) { /强哥将传过来的变量/
        /**
         * 临时创建了一个四元式对象 :-P
         */
        this.operation = operation;
        this.param1 = param1;
        this.param2 = param2;
        this.result = result;
    }

    let vm = VirtualMachine;

    SymbolTable.init();
   / 模拟强哥的语义动作，向符号表中插入一个纸带对象，因为它在运行环境时的 init 不会被删掉也不会添加新的 /

    SymbolTable.insertSymbol("output", "tape", "");
    console.log('语义分析结束的output:', SymbolTable.tapes.get('output')); 


    /**
     * FOF 源代码如下:
     *  tape output;
     *  char tmp = '*';
     *
     *  output = tmp; output->; 移到下一格
     *  output = 'H'; output->;
     *  output = 'i'; output->;
     *
     *  exit 0;
     */
    vm.load(fstr);

    function Loop() {
        try {
            console.log("运行指令：", vm.getNowInstruction());
            vm.step();
            let tape = SymbolTable.tapes.get('output'); 
            console.table({tapeData: tape.value.tapeData});
            var str = tape.value.tapeData.join(" ");
            document.getElementById('name').innerHTML = tape.value.name;
            document.getElementById("tape1").innerHTML = str;
            document.getElementById("pointer").innerHTML = tape.value.pointer 

            console.log(` ${tape.value.name}: pointer = ${tape.value.pointer}`);
        } catch (RangeError) {
            console.log(`运行结束，退出状态为 ${vm.endState} (${vm.endState===-1 ? "正常退出" : "异常退出"})`);
            return
        }
        setTimeout(Loop, 500);
    }

    Loop();
}

