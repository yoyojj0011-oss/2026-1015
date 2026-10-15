//學習4程式碼所在
// 全域狀態與變數宣告
let table; // 儲存 CSV 題庫資料表
let questions = []; // 儲存隨機抽出 5 題的陣列
let currentQuestionIndex = 0; // 目前進行到第幾題（從 0 開始）
let score = 0; // 使用者累計答對題數
let selectedOption = -1; // 使用者點選的選項索引（-1 表示尚未選擇）
let quizState = 'QUESTION'; // 測驗狀態：'QUESTION'(答題中), 'FEEDBACK'(顯示反饋), 'RESULT'(結算畫面)
let nextButton; // 下一題按鈕物件

// 字型名稱設定
const FONT_CN = 'LXGW WenKai Mono TC';

function preload() {
  // 載入 CSV 題庫檔案，指定 header 為 true
  table = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 設定文字對齊方式為居中
  textAlign(CENTER, CENTER);
  
  // 從 CSV 題庫中隨機抽出 5 題
  loadAndSelectQuestions();

  // 建立「下一題」按鈕
  nextButton = createButton('下一題');
  nextButton.style('font-size', '16px');
  nextButton.style('font-family', `"${FONT_CN}", sans-serif`);
  nextButton.style('cursor', 'pointer');
  nextButton.style('border-radius', '8px');
  nextButton.style('background-color', '#4A90E2');
  nextButton.style('color', '#FFFFFF');
  nextButton.style('border', 'none');
  nextButton.mousePressed(goToNextQuestion);
  nextButton.hide();
}

// 解析 CSV 並隨機抽出 5 題
function loadAndSelectQuestions() {
  let allQuestions = [];
  
  // 讀取 CSV 的每一列
  for (let r = 0; r < table.getRowCount(); r++) {
    let row = table.getRow(r);
    let qObj = {
      question: row.getString('question'),
      options: [
        row.getString('optionA'),
        row.getString('optionB'),
        row.getString('optionC'),
        row.getString('optionD')
      ],
      correctIndex: parseInt(row.getString('correctIndex'))
    };
    allQuestions.push(qObj);
  }

  // 洗牌演算法 (Fisher-Yates Shuffle) 隨機打亂題目
  for (let i = allQuestions.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    let temp = allQuestions[i];
    allQuestions[i] = allQuestions[j];
    allQuestions[j] = temp;
  }

  // 取前 5 題作為本次測驗題目
  questions = allQuestions.slice(0, min(5, allQuestions.length));
}

function draw() {
  // 設定背景顏色為淺灰藍色
  background(240, 244, 248);

  // 根據當前測驗狀態繪製對應畫面
  if (quizState === 'QUESTION' || quizState === 'FEEDBACK') {
    drawQuizScreen(); // 繪製題目與選項畫面
  } else if (quizState === 'RESULT') {
    drawResultScreen(); // 繪製最終結算畫面
  }
}

