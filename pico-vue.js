export const Modal = {
  props: {
    title: String,
    hideCloseX: Boolean,
    wide: Boolean
  },
  template: `<dialog ref="modal" :class="{wide}">
    <article>
      <header>
        <span v-if="!hideCloseX" aria-label="Close" class="close" @click="close(modal)"></span>
        {{ title || 'Modal' }}
      </header>
      <slot></slot>
    </article>
  </dialog>`,
  setup(_props, { emit }) {
    const modal = Vue.ref(null)
    const doc = document.documentElement

    function show(el) {
      doc.classList.add('modal-is-open')
      el.showModal()
    }

    function close(el) {
      el.close()
      doc.classList.remove('modal-is-open')
      Vue.nextTick(() => emit('closed'))
    }

    Vue.onMounted(() => {
      modal.value.addEventListener('close', () => {
        doc.classList.remove('modal-is-open')
        Vue.nextTick(() => emit('closed'))
      })
      if (!window.showModal)
        window.showModal = (id) => show(document.getElementById(id))
      if (!window.closeModal)
        window.closeModal = (id) => close(document.getElementById(id))
      document.querySelectorAll(`[data-show-modal=${modal.value.id}]`).forEach(el => el.addEventListener('click', () => show(modal.value)))
      modal.value.querySelectorAll(`[data-close-modal]`).forEach(el => {
        if (el.onclick) return
        let parentDialog = el.parentElement
        while (parentDialog != modal.value) parentDialog = parentDialog.parentElement
        el.onclick = () => close(parentDialog)
      })
    })

    return { modal, close }
  }
}

export const Dropdown = {
  props: {
    label: String
  },
  inheritAttrs: false,
  template: `<details class="dropdown" :dir="$attrs['dir']">
    <summary aria-haspopup="listbox" :role="$attrs['role']" :class="$attrs['class']">{{ label || 'Select one...' }}</summary>
    <ul role="listbox" @click="select">
      <slot></slot>
    </ul>
  </details>`,
  setup(_props, { emit }) {
    function select(ev) {
      emit('selected', ev.target.dataset.value || ev.target.innerText)
      ev.currentTarget.parentElement.removeAttribute('open')
    }
    return { select }
  }
}

