// ================================
// 4択生成
// ================================
function shuffleChoices() {
  const sets = Array.from(document.querySelectorAll(".qa-set"));

  const allAnswers = sets.map(set =>
    set.querySelector(".answer-text").value.trim()
  );

  sets.forEach(set => {
    const correct = set.querySelector(".answer-text").value.trim();

    const wrongCandidates = allAnswers.filter(ans => ans !== correct);
    const wrongChoices = wrongCandidates.sort(() => Math.random() - 0.5).slice(0, 3);

    const choices = [correct, ...wrongChoices];
    choices.sort(() => Math.random() - 0.5);

    const choiceTexts = set.querySelectorAll(".choice-text");
    choices.forEach((choice, i) => {
      choiceTexts[i].textContent = choice;
    });
  });
}



// ================================
// 問題追加（正解は最初は表示）
// ================================
function addSet() {
  const template = document.getElementById("qa-template");
  const clone = template.content.cloneNode(true);

  const container = document.getElementById("container");
  container.appendChild(clone);

  const sets = document.querySelectorAll(".qa-set");
  const index = sets.length - 1;

  const newSet = sets[index];

  // ラジオボタンの name をセットごとにユニークにする
  const radios = newSet.querySelectorAll(".choice-radio");
  radios.forEach((radio) => {
    radio.name = `choice-${index}`;
  });

  // セット番号
  newSet.querySelector(".set-number").textContent = `問題 ${index + 1}`;

  // 正解欄
  const answerText = newSet.querySelector(".answer-text");

  // 表示／非表示ボタン
  const showBtn = newSet.querySelector(".show-answer-btn");
  const hideBtn = newSet.querySelector(".hide-answer-btn");

  showBtn.addEventListener("click", () => {
    answerText.style.display = "block";
  });

  hideBtn.addEventListener("click", () => {
    answerText.style.display = "none";
  });

  // 削除ボタン
  const deleteBtn = newSet.querySelector(".delete-set-btn");

  deleteBtn.addEventListener("click", () => {
    newSet.remove();
    updateNumbers();
    saveAllData();
  });

  // セット追加直後に保存
  saveAllData();
}



// ================================
// 正解率の計算
// ================================
function updateScore() {
  const sets = Array.from(document.querySelectorAll(".qa-set"));
  const total = sets.length;

  let correctCount = 0;

  sets.forEach((set) => {
    const correct = set.querySelector(".answer-text").value.trim();
    const radios = set.querySelectorAll(".choice-radio");
    const choiceTexts = set.querySelectorAll(".choice-text");

    radios.forEach((radio, i) => {
      if (radio.checked && choiceTexts[i].textContent === correct) {
        correctCount++;
      }
    });
  });

  const rate = total > 0 ? Math.floor((correctCount / total) * 100) : 0;

  document.getElementById("score-display").textContent =
    `正解数：${correctCount} / ${total}（${rate}%）`;
}



// ================================
// 問題の並び替え（正解だけ隠す）
// ================================
function shuffleSets() {
  const container = document.getElementById("container");
  const sets = Array.from(document.querySelectorAll(".qa-set"));

  const shuffled = sets.sort(() => Math.random() - 0.5);

  shuffled.forEach((set, i) => {
    container.appendChild(set);
    set.querySelector(".set-number").textContent = `問題 ${i + 1}`;

    const answerText = set.querySelector(".answer-text");
    answerText.style.display = "none";
  });

  updateNumbers();
}



// ================================
// 正解・不正解の色付け（正解欄に色を付ける）
// ================================
function markChoiceColor(set) {
  const correct = set.querySelector(".answer-text").value.trim();
  const radios = set.querySelectorAll(".choice-radio");
  const choiceTexts = set.querySelectorAll(".choice-text");
  const answerText = set.querySelector(".answer-text");

  answerText.classList.remove("correct");
  answerText.classList.remove("wrong");

  radios.forEach((radio, i) => {
    if (radio.checked) {
      if (choiceTexts[i].textContent === correct) {
        answerText.classList.add("correct");
      } else {
        answerText.classList.add("wrong");
      }
    }
  });
}



// ================================
// 不正解だけ復習モード
// ================================
function reviewWrong() {
  const sets = document.querySelectorAll(".qa-set");

  sets.forEach(set => {
    const answerText = set.querySelector(".answer-text");
    const correct = answerText.value.trim();

    const radios = set.querySelectorAll(".choice-radio");
    const choiceTexts = set.querySelectorAll(".choice-text");

    let isCorrect = false;

    radios.forEach((radio, i) => {
      if (radio.checked && choiceTexts[i].textContent === correct) {
        isCorrect = true;
      }
    });

    if (isCorrect) {
      set.style.display = "none";
    } else {
      set.style.display = "";
    }
  });

  document.getElementById("showAllSetsBtn").style.display = "inline-block";
}



// ================================
// 全セット再表示
// ================================
function showAllSets() {
  const sets = document.querySelectorAll(".qa-set");

  sets.forEach(set => {
    set.style.display = "";
  });

  document.getElementById("showAllSetsBtn").style.display = "none";
}



