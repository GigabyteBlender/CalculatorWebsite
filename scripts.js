"use strict";

// Buffer to store the current input
let buffer = '';

/**
 * Appends a number to the input buffer and updates the console display.
 *
 * @param {string} number - The number to append.
 */

function appendNumber(number) {
    buffer += number;
    updateConsole();
}

/**
 * Appends an operator to the input buffer, adding spaces around it for clarity,
 * and updates the console display.
 *
 * @param {string} operator - The operator to append.
 */

function appendOperator(operator) {
    buffer += ' ' + operator + ' ';
    updateConsole();
}

/**
 * Appends a bracket (either '(' or ')') to the input buffer and updates the
 * console display.
 *
 * @param {string} bracket - The bracket to append.
 */

function appendBracket(bracket) {
    buffer += bracket;
    updateConsole();
}

/**
 * Clears the input buffer, effectively resetting the calculator display to empty,
 * and updates the console display.
 */
function clearInput() {
    buffer = '';
    updateConsole();
}

// --- Keyboard Support ---
// Add event listener for keydown events to support keyboard input
document.addEventListener('keydown', function(event) {
    const key = event.key;

    // Append number or decimal point to buffer
    if (!isNaN(parseInt(key)) || key === '.') {
        appendNumber(key);
        // Append operator to buffer
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendOperator(key);
        // Append bracket to buffer
    } else if (key === '(' || key === ')') {
        appendBracket(key);
        // Calculate result on Enter key press
    } else if (key === 'Enter') {
        calculate();
        // Clear input on Escape key press
    } else if (key === 'Escape') {
        clearInput();
        // Delete last character on Backspace key press
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

/**
 * Deletes the last character or operator from the input buffer. If the last
 * character is part of an operator (e.g., ' + ', ' - '), it removes the whole
 * operator including surrounding spaces. Updates the console display to reflect
 * the change.
 */
function deleteLast() {
    buffer = buffer.trim();
    if (
        buffer.endsWith('+') ||
        buffer.endsWith('-') ||
        buffer.endsWith('*') ||
        buffer.endsWith('/') ||
        buffer.endsWith('(') ||
        buffer.endsWith(')')
    ) {
        buffer = buffer.slice(0, -2);
    } else {
        buffer = buffer.slice(0, -1);
    }
    updateConsole();
}

/**
 * Updates the calculator's console display with the current value of the input
 * buffer. This function is essential for showing user input and calculation
 * results.
 */
function updateConsole() {
    document.getElementById('console').innerText = buffer;
}

/**
 * Main function to perform the calculation. It parses the expression in the
 * input buffer, calculates the result, and updates the console display with
 * the result. If an error occurs during calculation (e.g., division by zero,
 * mismatched parentheses), it catches the error and displays an error message
 * on the console.
 */
function calculate() {
    try {
        const result = parseAndCalculate(buffer);
        buffer = result.toString();
        updateConsole();
    } catch (error) {
        updateConsole('Error: ' + error.message); // Display specific error message
    }
}

/**
 * Parses and calculates the expression.
 *
 * @param {string} expression - The mathematical expression to parse and calculate.
 * @returns {number} The result of the calculation.
 */

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

/**
 * Evaluates the expression using the Shunting Yard algorithm.
 *
 * @param {string} expression - The expression to evaluate.
 * @returns {number} The result of the evaluation.
 */

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

/**
 * Tokenizes the expression into numbers and operators.
 *
 * @param {string} expression - The expression to tokenize.
 * @returns {Array<string>} An array of tokens.
 */
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

/**
 * Evaluates an array of tokens in Reverse Polish Notation (RPN) to compute a
 * numerical result. This function processes numbers by pushing them onto a stack
 * and performs calculations based on operators encountered, using the stack to
 * retrieve operands.
 *
 * @param {Array<string|number>} tokens - An array of tokens in RPN format, where
 * each token is either a number (as a string or number type) or an operator
 * (+, -, *, /).
 * @returns {number} The result of the calculation performed according to the RPN
 * expression.
 * @throws {Error} If the expression is invalid (e.g., not enough values in the
 * stack for an operator, division by zero).
 */
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
                    if (b === 0) {
                        throw new Error('Division by zero');
                    }
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