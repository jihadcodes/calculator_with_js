// ===========================
// State Variables
// এই 4টা variable দিয়ে calculator-এর সব তথ্য রাখা হয়
// ===========================
let currentNum = '0';    // এখন screen-এ যা দেখাচ্ছে
let prevNum = null;      // আগের number (যেমন: 5 + ___)
let operator = null;     // কোন operation: +, -, *, /
let shouldReset = false; // পরের number টাইপ করলে screen reset হবে কিনা
let expression = '';     // উপরের ছোট line-এ যা দেখায় (যেমন: 5 + 3 =)

// ===========================
// DOM Elements
// HTML থেকে elements নিয়ে আসা
// ===========================
const resultEl = document.getElementById('result');
const exprEl = document.getElementById('expression');

// ===========================
// updateDisplay()
// Screen update করার function
// ===========================
function updateDisplay() {
  resultEl.textContent = currentNum;
  exprEl.textContent = expression;

  // Error হলে লাল রং দেখাবে
  if (currentNum === 'Error') {
    resultEl.classList.add('error');
  } else {
    resultEl.classList.remove('error');
  }
}

// ===========================
// appendNum(num)
// Number button চাপলে call হয়
// ===========================
function appendNum(num) {
  // shouldReset = true মানে আগের calculation শেষ, নতুন number শুরু
  if (shouldReset) {
    currentNum = num;
    shouldReset = false;
  } else {
    if (currentNum === '0') {
      currentNum = num; // শুধু '0' থাকলে replace করো
    } else {
      if (currentNum.length >= 10) return; // সর্বোচ্চ 10 digit
      currentNum += num; // আগের সাথে যোগ করো (string concatenation)
    }
  }
  updateDisplay();
}

// ===========================
// appendDot()
// Decimal point (.) button চাপলে call হয়
// ===========================
function appendDot() {
  if (shouldReset) {
    currentNum = '0.';
    shouldReset = false;
    updateDisplay();
    return;
  }
  // যদি আগেই '.' থাকে, আবার যোগ করবো না
  if (!currentNum.includes('.')) {
    currentNum += '.';
  }
  updateDisplay();
}

// ===========================
// setOp(op)
// Operator button (+, -, *, /) চাপলে call হয়
// ===========================
function setOp(op) {
  // আগে কোনো operator set ছিলো এবং নতুন number আসেনি?
  // তাহলে আগের calculation করে নাও (chaining)
  if (operator && !shouldReset) {
    calculate(true);
  }

  prevNum = parseFloat(currentNum); // current number কে save করো
  operator = op;                     // operator save করো

  // Expression display এর জন্য symbol নির্বাচন
  const symbol = op === '/' ? '÷' : op === '*' ? '×' : op === '-' ? '−' : '+';
  expression = prevNum + ' ' + symbol;

  // Operator button highlight করো
  highlightOperator(op);

  shouldReset = true; // পরের number নতুন করে শুরু হবে
  updateDisplay();
}

// ===========================
// calculate(chaining)
// = button চাপলে call হয়
// chaining = true মানে operator chain হচ্ছে (5 + 3 * ...)
// ===========================
function calculate(chaining = false) {
  // কোনো operator বা আগের number না থাকলে বের হয়ে যাও
  if (operator === null || prevNum === null) return;

  const curr = parseFloat(currentNum); // current number কে number বানাও
  const symbol = operator === '/' ? '÷' : operator === '*' ? '×' : operator === '-' ? '−' : '+';

  // চেইনিং না হলে expression-এ পুরো equation দেখাও
  if (!chaining) {
    expression = prevNum + ' ' + symbol + ' ' + curr + ' =';
  }

  let result;

  // Operator অনুযায়ী calculation করো
  if (operator === '+') result = prevNum + curr;
  else if (operator === '-') result = prevNum - curr;
  else if (operator === '*') result = prevNum * curr;
  else if (operator === '/') {
    if (curr === 0) {
      // 0 দিয়ে ভাগ করা যায় না!
      currentNum = 'Error';
      operator = null;
      prevNum = null;
      expression = 'Cannot divide by zero';
      updateDisplay();
      return;
    }
    result = prevNum / curr;
  }

  // Floating point error ঠিক করো (যেমন: 0.1 + 0.2 = 0.30000000004)
  result = parseFloat(result.toFixed(10));

  // Result অনেক বড় হলে সংক্ষেপ করো
  if (result.toString().length > 10) {
    currentNum = parseFloat(result.toPrecision(8)).toString();
  } else {
    currentNum = result.toString();
  }

  if (!chaining) {
    operator = null;
    prevNum = null;
    shouldReset = true;
    clearOperatorHighlight();
  } else {
    prevNum = result;
    shouldReset = true;
  }

  updateDisplay();
}

