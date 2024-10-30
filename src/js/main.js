(async () => {
  const $ = document.querySelector.bind(document);
  const $$ = document.querySelectorAll.bind(document);

  const sliceList = $(".slice-list");
  const sliceTool = $(".slice-tool");
  const sliceItems = $$(".slice-item") || [];
  const dots = $$(".dot") || [];
  const tradeBar = $(".trade-bar__coin-list") || [];

  function handleSliceChange(action) {
    let sliceActive = +sliceList.getAttribute("data-active") || 0;
    let dotActive = dots[sliceActive];
    const sliceItemWidth = sliceItems[0].clientWidth;

    const isNext = action == "next";
    if (isNext) {
      sliceActive++;
    } else {
      sliceActive--;
    }

    if (sliceActive > sliceItems.length - 1) {
      sliceActive = 0;
    } else if (sliceActive < 0) {
      sliceActive = sliceItems.length - 1;
    }

    if (dotActive) {
      dotActive.classList.toggle("active");
    }
    dotActive = dots[sliceActive];
    dotActive.classList.toggle("active");

    sliceList.setAttribute("data-active", sliceActive);

    sliceList.style.transform = `translateX(-${
      sliceActive * sliceItemWidth
    }px)`;
  }

  function autoSlice() {
    let autoSliceIntervalId;

    const start = () => {
      autoSliceIntervalId = setInterval(() => {
        const next = sliceTool.querySelector('[data-action="next"]');
        if (next) {
          next.click();
        }
      }, 5 * 1000);
    };
    const stop = () => {
      clearInterval(autoSliceIntervalId);
    };

    const reset = () => {
      stop();
      start();
    };

    return {
      start,
      stop,
      reset,
    };
  }

  async function getTradeBarData() {
    return fetch("https://api.binance.com/api/v3/ticker/price").then(
      async (data) => data.json()
    );
  }

  function addTradeBarData(data) {
    let html = ``;
    data = data.splice(0, 50);
    data.forEach((element) => {
      html += `<li class="trade-bar__item">
      <img aria-hidden="true" src="" alt="" class="icon">
      <div class="info">
        <span class="price">$${element.price}</span>
        <span class="name">${element.symbol}</span>
      </div>
    </li>`;
    });
    tradeBar.innerHTML = html;
  }

  const autoInstance = autoSlice();

  autoInstance.start();

  sliceTool.onclick = (val) => {
    const action = val.target.getAttribute("data-action");
    if (action) {
      handleSliceChange(action);
      autoInstance.reset();
    }
  };

  const tradeData = await getTradeBarData();
  addTradeBarData(tradeData);
})();