export const SmartTable = {
  props: {
    items: Array,
    fields: Array,
    filter: Boolean,
    striped: Boolean,
    bordered: Boolean,
    busy: Boolean
  },
  template: `<div :class="['overflow-auto smart-table',{bordered}]">
    <table :role="striped ? 'grid' : ''">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.name">
            <div class="column">
              <input v-if="filter" class="column-filter compact" type="text" v-model="data.filterCols[col.name]" :placeholder="col.label">
              <span v-else :class="['column-label',{active:data.sortBy == col.name}]">{{ col.label }}</span>
              <div class="sorter">
                <div @click="sortAsc(col.name)" :class="['sort asc',{active:data.sortBy == col.name && data.sortDir == 1}]"></div>
                <div @click="sortDesc(col.name)" :class="['sort desc',{active:data.sortBy == col.name && data.sortDir == -1}]"></div>
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody v-if="busy">
        <tr>
          <td :colspan="columns.length">
            <div aria-busy="true"><slot name="busy-text"></slot></div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="(row,rx) in rows" :key="'r'+rx">
          <td v-for="col in columns" :key="col.name" :style="{ 'text-align': col.align || 'inherit' }">
            <slot :name="convert(col.name)" :="row">{{ row[col.name] }}</slot>
          </td>
        </tr>
        <tr v-if="items.length == 0">
          <td :colspan="columns.length" style="text-align:center">
            <slot name="empty-text">No data</slot>
          </td>
        </tr>
        <tr v-else-if="rows.length == 0">
          <td :colspan="columns.length" style="text-align:center">
            <slot name="empty-filter-text">No items by that filter</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>`,
  setup(props) {
    const data = Vue.reactive({
      sortBy: null,
      sortDir: 0,
      filterCols: {}
    })

    const columns = Vue.computed(() => {
      return (props.fields || Object.keys(props?.items[0] || {})).map(c => ({
        name: c.name || c,
        label: c.label || (c.name || c).split(/_|-|(?=[A-Z])/).map(w => w[0].toUpperCase() + w.substring(1)).join(' '),
        align: c.align || false
      }))
    })

    const rows = Vue.computed(() => {
      if (!props.items || !Array.isArray(props.items)) return []
      const filters = Object.keys(data.filterCols)
      const results = props.filter && filters.length > 0
        ? props.items.filter(i => filters.map(f => i[f]?.toString()?.toLowerCase().indexOf(data.filterCols[f].toLowerCase()) > -1).every(b => b == true))
        : props.items
      return results.toSorted((a, b) => {
        if (a[data.sortBy] > b[data.sortBy]) return 1 * data.sortDir
        else if (a[data.sortBy] < b[data.sortBy]) return -1 * data.sortDir
        else return 0
      })
    })

    function unSort() {
      data.sortBy = null
      data.sortDir = 0
    }

    function sortAsc(n) {
      if (data.sortBy == n && data.sortDir == 1) return unSort()
      data.sortDir = 1
      data.sortBy = n
    }

    function sortDesc(n) {
      if (data.sortBy == n && data.sortDir == -1) return unSort()
      data.sortDir = -1
      data.sortBy = n
    }

    function convert(n) {
      return n.split(/_|-|(?=[A-Z])/).map(w => w.toLowerCase()).join('-')
    }

    Vue.watch(() => data.filterCols, (n, o) => {
      Object.keys(n).forEach(k => {
        if (data.filterCols[k] == '') delete data.filterCols[k]
      })
    }, { deep: true })

    return { data, rows, columns, sortAsc, sortDesc, convert }
  }
}

export const Alert = {
  props: {
    type: String
  },
  template: `<div role="alert" :class="type">
    <slot></slot>
  </div>`
}

export const Toaster = {
  props: {
    width: {
      type: String,
      default: '350px'
    },
    position: {
      type: String,
      default: 'bottom-left'
    }
  },
  template: `<div :class="['toaster',position]" ref="toaster" :style="{'max-width':width}"></div>`,
  setup() {
    const toaster = Vue.ref(null)
    const fade = 201

    Vue.onMounted(() => {
      window.closeToast = (e) => {
        const el = e.target || e
        el?.classList.remove('show')
        setTimeout(() => el?.remove(), fade)
      }
      window.appendToast = ({ content, dismissAfter = 5, stay = false, type = false }) => {
        const toast = document.createElement('div')
        toast.classList.add('toast')
        if (type) toast.classList.add(type)
        toast.innerHTML = `<div>${content}</div><span class="close" onclick="closeToast(this.parentElement)"></span>`
        toaster.value.appendChild(toast)
        Vue.nextTick(() => setTimeout(() => toast.classList.add('show'), 100))
        if (!stay) setTimeout(() => closeToast(toast), dismissAfter * 1000)
      }
    })

    return { toaster }
  }
}

export const ThemeSwitch = {
  props: {
    icon: Boolean
  },
  template: `<label class="theme-switch-wrap">
    <input id="theme-switch" type="checkbox" role="switch" v-model="data.theme" true-value="dark" false-value="light" :hidden="icon">
    <span v-if="icon" for="theme-switch">
      <div class="theme-switch-icon"></div>
    </span>
    <slot></slot>
  </label>`,
  setup() {
    const data = Vue.reactive({
      theme: null
    })

    function toggle(n) {
      data.theme = n
      localStorage.theme = data.theme
      document.documentElement.setAttribute('data-theme', data.theme)
    }

    function load() {
      data.theme = localStorage.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', data.theme)
    }

    Vue.watch(() => data.theme, toggle)

    Vue.onBeforeMount(load)

    return { data, toggle }
  }
}

