/点击编译按钮执行预处理/
function PreProcessor() {
	let code = []; 
	let textArea = $('#test').val();
 	code = textArea.split("");
	let item1 = 1;
 	let item2 = 1;
	/清理注释/
	for(i = 0; i < code.length; i++) {
		/进入字符块中/
		if((code[i] == '\'' || code[i] == '\"')&&item2 == 1) 
			item1 *= -1;
		if(item1 == -1) 
			continue;
		/进入注释块中/
		if(code[i] == '#'&&item1 == 1)
			item2 *= -1;
		if(item2 == -1)
		{
			if(code[i] == '\n'){
				item2 = 1;
				continue;
			}
			code[i] = "";
			continue;
		}
	}
	if(code[code.length-1] != '\n')
		code.push('\n');
	return code;
}





