Bugs = new (function() {
    /**
     * 错误信息收集对象，通过调用 log 方法将信息收集在 msgs 属性中
     * 该对象本身可迭代，可通过 for...of 进行循环
     */
    this.msgs = [];
    this.log = function(lineno, msg) {
        /**
         * lineno: 行号，Number类型
         * msg: 具体错误信息，String 类型
         */
        this.msgs.push(`line ${lineno}: ${msg}`);
    }

})();
Bugs[Symbol.iterator] = function*() {
    for (let value of this.msgs) {
        yield value;
    }
}


SymbolTable = new (function () {
    /**
     * 符号表对象，每个作用域一个表
     * 用 Map 把符号与 SymbolInfo 信息关联起来
     */
    function SymbolInfo(type, value) {
        /**
         * 符号表主表项
         * type: 符号类型
         * value: 符号的具体值，普通变量记录值，数组和函数关联新的 Info 对象
         */
        this.type = type;
        this.value = value;
    }

    this.tables = undefined;

    this.init = function () {
        this.tables = [new Map()];
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
         * name: 符号名
         * type，value: 同 SymbolInfo 对象
         */
        this.tables[this.tables.length-1].set(name, new SymbolInfo(type, value));
    }

    this.getSymbolInfo = function (symbol) {
        /**
         * 从当前最内层作用域向外查找 symbol 指定的符号
         * symbol: 符号的名字
         * 返回值: 如果找到返回对应的 SymbolInfo 对象，否则返回 undefined
         */
        let tmpInfo = undefined;
        for (let index = this.tables.length-1; index >= 0; index--) {
            tmpInfo || (tmpInfo = this.tables[index].get(symbol));
        }
        return tmpInfo;
    }

})();
