const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');

let currentInput = '';

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.value;

        if (value === '=') {
            try {
                const result = Calculate(currentInput);
                display.value = result !== null ? result : "Error";
                currentInput = ''; // Clear the input after evaluation
            } catch (error) {
                display.value = "Error: Invalid expression";
            }
        } else if (value === 'C') {
            currentInput = '';
            display.value = '';
        } else if (value === 'AC') {
            currentInput = '';
            display.value = '';
        } else if (value === 'DEL') {
            currentInput = currentInput.slice(0, -1);
            display.value = currentInput;
        } else {
            currentInput += value;
            display.value = currentInput;
        }
    });
});

function Calculate(input) {
    // Convert input to infix array
    var arr = toInfixArray(input);
    // Convert infix to postfix array
    var postfix = toPostfixArray(arr, -1);
    // Evaluate the postfix expression
    var result = evaluatePostfix(postfix);
    return result;
}

var prec = {};
prec[','] = 1;
prec['='] = 1.5;
prec['<='] = 1.5;
prec['>='] = 1.5;
prec['=='] = 1.5;
prec['!='] = 1.5;
prec['>'] = 1.5;
prec['<'] = 1.5;
prec['+'] = 2;
prec['-'] = 2;
prec['0-'] = 3;
prec['*'] = 3;
prec['/'] = 3;
prec['^'] = 4;
prec['%'] = 10;
prec['max'] = 10;
prec['min'] = 10;
prec['sum'] = 10;
prec['sin'] = 10;
prec['cos'] = 10;
prec['tan'] = 10;
prec['csc'] = 10;
prec['sec'] = 10;
prec['cot'] = 10;
prec['ln'] = 10;
prec['log'] = 10;
prec['_'] = 11;

function toInfixArray(input) {
    var arr = [];
    var str = "";
    for (var i = 0; i < input.length; i++) {
        if ("+*/()^%,{}".indexOf(input[i]) > -1) {
            if (str.length > 0) { arr.push(str); }
            arr.push(input[i]);
            str = "";
        } else if (input[i] == "-") {
            if (str.length > 0) { arr.push(str); }
            if (i == 0) {
                arr.push("0-");
            } else if (arr.length > 0 && prec[arr[arr.length - 1]] > 0) {
                arr.push("0-");
            } else {
                arr.push(input[i]);
            }
            str = "";
        } else if ("!=<>".indexOf(input[i]) > -1) {
            if (i + 1 < input.length && input[i + 1] == "=") {
                if (str.length > 0) { arr.push(str); }
                arr.push(input[i] + input[i + 1]);
                i++;
            } else {
                if (str.length > 0) { arr.push(str); }
                arr.push(input[i]);
            }
            str = "";
        } else if (input[i] == "_") {
            if (str == "log") { continue; }
            if (str.length > 0) { arr.push(str); }
            arr.push(input[i]);
            str = "";
        } else if (input[i] == " ") {
            if (str.length > 0) { arr.push(str); }
            str = "";
        } else {
            str += input[i];
        }
    }
    if (str.length > 0) { arr.push(str); }
    return arr;
}