export const NavBar = {
  props: {
    breakpoint: {
      type: String,
      default: 'md'
    },
    menuLabel: {
      type: String,
      default: 'Menu'
    }
  },
  template: `<nav :class="['nav-bar',breakpoint]">
    <ul>
      <li>
        <slot name="brand"></slot>
      </li>
    </ul>
    <ul class="desktop-menu">
      <slot name="menu"></slot>
    </ul>
    <ul class="mobile-menu">
      <li>
        <details class="dropdown" ref="menu">
          <summary>
            <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="1.2rem" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </summary>
          <ul dir="rtl">
            <slot name="menu"></slot>
          </ul>
        </details>
      </li>
    </ul>
  </nav>`,
  setup() {
    const menu = Vue.ref(null)
    
    Vue.onMounted(() => {
      menu.value.querySelectorAll('ul li a').forEach(el => {
        el.addEventListener('click', () => menu.value.removeAttribute('open'))
      })
    })
    
    return { menu }
  }
}

export const Tab = {
  props: {
    title: String
  },
  template: `<div class="tab-content">
    <slot></slot>
  </div>`
}

export const Tabs = {
  props: {
    stretch: Boolean
  },
  template: `<article :class="['tabs',{stretch}]">
    <header>
      <ul>
        <li v-for="(s,i) in slots.default()" :key="i" @click="active = i" :class="['tab-btn',{active:active == i}]" role="button" :disabled="s.props.disabled">
          {{ s.props.title }}
        </li>
      </ul>
    </header>
    <component :is="slots.default()[active]"></component>
  </article>`,
  setup() {
    const slots = Vue.useSlots()
    const active = Vue.ref(0)
    return { active, slots }
  }
}

export default {
  install(app, _options) {
    app.component('modal', Modal)
    app.component('dropdown', Dropdown)
    app.component('smart-table', SmartTable)
    app.component('alert', Alert)
    app.component('toaster', Toaster)
    app.component('theme-switch', ThemeSwitch)
    app.component('nav-bar', NavBar)
    app.component('tab', Tab)
    app.component('tabs', Tabs)
  }
}

