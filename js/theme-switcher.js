(function () {
    const STORAGE_KEY = "chess_tree_theme";
    const THEMES = ["dark", "light"];
    const ICONS = {
        dark: {
            src: "img/DarkQueen.webp",
            alt: "Dark theme"
        },
        light: {
            src: "img/WhiteKing.webp",
            alt: "Light theme"
        }
    };

    let activeTheme = resolveInitialTheme();
    let isExpanded = false;
    let switcher;
    let toggleButton;
    let toggleIcon;
    let alternateButton;
    let alternateIcon;

    function isValidTheme(value) {
        return THEMES.includes(value);
    }

    function resolveInitialTheme() {
        const rootTheme = document.documentElement.getAttribute("data-theme");
        if (isValidTheme(rootTheme)) return rootTheme;

        try {
            const storedTheme = localStorage.getItem(STORAGE_KEY);
            if (isValidTheme(storedTheme)) return storedTheme;
        } catch (_error) {
            // Ignore storage errors.
        }

        return "dark";
    }

    function setTheme(theme, options = {}) {
        const { persist = true, emit = true } = options;
        const nextTheme = isValidTheme(theme) ? theme : "dark";

        activeTheme = nextTheme;
        document.documentElement.setAttribute("data-theme", nextTheme);

        if (persist) {
            try {
                localStorage.setItem(STORAGE_KEY, nextTheme);
            } catch (_error) {
                // Ignore storage errors.
            }
        }

        if (toggleIcon) {
            toggleIcon.src = ICONS[nextTheme].src;
            toggleIcon.alt = ICONS[nextTheme].alt;
        }

        if (alternateButton && alternateIcon) {
            const alternateTheme = nextTheme === "dark" ? "light" : "dark";
            alternateButton.dataset.themeValue = alternateTheme;
            alternateButton.setAttribute("aria-label", `Use ${alternateTheme} theme`);
            alternateButton.title = `Use ${alternateTheme} theme`;
            alternateIcon.src = ICONS[alternateTheme].src;
            alternateIcon.alt = "";
        }

        if (emit) {
            document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: nextTheme } }));
        }
    }

    function expand() {
        if (!switcher) return;
        isExpanded = true;
        switcher.classList.add("is-expanded");
        toggleButton.setAttribute("aria-expanded", "true");
    }

    function collapse() {
        if (!switcher) return;
        isExpanded = false;
        switcher.classList.remove("is-expanded");
        toggleButton.setAttribute("aria-expanded", "false");
    }

    function toggleExpanded() {
        if (isExpanded) {
            collapse();
        } else {
            expand();
        }
    }

    function handleOutsideClick(event) {
        if (!isExpanded || !switcher) return;
        if (!switcher.contains(event.target)) {
            collapse();
        }
    }

    function createAlternateButton() {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "theme-switcher__option";

        const icon = document.createElement("img");
        icon.className = "theme-switcher__piece";
        icon.alt = "";
        icon.draggable = false;
        button.appendChild(icon);

        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const nextTheme = button.dataset.themeValue;
            setTheme(nextTheme);
            collapse();
        });

        alternateButton = button;
        alternateIcon = icon;
        return button;
    }

    function buildSwitcher() {
        if (document.querySelector(".theme-switcher")) return;

        switcher = document.createElement("div");
        switcher.className = "theme-switcher";

        toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "theme-switcher__toggle";
        toggleButton.setAttribute("aria-label", "Toggle theme options");
        toggleButton.setAttribute("aria-expanded", "false");

        toggleIcon = document.createElement("img");
        toggleIcon.className = "theme-switcher__piece theme-switcher__piece--toggle";
        toggleIcon.alt = "";
        toggleIcon.draggable = false;
        toggleButton.appendChild(toggleIcon);

        const options = document.createElement("div");
        options.className = "theme-switcher__options";
        options.setAttribute("role", "group");
        options.setAttribute("aria-label", "Theme option");

        options.appendChild(createAlternateButton());
        switcher.appendChild(toggleButton);
        switcher.appendChild(options);
        document.body.appendChild(switcher);

        toggleButton.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleExpanded();
        });

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") collapse();
        });

        setTheme(activeTheme, { persist: false, emit: false });
    }

    function init() {
        buildSwitcher();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
