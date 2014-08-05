$(function () { main("svg"); });

function main(el) {
    var _element = $(el);
    var _snap = 10;
    var _ctrlSnap = 1;
    var _altSnap = 50;
    var _selectedEl = null;
    //_element.find("[class]").wrap("<g class='Element'></g>");

    var _keyBindings = {
        TAB: selectNextElement,
        SHIFT_LEFT: function (e) { resizeElementBy(_selectedEl, -_snap, 0); },
        SHIFT_RIGHT: function (e) { resizeElementBy(_selectedEl, _snap, 0); },
        SHIFT_UP: function (e) { resizeElementBy(_selectedEl, 0, -_snap); },
        SHIFT_DOWN: function (e) { resizeElementBy(_selectedEl, 0, _snap); },

        CTRL_SHIFT_LEFT: function (e) { resizeElementBy(_selectedEl, -_ctrlSnap, 0); },
        CTRL_SHIFT_RIGHT: function (e) { resizeElementBy(_selectedEl, _ctrlSnap, 0); },
        CTRL_SHIFT_UP: function (e) { resizeElementBy(_selectedEl, 0, -_ctrlSnap); },
        CTRL_SHIFT_DOWN: function (e) { resizeElementBy(_selectedEl, 0, _ctrlSnap); },

        ALT_SHIFT_LEFT: function (e) { resizeElementBy(_selectedEl, -_altSnap, 0); },
        ALT_SHIFT_RIGHT: function (e) { resizeElementBy(_selectedEl, _altSnap, 0); },
        ALT_SHIFT_UP: function (e) { resizeElementBy(_selectedEl, 0, -_altSnap); },
        ALT_SHIFT_DOWN: function (e) { resizeElementBy(_selectedEl, 0, _altSnap); },

        LEFT: function (e) { moveElementBy(_selectedEl, -_snap, 0); },
        RIGHT: function (e) { moveElementBy(_selectedEl, +_snap, 0); },
        UP: function (e) { moveElementBy(_selectedEl, 0, -_snap); },
        DOWN: function (e) { moveElementBy(_selectedEl, 0, +_snap); },

        CTRL_LEFT: function (e) { moveElementBy(_selectedEl, -_ctrlSnap, 0); },
        CTRL_RIGHT: function (e) { moveElementBy(_selectedEl, +_ctrlSnap, 0); },
        CTRL_UP: function (e) { moveElementBy(_selectedEl, 0, -_ctrlSnap); },
        CTRL_DOWN: function (e) { moveElementBy(_selectedEl, 0, +_ctrlSnap); },

        ALT_LEFT: function (e) { moveElementBy(_selectedEl, -_altSnap, 0); },
        ALT_RIGHT: function (e) { moveElementBy(_selectedEl, +_altSnap, 0); },
        ALT_UP: function (e) { moveElementBy(_selectedEl, 0, -_altSnap); },
        ALT_DOWN: function (e) { moveElementBy(_selectedEl, 0, +_altSnap); },

        R: rotateSelectedElement,
    };

    function selectNextElement() {
        var el = _selectedEl;
        var all = _element.find(".Element").toArray();
        if (el == null)
            el = all[0];
        else {
            var index = all.indexOf(el);
            el = all[index + 1];
            if (el == null)
                el = all[0];
        }

        selectElement(el);
    }

    function rotateSelectedElement() {
        var el = _selectedEl;
        var pos = getPos(el);
        var deg = getRotation(el);
        deg += 45;
        if (deg == 360)
            deg = 0;
        el.setAttribute("transform", "rotate(" + deg + " " + pos.x + " " + pos.y + ")");
    }

    function getKeyBindingKey(e) {
        var name = "";
        if (e.ctrlKey)
            name += "CTRL_";
        if (e.altKey)
            name += "ALT_";
        if (e.shiftKey)
            name += "SHIFT_";
        var key = Object.firstKey(Object.where(KEYS, function (key, value) { return value == e.keyCode; }));
        name += key;
        return name;
    }
    $(window).keydown(function (e) {
        var key = getKeyBindingKey(e);
        console.log(e.keyCode, key);
        var key2 = "ANYMOD_" + getKeyBindingKey({ keyCode: e.keyCode });
        var handler = _keyBindings[key];
        var handler2 = _keyBindings[key2];
        if (handler != null || handler2 != null) {
            e.preventDefault();
            if (handler != null)
                handler(e);
            if (handler2 != null)
                handler2(e);
        }
    });

    function getRotation(el) {
        var t = el.getAttribute("transform");
        var deg = 0;
        if (t != null) {
            var deg2 = t.substr(t.indexOf("rotate(") + "rotate(".length, t.indexOf(")"));
            if (deg2 != "")
                deg = parseInt(deg2);
        }
        return deg;
    }
    function setRotation(el, deg) {
        var pos = getPos(el);
        el.setAttribute("transform", "rotate(" + deg + " " + pos.x + " " + pos.y + ")");
        onChanged();
    }
    function getTransform(el, type) {
        var type2 = SVGTransform["SVG_TRANSFORM_" + type.toUpperCase()];
        return Array.prototype.filter.call(el.transform.baseVal, function (t) { return t.type == type2; })[0];
    }
    function getPos(el) {
        var t = getTransform(el, "translate");
        if (t == null)
            return null;
        return { x: t.matrix.e, y: t.matrix.f };
        if (el.nodeName == "path") {
            var d = el.getAttribute("d");
            var dd = d.substr(1).split(" ");

            var x = parseInt(dd[0]);
            var y = parseInt(dd[1]);
            return { x: x, y: y };
        }
        else if (el.nodeName == "circle") {
            var x = parseInt(el.getAttribute("cx"));
            var y = parseInt(el.getAttribute("cy"));
            return { x: x, y: y };

        }
        var x = parseInt(el.getAttribute("x"));
        var y = parseInt(el.getAttribute("y"));
        return { x: x, y: y };
    }
    function setPos(el, pos) {
        var trn = getTransform(el, "translate");
        trn.setTranslate(pos.x, pos.y);

        //if (el.nodeName == "path") {
        //    var d = el.getAttribute("d");
        //    var index = d.indexOf(" ", d.indexOf(" ") + 1);
        //    d = "M" + pos.x + " " + pos.y + " " + d.substr(index);
        //    el.setAttribute("d", d)
        //}
        //else if (el.nodeName == "circle") {
        //    el.setAttribute("cx", pos.x);
        //    el.setAttribute("cy", pos.y);

        //}
        //else {
        //    el.setAttribute("x", pos.x);
        //    el.setAttribute("y", pos.y);
        //}
        //setRotation(el, getRotation(el));
        onChanged();
    }

    function moveElementBy(el, dx, dy) {
        var pos = getPos(el);
        var dx2 = dx;
        var dy2 = dy;
        pos.x += dx2;
        pos.y += dy2;
        setPos(el, pos);
    }

    function resizeElementBy(el, dw, dh) {
        if (dw)
            el.setAttribute("width", parseInt(el.getAttribute("width")) + dw);
        if (dh)
            el.setAttribute("height", parseInt(el.getAttribute("height")) + dh);

    }
    function selectElement(el) {
        if (_selectedEl != null)
            _selectedEl.classList.remove("Selected");
        _selectedEl = el;
        if (_selectedEl == null)
            return;
        _selectedEl.classList.add("Selected");
    }
    function onChanged() {
        var html = _element.html();
        $("#Code").text(html);
    }
    _element.mousedown(function (e) {
        if (!$(e.target).is(".ElementObject"))
            return;
        selectElement($(e.target).closest(".Element")[0]);
    });
};

