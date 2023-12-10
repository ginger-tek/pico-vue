# pico-vue
Vue component library to use with [Pico CSS](https://picocss.com/)

## Get Started
In the spirit of Vue's ability to be dropped in via CDN, pico-vue is intended to also be used by just linking the pico-vue.js file, or by downloading into your project files.

You can then start importing components in your Vue ESM or SFC files:
```js
import { Component } from 'https://cdn.jsdelivr.net/gh/ginger-tek/pico-vue/pico-vue.js'

// or

import { Component } from './pico-vue.js'
```

## Components
### Modal
Example
```html
<modal title="My Modal" id="my-modal">
  ...
</modal>
<button data-show-modal="my-modal">Open Modal</button>
```
JavaScript Controls
```js
showModal('my-modal')
closeModal('my-modal')
```

### Dropdown/DropdownItem
### SmartTable
### Alert
### NavBar
### ThemeSwitch