function toPostfixArray(input, max = -1) {
    var stack = [];
    var postfix = [];
    var maxx = max;
    if (maxx > input.length || maxx < 0) { maxx = input.length; }
    
    for (var i = 0; i < maxx; i++) {
        if (prec[input[i]]) {
            if (stack.length == 0) {
                stack.push(input[i]);
            } else if (input[i] == "0-") {
                stack.push(input[i]);
            } else if (prec[stack[stack.length - 1]] < prec[input[i]]) {
                stack.push(input[i]);
            } else if (stack[stack.length - 1] == "^" && input[i] == "^") {
                stack.push(input[i]);
            } else {
                while (stack.length > 0 && prec[stack[stack.length - 1]] >= prec[input[i]]) {
                    if (stack[stack.length - 1] == "^" && input[i] == "^") { break; }
                    var last = stack[stack.length - 1];
                    if (last == "0-" && isNumber(postfix[postfix.length - 1])) {
                        postfix[postfix.length - 1] = "-" + postfix[postfix.length - 1];
                    } else {
                        postfix.push(last);
                    }
                    stack.pop();
                }
                stack.push(input[i]);
            }
        } else if (input[i] == '(' || input[i] == '{') {
            stack.push(input[i]);
        } else if (input[i] == ')') {
            while (stack.length > 0 && stack[stack.length - 1] != "(") {
                var last = stack[stack.length - 1];
                if (last == "0-" && isNumber(postfix[postfix.length - 1])) {
                    postfix[postfix.length - 1] = "-" + postfix[postfix.length - 1];
                } else {
                    postfix.push(last);
                }
                stack.pop();
            }
            stack.pop(); // Remove the '(' from the stack
        } else if (input[i] == '}') {
            while (stack.length > 0 && stack[stack.length - 1] != "{") {
                var last = stack[stack.length - 1];
                if (last == "0-" && isNumber(postfix[postfix.length - 1])) {
                    postfix[postfix.length - 1] = "-" + postfix[postfix.length - 1];
                } else {
                    postfix.push(last);
                }
                stack.pop();
            }
            stack.pop(); // Remove the '{' from the stack
        } else {
            postfix.push(input[i]);
        }
    }
    
    if (max == -1) {
        while (stack.length > 0) {
            var last = stack[stack.length - 1];
            if (last == "0-" && isNumber(postfix[postfix.length - 1])) {
                postfix[postfix.length - 1] = "-" + postfix[postfix.length - 1];
            } else {
                postfix.push(last);
            }
            stack.pop();
        }
        return postfix;
    }
    return { postfix: postfix, stack: stack };
}
function evaluatePostfix(postfix) {
    const stack = [];

    for (let i = 0; i < postfix.length; i++) {
        const token = postfix[i];

        if (isNumber(token)) {
            // If the token is a number, push it onto the stack
            stack.push(parseFloat(token));
        } else {
            // The token must be an operator, so pop two elements from the stack
            const b = stack.pop();
            const a = stack.pop();

            switch (token) {
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
                case '*':
                    stack.push(a * b);
                    break;
                case '/':
                    if (b === 0) {
                        throw new Error("Division by zero");
                    }
                    stack.push(a / b);
                    break;
                case '^':
                    stack.push(Math.pow(a, b));
                    break;
                case '%':
                    stack.push(a % b);
                    break;
                // Add more cases for other operators as needed
                default:
                    throw new Error(`Unknown operator: ${token}`);
            }
        }
    }

    // The final result will be the only element left in the stack
    return stack.pop();
}

// Helper function to check if a token is a number
function isNumber(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
}

