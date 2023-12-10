# pico-vue
[Vue 3](https://vuejs.org) component library to use with [Pico CSS](https://picocss.com/)

## Get Started
It is recommended to already be familiar with Pico CSS, as the components utilize the same semantic HTML, attributes, and classes. You can review the docs [here](https://picocss.com/docs) if necessary.

Pico-vue is intended to also be used by just linking the pico-vue.js file, or by downloading into your project files.

You can then start importing components right in your Vue files:
```js
import { Component } from 'https://cdn.jsdelivr.net/gh/ginger-tek/pico-vue/pico-vue.esm.js'

// or

import { Component } from './pico-vue.js'
```

## Components
All components are vanilla ESM modules that use the Vue 3 Composition API.

They can be used directly in both vanilla ESM modules:
```js
import { Modal } from 'pico-vue.js"

export default {
  template: `<modal/>`
  setup() {
    ...
  }
}
```
or Vue Single File Components (SFC):
```vue
<script setup>
import { Modal } from 'pico-vue.js'
</script>

<template>
  <modal/>
</template>
```

## Modal
### Attributes
|Attribute|Type|Details|
|---|---|---|
|`title`|String|Set the title in the header of the modal|
|`id`|String|Used to control showing/closing the target modal|
|`hide-close-x`|Boolean|Hide the default close (X) button in the top-right of the modal|
|`wide`|Boolean|Make the modal fill the `max-width` of the modal, set by Pico|

Modals can be shown/closed via 2 methods: attributes or methods.
To open a modal via a button, you can use the `data-show-modal` attribute, specifying the id of the modal to target:
```html
<modal title="My Modal" id="my-modal">
  ...
</modal>
<button data-show-modal="my-modal">Open Modal</button>
```

To add a custom close button, add a button element with the `data-close-modal` attribute; no value is needed:
```html
<modal title="My Modal" id="my-modal">
  ...
  <button type="button" data-close-modal>Close this modal</button>
</modal>
```

There are also global window functions to show and close modals programmatically:
```js
showModal('my-modal')
closeModal('my-modal')
```

### Examples
**Modal with AJAX form**
```html
<modal title="My modal form" id="my-modal-form" hide-close-x>
  <form @submit.prevent="submitForm">
    ...
    <div class="grid">
      <button type="reset" class="secondary" data-close-modal>Cancel</button>
      <button type="submit">Submit</button>
    </div>
  </form>
</modal>
```
```js
async function submitForm() {
  const result = apiCall(...)
  if (result == true) closeModal('my-modal-form')
}
```

## Dropdown/DropdownItem
## SmartTable
## Alert
## NavBar
## ThemeSwitch