// 繪製題目與選項畫面的函式
function drawQuizScreen() {
  if (questions.length === 0) return;
  let q = questions[currentQuestionIndex];

  let isMobile = width < 600;
  let isLandscapeMobile = height < 500;
  
  let titleFontSize = isLandscapeMobile ? 14 : (isMobile ? 16 : 20);
  let qFontSize = isLandscapeMobile ? 16 : (isMobile ? 18 : 22);
  let optFontSize = isLandscapeMobile ? 14 : (isMobile ? 15 : 18);

  // 繪製頂部進度文字
  fill(80);
  noStroke();
  textFont(FONT_CN);
  textSize(titleFontSize);
  text(`題目 ${currentQuestionIndex + 1} / ${questions.length}`, width / 2, isLandscapeMobile ? 20 : 35);

  // ------------------ 題目方框與內文 ------------------
  let cardWidth = min(width * 0.9, 650);
  let cardHeight = isLandscapeMobile ? 65 : (isMobile ? 85 : 100); 
  let cardX = width / 2 - cardWidth / 2;
  let cardY = isLandscapeMobile ? 35 : 60;

  // 繪製題目背景方框（顏色 #bdb2ff）
  fill('#bdb2ff');
  stroke(180);
  strokeWeight(2);
  rect(cardX, cardY, cardWidth, cardHeight, 12);

  // 繪製題目內文
  fill(20);
  noStroke();
  textFont(FONT_CN);
  textSize(qFontSize);
  textStyle(BOLD);
  text(q.question, cardX + 15, cardY + 5, cardWidth - 30, cardHeight - 10);

  // ------------------ 選項繪製 ------------------
  let optionWidth = cardWidth;
  let optionHeight = isLandscapeMobile ? 40 : (isMobile ? 50 : 60);
  let startY = cardY + cardHeight + (isLandscapeMobile ? 10 : 20);
  let gap = isLandscapeMobile ? 8 : (isMobile ? 10 : 15);

  textStyle(NORMAL);
  textSize(optFontSize);

  for (let i = 0; i < q.options.length; i++) {
    let x = width / 2 - optionWidth / 2;
    let y = startY + i * (optionHeight + gap);

    let bgColor = color(255);

    // 反饋狀態顏色與跳動/搖晃動畫
    if (quizState === 'FEEDBACK') {
      let time = frameCount * 0.15;

      if (i === q.correctIndex) {
        bgColor = color('#fdffb6');
        let jumpOffsetY = sin(time) * (isMobile ? 8 : 12);
        y += jumpOffsetY;
      }
      
      if (selectedOption !== q.correctIndex && i === selectedOption) {
        bgColor = color('#ff4d6d');
        let shakeOffsetX = sin(time * 2) * (isMobile ? 6 : 10);
        x += shakeOffsetX;
      }
    }

    // 繪製選項卡片
    fill(bgColor);
    stroke(200);
    strokeWeight(1.5);
    rect(x, y, optionWidth, optionHeight, 8);

    // 繪製選項文字
    fill(30);
    noStroke();
    textFont(FONT_CN);
    text(q.options[i], x + 10, y + 5, optionWidth - 20, optionHeight - 10);
  }

  // 顯示「下一題」按鈕
  if (quizState === 'FEEDBACK') {
    let lastOptionY = startY + q.options.length * (optionHeight + gap);
    let btnW = isMobile ? 100 : 120;
    let btnH = isLandscapeMobile ? 35 : 40;
    nextButton.size(btnW, btnH);
    nextButton.position(width / 2 - btnW / 2, lastOptionY + (isLandscapeMobile ? 5 : 10));
    nextButton.show();
  } else {
    nextButton.hide();
  }
}

// 繪製最終結算畫面
function drawResultScreen() {
  nextButton.hide();

  let isMobile = width < 600;

  fill(40);
  noStroke();
  textFont(FONT_CN);
  textSize(isMobile ? 28 : 36);
  textStyle(BOLD);
  text("測驗結束！", width / 2, height / 2 - 80);

  textSize(isMobile ? 22 : 28);
  fill(0, 102, 204);
  text(`您總共答對了 ${score} / ${questions.length} 題`, width / 2, height / 2);

  textSize(isMobile ? 16 : 20);
  textStyle(NORMAL);
  fill(80);
  if (score === questions.length) {
    text("太棒了！您的資訊素養觀念非常完美！", width / 2, height / 2 + 60);
  } else if (score >= 3) {
    text("表現良好！大部分的資訊安全觀念都很紮實。", width / 2, height / 2 + 60);
  } else {
    text("再接再厲！建議多加加強資訊安全的基礎防護知識。", width / 2, height / 2 + 60);
  }
}

function handleSelection(px, py) {
  if (quizState !== 'QUESTION') return;

  let q = questions[currentQuestionIndex];
  let isMobile = width < 600;
  let isLandscapeMobile = height < 500;

  let cardWidth = min(width * 0.9, 650);
  let cardHeight = isLandscapeMobile ? 65 : (isMobile ? 85 : 100);
  let optionWidth = cardWidth;
  let optionHeight = isLandscapeMobile ? 40 : (isMobile ? 50 : 60);
  let cardY = isLandscapeMobile ? 35 : 60;
  let startY = cardY + cardHeight + (isLandscapeMobile ? 10 : 20);
  let gap = isLandscapeMobile ? 8 : (isMobile ? 10 : 15);

  for (let i = 0; i < q.options.length; i++) {
    let x = width / 2 - optionWidth / 2;
    let y = startY + i * (optionHeight + gap);

    if (px >= x && px <= x + optionWidth && py >= y && py <= y + optionHeight) {
      selectedOption = i;
      if (selectedOption === q.correctIndex) {
        score++;
      }
      quizState = 'FEEDBACK';
      break;
    }
  }
}

function mousePressed() {
  handleSelection(mouseX, mouseY);
}

function touchStarted() {
  handleSelection(touches[0]?.x || mouseX, touches[0]?.y || mouseY);
}

function goToNextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    selectedOption = -1;
    quizState = 'QUESTION';
  } else {
    quizState = 'RESULT';
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}