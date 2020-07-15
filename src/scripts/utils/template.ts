interface TagAttributes {
    name: String
    children: TagAttributes[] | TagAttributes
}

export function tag(attrs: TagAttributes | HTMLElement) {
    if (attrs instanceof Element) {
        return attrs
    }

    var el = document.createElement(attrs.name.toString())

    !!attrs && Object.entries(attrs).forEach(function([key, val]) {
        if (key === 'name') return
        if (val instanceof Function) {
            val = val()
        }

        switch (key) {
            case "children":
                if (!(val instanceof Array))
                    val = [val]

                val.forEach(function(childTag) {
                    // append child when its not nullable
                    !!childTag && el.appendChild(tag(childTag))
                })

                break
            case "textContent":
                el.textContent = val
                break
            default:
                el.setAttribute(key, val)
                break
        }
    })

    return el
}

const SVGNS   = "http://www.w3.org/2000/svg";
const XLINKNS = "http://www.w3.org/1999/xlink";

export function svgIcon(iconId: string) {
    let svgElem = document.createElementNS(SVGNS, 'svg')
    svgElem.classList.add("icon")
    let useElem = document.createElementNS(SVGNS, 'use');
    useElem.setAttributeNS(XLINKNS, 'xlink:href', `#${iconId}`);
    svgElem.appendChild(useElem);
    return svgElem;
}