// ===========================
// clearAll()
// AC button চাপলে সব reset হয়
// ===========================
function clearAll() {
  currentNum = '0';
  prevNum = null;
  operator = null;
  shouldReset = false;
  expression = '';
  clearOperatorHighlight();
  updateDisplay();
}

// ===========================
// toggleSign()
// +/- button চাপলে positive/negative toggle হয়
// ===========================
function toggleSign() {
  if (currentNum === '0' || currentNum === 'Error') return;
  currentNum = (parseFloat(currentNum) * -1).toString();
  updateDisplay();
}

// ===========================
// percent()
// % button চাপলে 100 দিয়ে ভাগ হয়
// ===========================
function percent() {
  if (currentNum === 'Error') return;
  currentNum = (parseFloat(currentNum) / 100).toString();
  updateDisplay();
}

// ===========================
// Operator Highlight Helpers
// কোন operator active আছে সেটা highlight করা
// ===========================
function highlightOperator(op) {
  clearOperatorHighlight();
  const opButtons = {
    '+': document.getElementById('plus'),
    '-': document.getElementById('minus'),
    '*': document.getElementById('multiply'),
    '/': document.getElementById('divide'),
  };
  if (opButtons[op]) {
    opButtons[op].classList.add('active');
  }
}

function clearOperatorHighlight() {
  document.querySelectorAll('.btn.operator').forEach(btn => {
    btn.classList.remove('active');
  });
}

// ===========================
// Button Event Listeners
// HTML button গুলোতে click event যোগ করা
// ===========================

// Number buttons
document.getElementById('zero').addEventListener('click', () => appendNum('0'));
document.getElementById('one').addEventListener('click', () => appendNum('1'));
document.getElementById('two').addEventListener('click', () => appendNum('2'));
document.getElementById('three').addEventListener('click', () => appendNum('3'));
document.getElementById('four').addEventListener('click', () => appendNum('4'));
document.getElementById('five').addEventListener('click', () => appendNum('5'));
document.getElementById('six').addEventListener('click', () => appendNum('6'));
document.getElementById('seven').addEventListener('click', () => appendNum('7'));
document.getElementById('eight').addEventListener('click', () => appendNum('8'));
document.getElementById('nine').addEventListener('click', () => appendNum('9'));

// Special buttons
document.getElementById('dot').addEventListener('click', appendDot);
document.getElementById('ac').addEventListener('click', clearAll);
document.getElementById('toggle').addEventListener('click', toggleSign);
document.getElementById('percent').addEventListener('click', percent);
document.getElementById('equals').addEventListener('click', () => calculate());

// Operator buttons
document.getElementById('plus').addEventListener('click', () => setOp('+'));
document.getElementById('minus').addEventListener('click', () => setOp('-'));
document.getElementById('multiply').addEventListener('click', () => setOp('*'));
document.getElementById('divide').addEventListener('click', () => setOp('/'));

// ===========================
// Keyboard Support
// Keyboard দিয়েও calculator চালানো যাবে
// ===========================
document.addEventListener('keydown', function (e) {
  if (e.key >= '0' && e.key <= '9') appendNum(e.key);
  else if (e.key === '.') appendDot();
  else if (e.key === '+') setOp('+');
  else if (e.key === '-') setOp('-');
  else if (e.key === '*') setOp('*');
  else if (e.key === '/') {
    e.preventDefault(); // browser-এর default / action বন্ধ করো
    setOp('/');
  }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Escape') clearAll();
  else if (e.key === 'Backspace') {
    if (currentNum === 'Error') { clearAll(); return; }
    if (currentNum.length > 1) {
      currentNum = currentNum.slice(0, -1); // শেষের character মুছো
    } else {
      currentNum = '0';
    }
    updateDisplay();
  }
  else if (e.key === '%') percent();
});