// ================================
// 全セットコピー（選んだ選択肢だけ＋〇×判定）
// ================================
function copyAllSets() {
  const sets = document.querySelectorAll(".qa-set");

  let lines = [];

  sets.forEach(set => {
    const question = set.querySelector(".question").value.trim();
    const answer = set.querySelector(".answer-text").value.trim();

    const radios = set.querySelectorAll(".choice-radio");
    const choiceTexts = set.querySelectorAll(".choice-text");

    let selectedChoice = "";
    let isCorrect = false;

    radios.forEach((radio, i) => {
      if (radio.checked) {
        selectedChoice = choiceTexts[i].textContent.trim();

        if (selectedChoice === answer) {
          isCorrect = true;
        }
      }
    });

    if (!selectedChoice) {
      selectedChoice = "（未選択）";
    }

    const mark = isCorrect ? "【〇】" : "【×】";

    const line =
      `${mark}\n問題：${question}\n選択肢：${selectedChoice}\n正解：${answer}`;

    lines.push(line);
    lines.push("--------------------------------");
  });

  const text = lines.join("\n");

  navigator.clipboard.writeText(text)
    .then(() => alert("全セットをコピーしました！"))
    .catch(err => console.error("コピー失敗:", err));
}



// ================================
// 問題番号の再採番
// ================================
function updateNumbers() {
  const sets = document.querySelectorAll(".qa-set");
  sets.forEach((set, index) => {
    set.querySelector(".set-number").textContent = `問題 ${index + 1}`;
  });
}



// ================================
// 保存機能（問題・選択肢・正解・選んだ選択肢）
// ================================
function saveAllData() {
  const sets = document.querySelectorAll(".qa-set");

  const data = Array.from(sets).map(set => {
    const question = set.querySelector(".question").value.trim();
    const answer = set.querySelector(".answer-text").value.trim();

    const choices = Array.from(set.querySelectorAll(".choice-text"))
      .map(c => c.textContent.trim());

    const radios = set.querySelectorAll(".choice-radio");
    const choiceTexts = set.querySelectorAll(".choice-text");

    let selected = "";
    radios.forEach((radio, i) => {
      if (radio.checked) {
        selected = choiceTexts[i].textContent.trim();
      }
    });

    return { question, choices, answer, selected };
  });

  localStorage.setItem("fourChoiceData", JSON.stringify(data));
}



// ================================
// 保存データ復元
// ================================
function loadAllData() {
  const raw = localStorage.getItem("fourChoiceData");
  if (!raw) return;

  const data = JSON.parse(raw);

  data.forEach((item, index) => {
    addSet();

    const set = document.querySelectorAll(".qa-set")[index];

    set.querySelector(".question").value = item.question;
    set.querySelector(".answer-text").value = item.answer;

    const choiceTexts = set.querySelectorAll(".choice-text");
    item.choices.forEach((choice, i) => {
      choiceTexts[i].textContent = choice;
    });

    const radios = set.querySelectorAll(".choice-radio");
    radios.forEach((radio, i) => {
      if (choiceTexts[i].textContent === item.selected) {
        radio.checked = true;
      }
    });

    markChoiceColor(set);
  });

  updateNumbers();
}



// ================================
// イベント登録
// ================================
document.getElementById("addSetBtn").addEventListener("click", () => {
  addSet();
  saveAllData();
});

document.getElementById("shuffleSetsBtn").addEventListener("click", () => {
  shuffleChoices();
  shuffleSets();
  saveAllData();
});

document.getElementById("reviewWrongBtn").addEventListener("click", reviewWrong);
document.getElementById("showAllSetsBtn").addEventListener("click", showAllSets);
document.getElementById("copyAllBtn").addEventListener("click", copyAllSets);

document.addEventListener("change", (e) => {
  if (e.target.classList.contains("choice-radio")) {
    const set = e.target.closest(".qa-set");
    markChoiceColor(set);
    updateScore();
    saveAllData();
  }
});

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("question") ||
      e.target.classList.contains("answer-text")) {
    saveAllData();
  }
});

window.onload = loadAllData;

/* ================================
   保存データ復元
================================ */
function loadAllData() {
  const raw = localStorage.getItem("fourChoiceData");
  if (!raw) return;

  const data = JSON.parse(raw);

  data.forEach((item, index) => {
    addSet(); // セットを追加

    const set = document.querySelectorAll(".qa-set")[index];

    // 問題文
    set.querySelector(".question").value = item.question;

    // 正解
    set.querySelector(".answer-text").value = item.answer;

    // 選択肢
    const choiceTexts = set.querySelectorAll(".choice-text");
    item.choices.forEach((choice, i) => {
      choiceTexts[i].textContent = choice;
    });

    // 選択状態
    const radios = set.querySelectorAll(".choice-radio");
    radios.forEach((radio, i) => {
      if (choiceTexts[i].textContent === item.selected) {
        radio.checked = true;
      }
    });

    // 色付け
    markChoiceColor(set);
  });

  updateNumbers();
}


/* ================================
   保存を発火させるイベント登録
================================ */

// 問題追加時
document.getElementById("addSetBtn").addEventListener("click", () => {
  addSet();
  saveAllData();
});

// 並び替え（4択生成含む）
document.getElementById("shuffleSetsBtn").addEventListener("click", () => {
  shuffleChoices();
  shuffleSets();
  saveAllData();
});

// 問題文・正解入力時
document.addEventListener("input", (e) => {
  if (e.target.classList.contains("question") ||
      e.target.classList.contains("answer-text")) {
    saveAllData();
  }
});

// 選択肢選択時
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("choice-radio")) {
    const set = e.target.closest(".qa-set");
    markChoiceColor(set);
    updateScore();
    saveAllData();
  }
});

// ページ読み込み時
window.onload = loadAllData;
