// 配置项变量
// 选手们
const ATHLETES = {
  cd: [],
  hz: [
    { name: "选手1", nickName: "选手1" },
    { name: "选手2", nickName: "选手2" },
    { name: "选手3", nickName: "选手3" },
    { name: "选手4", nickName: "选手4" },
    { name: "选手5", nickName: "选手5" },
    { name: "选手6", nickName: "选手6" },
    { name: "选手7", nickName: "选手7" },
    { name: "选手8", nickName: "选手8" },
    { name: "选手9", nickName: "选手9" },
    { name: "选手10", nickName: "选手10" },
    { name: "选手11", nickName: "选手11" },
    { name: "选手12", nickName: "选手12" },
    { name: "选手13", nickName: "选手13" },
    { name: "选手14", nickName: "选手14" },
    { name: "选手15", nickName: "选手15" },
    { name: "选手16", nickName: "选手16" },
    { name: "选手17", nickName: "选手17" },
  ],
};

// 常量
// 总距离
const DEST = 100;

// 根据平均速度和偏差算出随机速度
function getRandomSpeed(expectedTime, deviation) {
  const avgSpeed = DEST / expectedTime;
  return avgSpeed * (1 + (Math.random() - 0.5) * deviation * 2);
}

// 获取下一个 tick 对应的位置，以及消耗的时间，如果位置超过 DEST，说明到达终点，则直接返回 DEST
function getNextState(currentPosition, expectedTime, deviation, tickTime) {
  const speed = getRandomSpeed(expectedTime, deviation);
  const distance = Math.min(speed * tickTime, DEST - currentPosition);
  return {
    position: currentPosition + distance,
    time: distance / speed,
  };
}

// 定期计算当前所有状态
function startTick($tracks) {
  // 期望的大致比赛时间
  const expectedTime = Number($("#expected-time").val());

  // 速度浮动标准差（小于 1）
  const deviation = Number($("#deviation").val());
  // 将期望时间均分十份，随机速度
  const tickTime = expectedTime / 10;
  // 记录整个比赛 tick 上限（用于指导 tick）
  let maxTick = 0;
  // 每个人的总时间
  let times = [];
  // 最开始就算好每个 tick 下，每个人的状态
  const wholeState = $tracks.map(() => {
    let time = 0;
    let pos = 0;
    let athStateList = [];
    let totalTime = 0;
    // 算好每位选手的 tick 内容和总时间
    while (pos - DEST < 0) {
      const { position, time } = getNextState(
        pos,
        expectedTime,
        deviation,
        tickTime
      );
      pos = position;
      athStateList.push({ position, time });
      totalTime += time;
    }
    maxTick = Math.max(maxTick, athStateList.length);
    times.push(totalTime);
    console.log(athStateList);
    return athStateList;
  });

  // 写入排序结果
  Object.entries(times)
    .sort(([, a], [, b]) => a - b)
    .forEach(([originIndex, value], rankIndex) => {
      $tracks[originIndex].append(`
        <div class="rank rank-${rankIndex + 1}">
        ${rankIndex + 1}
        </div>
        `);
    });
  let tickCount = 0;
  let endMark = [];
  tick();
  function tick() {
    // 更新状态
    wholeState.forEach((athStateList, index) => {
      if (endMark[index]) return;
      // 获取选手在这个 tick 下的状态
      const athState = athStateList[tickCount];
      // if (!athState) {
      //   $tracks[index].find(".rank").addClass("show");
      //   endMark[index] = true;
      //   return;
      // }
      const { position, time } = athState;
      $tracks[index].find(".dancing").css({
        "transition-duration": `${time}s`,
        left: `${position}%`,
      });
      // 如果下一个状态没有内容，说明结束了，则加上结束标签
      if (!athStateList[tickCount + 1]) {
        endMark[index] = true;
        setTimeout(() => {
          $tracks[index].find(".rank").addClass("show");
        }, time * 1000);

        return;
      }
    });
    tickCount += 1;
    // 如果没有结束，则
    if (tickCount - maxTick < 0) {
      setTimeout(tick, tickTime * 1000);
    }
  }
}

function getDancingMan() {
  if ($("#bg").hasClass("light")) {
    return "./images/dancing2.gif";
  } else {
    return "./images/dancing.gif";
  }
}

function initMusic() {
  let audio = $(`<audio controls="controls" style="display: none;"></audio>`);
  $("#bg").append(audio);
  let transient = new Audio("media/j.mp3");
  let dancing = new Audio("media/jntm.mp3");
  return {
    transient,
    dancing,
  };
}

function initAthletes() {
  let $tracks = [];
  Object.keys(ATHLETES).forEach((group) => {
    ATHLETES[group].forEach(({ name, nickName }, index) => {
      let dancingMan = getDancingMan();
      let $track = $(`
      <div class="track">
        <div class="name">${nickName} (${name})</div>
        <img height="60" class="dancing" src="${dancingMan}" />
      </div>`);
      $tracks.push($track);
      $("#playground").append($track);
    });
  });
  return $tracks;
}

(function bootStrap() {
  let $tracks = initAthletes();
  let $audio = initMusic();
  $("#bgm").on("click", () => {
    if ($(".bgm-close").attr("display") === "none") {
      $audio.transient.pause();
      $audio.dancing.pause();
      $(".bgm-open").attr("display", "none");
      $(".bgm-close").attr("display", "block");
    } else {
      // $audio.transient.play();
      // $audio.dancing.play();
      $(".bgm-open").attr("display", "block");
      $(".bgm-close").attr("display", "none");
    }
  });
  $("#kun").on("click", () => {
    $("#bg").addClass("light");
    let dancingMan = getDancingMan();
    $(".dancing").attr("src", dancingMan);
    $audio?.transient?.play();
    $("#kun").remove();
    $(".track").remove();
    $tracks = initAthletes();
  });
  $("#reset").on("click", () => {
    $(".track").remove();
    $tracks = initAthletes();
    $audio.dancing?.pause();
  });
  $("#start-trigger").on("click", () => {
    startTick($tracks);
    if (
      $("#bg").hasClass("light") &&
      $(".bgm-close").attr("display") === "none"
    ) {
      $audio.dancing?.load();
      $audio.dancing?.play();
    }
  });
})();
