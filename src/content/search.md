---
title: search
menu:
  nav:
    weight: 100

styles:
  - search
scripts:
 - path: main.bundle.js
 - path: search.bundle.js
   async: true
---
<form action="" id="site-search" class="search-form" role="search">
  <input class="search" name="search" type="text" value="" id="search-input"
         aria-label="Search the site..." autocomplete="off"
         placeholder="Search" required="required" />
  <button id="search-clear" name="clear" type="button" value="clear">clear</button>
</form>

<script>
  'use-strict';
  let form = document.getElementById('site-search'),
      text = document.getElementById('search-input');

  text.addEventListener('focus', function() {
    form.classList.add('active');
  })

  text.addEventListener('blur', function() {
    form.classList.remove('active');
  })
</script>

<hr />

<div class="loader-container">
  {{< loader >}}
</div>

<ul id="search-results"></ul>

{{< fontawesome "r" "calendar" "hidden" >}}
{{< fontawesome "s" "tags" "hidden" >}}