const sheet = new CSSStyleSheet()
sheet.replaceSync(`/* Global */
:root {
  --pv-success: var(--pico-form-element-valid-border-color);
  --pv-error: var(--pico-form-element-invalid-border-color);
  --pv-modal-duration: .2s;
  --pv-toast-duration: .2s;
  --pv-transition: .2s;
}

.compact:where(input:not([type=checkbox], [type=radio], [type=range]), select, textarea, button, [role=button]) {
  padding: calc(0.75 * var(--pico-form-element-spacing-vertical)) calc(0.75 * var(--pico-form-element-spacing-horizontal)) !important;
  height: calc(0.5rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 1.75 + var(--pico-border-width) * 1.75) !important;
}

.success {
  background: var(--pv-success) !important;
}

.error {
  background: var(--pv-error) !important;
}

label:has([required]):before {
  display: inline-block;
  content: '*';
  color: var(--pv-error);
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
}

.row>* {
  width: auto;
  flex: 1;
}

/* Modal (Dialog) */
dialog {
  outline: none;
}

dialog {
  animation: fade-out-dialog var(--pv-modal-duration) ease-out;
}

dialog > article {
  animation: fade-out-article var(--pv-modal-duration) ease-out;
}

dialog[open] {
  animation: fade-in-dialog var(--pv-modal-duration) ease-out;
}

dialog[open] > article {
  animation: fade-in-article var(--pv-modal-duration) ease-out;
}

dialog[open]::backdrop {
  animation: backdrop-fade-in var(--pv-modal-duration) ease-in forwards;
}

dialog > article header .close {
  cursor: pointer;
}

dialog > article {
  padding-bottom: 1rem;
  position: relative;
  width: 100%;
}

dialog > article header {
  margin-bottom: 1rem;
}

dialog > article form {
  margin-bottom: 0;
}

@keyframes fade-in-dialog {
  0% {
    opacity: 0;
    top: -1rem;
    display: none;
  }

  100% {
    opacity: 1;
    top: 0;
    display: flex;
  }
}

@keyframes fade-in-article {
  0% {
    opacity: 0;
    top: -1rem;
    display: none;
  }

  100% {
    opacity: 1;
    top: 0;
    display: block;
  }
}

@keyframes fade-out-dialog {
  0% {
    opacity: 1;
    top: 0;
    display: flex;
  }

  100% {
    opacity: 0;
    top: -1rem;
    display: none;
  }
}

@keyframes fade-out-article {
  0% {
    opacity: 1;
    top: 0;
    display: block;
  }

  100% {
    opacity: 0;
    top: -1rem;
    display: none;
  }
}

@keyframes backdrop-fade-in {
  0% {
    background-color: rgb(0 0 0 / 0);
  }

  100% {
    background-color: rgb(0 0 0 / 0.25);
  }
}

/* Dropdown */
details[role=list] ul li {
  cursor: pointer;
}

details[role=list] ul li:has(:not(a)):hover {
  background-color: var(--pico-dropdown-hover-background-color);
}

/* Smart Table */
table thead .column {
  display: flex;
  align-items: center;
}

table thead .column-label {
  flex-grow: 1;
}

table thead .column-label.active {
  font-weight: bold;
}

table thead .column-filter {
  flex-shrink: 1;
  margin-bottom: 0;
  margin-right: .5rem;
  border-width: 1px !important;
}

table thead .sorter {
  display: inline-block;
  text-align: center;
}

table thead .sort:before {
  cursor: pointer;
  display: block;
  content: var(--pico-icon-chevron);
  margin: 0;
  opacity: .5;
}

table thead .sort.desc:before {
  margin-top: -8px;
}

table thead .sort.asc:before {
  transform: rotate(180deg);
  margin-bottom: -8px;
}

table thead .sort:hover:before,
table thead .sort.active:before {
  opacity: 1;
}

figure.smart-table table {
  margin-bottom: 0 !important;
}

figure.smart-table:has(table).bordered {
  border: 1px solid var(--pico-table-border-color);
  border-radius: var(--pico-border-radius);
}

/* Alert */
[role=alert]:empty {
  display: none;
}

[role=alert]:not(:empty) {
  display: block;
  padding: var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);
  border-radius: var(--pico-border-radius);
  border: 1px solid rgba(0, 0, 0, .15);
  margin-bottom: var(--pico-spacing);
  background: var(--pico-secondary);
  font-weight: 400;
  color: rgba(255, 255, 255, .9);
}

/* Toaster */
.toaster {
  position: fixed;
  max-width: 350px;
  width: 100%;
  max-height: 50dvh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10000;
}

.toaster:not(:empty) {
  padding: 1rem;
}

.toaster.bottom-right {
  bottom: 0;
  right: 0;
}

.toaster.bottom-center {
  bottom: 0;
  left: 0;
  right: 0;
  margin-inline: auto;
}

.toaster.bottom-left {
  bottom: 0;
  left: 0;
}

.toaster.top-right {
  top: 0;
  right: 0;
}

.toaster.top-center {
  top: 0;
  left: 0;
  right: 0;
  margin-inline: auto;
}

.toaster.top-left {
  top: 0;
  left: 0;
}

.toast {
  display: flex;
  gap: .25rem;
  position: relative;
  opacity: 0;
  transition: var(--pv-toast-duration);
  padding: 10px;
  border-radius: var(--pico-border-radius);
  background: var(--pico-secondary);
  color: var(--pico-secondary-inverse);
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--pico-card-box-shadow);
  max-width: 500px;
  width: 100%;
}

.toast.show {
  opacity: 1;
}

.toast .close {
  display: inline-block;
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  background-image: var(--pico-icon-close);
  background-position: center center;
  background-size: auto 1rem;
  background-repeat: no-repeat;
  transition: opacity var(--pv-transition);
  filter: brightness(0);
  opacity: .35;
  cursor: pointer;
}

.toast .close:hover {
  opacity: .65;
}

.toaster.bottom-center .toast {
  top: 1rem;
}

.toaster.bottom-center .toast.show {
  top: 0;
}

.toaster:where(.bottom-right, .top-right) .toast {
  right: -1rem;
}

.toaster:where(.bottom-right, .top-right) .toast.show {
  right: 0;
}

.toaster:where(.bottom-left, .top-left) .toast {
  left: -1rem;
}

.toaster:where(.bottom-left, .top-left) .toast.show {
  left: 0;
}

.toaster.top-center .toast {
  top: -1rem;
}

.toaster.top-center .toast.show {
  top: 0;
}

/* Theme Switch */
.theme-switch-wrap {
  display: inline-block;
  border-bottom: none !important;
  cursor: pointer;
  color: inherit;
}

.theme-switch-icon {
  color: inherit;
  display: inline-block;
}

.theme-switch-icon:after {
  color: inherit;
  display: inline-block;
  width: 1rem;
  height: 1rem;
  position: relative;
  top: 0.1rem;
  border: 0.15rem solid currentColor;
  border-radius: 50%;
  background: linear-gradient(to right, currentColor 0, currentColor 50%, transparent 50%);
  content: '';
  transition: transform var(--pv-transition);
}

.theme-switch-wrap:hover .theme-switch-icon::after {
  transform: rotate(180deg);
}

/* Tabs */
.tabs header {
  padding-bottom: 0;
  border-bottom: 1px solid var(--pico-muted-border-color);
}

.tabs header ul {
  display: flex;
  justify-content: flex-start;
  gap: .5em;
  padding: 0;
  margin-bottom: -1px;
  overflow: auto hidden;
}

.tabs.stretch header ul .tab-btn {
  flex: 1;
  text-align: center;
}

.tabs header ul .tab-btn {
  display: inline-block;
  list-style-type: none;
  cursor: pointer;
  padding: 1em;
  border-top-right-radius: var(--pico-border-radius);
  border-top-left-radius: var(--pico-border-radius);
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  background: var(--pico-secondary-focus);
  color: var(--pico-contrast);
  border: 1px solid var(--pico-muted-border-color);
  margin-bottom: 0;
}

.tabs header .tab-btn.active {
  background: var(--card-background-color);
  border-bottom-color: var(--pico-card-background-color);
}

/* NavBar */
.nav-bar .menu-btn {
  align-items: center;
  padding: .65rem;
}

.nav-bar .menu-btn:after {
  display: none;
}

/* Small */
@media(max-width:575px) {
  .nav-bar.sm .desktop-menu {
    display: none;
  }

  .nav-bar.sm .mobile-menu {
    display: inherit;
  }
}

@media(min-width:576px) {
  .nav-bar.sm .desktop-menu {
    display: inherit;
  }

  .nav-bar.sm .mobile-menu {
    display: none;
  }
}

/* Medium */
@media(max-width:767px) {
  .nav-bar.md .desktop-menu {
    display: none;
  }

  .nav-bar.md .mobile-menu {
    display: inherit;
  }
}

@media(min-width:768px) {
  .nav-bar.md .desktop-menu {
    display: inherit;
  }

  .nav-bar.md .mobile-menu {
    display: none;
  }
}

/* Large */
@media(max-width:991px) {
  .nav-bar.lg .desktop-menu {
    display: none;
  }

  .nav-bar.lg .mobile-menu {
    display: inherit;
  }
}

@media(min-width:992px) {
  .nav-bar.lg .desktop-menu {
    display: inherit;
  }

  .nav-bar.lg .mobile-menu {
    display: none;
  }
}

/* Extra Large */
@media(max-width:1199px) {
  .nav-bar.xl .desktop-menu {
    display: none;
  }

  .nav-bar.xl .mobile-menu {
    display: inherit;
  }
}

@media(min-width:1200px) {
  .nav-bar.xl .desktop-menu {
    display: inherit;
  }

  .nav-bar.xl .mobile-menu {
    display: none;
  }
}`)
document.adoptedStyleSheets = [sheet]