// alternative code 
/*const display = document.getElementById('display');
        const buttons = document.querySelectorAll('button');
        
        let currentInput = '';
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.value;
        
                if (value === '=') {
                    try {
                        const result = Calculate(currentInput);
                        display.value = result !== null ? result : "Error";
                        currentInput = ''; // Clear the input after evaluation
                    } catch (error) {
                        display.value = "Error: Invalid expression";
                    }
                } else if (value === 'C') {
                    currentInput = '';
                    display.value = '';
                } else if (value === 'AC') {
                    currentInput = '';
                    display.value = '';
                } else if (value === 'DEL') {
                    currentInput = currentInput.slice(0, -1);
                    display.value = currentInput;
                } else {
                    currentInput += value;
                    display.value = currentInput;
                }
            });
        });
        
        function Calculate(input) {
            output = input;

        var result = [];
        var str = "";
        var temp = [];
        var expression = [];
 


            for (i = 0; i < output.length; ++i)

            { 

                if(output[i] != "*" && output[i] != "+" && output[i] != "/" && output[i] != "-" )

                temp.push(output[i]);

                if(output[i] == "*" || output[i] == "+" || output[i] == "-" || output[i] == "/")

                { 
                    for(var j = 0; j<= temp.length-1 ; j++ )
                    {

                        if (temp[j] == '(' || temp[j] == ')')
                        { 
                            expression.push(temp[j])
                        }
                        else
                        {
                            str += temp[j];
                            if (temp[j+1] == ")")
                            { expression.push(str);
                                str = "";
                            }
                        }
                    }
            
                    var temp = [];  
                    if (str!="")
                    {
                        expression.push(str);
                    }
                    expression.push(output[i]);
                    
                }       

                str = "";

            } 

            for(var n = 0 ; n<= temp.length-1 ; n++ )
            {

                            if (temp[n] == '(' || temp[n] == ')')
                        { 
                            expression.push(temp[n])
                        }
                        else
                        {
                            str += temp[n];
                            if (temp[n+1] == ")")
                            { expression.push(str);
                                str = "";
                            }
                        }
                
                
            }
            if (str!="")
                    {
                        expression.push(str);
                    }

            var output = [];   
            var stack = [];
            var precedence = {'+': 1,'-': 1,'*': 2,'/': 2,'(': 0};

            for(var i = 0; i <= (expression.length-1) ; i++)
            {
                if(!isNaN(expression[i]))
                {
                output.push((expression[i]));   
                }
                else if(expression[i] == "*" || expression[i] == "/" || expression[i] == "+" || expression[i] == "-" || expression[i] == "(" || expression[i] == ")")
                {
                    if(stack == "" && expression[i] != ")")
                {
                    stack.push(expression[i]);
                }
                    else if(precedence[expression[i]] > precedence[stack[(stack.length -1)]])
                {
                    stack.push(expression[i]);
                }
                    else if((precedence[expression[i]] <= precedence[stack[stack.length -1]]))
                    {   
                        if(expression[i] == "(")
                        {
                            stack.push(expression[i]);
                        }
                        if(stack[stack.length-1]!="(")
                        { 
                        for(var k = (stack.length-1); k >= 0 ; k--)  
                        { 
                            output.push(stack[k]);
                            stack.pop(stack[k]);
                        }
                            stack.push(expression[i]);
                        }
                    }

            if(expression[i] == ")")
            {
                for(var j = (stack.length-1); j > 0 ; j--)
                {  
                    if(stack[j]!="(")
                    output.push(stack[j]);
                    stack.pop(stack[j]);
                }
                    
            }
            }
                
                
                if(i == expression.length-1 && expression[i] != ")")
            {
                
                for(var j = (stack.length-1); j >= 0 ; j--)
                {  
                    if(stack[j]!="(")
                output.push(stack[j]);
                    stack.pop();
                }
                    
            }
                
            }
                for(var j = (stack.length-1); j >= 0 ; j--)
                {  
                    if(stack[j]!="(")
                output.push(stack[j]);
                }
                  

            //============ Calculate the result===================

            var result = [];

            for (i = 0; i < output.length; ++i)
            { 
                t = output[i];
                //alert(t);
                if (!isNaN(t))
                result.push(t);
                else if (t == "(" || result.length < 2)
                return false;
                else 
                {
                
                var rhs = result.pop();
                
                var lhs = result.pop();
                
                if (t == "+") result.push(parseFloat(lhs) + parseFloat(rhs));
                if (t == "-") result.push(parseFloat(lhs) - parseFloat(rhs));
                if (t == "*") result.push(parseFloat(lhs) * parseFloat(rhs));
                if (t == "/") result.push(parseFloat(lhs) / parseFloat(rhs));
                if (t == "exp") result.push(Math.pow(parseFloat(lhs),parseFloat(rhs)));
                if (t == "sqrt") result.push(Math.sqrt(parseFloat(rhs)));
                if (t == "sin") result.push(Math.sin(parseFloat(rhs)));
                if (t == "cos") result.push(Math.cos(parseFloat(rhs)))
                if (t == "tan") result.push(Math.tan(parseFloat(rhs)));

                }
            }
            return result;


        }*/

            function evaluatePostfix(postfix) {
                const stack = [];
            
                for (let i = 0; i < postfix.length; i++) {
                    const token = postfix[i];
            
                    if (isNumber(token)) {
                        // If the token is a number, push it onto the stack
                        stack.push(parseFloat(token));
                    } else {
                        // The token must be an operator or a function
                        if (['sin', 'cos', 'tan', 'ln', 'log', 'exp', '√', 'π'].includes(token)) {
                            const b = stack.pop(); // Only one operand needed
                            switch (token) {
                                case 'sin':
                                    stack.push(Math.sin(b));
                                    break;
                                case 'cos':
                                    stack.push(Math.cos(b));
                                    break;
                                case 'tan':
                                    stack.push(Math.tan(b));
                                    break;
                                case 'ln':
                                    stack.push(Math.log(b));
                                    break;
                                case 'log':
                                    stack.push(Math.log10(b));
                                    break;
                                case 'exp':
                                    stack.push(Math.exp(b));
                                    break;
                                case '√':
                                    stack.push(Math.sqrt(b));
                                    break;
                                case 'π':
                                    stack.push(Math.PI);
                                    break;
                                default:
                                    throw new Error(`Unknown function: ${token}`);
                            }
                        } else {
                            // For binary operators, pop two elements from the stack
                            const b = stack.pop();
                            const a = stack.pop();
                            switch (token) {
                                case '+':
                                    stack.push(a + b);
                                    break;
                                case '-':
                                    stack.push(a - b);
                                    break;
                                case '*':
                                    stack.push(a * b);
                                    break;
                                case '/':
                                    if (b === 0) {
                                        throw new Error("Division by zero");
                                    }
                                    stack.push(a / b);
                                    break;
                                case '^':
                                    stack.push(Math.pow(a, b));
                                    break;
                                case '%':
                                    stack.push(a % b);
                                    break;
                                default:
                                    throw new Error(`Unknown operator: ${token}`);
                            }
                        }
                    }
                }
            
                // The final result will be the only element left in the stack
                return stack.pop();
            }