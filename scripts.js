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
        const result = eval(buffer);
        buffer = result;
        updateConsole();
    } catch (e) {
        updateConsole('Error');
    }
}