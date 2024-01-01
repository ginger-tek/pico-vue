<h1><img src="https://raw.githubusercontent.com/picocss/pico/master/.github/logo.svg" width="40px">&nbsp;<sup>&plus;</sup>&nbsp;<img src="https://vuejs.org/images/logo.png" width="40px"><br>pico-vue</h1>

**A [Vue 3](https://vuejs.org) component library for use with the [Pico CSS](https://picocss.com/) framework**

---
## Get Started
It is recommended to already be familiar with Pico CSS, as the components utilize the same semantic HTML, attributes, and classes. You can review the docs [here](https://picocss.com/docs) if necessary.

### Install
Currently, PicoVue is only accessible through CDN or manually copying it to your project files (npm coming soon!).

You can load all components globally (recommended):
```js
import PicoVue from 'https://cdn.jsdelivr.net/gh/ginger-tek/pico-vue@latest/pico-vue.js'

createApp(App)
  .use(PicoVue)
  .mount('#app')
```

Or you can import individual components as needed:
```js
import { SmartTable } from 'https://cdn.jsdelivr.net/gh/ginger-tek/pico-vue@latest/pico-vue.js'
```

---
# Components

All components are vanilla ESM modules that use the Vue 3 Composition API. They can be used directly in both vanilla ESM modules or Vue Single File Components (SFC)

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
|Name|Details|
|---|---|
|`selected`|Fires when the an option is clicked|

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
|`bordered`|Boolean|Adds an outside border styling to the table wrapper|

Provides an interactive, responsive table with filtering and sorting.

Columns are automatically generated based on the object properties in the array, but you can use the `fields` attribute to only show the columns specified.

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
|`type`|String|Sets the background color of the alert based on alert category. Valid options are `success` (green), `info` (cyan), `warning` (yellow), and `error` (red). Defaults to secondary color background when not specified|

Alerts with no content are hidden by default, and will show when content is added

### Examples
```html
<alert type="error"></alert> <!-- hidden -->
<alert type="error">Oh no! Something went wrong!</alert> <!-- shown -->
```
---
## Toaster
### Attributes
|Name|Type|Details|
|---|---|---|
|`position`|String|Sets the position of the toaster on the page. Valid options are `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, or `bottom-right`. Defaults to `bottom-left`|
|`width`|String|Sets the max width of the toaster and toasts. Defaults to `350px`|

A responsive component for creating toast notifications.

**NOTE: Only one instance of the toaster component should be added to your application, typically in the main `App` component.**

To add a toast programmatically, use the global window function `appendToast` and pass an object with any of the following options:
|Name|Type|Details|
|---|---|---|
|`content`|String|Text or HTML string of content to display|
|`type`|String|Style of the toast. Valid options are `success` (green), `info` (cyan), `warning` (yellow), or `error` (red)|
|`dismissAfter`|Number|Seconds after which the toast will auto-dismiss. Default is 5 seconds|
|`stay`|Boolean|Disable the auto-dismiss. Toast must be closed manually|

### Examples
```html
<toaster width="400px"></toaster>
<toaster position="top-center"></toaster>
```
```js
// regular (gray) toast
appendToast({ content: 'Here is a message' })
// info (cyan) toast
appendToast({ content: 'Some info...', type: 'info' })
// success (green) toast
appendToast({ content: 'Success!', type: 'success' })
// warning (yellow) toast that dismisses after 10 seconds
appendToast({ content: 'Warning!', type: 'warning', dismissAfter: 10 })
// error (red) toast that does not dismiss automatically
appendToast({ content: 'An error has occurred!', type: 'error', stay: true })
```

### Examples
```html
<alert type="error"></alert> <!-- hidden -->
<alert type="error">Oh no! Something went wrong!</alert> <!-- shown -->
```
---
## ThemeSwitch
### Attributes
|Name|Type|Details|
|---|---|---|
|`icon`|Boolean|Show an icon instead of a checkbox switch input|

Toggles and loads the value of `localStorage.theme` key if present. Will use to `prefers-color-scheme` value to determine theme on first-time load, or when `localStorage.theme` is cleared.

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
|`breakpoint`|String|Sets the screen width at which the collapsed menu will appear. Valid options are `sm` (575px), `md` (768px), `lg` (991px), and `xl` (1199px). Defaults to `md`|

Provides a responsive navigation bar, with built-in collapsable menu.

There are 2 named slots for content. Use `#brand` to define your "Home"/Logo content, and `#menu` to define your navigable links that will responsively collapse when applicable.

### Examples
```html
<nav-bar>
  <template #brand>
    <router-link to="/">Home</router-link>
  </template>
  <template #menu>
    <li>
      <router-link to="/projects">Projects</router-link>
    </li>
    <li>
      <router-link to="/logout">Logout</router-link>
    </li>
    <li>
      <router-link to="/login">Login</router-link>
    </li>
    <li>
      <theme-switch icon> Theme</theme-switch>
    </li>
  </template>
</nav-bar>
```
---
## Tabs/Tab
### Tabs Attributes
|Name|Type|Details|
|---|---|---|
|`stretch`|Boolean|Makes all tab buttons stretch to fill the tab header|

### Tab Attributes
|Name|Type|Details|
|---|---|---|
|`title`|String|Makes all tab buttons stretch to fill the tab header|
|`disabled`|Boolean|Disables the tab from being selectable|

### Examples
```html
<tabs>
  <tab title="My First Tab">
    ...
  </tab>
  <tab title="My Second Tab" disabled>
    ...
  </tab>
  <tab title="My Third Tab">
    ...
  </tab>
</tabs>
```
