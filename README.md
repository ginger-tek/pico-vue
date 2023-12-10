# pico-vue
[Vue 3](https://vuejs.org) component library for use with [Pico CSS](https://picocss.com/)

## Get Started
It is recommended to already be familiar with Pico CSS, as the components utilize the same semantic HTML, attributes, and classes. You can review the docs [here](https://picocss.com/docs) if necessary.

Pico-vue is intended to also be used by just linking the pico-vue.js file, or by downloading into your project files.

You can then start importing components right in your Vue files:
```js
import { Component } from 'https://cdn.jsdelivr.net/gh/ginger-tek/pico-vue/pico-vue.esm.js'

// or

import { Component } from './pico-vue.js'
```
---
## Components
All components are vanilla ESM modules that use the Vue 3 Composition API.

They can be used directly in both vanilla ESM modules:
```js
import { Modal } from 'pico-vue.js"

export default {
  template: `<modal></modal>`
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
  <Modal/>
</template>
```
---
## Modal
### Attributes
|Name|Type|Details|
|---|---|---|
|`title`|String|Set the title in the header of the modal|
|`id`|String|Used to control showing/closing the target modal|
|`hide-close-x`|Boolean|Hide the default close (X) button in the top-right of the modal|
|`wide`|Boolean|Make the modal fill the `max-width` of the modal, set by Pico|

### Events
|Name|Details|
|---|---|
|`closed`|Fires when the modal closes|

Modals can be shown/closed either by **data attributes** or **global helper functions**.

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

To open or close a modal programmatically, use the global window functions `showModal()` or `closeModal()`, which take the id of the target modal as an argument:
```js
showModal('my-modal')
closeModal('my-modal')
```

### Examples
*Modal with AJAX form*
```html
<modal title="My modal form" id="my-modal-form" hide-close-x @closed="refreshData">
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

async function refreshData() {
  ...
}
```
---
## Dropdown
### Attributes
|Name|Type|Details|
|---|---|---|
|`label`|String|Set the select text, i.e. 'Select one...'|

### Events
|Name|Type|Details|
|---|---|---|
|`label`|String|Set the select text, i.e. 'Select one...'|

### Examples
```html
<dropdown>
  <li>One</li>
  <li>Two</li>
</dropdown>
```
---
## SmartTable
### Attributes
|Attribute|Type|Details|
|---|---|---|
|`items`|Array|Data to render on the table|
|`fields`|Array|Specify which fields to show as columns|
|`filter`|Boolean|Shows type-to-search column filters in the table header|
|`striped`|Boolean|Adds a striped styling to the table rows|

Provides an interactive table with filtering and sorting.

By default, columns will be automatically determined based on the row properties, but you can use the `fields` attribute to specify the columnds to be shown.

### Examples
*Simple*
```html
<smart-table :items="data"></smart-table>
```

*Specific Fields*
```html
<smart-table :items="data" :fields="fields"></smart-table>
```
```js
const fields = [
  'firstname',
  'lastName',
  { name: 'createdOn', label: 'Created' },
  { name: 'invoiceTotal', label: 'Total', align: 'right' }
]
```

*Enable Column Filtering*
```html
<smart-table :items="data" filter></smart-table>
```

*Custom Empty Text/HTML*
```html
<smart-table :items="data">
  <template #emptyText>
    <span style="color:red">No data at all, muchacho!</span>
  </template>
</smart-table>
```

*Custom Empty Filter Text/HTML*
```html
<smart-table :items="data" filter>
  <template #emptyFilterText>
    <i>No result for that. Try again, buddy<i>
  </template>
</smart-table>
```
---
## Alert
### Attributes
|Name|Type|Details|
|---|---|---|
|`type`|String|Set the select text, i.e. 'Select one...'|

### Examples
```html
<alert type="error">Oh no! Something went wrong!</alert>
```
---
## ThemeSwitch
### Attributes
|Name|Type|Details|
|---|---|---|
|`icon`|Boolean|Set the select text, i.e. 'Select one...'|

### Examples
```html
<theme-switch></theme-switch>
<theme-switch icon></theme-switch>
```
---
## NavBar
### Attributes
|Name|Type|Details|
|---|---|---|
|`label`|String|Set the select text, i.e. 'Select one...'|

### Examples
```html
<dropdown>
  <li>One</li>
  <li>Two</li>
</dropdown>
```
---
## Tabs
### Attributes
|Name|Type|Details|
|---|---|---|
|`label`|String|Set the select text, i.e. 'Select one...'|

### Examples
```html
<dropdown>
  <li>One</li>
  <li>Two</li>
</dropdown>
```
