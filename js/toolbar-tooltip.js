(function () {
    const targets = Array.from(document.querySelectorAll(
        ".nav-link--disabled[data-tooltip], [data-tooltip-scope='toolbar'][data-tooltip]"
    ));
    if (!targets.length) return;

    const tip = document.createElement("div");
    tip.className = "toolbar-tooltip";
    tip.setAttribute("role", "status");
    tip.setAttribute("aria-live", "polite");
    tip.hidden = true;
    document.body.appendChild(tip);

    function updatePosition(event) {
        tip.style.left = `${event.clientX + 12}px`;
        tip.style.top = `${event.clientY + 14}px`;
    }

    function show(event, element) {
        const text = String(element.getAttribute("data-tooltip") || "").trim();
        if (!text) return;
        tip.textContent = text;
        tip.hidden = false;
        updatePosition(event);
    }

    function hide() {
        tip.hidden = true;
    }

    targets.forEach((element) => {
        element.addEventListener("mouseenter", (event) => show(event, element));
        element.addEventListener("mousemove", updatePosition);
        element.addEventListener("mouseleave", hide);
        element.addEventListener("blur", hide);
    });
})();
