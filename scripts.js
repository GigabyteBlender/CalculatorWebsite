"use strict";

// Buffer to store the current input
let buffer = '';

// Function to append a number to the buffer
function appendNumber(number) {
    buffer += number;
    updateConsole();
}

// Function to append an operator to the buffer
function appendOperator(operator) {
    buffer += ' ' + operator + ' ';
    updateConsole();
}

// Function to append a bracket to the buffer
function appendBracket(bracket) {
    buffer += bracket;
    updateConsole();
}

// Function to clear the input buffer
function clearInput() {
    buffer = '';
    updateConsole();
}

// --- Keyboard Support ---
document.addEventListener('keydown', function(event) {
    const key = event.key;

    if (!isNaN(parseInt(key)) || key === '.') {
        appendNumber(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendOperator(key);
    } else if (key === '(' || key === ')') {
        appendBracket(key);
    } else if (key === 'Enter') {
        calculate();
    } else if (key === 'Escape') {
        clearInput();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

// Function to delete the last character or operator from the buffer
function deleteLast() {
    buffer = buffer.trim();
    if (buffer.endsWith('+') || buffer.endsWith('-') || buffer.endsWith('*') || buffer.endsWith('/') || buffer.endsWith('(') || buffer.endsWith(')')) {
        buffer = buffer.slice(0, -2);
    } else {
        buffer = buffer.slice(0, -1);
    }
    updateConsole();
}

// Function to update the console display
function updateConsole() {
    document.getElementById('console').innerText = buffer;
}

// Main function to perform the calculation
function calculate() {
    try {
        const result = parseAndCalculate(buffer);
        buffer = result.toString();
        updateConsole();
    } catch (error) {
        updateConsole('Error: ' + error.message); // Display specific error message
    }
}

// Function to parse and calculate the expression
function parseAndCalculate(expression) {
    // Remove spaces from the expression
    expression = expression.replace(/\s/g, '');

    try {
        // Evaluate the expression
        return evaluateExpression(expression);
    } catch (error) {
        throw new Error(error.message);
    }
}

// Function to evaluate the expression using Shunting Yard algorithm
function evaluateExpression(expression) {
    if (!expression) {
        return 0;
    }

    let tokens = tokenize(expression);
    let outputQueue = [];
    let operatorStack = [];

    // Define operator precedence
    const precedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2,
    };

    // Implement Shunting Yard algorithm
    for (const token of tokens) {
        if (!isNaN(parseFloat(token))) {
            outputQueue.push(parseFloat(token));
        } else if (['+', '-', '*', '/'].includes(token)) {
            while (
                operatorStack.length > 0 &&
                ['+', '-', '*', '/'].includes(operatorStack[operatorStack.length - 1]) &&
                precedence[token] <= precedence[operatorStack[operatorStack.length - 1]]
            ) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            if (operatorStack.length === 0) {
                throw new Error('Mismatched parentheses');
            }
            operatorStack.pop(); // Remove the '('
        }
    }

    // Pop remaining operators to output queue
    while (operatorStack.length > 0) {
        if (['(', ')'].includes(operatorStack[operatorStack.length - 1])) {
            throw new Error('Mismatched parentheses');
        }
        outputQueue.push(operatorStack.pop());
    }

    // Evaluate the Reverse Polish Notation (RPN)
    return evaluateRPN(outputQueue);
}

// Function to tokenize the expression into numbers and operators
function tokenize(expression) {
    const tokens = [];
    let currentNumber = '';

    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];

        if (!isNaN(parseInt(char)) || char === '.') {
            currentNumber += char;
        } else if (['+', '-', '*', '/', '(', ')'].includes(char)) {
            if (currentNumber !== '') {
                tokens.push(currentNumber);
                currentNumber = '';
            }
            tokens.push(char);
        }
    }

    if (currentNumber !== '') {
        tokens.push(currentNumber);
    }

    return tokens;
}

// Function to evaluate Reverse Polish Notation (RPN)
function evaluateRPN(tokens) {
    let stack = [];

    for (const token of tokens) {
        if (!isNaN(parseFloat(token))) {
            stack.push(parseFloat(token));
        } else if (['+', '-', '*', '/'].includes(token)) {
            if (stack.length < 2) {
                throw new Error('Invalid expression');
            }
            const b = stack.pop();
            const a = stack.pop();

            switch (token) {
                case '/':
                    if (b === 0) {throw new Error('Division by zero');}
                    stack.push(a / b);
                    break;
                case '*':
                    stack.push(a * b);
                    break;
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
            }
        }
    }

    if (stack.length !== 1) {
        throw new Error('Invalid expression');
    }

    return stack[0];
}