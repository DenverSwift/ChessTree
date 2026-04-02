(function () {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const transitionMs = 220;
    let navigating = false;

    function isModifiedClick(event) {
        return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    }

    function isSameDocument(url) {
        return url.origin === window.location.origin
            && url.pathname === window.location.pathname
            && url.search === window.location.search;
    }

    function shouldHandleLink(anchor) {
        if (!anchor) return false;
        if (anchor.hasAttribute("data-no-transition")) return false;
        if (anchor.target && anchor.target.toLowerCase() !== "_self") return false;
        if (anchor.hasAttribute("download")) return false;
        if (!anchor.href) return false;

        let parsed;
        try {
            parsed = new URL(anchor.href, window.location.href);
        } catch (_error) {
            return false;
        }

        if (parsed.origin !== window.location.origin) return false;
        if (parsed.href === window.location.href) return false;
        if (isSameDocument(parsed)) return false;
        return true;
    }

    function directNavigate(url) {
        window.location.href = url;
    }

    function navigateWithExit(urlLike) {
        let nextUrl;
        try {
            nextUrl = new URL(urlLike, window.location.href);
        } catch (_error) {
            directNavigate(String(urlLike || ""));
            return;
        }

        if (nextUrl.origin !== window.location.origin || isSameDocument(nextUrl)) {
            directNavigate(nextUrl.href);
            return;
        }

        if (navigating) return;
        navigating = true;

        if (reduceMotion) {
            directNavigate(nextUrl.href);
            return;
        }

        root.classList.add("page-transition-exit");
        window.setTimeout(() => {
            directNavigate(nextUrl.href);
        }, transitionMs);
    }

    function handleDocumentClick(event) {
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (isModifiedClick(event)) return;

        const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
        if (!(target instanceof HTMLAnchorElement)) return;
        if (!shouldHandleLink(target)) return;

        event.preventDefault();
        navigateWithExit(target.href);
    }

    root.classList.add("page-transition-active");
    if (!reduceMotion) {
        root.classList.add("page-transition-enter");
        window.setTimeout(() => {
            root.classList.remove("page-transition-enter");
        }, transitionMs + 40);
    }

    window.addEventListener("pageshow", () => {
        navigating = false;
        root.classList.remove("page-transition-exit");
    });

    document.addEventListener("click", handleDocumentClick, true);

    window.navigateWithTransition = navigateWithExit;
})();
