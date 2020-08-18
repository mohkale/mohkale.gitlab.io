---
title: fontawesome
resources:
  - src: "*.scss"
styles: ./fontawesome
default_styles: true
---

Evaluate the following script to generate the shortcodes needed to display every
fontawesome gif known to this project.

```bash
find src/assets/images/fa -type f -iname '*.svg' |
    sed 's/\.svg$//' |
    awk -F '/' -e '
      {
        ico = sprintf("{{</* fontawesome \"%s\" \"%s\" */>}}", $(NF-1), $NF)
        printf("- <span title=\"%s %s\">%s</span>\n", $(NF-1), $NF, ico)
      }'
```
