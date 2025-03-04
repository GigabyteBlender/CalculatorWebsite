"use strict";

let buffer = '';

function appendNumber(number) {
    buffer += number;
    updateConsole();
}

function appendOperator(operator) {
    buffer += ' ' + operator + ' ';
    updateConsole();
}

function clearInput() {
    buffer = '';
    updateConsole();
}

function deleteLast() {
    buffer = buffer.trim();
    if (buffer.endsWith('+') || buffer.endsWith('-') || buffer.endsWith('*') || buffer.endsWith('/')) {
        buffer = buffer.slice(0, -2);
    } else {
        buffer = buffer.slice(0, -1);
    }
    updateConsole();
}

function updateConsole() {
    document.getElementById('console').innerText = buffer;
}

function calculate() {
    try {
        const result = parseAndCalculate(buffer);
        buffer = result.toString();
        updateConsole();
    } catch (error) {
        updateConsole('Error: ' + error.message); // More specific error
    }
}

function parseAndCalculate(expression) {
    // Tokenize the expression
    const tokens = expression.split(/\s+/); // Split by spaces

    // Validate tokens (very basic)
    if (tokens.length === 0) {
        return 0; // Or throw an error
    }

    let numbers = [];
    let operators = [];

    for (const token of tokens) {
        if (!isNaN(parseFloat(token)) && isFinite(token)) {
            numbers.push(parseFloat(token));
        } else if (['+', '-', '*', '/'].includes(token)) {
            operators.push(token);
        } else {
            throw new Error('Invalid token: ' + token);
        }
    }

  if (numbers.length - 1 !== operators.length) {
        throw new Error("Invalid expression: Number of operators does not match number of operands.");
    }

    let result = numbers[0];

    for (let i = 0; i < operators.length; i++) {
        const operator = operators[i];
        const number = numbers[i + 1];

        switch (operator) {
            case '+':
                result += number;
                break;
            case '-':
                result -= number;
                break;
            case '*':
                result *= number;
                break;
            case '/':
                if (number === 0) {
                    throw new Error('Division by zero');
                }
                result /= number;
                break;
            default:
                throw new Error('Invalid operator: ' + operator);
        }
    }

    return result;
}